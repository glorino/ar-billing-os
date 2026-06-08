import { db } from '@/lib/db';
import {
  invoices,
  invoiceItems,
  payments,
  customers,
  ledgerAccounts,
  ledgerEntries,
  arAging,
  type ArAging,
  type NewArAging,
  invoiceStatusEnum,
  ledgerEntryTypeEnum,
  ledgerAccountTypeEnum,
} from '@/lib/db/schema';
import { eq, and, sql, gte, lte, desc } from 'drizzle-orm';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export interface PnLReport {
  revenue: {
    subscriptionRevenue: string;
    usageRevenue: string;
    oneTimeRevenue: string;
    totalRevenue: string;
  };
  expenses: {
    operatingExpenses: string;
    costOfRevenue: string;
    totalExpenses: string;
  };
  netIncome: string;
  grossMargin: number;
  netMargin: number;
}

export interface BalanceSheet {
  assets: {
    currentAssets: {
      cash: string;
      accountsReceivable: string;
      totalCurrent: string;
    };
    totalAssets: string;
  };
  liabilities: {
    currentLiabilities: {
      deferredRevenue: string;
      totalCurrent: string;
    };
    totalLiabilities: string;
  };
  equity: {
    retainedEarnings: string;
    totalEquity: string;
  };
}

export interface ARAgingReport {
  customerId: string;
  customerName: string;
  current: string;
  days1to30: string;
  days31to60: string;
  days61to90: string;
  days90plus: string;
  totalOutstanding: string;
}

export interface DSOResult {
  dso: number;
  averageDailySales: string;
  totalReceivables: string;
  periodDays: number;
}

