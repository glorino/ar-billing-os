import { task } from "@trigger.dev/sdk";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  revenueMetrics,
  cashFlowForecast,
  invoices,
  subscriptions,
  payments,
} from "@/lib/db/schema";

interface ForecastRevenuePayload {
  tenantId: string;
  forecastMonths?: number;
}

interface CacheForecastPayload {
  tenantId: string;
  forecastId: string;
}

export default task({
  id: "forecast-revenue",
  maxDuration: 300,
  retry: { maxAttempts: 3 },
  run: async (payload: ForecastRevenuePayload, { ctx }) => {
    const { tenantId, forecastMonths = 12 } = payload;
    const now = new Date();

    // Gather historical data
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    const historicalPayments = await db.query.payments.findMany({
      where: and(
        eq(payments.tenantId, tenantId),
        eq(payments.status, "completed"),
        sql`${payments.processedAt} >= ${sixMonthsAgo}`,
      ),
    });

    const historicalInvoices = await db.query.invoices.findMany({
      where: and(
        eq(invoices.tenantId, tenantId),
        sql`${invoices.createdAt} >= ${sixMonthsAgo}`,
      ),
    });

    // Calculate historical metrics
    const monthlyRevenue: Record<string, number> = {};
    for (const payment of historicalPayments) {
      const month = new Date(payment.processedAt!).toISOString().slice(0, 7);
      monthlyRevenue[month] = (monthlyRevenue[month] ?? 0) + parseFloat(payment.amount);
    }

    const revenueValues = Object.values(monthlyRevenue);
    const avgMonthlyRevenue =
      revenueValues.length > 0
        ? revenueValues.reduce((a, b) => a + b, 0) / revenueValues.length
        : 0;

    // Calculate growth trend
    const sortedMonths = Object.keys(monthlyRevenue).sort();
    let growthRate = 0;
    if (sortedMonths.length >= 2) {
      const firstHalf = revenueValues.slice(0, Math.floor(revenueValues.length / 2));
      const secondHalf = revenueValues.slice(Math.floor(revenueValues.length / 2));
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      growthRate = firstAvg > 0 ? (secondAvg - firstAvg) / firstAvg : 0;
    }

    // Active subscriptions for recurring revenue
    const activeSubscriptions = await db.query.subscriptions.findMany({
      where: and(
        eq(subscriptions.tenantId, tenantId),
        eq(subscriptions.status, "active"),
      ),
    });

    const monthlyRecurringRevenue = activeSubscriptions.reduce(
      (sum, sub) => sum + parseFloat(sub.recurringAmount),
      0,
    );

    // Generate forecast
    const forecasts: Array<{
      date: string;
      expectedInflows: number;
      confidence: number;
    }> = [];

    for (let i = 1; i <= forecastMonths; i++) {
      const forecastDate = new Date(now);
      forecastDate.setMonth(forecastDate.getMonth() + i);

      const projectedRevenue = avgMonthlyRevenue * Math.pow(1 + growthRate, i);
      const projectedMrr = monthlyRecurringRevenue * Math.pow(1 + growthRate * 0.5, i);
      const totalExpected = projectedRevenue + projectedMrr;

      // Confidence decreases further out
      const confidence = Math.max(0.3, 0.95 - (i - 1) * 0.06);

      forecasts.push({
        date: forecastDate.toISOString().slice(0, 7),
        expectedInflows: totalExpected,
        confidence,
      });

      await db.insert(cashFlowForecast).values({
        tenantId,
        forecastDate,
        expectedInflows: String(totalExpected),
        expectedOutflows: "0",
        netCashFlow: String(totalExpected),
        confidence: String(confidence),
        metadata: {
          monthlyRecurringRevenue: projectedMrr,
          oneTimeRevenue: projectedRevenue,
          growthRate,
          historicalMonths: revenueValues.length,
        },
      });
    }

    // Store revenue metrics for the current period
    const totalPaid = historicalPayments.reduce(
      (sum, p) => sum + parseFloat(p.amount),
      0,
    );
    const paidCount = historicalPayments.length;

    await db.insert(revenueMetrics).values({
      tenantId,
      periodStart: sixMonthsAgo,
      periodEnd: now,
      totalRevenue: String(totalPaid),
      recurringRevenue: String(monthlyRecurringRevenue * 6),
      oneTimeRevenue: String(totalPaid - monthlyRecurringRevenue * 6),
      usageRevenue: "0",
      totalInvoices: historicalInvoices.length,
      paidInvoices: historicalInvoices.filter((i) => i.status === "paid").length,
      overdueInvoices: historicalInvoices.filter((i) => i.status === "overdue").length,
      averageInvoiceValue:
        historicalInvoices.length > 0
          ? String(totalPaid / historicalInvoices.length)
          : "0",
    });

    return {
      forecastMonths,
      monthlyRecurringRevenue: String(monthlyRecurringRevenue),
      avgMonthlyRevenue: String(avgMonthlyRevenue),
      growthRate: String(growthRate),
      forecasts,
      dataPoints: revenueValues.length,
    };
  },
});

export const cacheForecast = task({
  id: "cache-forecast",
  maxDuration: 60,
  retry: { maxAttempts: 2 },
  run: async (payload: CacheForecastPayload, { ctx }) => {
    const { tenantId } = payload;

    const latestForecasts = await db.query.cashFlowForecast.findMany({
      where: eq(cashFlowForecast.tenantId, tenantId),
      orderBy: (cashFlowForecast, { desc }) => [desc(cashFlowForecast.createdAt)],
      limit: 12,
    });

    return {
      tenantId,
      cachedAt: new Date().toISOString(),
      forecasts: latestForecasts.map((f) => ({
        date: f.forecastDate,
        expectedInflows: f.expectedInflows,
        confidence: f.confidence,
      })),
    };
  },
});
