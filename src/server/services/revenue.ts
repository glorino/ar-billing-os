import { db } from '@/lib/db';
import {
  invoices,
  invoiceItems,
  subscriptions,
  customers,
  revenueMetrics,
  type RevenueMetric,
  type NewRevenueMetric,
} from '@/lib/db/schema';
import { eq, and, sql, gte, lte, desc } from 'drizzle-orm';
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
} from 'date-fns';

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

export interface PeriodRange {
  start: Date;
  end: Date;
}

export interface MRRResult {
  currentMRR: string;
  previousMRR: string;
  mrrGrowth: string;
  mrrGrowthPercent: number;
}

export interface ARRResult {
  currentARR: string;
  previousARR: string;
  arrGrowth: string;
  arrGrowthPercent: number;
}

export interface ChurnResult {
  churnedCustomers: number;
  totalCustomers: number;
  churnRate: number;
  revenueChurned: string;
  totalRevenue: string;
  revenueChurnRate: number;
}

export interface CohortEntry {
  cohort: string;
  customers: number;
  retention: number[];
  revenue: number[];
}

export interface RevenueBreakdown {
  subscriptionRevenue: string;
  usageRevenue: string;
  oneTimeRevenue: string;
  totalRevenue: string;
}

export class RevenueService {
  static async getMRR(tenantId: string): Promise<MRRResult> {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    const previousMonthStart = startOfMonth(subMonths(now, 1));
    const previousMonthEnd = endOfMonth(subMonths(now, 1));

    const currentMRR = await this.getRecurringRevenue(
      tenantId,
      currentMonthStart,
      currentMonthEnd,
    );
    const previousMRR = await this.getRecurringRevenue(
      tenantId,
      previousMonthStart,
      previousMonthEnd,
    );

    const growth = Number(currentMRR) - Number(previousMRR);
    const growthPercent =
      Number(previousMRR) > 0 ? (growth / Number(previousMRR)) * 100 : 0;

    return {
      currentMRR,
      previousMRR,
      mrrGrowth: growth.toFixed(4),
      mrrGrowthPercent: Math.round(growthPercent * 100) / 100,
    };
  }

  static async getARR(tenantId: string): Promise<ARRResult> {
    const mrr = await this.getMRR(tenantId);
    const currentARR = (Number(mrr.currentMRR) * 12).toFixed(4);
    const previousARR = (Number(mrr.previousMRR) * 12).toFixed(4);
    const growth = Number(currentARR) - Number(previousARR);
    const growthPercent =
      Number(previousARR) > 0 ? (growth / Number(previousARR)) * 100 : 0;

    return {
      currentARR,
      previousARR,
      arrGrowth: growth.toFixed(4),
      arrGrowthPercent: Math.round(growthPercent * 100) / 100,
    };
  }

  static async getChurnRate(
    tenantId: string,
    period?: PeriodRange,
  ): Promise<ChurnResult> {
    const now = new Date();
    const periodStart = period?.start ?? startOfMonth(subMonths(now, 1));
    const periodEnd = period?.end ?? endOfMonth(subMonths(now, 1));

    const [totalCustomers] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(customers)
      .where(
        and(eq(customers.tenantId, tenantId), eq(customers.isActive, true)),
      );

    const [churnedCustomers] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(customers)
      .where(
        and(
          eq(customers.tenantId, tenantId),
          eq(customers.isActive, false),
          gte(customers.updatedAt, periodStart),
          lte(customers.updatedAt, periodEnd),
        ),
      );

    const activeCount = totalCustomers?.count ?? 0;
    const churnedCount = churnedCustomers?.count ?? 0;
    const total = activeCount + churnedCount;
    const churnRate = total > 0 ? (churnedCount / total) * 100 : 0;

    const [revenueChurned] = await db
      .select({
        total: sql<string>`coalesce(sum(${invoices.amountDue}), '0')`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          eq(invoices.status, 'written_off'),
          gte(invoices.updatedAt, periodStart),
          lte(invoices.updatedAt, periodEnd),
        ),
      );

    const [totalRevenue] = await db
      .select({
        total: sql<string>`coalesce(sum(${invoices.total}), '0')`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          gte(invoices.issueDate, periodStart),
          lte(invoices.issueDate, periodEnd),
        ),
      );

    const churnedRevenue = Number(revenueChurned?.total ?? '0');
    const totalRevenueAmount = Number(totalRevenue?.total ?? '1');
    const revenueChurnRate =
      totalRevenueAmount > 0 ? (churnedRevenue / totalRevenueAmount) * 100 : 0;

    return {
      churnedCustomers: churnedCount,
      totalCustomers: total,
      churnRate: Math.round(churnRate * 100) / 100,
      revenueChurned: churnedRevenue.toFixed(4),
      totalRevenue: totalRevenueAmount.toFixed(4),
      revenueChurnRate: Math.round(revenueChurnRate * 100) / 100,
    };
  }