export class ReportingService {
  static async getProfitAndLoss(
    tenantId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<PnLReport> {
    const revenue = await this.getRevenueSummary(
      tenantId,
      periodStart,
      periodEnd,
    );

    const expenses = await this.getExpenseSummary(
      tenantId,
      periodStart,
      periodEnd,
    );

    const totalRevenue = Number(revenue.totalRevenue);
    const totalExpenses = Number(expenses.totalExpenses);
    const netIncome = totalRevenue - totalExpenses;
    const grossMargin =
      totalRevenue > 0
        ? ((totalRevenue - Number(expenses.costOfRevenue)) / totalRevenue) * 100
        : 0;
    const netMargin =
      totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

    return {
      revenue,
      expenses: {
        operatingExpenses: expenses.operatingExpenses,
        costOfRevenue: expenses.costOfRevenue,
        totalExpenses: expenses.totalExpenses,
      },
      netIncome: netIncome.toFixed(4),
      grossMargin: Math.round(grossMargin * 100) / 100,
      netMargin: Math.round(netMargin * 100) / 100,
    };
  }

  static async getBalanceSheet(
    tenantId: string,
    asOfDate?: Date,
  ): Promise<BalanceSheet> {
    const cutoff = asOfDate ?? new Date();

    const [arTotal] = await db
      .select({
        total: sql<string>`coalesce(sum(${invoices.amountDue}), '0')`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          sql`${invoices.status} not in ('paid', 'cancelled', 'written_off', 'draft')`,
          lte(invoices.issueDate, cutoff),
        ),
      );

    const [cashTotal] = await db
      .select({
        total: sql<string>`coalesce(sum(${payments.amount}), '0')`,
      })
      .from(payments)
      .where(
        and(
          eq(payments.tenantId, tenantId),
          eq(payments.status, 'completed'),
          lte(payments.receivedAt, cutoff),
        ),
      );

    const [deferredRevenue] = await db
      .select({
        total: sql<string>`coalesce(sum(${invoices.total} - ${invoices.amountPaid}), '0')`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          sql`${invoices.status} in ('sent', 'viewed', 'pending')`,
          lte(invoices.issueDate, cutoff),
        ),
      );

    const [totalRevenue] = await db
      .select({
        total: sql<string>`coalesce(sum(${invoices.amountPaid}), '0')`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          eq(invoices.status, 'paid'),
          lte(invoices.paidAt, cutoff),
        ),
      );

    const [totalExpenses] = await db
      .select({
        total: sql<string>`coalesce(sum(${ledgerEntries.debitAmount}), '0')`,
      })
      .from(ledgerEntries)
      .innerJoin(ledgerAccounts, eq(ledgerEntries.accountId, ledgerAccounts.id))
      .where(
        and(
          eq(ledgerEntries.tenantId, tenantId),
          eq(ledgerAccounts.type, 'expense'),
          lte(ledgerEntries.createdAt, cutoff),
        ),
      );

    const cash = Number(cashTotal?.total ?? '0');
    const ar = Number(arTotal?.total ?? '0');
    const currentAssets = cash + ar;
    const deferred = Number(deferredRevenue?.total ?? '0');
    const retainedEarnings =
      Number(totalRevenue?.total ?? '0') - Number(totalExpenses?.total ?? '0');

    return {
      assets: {
        currentAssets: {
          cash: cash.toFixed(4),
          accountsReceivable: ar.toFixed(4),
          totalCurrent: currentAssets.toFixed(4),
        },
        totalAssets: currentAssets.toFixed(4),
      },
      liabilities: {
        currentLiabilities: {
          deferredRevenue: deferred.toFixed(4),
          totalCurrent: deferred.toFixed(4),
        },
        totalLiabilities: deferred.toFixed(4),
      },
      equity: {
        retainedEarnings: retainedEarnings.toFixed(4),
        totalEquity: retainedEarnings.toFixed(4),
      },
    };
  }

  static async getARAgingReport(
    tenantId: string,
    asOfDate?: Date,
  ): Promise<ARAgingReport[]> {
    const cutoff = asOfDate ?? new Date();

    const customerInvoices = await db
      .select({
        customerId: invoices.customerId,
        amountDue: invoices.amountDue,
        dueDate: invoices.dueDate,
        total: invoices.total,
        amountPaid: invoices.amountPaid,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          sql`${invoices.status} not in ('paid', 'cancelled', 'written_off', 'draft')`,
          lte(invoices.issueDate, cutoff),
        ),
      );

    const customerMap = new Map<
      string,
      {
        customerName: string;
        current: number;
        days1to30: number;
        days31to60: number;
        days61to90: number;
        days90plus: number;
        totalOutstanding: number;
      }
    >();

    for (const inv of customerInvoices) {
      if (!customerMap.has(inv.customerId)) {
        const customer = await db.query.customers.findFirst({
          where: eq(customers.id, inv.customerId),
        });
        customerMap.set(inv.customerId, {
          customerName: customer?.name ?? 'Unknown',
          current: 0,
          days1to30: 0,
          days31to60: 0,
          days61to90: 0,
          days90plus: 0,
          totalOutstanding: 0,
        });
      }

      const bucket = customerMap.get(inv.customerId)!;
      const amount = Number(inv.amountDue);
      const dueDate = new Date(inv.dueDate);
      const daysOverdue = Math.max(
        0,
        Math.floor(
          (cutoff.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
        ),
      );

      bucket.totalOutstanding += amount;
      if (daysOverdue <= 0) {
        bucket.current += amount;
      } else if (daysOverdue <= 30) {
        bucket.days1to30 += amount;
      } else if (daysOverdue <= 60) {
        bucket.days31to60 += amount;
      } else if (daysOverdue <= 90) {
        bucket.days61to90 += amount;
      } else {
        bucket.days90plus += amount;
      }
    }

    return Array.from(customerMap.entries()).map(([customerId, data]) => ({
      customerId,
      customerName: data.customerName,
      current: data.current.toFixed(4),
      days1to30: data.days1to30.toFixed(4),
      days31to60: data.days31to60.toFixed(4),
      days61to90: data.days61to90.toFixed(4),
      days90plus: data.days90plus.toFixed(4),
      totalOutstanding: data.totalOutstanding.toFixed(4),
    }));
  }

  static async getDSO(
    tenantId: string,
    periodDays = 30,
  ): Promise<DSOResult> {
    const now = new Date();
    const periodStart = subMonths(now, 1);

    const [totalReceivables] = await db
      .select({
        total: sql<string>`coalesce(sum(${invoices.amountDue}), '0')`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          sql`${invoices.status} not in ('paid', 'cancelled', 'written_off', 'draft')`,
        ),
      );

    const [creditSales] = await db
      .select({
        total: sql<string>`coalesce(sum(${invoices.total}), '0')`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          sql`${invoices.status} != 'cancelled'`,
          gte(invoices.issueDate, periodStart),
          lte(invoices.issueDate, now),
        ),
      );

    const receivables = Number(totalReceivables?.total ?? '0');
    const sales = Number(creditSales?.total ?? '1');
    const avgDailySales = sales / periodDays;
    const dso = avgDailySales > 0 ? receivables / avgDailySales : 0;

    return {
      dso: Math.round(dso * 100) / 100,
      averageDailySales: avgDailySales.toFixed(4),
      totalReceivables: receivables.toFixed(4),
      periodDays,
    };
  }

  static async snapshotARAging(
    tenantId: string,
    snapshotDate?: Date,
  ): Promise<ArAging[]> {
    const report = await this.getARAgingReport(tenantId, snapshotDate);
    const date = snapshotDate ?? new Date();
    const results: ArAging[] = [];

    for (const row of report) {
      const [created] = await db
        .insert(arAging)
        .values({
          tenantId,
          customerId: row.customerId,
          snapshotDate: date,
          currentAmount: row.current,
          days1to30: row.days1to30,
          days31to60: row.days31to60,
          days61to90: row.days61to90,
          days90plus: row.days90plus,
          totalOutstanding: row.totalOutstanding,
        })
        .returning();
      results.push(created);
    }

    return results;
  }

  static async getAgingHistory(
    tenantId: string,
    customerId: string,
    months = 6,
  ): Promise<ArAging[]> {
    const results: ArAging[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const snapshotDate = subMonths(new Date(), i);
      const records = await db.query.arAging.findMany({
        where: and(
          eq(arAging.tenantId, tenantId),
          eq(arAging.customerId, customerId),
        ),
        orderBy: desc(arAging.snapshotDate),
        limit: 1,
      });
      if (records.length > 0) {
        results.push(records[0]);
      }
    }
    return results;
  }

  private static async getRevenueSummary(
    tenantId: string,
    periodStart: Date,
    periodEnd: Date,
  ) {
    const items = await db
      .select({
        lineItemType: invoiceItems.lineItemType,
        amount: sql<string>`coalesce(sum(${invoiceItems.amount}), '0')`,
      })
      .from(invoiceItems)
      .innerJoin(invoices, eq(invoiceItems.invoiceId, invoices.id))
      .where(
        and(
          eq(invoiceItems.tenantId, tenantId),
          eq(invoices.status, 'paid'),
          gte(invoices.paidAt, periodStart),
          lte(invoices.paidAt, periodEnd),
        ),
      )
      .groupBy(invoiceItems.lineItemType);

    let subscriptionRevenue = 0;
    let usageRevenue = 0;
    let oneTimeRevenue = 0;

    for (const item of items) {
      const amount = Number(item.amount);
      switch (item.lineItemType) {
        case 'subscription':
          subscriptionRevenue += amount;
          break;
        case 'usage':
          usageRevenue += amount;
          break;
        case 'one_time':
          oneTimeRevenue += amount;
          break;
      }
    }

    const total = subscriptionRevenue + usageRevenue + oneTimeRevenue;

    return {
      subscriptionRevenue: subscriptionRevenue.toFixed(4),
      usageRevenue: usageRevenue.toFixed(4),
      oneTimeRevenue: oneTimeRevenue.toFixed(4),
      totalRevenue: total.toFixed(4),
    };
  }

  private static async getExpenseSummary(
    tenantId: string,
    periodStart: Date,
    periodEnd: Date,
  ) {
    const [operatingExpenses] = await db
      .select({
        total: sql<string>`coalesce(sum(${ledgerEntries.debitAmount}), '0')`,
      })
      .from(ledgerEntries)
      .innerJoin(ledgerAccounts, eq(ledgerEntries.accountId, ledgerAccounts.id))
      .where(
        and(
          eq(ledgerEntries.tenantId, tenantId),
          eq(ledgerAccounts.type, 'expense'),
          gte(ledgerEntries.createdAt, periodStart),
          lte(ledgerEntries.createdAt, periodEnd),
        ),
      );

    return {
      operatingExpenses: operatingExpenses?.total ?? '0',
      costOfRevenue: '0',
      totalExpenses: operatingExpenses?.total ?? '0',
    };
  }
}
