import { z } from 'zod';
import { db } from '@/lib/db';
import {
  invoices, payments, customers, revenueMetrics, arAging,
  customerMetrics, cashFlowForecast
} from '@/lib/db/schema';
import { eq, and, desc, sql, count, sum, gte, lte, avg } from 'drizzle-orm';
import { AgentContext, AgentToolResult } from '../types';

export const getARAgingInputSchema = z.object({
  customerId: z.string().uuid().optional(),
  snapshotDate: z.string().datetime().optional(),
});

export const getRevenueMetricsInputSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  granularity: z.enum(['daily', 'weekly', 'monthly']).optional().default('monthly'),
});

export const getCollectionAnalyticsInputSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const getCashFlowForecastInputSchema = z.object({
  forecastDays: z.number().int().min(1).max(365).optional().default(30),
});

export const getDSOInputSchema = z.object({
  periodDays: z.number().int().min(1).max(365).optional().default(90),
});

export async function getARAging(
  context: AgentContext,
  input: z.infer<typeof getARAgingInputSchema>
): Promise<AgentToolResult> {
  try {
    const conditions = [
      eq(invoices.tenantId, context.tenantId),
      sql`${invoices.status} IN ('sent', 'viewed', 'partial', 'overdue')`,
    ];

    if (input.customerId) {
      conditions.push(eq(invoices.customerId, input.customerId));
    }

    const agingData = await db
      .select({
        customerId: invoices.customerId,
        customerName: customers.name,
        current: sql<string>`coalesce(sum(case when ${invoices.dueDate} >= current_date then ${invoices.amountDue} else 0 end), '0')`,
        days1to30: sql<string>`coalesce(sum(case when ${invoices.dueDate} >= current_date - interval '30 days' and ${invoices.dueDate} < current_date then ${invoices.amountDue} else 0 end), '0')`,
        days31to60: sql<string>`coalesce(sum(case when ${invoices.dueDate} >= current_date - interval '60 days' and ${invoices.dueDate} < current_date - interval '30 days' then ${invoices.amountDue} else 0 end), '0')`,
        days61to90: sql<string>`coalesce(sum(case when ${invoices.dueDate} >= current_date - interval '90 days' and ${invoices.dueDate} < current_date - interval '60 days' then ${invoices.amountDue} else 0 end), '0')`,
        days90plus: sql<string>`coalesce(sum(case when ${invoices.dueDate} < current_date - interval '90 days' then ${invoices.amountDue} else 0 end), '0')`,
        totalOutstanding: sql<string>`coalesce(sum(${invoices.amountDue}), '0')`,
      })
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .where(and(...conditions))
      .groupBy(invoices.customerId, customers.name);

    const totalAR = agingData.reduce((sum, row) => sum + parseFloat(row.totalOutstanding), 0);

    return {
      success: true,
      data: {
        aging: agingData.map(row => ({
          customerId: row.customerId,
          customerName: row.customerName,
          current: parseFloat(row.current),
          days1to30: parseFloat(row.days1to30),
          days31to60: parseFloat(row.days31to60),
          days61to90: parseFloat(row.days61to90),
          days90plus: parseFloat(row.days90plus),
          totalOutstanding: parseFloat(row.totalOutstanding),
          percentage: totalAR > 0 ? (parseFloat(row.totalOutstanding) / totalAR) * 100 : 0,
        })),
        totals: {
          current: agingData.reduce((sum, row) => sum + parseFloat(row.current), 0),
          days1to30: agingData.reduce((sum, row) => sum + parseFloat(row.days1to30), 0),
          days31to60: agingData.reduce((sum, row) => sum + parseFloat(row.days31to60), 0),
          days61to90: agingData.reduce((sum, row) => sum + parseFloat(row.days61to90), 0),
          days90plus: agingData.reduce((sum, row) => sum + parseFloat(row.days90plus), 0),
          total: totalAR,
        },
        snapshotDate: input.snapshotDate || new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get AR aging',
    };
  }
}

export async function getRevenueMetrics(
  context: AgentContext,
  input: z.infer<typeof getRevenueMetricsInputSchema>
): Promise<AgentToolResult> {
  try {
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);

    const metrics = await db.query.revenueMetrics.findMany({
      where: and(
        eq(revenueMetrics.tenantId, context.tenantId),
        gte(revenueMetrics.periodStart, startDate),
        lte(revenueMetrics.periodEnd, endDate)
      ),
      orderBy: [asc(revenueMetrics.periodStart)],
    });

    const [aggregateStats] = await db
      .select({
        totalRevenue: sum(revenueMetrics.totalRevenue),
        recurringRevenue: sum(revenueMetrics.recurringRevenue),
        oneTimeRevenue: sum(revenueMetrics.oneTimeRevenue),
        usageRevenue: sum(revenueMetrics.usageRevenue),
        totalInvoices: sum(revenueMetrics.totalInvoices),
        paidInvoices: sum(revenueMetrics.paidInvoices),
        overdueInvoices: sum(revenueMetrics.overdueInvoices),
      })
      .from(revenueMetrics)
      .where(
        and(
          eq(revenueMetrics.tenantId, context.tenantId),
          gte(revenueMetrics.periodStart, startDate),
          lte(revenueMetrics.periodEnd, endDate)
        )
      );

    const totalInvoices = Number(aggregateStats?.totalInvoices || 0);
    const paidInvoices = Number(aggregateStats?.paidInvoices || 0);
    const collectionRate = totalInvoices > 0 ? (paidInvoices / totalInvoices) * 100 : 0;

    const averageInvoiceValue = totalInvoices > 0
      ? parseFloat(String(aggregateStats?.totalRevenue || '0')) / totalInvoices
      : 0;

    return {
      success: true,
      data: {
        period: { start: startDate, end: endDate },
        metrics: metrics.map(m => ({
          periodStart: m.periodStart,
          periodEnd: m.periodEnd,
          totalRevenue: parseFloat(m.totalRevenue),
          recurringRevenue: parseFloat(m.recurringRevenue),
          oneTimeRevenue: parseFloat(m.oneTimeRevenue),
          usageRevenue: parseFloat(m.usageRevenue),
          totalInvoices: m.totalInvoices,
          paidInvoices: m.paidInvoices,
          overdueInvoices: m.overdueInvoices,
          averageInvoiceValue: parseFloat(m.averageInvoiceValue),
        })),
        aggregate: {
          totalRevenue: parseFloat(aggregateStats?.totalRevenue || '0'),
          recurringRevenue: parseFloat(aggregateStats?.recurringRevenue || '0'),
          oneTimeRevenue: parseFloat(aggregateStats?.oneTimeRevenue || '0'),
          usageRevenue: parseFloat(aggregateStats?.usageRevenue || '0'),
          totalInvoices,
          paidInvoices,
          overdueInvoices: aggregateStats?.overdueInvoices || 0,
          collectionRate: Math.round(collectionRate * 100) / 100,
          averageInvoiceValue: Math.round(averageInvoiceValue * 100) / 100,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get revenue metrics',
    };
  }
}

export async function getCollectionAnalytics(
  context: AgentContext,
  input: z.infer<typeof getCollectionAnalyticsInputSchema>
): Promise<AgentToolResult> {
  try {
    const conditions = [eq(payments.tenantId, context.tenantId)];

    if (input.startDate) {
      conditions.push(gte(payments.createdAt, new Date(input.startDate)));
    }
    if (input.endDate) {
      conditions.push(lte(payments.createdAt, new Date(input.endDate)));
    }

    const paymentStats = await db
      .select({
        status: payments.status,
        count: count(),
        totalAmount: sum(payments.amount),
      })
      .from(payments)
      .where(and(...conditions))
      .groupBy(payments.status);

    const methodStats = await db
      .select({
        method: payments.paymentMethod,
        count: count(),
        totalAmount: sum(payments.amount),
      })
      .from(payments)
      .where(and(...conditions, eq(payments.status, 'completed')))
      .groupBy(payments.paymentMethod);

    const dailyStats = await db
      .select({
        date: sql<string>`date(${payments.createdAt})`,
        count: count(),
        totalAmount: sum(payments.amount),
      })
      .from(payments)
      .where(and(...conditions, eq(payments.status, 'completed')))
      .groupBy(sql`date(${payments.createdAt})`)
      .orderBy(sql`date(${payments.createdAt})`);

    return {
      success: true,
      data: {
        byStatus: paymentStats.map(s => ({
          status: s.status,
          count: s.count,
          totalAmount: parseFloat(s.totalAmount || '0'),
        })),
        byMethod: methodStats.map(m => ({
          method: m.method,
          count: m.count,
          totalAmount: parseFloat(m.totalAmount || '0'),
        })),
        dailyTrend: dailyStats.map(d => ({
          date: d.date,
          count: d.count,
          totalAmount: parseFloat(d.totalAmount || '0'),
        })),
        summary: {
          totalPayments: paymentStats.reduce((sum, s) => sum + s.count, 0),
          totalCollected: paymentStats
            .filter(s => s.status === 'completed')
            .reduce((sum, s) => sum + parseFloat(s.totalAmount || '0'), 0),
          successRate: paymentStats.reduce((sum, s) => sum + s.count, 0) > 0
            ? (paymentStats.find(s => s.status === 'completed')?.count || 0) /
              paymentStats.reduce((sum, s) => sum + s.count, 0) * 100
            : 0,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get collection analytics',
    };
  }
}

export async function getCashFlowForecast(
  context: AgentContext,
  input: z.infer<typeof getCashFlowForecastInputSchema>
): Promise<AgentToolResult> {
  try {
    const today = new Date();
    const forecastEnd = new Date(today);
    forecastEnd.setDate(forecastEnd.getDate() + input.forecastDays);

    const upcomingInvoices = await db
      .select({
        dueDate: sql<string>`date(${invoices.dueDate})`,
        totalDue: sum(invoices.amountDue),
        count: count(),
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, context.tenantId),
          sql`${invoices.status} IN ('sent', 'viewed', 'partial', 'overdue')`,
          gte(invoices.dueDate, today),
          lte(invoices.dueDate, forecastEnd)
        )
      )
      .groupBy(sql`date(${invoices.dueDate})`)
      .orderBy(sql`date(${invoices.dueDate})`);

    const historicalPaymentRate = await db
      .select({
        avgDaysToPay: sql<number>`avg(extract(day from ${payments.receivedAt} - ${invoices.dueDate}))`,
        paymentRate: sql<number>`count(${payments.id})::float / nullif(count(${invoices.id}), 0)`,
      })
      .from(invoices)
      .leftJoin(
        payments,
        and(
          eq(payments.customerId, invoices.customerId),
          eq(payments.tenantId, invoices.tenantId),
          eq(payments.status, 'completed')
        )
      )
      .where(
        and(
          eq(invoices.tenantId, context.tenantId),
          lte(invoices.dueDate, today)
        )
      );

    const avgPaymentRate = historicalPaymentRate[0]?.paymentRate || 0.8;
    const avgDaysToPay = historicalPaymentRate[0]?.avgDaysToPay || 5;

    const projectedInflows = upcomingInvoices.map(inv => ({
      date: inv.dueDate,
      expectedAmount: parseFloat(inv.totalDue || '0') * avgPaymentRate,
      confidence: Math.min(0.95, 0.6 + (avgPaymentRate * 0.3)),
      invoiceCount: inv.count,
    }));

    const cumulativeInflows = projectedInflows.reduce((acc, inflow) => {
      const prevTotal = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
      return [...acc, {
        ...inflow,
        cumulative: prevTotal + inflow.expectedAmount,
      }];
    }, [] as Array<typeof projectedInflows[0] & { cumulative: number }>);

    return {
      success: true,
      data: {
        forecastPeriod: {
          start: today.toISOString(),
          end: forecastEnd.toISOString(),
          days: input.forecastDays,
        },
        projectedInflows: cumulativeInflows,
        historicalMetrics: {
          averagePaymentRate: Math.round(avgPaymentRate * 100) / 100,
          averageDaysToPay: Math.round(avgDaysToPay),
        },
        totalExpectedInflows: cumulativeInflows.reduce(
          (sum, i) => sum + i.expectedAmount, 0
        ),
        averageDailyInflow: cumulativeInflows.reduce(
          (sum, i) => sum + i.expectedAmount, 0
        ) / Math.max(cumulativeInflows.length, 1),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get cash flow forecast',
    };
  }
}

export async function getDSO(
  context: AgentContext,
  input: z.infer<typeof getDSOInputSchema>
): Promise<AgentToolResult> {
  try {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - input.periodDays);

    const [revenueStats] = await db
      .select({
        totalRevenue: sql<string>`coalesce(sum(${revenueMetrics.totalRevenue}), '0')`,
      })
      .from(revenueMetrics)
      .where(
        and(
          eq(revenueMetrics.tenantId, context.tenantId),
          gte(revenueMetrics.periodStart, startDate),
          lte(revenueMetrics.periodEnd, endDate)
        )
      );

    const [arStats] = await db
      .select({
        totalOutstanding: sql<string>`coalesce(sum(${invoices.amountDue}), '0')`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, context.tenantId),
          sql`${invoices.status} IN ('sent', 'viewed', 'partial', 'overdue')`
        )
      );

    const totalRevenue = parseFloat(revenueStats?.totalRevenue || '0');
    const totalOutstanding = parseFloat(arStats?.totalOutstanding || '0');

    const dailyRevenue = totalRevenue / input.periodDays;
    const currentDSO = dailyRevenue > 0 ? totalOutstanding / dailyRevenue : 0;

    const historicalDSO = await db
      .select({
        periodStart: revenueMetrics.periodStart,
        totalRevenue: revenueMetrics.totalRevenue,
      })
      .from(revenueMetrics)
      .where(
        and(
          eq(revenueMetrics.tenantId, context.tenantId),
          gte(revenueMetrics.periodStart, new Date(startDate.getTime() - 180 * 24 * 60 * 60 * 1000))
        )
      )
      .orderBy(asc(revenueMetrics.periodStart));

    const dsoTrend = historicalDSO.length >= 2
      ? (currentDSO - (historicalDSO[0] ? totalOutstanding / (parseFloat(historicalDSO[0].totalRevenue) / input.periodDays) : currentDSO))
      : 0;

    return {
      success: true,
      data: {
        currentDSO: Math.round(currentDSO * 100) / 100,
        periodDays: input.periodDays,
        totalRevenue,
        totalOutstanding,
        dailyRevenue: Math.round(dailyRevenue * 100) / 100,
        trend: {
          direction: dsoTrend > 1 ? 'worsening' : dsoTrend < -1 ? 'improving' : 'stable',
          change: Math.round(dsoTrend * 100) / 100,
        },
        benchmark: {
          industry: 'SaaS',
          medianDSO: 45,
          topQuartile: 35,
          bottomQuartile: 60,
        },
        historicalData: historicalDSO.map(h => ({
          periodStart: h.periodStart,
          revenue: parseFloat(h.totalRevenue),
        })),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get DSO metrics',
    };
  }
}

function asc(column: unknown) {
  return sql`${column} asc`;
}

export const analyticsTools = {
  getARAging: {
    name: 'get_ar_aging',
    description: 'Get accounts receivable aging report with bucketed outstanding amounts',
    inputSchema: getARAgingInputSchema,
    handler: getARAging,
  },
  getRevenueMetrics: {
    name: 'get_revenue_metrics',
    description: 'Get revenue metrics for a specified time period',
    inputSchema: getRevenueMetricsInputSchema,
    handler: getRevenueMetrics,
  },
  getCollectionAnalytics: {
    name: 'get_collection_analytics',
    description: 'Get payment collection analytics and trends',
    inputSchema: getCollectionAnalyticsInputSchema,
    handler: getCollectionAnalytics,
  },
  getCashFlowForecast: {
    name: 'get_cash_flow_forecast',
    description: 'Generate cash flow forecast based on upcoming invoices and historical payment patterns',
    inputSchema: getCashFlowForecastInputSchema,
    handler: getCashFlowForecast,
  },
  getDSO: {
    name: 'get_dso_metrics',
    description: 'Calculate Days Sales Outstanding and trend analysis',
    inputSchema: getDSOInputSchema,
    handler: getDSO,
  },
};