  static async getRevenueBreakdown(
    tenantId: string,
    period?: PeriodRange,
  ): Promise<RevenueBreakdown> {
    const now = new Date();
    const start = period?.start ?? startOfMonth(now);
    const end = period?.end ?? endOfMonth(now);

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
          gte(invoices.paidAt, start),
          lte(invoices.paidAt, end),
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

  static async getCohortAnalysis(
    tenantId: string,
    months = 12,
  ): Promise<CohortEntry[]> {
    const cohorts: CohortEntry[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const cohortMonth = subMonths(now, i);
      const cohortLabel = format(cohortMonth, 'yyyy-MM');
      const monthStart = startOfMonth(cohortMonth);
      const monthEnd = endOfMonth(cohortMonth);

      const [cohortCustomers] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(customers)
        .where(
          and(
            eq(customers.tenantId, tenantId),
            gte(customers.createdAt, monthStart),
            lte(customers.createdAt, monthEnd),
          ),
        );

      const totalInCohort = cohortCustomers?.count ?? 0;
      if (totalInCohort === 0) continue;

      const retention: number[] = [];
      const revenue: number[] = [];

      for (let j = 0; j < months - i; j++) {
        const checkMonth = subMonths(now, i - j);
        const checkStart = startOfMonth(checkMonth);
        const checkEnd = endOfMonth(checkMonth);

        const [activeCount] = await db
          .select({ count: sql<number>`count(distinct ${invoices.customerId})::int` })
          .from(invoices)
          .where(
            and(
              eq(invoices.tenantId, tenantId),
              gte(invoices.issueDate, checkStart),
              lte(invoices.issueDate, checkEnd),
              sql`${invoices.customerId} in (select id from customers where created_at >= ${monthStart} and created_at <= ${monthEnd} and tenant_id = ${tenantId})`,
            ),
          );

        const [periodRevenue] = await db
          .select({
            total: sql<string>`coalesce(sum(${invoices.amountPaid}), '0')`,
          })
          .from(invoices)
          .where(
            and(
              eq(invoices.tenantId, tenantId),
              gte(invoices.paidAt, checkStart),
              lte(invoices.paidAt, checkEnd),
              sql`${invoices.customerId} in (select id from customers where created_at >= ${monthStart} and created_at <= ${monthEnd} and tenant_id = ${tenantId})`,
            ),
          );

        retention.push(
          totalInCohort > 0
            ? Math.round(((activeCount?.count ?? 0) / totalInCohort) * 100)
            : 0,
        );
        revenue.push(Number(periodRevenue?.total ?? '0'));
      }

      cohorts.push({
        cohort: cohortLabel,
        customers: totalInCohort,
        retention,
        revenue,
      });
    }

    return cohorts;
  }

  static async getRevenueMetrics(
    tenantId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<RevenueMetric> {
    const existing = await db.query.revenueMetrics.findFirst({
      where: and(
        eq(revenueMetrics.tenantId, tenantId),
        gte(revenueMetrics.periodStart, periodStart),
        lte(revenueMetrics.periodEnd, periodEnd),
      ),
    });

    if (existing) return existing;

    const breakdown = await this.getRevenueBreakdown(tenantId, {
      start: periodStart,
      end: periodEnd,
    });

    const [invoiceStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        paid: sql<number>`count(*) filter (where ${invoices.status} = 'paid')::int`,
        overdue: sql<number>`count(*) filter (where ${invoices.status} = 'overdue')::int`,
        avgValue: sql<string>`coalesce(avg(${invoices.total}), '0')`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          gte(invoices.issueDate, periodStart),
          lte(invoices.issueDate, periodEnd),
        ),
      );

    const [created] = await db
      .insert(revenueMetrics)
      .values({
        tenantId,
        periodStart,
        periodEnd,
        totalRevenue: breakdown.totalRevenue,
        recurringRevenue: breakdown.subscriptionRevenue,
        oneTimeRevenue: breakdown.oneTimeRevenue,
        usageRevenue: breakdown.usageRevenue,
        totalInvoices: invoiceStats?.total ?? 0,
        paidInvoices: invoiceStats?.paid ?? 0,
        overdueInvoices: invoiceStats?.overdue ?? 0,
        averageInvoiceValue: invoiceStats?.avgValue ?? '0',
      })
      .returning();

    return created;
  }

  static async getHistoricalMetrics(
    tenantId: string,
    months = 12,
  ): Promise<RevenueMetric[]> {
    const now = new Date();
    const results: RevenueMetric[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = endOfMonth(subMonths(now, i));
      const metric = await this.getRevenueMetrics(tenantId, monthStart, monthEnd);
      results.push(metric);
    }

    return results;
  }

  private static async getRecurringRevenue(
    tenantId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<string> {
    const [result] = await db
      .select({
        total: sql<string>`coalesce(sum(${subscriptions.recurringAmount}), '0')`,
      })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.tenantId, tenantId),
          sql`${subscriptions.status} in ('active', 'trialing')`,
          lte(subscriptions.currentPeriodStart, periodEnd),
          sql`(${subscriptions.currentPeriodEnd} is null or ${subscriptions.currentPeriodEnd} >= ${periodStart})`,
        ),
      );

    return result?.total ?? '0';
  }
}
