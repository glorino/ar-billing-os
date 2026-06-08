import { task } from "@trigger.dev/sdk";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  invoices,
  payments,
  customers,
  revenueMetrics,
  arAging,
} from "@/lib/db/schema";

interface GenerateArAgingPayload {
  tenantId: string;
  asOfDate?: string;
}

interface CalculateDsoPayload {
  tenantId: string;
  periodMonths?: number;
}

interface GeneratePnlPayload {
  tenantId: string;
  startDate: string;
  endDate: string;
}

export const generateArAging = task({
  id: "generate-ar-aging",
  maxDuration: 300,
  retry: { maxAttempts: 3 },
  run: async (payload: GenerateArAgingPayload, { ctx }) => {
    const { tenantId, asOfDate } = payload;
    const snapshotDate = asOfDate ? new Date(asOfDate) : new Date();

    const unpaidInvoices = await db.query.invoices.findMany({
      where: and(
        eq(invoices.tenantId, tenantId),
        sql`${invoices.status} IN ('pending', 'sent', 'viewed', 'partial', 'overdue')`,
        sql`${invoices.amountDue} > 0`,
      ),
    });

    const customerAgingMap = new Map<
      string,
      {
        current: number;
        days1to30: number;
        days31to60: number;
        days61to90: number;
        days90plus: number;
        total: number;
      }
    >();

    for (const invoice of unpaidInvoices) {
      const existing = customerAgingMap.get(invoice.customerId) ?? {
        current: 0,
        days1to30: 0,
        days31to60: 0,
        days61to90: 0,
        days90plus: 0,
        total: 0,
      };

      const daysSinceDue = Math.floor(
        (snapshotDate.getTime() - new Date(invoice.dueDate).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      const amount = parseFloat(invoice.amountDue);

      if (daysSinceDue <= 0) {
        existing.current += amount;
      } else if (daysSinceDue <= 30) {
        existing.days1to30 += amount;
      } else if (daysSinceDue <= 60) {
        existing.days31to60 += amount;
      } else if (daysSinceDue <= 90) {
        existing.days61to90 += amount;
      } else {
        existing.days90plus += amount;
      }

      existing.total += amount;
      customerAgingMap.set(invoice.customerId, existing);
    }

    const results = {
      snapshotDate: snapshotDate.toISOString(),
      totalOutstanding: 0,
      agingByBucket: {
        current: 0,
        days1to30: 0,
        days31to60: 0,
        days61to90: 0,
        days90plus: 0,
      },
      customerCount: customerAgingMap.size,
      entries: [] as Array<{
        customerId: string;
        current: number;
        days1to30: number;
        days31to60: number;
        days61to90: number;
        days90plus: number;
        total: number;
      }>,
    };

    for (const [customerId, aging] of customerAgingMap) {
      await db.insert(arAging).values({
        tenantId,
        customerId,
        snapshotDate,
        currentAmount: String(aging.current),
        days1to30: String(aging.days1to30),
        days31to60: String(aging.days31to60),
        days61to90: String(aging.days61to90),
        days90plus: String(aging.days90plus),
        totalOutstanding: String(aging.total),
      });

      results.totalOutstanding += aging.total;
      results.agingByBucket.current += aging.current;
      results.agingByBucket.days1to30 += aging.days1to30;
      results.agingByBucket.days31to60 += aging.days31to60;
      results.agingByBucket.days61to90 += aging.days61to90;
      results.agingByBucket.days90plus += aging.days90plus;

      results.entries.push({ customerId, ...aging });
    }

    return results;
  },
});

export const calculateDso = task({
  id: "calculate-dso",
  maxDuration: 120,
  retry: { maxAttempts: 3 },
  run: async (payload: CalculateDsoPayload, { ctx }) => {
    const { tenantId, periodMonths = 3 } = payload;
    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setMonth(periodStart.getMonth() - periodMonths);

    const periodDays = periodMonths * 30;

    const totalCreditSales = await db.query.invoices.findMany({
      where: and(
        eq(invoices.tenantId, tenantId),
        sql`${invoices.createdAt} >= ${periodStart}`,
      ),
    });

    const totalSalesAmount = totalCreditSales.reduce(
      (sum, inv) => sum + parseFloat(inv.total),
      0,
    );

    const unpaidInvoices = await db.query.invoices.findMany({
      where: and(
        eq(invoices.tenantId, tenantId),
        sql`${invoices.status} IN ('pending', 'sent', 'viewed', 'partial', 'overdue')`,
        sql`${invoices.amountDue} > 0`,
      ),
    });

    const totalReceivables = unpaidInvoices.reduce(
      (sum, inv) => sum + parseFloat(inv.amountDue),
      0,
    );

    const dso =
      totalSalesAmount > 0
        ? (totalReceivables / totalSalesAmount) * periodDays
        : 0;

    return {
      periodMonths,
      totalSales: String(totalSalesAmount),
      totalReceivables: String(totalReceivables),
      dso: Math.round(dso * 100) / 100,
      invoiceCount: totalCreditSales.length,
      unpaidCount: unpaidInvoices.length,
    };
  },
});

export const generatePnlSummary = task({
  id: "generate-pnl-summary",
  maxDuration: 300,
  retry: { maxAttempts: 3 },
  run: async (payload: GeneratePnlPayload, { ctx }) => {
    const { tenantId, startDate, endDate } = payload;
    const start = new Date(startDate);
    const end = new Date(endDate);

    const periodInvoices = await db.query.invoices.findMany({
      where: and(
        eq(invoices.tenantId, tenantId),
        sql`${invoices.issueDate} >= ${start}`,
        sql`${invoices.issueDate} <= ${end}`,
      ),
    });

    const periodPayments = await db.query.payments.findMany({
      where: and(
        eq(payments.tenantId, tenantId),
        eq(payments.status, "completed"),
        sql`${payments.processedAt} >= ${start}`,
        sql`${payments.processedAt} <= ${end}`,
      ),
    });

    const revenue = {
      total: 0,
      byStatus: {
        paid: 0,
        pending: 0,
        overdue: 0,
        cancelled: 0,
      },
      invoiceCount: periodInvoices.length,
    };

    for (const invoice of periodInvoices) {
      const total = parseFloat(invoice.total);
      revenue.total += total;

      switch (invoice.status) {
        case "paid":
          revenue.byStatus.paid += total;
          break;
        case "pending":
        case "sent":
        case "viewed":
          revenue.byStatus.pending += total;
          break;
        case "overdue":
          revenue.byStatus.overdue += total;
          break;
        case "cancelled":
          revenue.byStatus.cancelled += total;
          break;
      }
    }

    const cashCollected = periodPayments.reduce(
      (sum, p) => sum + parseFloat(p.amount),
      0,
    );

    const outstanding = revenue.total - cashCollected;

    const collectedInvoices = periodInvoices.filter((i) => i.status === "paid");
    const collectionRate =
      revenue.total > 0 ? (revenue.byStatus.paid / revenue.total) * 100 : 0;

    return {
      period: { startDate, endDate },
      revenue: {
        total: String(revenue.total),
        ...Object.fromEntries(
          Object.entries(revenue.byStatus).map(([k, v]) => [k, String(v)]),
        ),
      },
      cashCollected: String(cashCollected),
      outstanding: String(outstanding),
      collectionRate: Math.round(collectionRate * 100) / 100,
      invoiceCount: revenue.invoiceCount,
      collectedCount: collectedInvoices.length,
    };
  },
});
