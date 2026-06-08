import { db } from '@/lib/db';
import {
  invoices,
  payments,
  subscriptions,
  cashFlowForecast,
  type CashFlowForecast,
  type NewCashFlowForecast,
  invoiceStatusEnum,
  paymentStatusEnum,
} from '@/lib/db/schema';
import { eq, and, sql, gte, lte, desc } from 'drizzle-orm';
import {
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  format,
  eachMonthOfInterval,
  startOfDay,
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

export interface CashflowProjection {
  date: string;
  expectedInflows: string;
  expectedOutflows: string;
  netCashFlow: string;
  confidence: number;
  cumulativeBalance: string;
}

export interface RunwayResult {
  currentBalance: string;
  averageMonthlyBurn: string;
  runwayMonths: number;
  projectedDepletionDate: string | null;
  monthlyBurnRates: { month: string; burn: string }[];
}

export interface InflowAnalysis {
  totalReceived: string;
  totalPending: string;
  byMethod: Record<string, string>;
  byCustomer: { customerId: string; amount: string }[];
  collectionRate: number;
}

export interface OutflowAnalysis {
  totalPaid: string;
  totalOutstanding: string;
  overdueAmount: string;
  agingBuckets: {
    current: string;
    days1to30: string;
    days31to60: string;
    days61to90: string;
    days90plus: string;
  };
}

export class CashflowService {
  static async getProjections(
    tenantId: string,
    months = 6,
  ): Promise<CashflowProjection[]> {
    const now = new Date();
    const projections: CashflowProjection[] = [];

    const expectedInflows = await this.getExpectedInflows(tenantId, months);

    let cumulativeBalance = Number(
      (await this.getCurrentBalance(tenantId)).currentBalance,
    );

    for (let i = 0; i < months; i++) {
      const monthDate = addMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const inflows = expectedInflows[i] ?? '0';
      const outflows = await this.getExpectedOutflows(
        tenantId,
        monthStart,
        monthEnd,
      );

      const net = Number(inflows) - Number(outflows);
      cumulativeBalance += net;

      projections.push({
        date: format(monthDate, 'yyyy-MM'),
        expectedInflows: inflows,
        expectedOutflows: outflows,
        netCashFlow: net.toFixed(4),
        confidence: Math.max(50, 100 - i * 8),
        cumulativeBalance: cumulativeBalance.toFixed(4),
      });
    }

    return projections;
  }

  static async getRunway(tenantId: string): Promise<RunwayResult> {
    const balance = await this.getCurrentBalance(tenantId);
    const monthlyBurns = await this.getMonthlyBurnRates(tenantId, 6);

    let totalBurn = 0;
    const burnRates: { month: string; burn: string }[] = [];

    for (const burn of monthlyBurns) {
      totalBurn += Number(burn.burn);
      burnRates.push({ month: burn.month, burn: burn.burn });
    }

    const avgBurn = monthlyBurns.length > 0 ? totalBurn / monthlyBurns.length : 0;
    const currentBalance = Number(balance.currentBalance);
    const runwayMonths = avgBurn > 0 ? Math.floor(currentBalance / avgBurn) : Infinity;

    let depletionDate: string | null = null;
    if (runwayMonths !== Infinity && runwayMonths >= 0) {
      depletionDate = format(
        addMonths(new Date(), runwayMonths),
        'yyyy-MM-dd',
      );
    }

    return {
      currentBalance: balance.currentBalance,
      averageMonthlyBurn: avgBurn.toFixed(4),
      runwayMonths: runwayMonths === Infinity ? -1 : runwayMonths,
      projectedDepletionDate: depletionDate,
      monthlyBurnRates: burnRates,
    };
  }

  static async getInflowAnalysis(
    tenantId: string,
    period?: { start: Date; end: Date },
  ): Promise<InflowAnalysis> {
    const now = new Date();
    const start = period?.start ?? startOfMonth(now);
    const end = period?.end ?? endOfMonth(now);

    const [received] = await db
      .select({
        total: sql<string>`coalesce(sum(${payments.amount}), '0')`,
      })
      .from(payments)
      .where(
        and(
          eq(payments.tenantId, tenantId),
          eq(payments.status, 'completed'),
          gte(payments.receivedAt, start),
          lte(payments.receivedAt, end),
        ),
      );

    const [pending] = await db
      .select({
        total: sql<string>`coalesce(sum(${payments.amount}), '0')`,
      })
      .from(payments)
      .where(
        and(
          eq(payments.tenantId, tenantId),
          sql`${payments.status} in ('pending', 'processing')`,
          gte(payments.createdAt, start),
          lte(payments.createdAt, end),
        ),
      );

    const byMethodRaw = await db
      .select({
        method: payments.paymentMethod,
        total: sql<string>`coalesce(sum(${payments.amount}), '0')`,
      })
      .from(payments)
      .where(
        and(
          eq(payments.tenantId, tenantId),
          eq(payments.status, 'completed'),
          gte(payments.receivedAt, start),
          lte(payments.receivedAt, end),
        ),
      )
      .groupBy(payments.paymentMethod);

    const byMethod: Record<string, string> = {};
    for (const row of byMethodRaw) {
      byMethod[row.method] = row.total;
    }

    const byCustomerRaw = await db
      .select({
        customerId: payments.customerId,
        total: sql<string>`coalesce(sum(${payments.amount}), '0')`,
      })
      .from(payments)
      .where(
        and(
          eq(payments.tenantId, tenantId),
          eq(payments.status, 'completed'),
          gte(payments.receivedAt, start),
          lte(payments.receivedAt, end),
        ),
      )
      .groupBy(payments.customerId)
      .orderBy(sql`sum(${payments.amount}) desc`)
      .limit(20);

    const [totalInvoiced] = await db
      .select({
        total: sql<string>`coalesce(sum(${invoices.total}), '0')`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          gte(invoices.issueDate, start),
          lte(invoices.issueDate, end),
        ),
      );

    const receivedAmount = Number(received?.total ?? '0');
    const invoicedAmount = Number(totalInvoiced?.total ?? '1');
    const collectionRate =
      invoicedAmount > 0 ? (receivedAmount / invoicedAmount) * 100 : 0;

    return {
      totalReceived: receivedAmount.toFixed(4),
      totalPending: Number(pending?.total ?? '0').toFixed(4),
      byMethod,
      byCustomer: byCustomerRaw.map((r) => ({
        customerId: r.customerId,
        amount: r.total,
      })),
      collectionRate: Math.round(collectionRate * 100) / 100,
    };
  }

  static async getOutflowAnalysis(
    tenantId: string,
    period?: { start: Date; end: Date },
  ): Promise<OutflowAnalysis> {
    const now = new Date();
    const start = period?.start ?? startOfMonth(now);
    const end = period?.end ?? endOfMonth(now);

    const [outstanding] = await db
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

    const [overdue] = await db
      .select({
        total: sql<string>`coalesce(sum(${invoices.amountDue}), '0')`,
      })
      .from(invoices)
      .where(
        and(eq(invoices.tenantId, tenantId), eq(invoices.status, 'overdue')),
      );

    const aging = await this.getAgingBuckets(tenantId);

    return {
      totalPaid: '0',
      totalOutstanding: outstanding?.total ?? '0',
      overdueAmount: overdue?.total ?? '0',
      agingBuckets: aging,
    };
  }

  static async storeForecast(
    tenantId: string,
    data: Omit<NewCashFlowForecast, 'id' | 'tenantId' | 'createdAt'>,
  ): Promise<CashFlowForecast> {
    const [created] = await db
      .insert(cashFlowForecast)
      .values({ ...data, tenantId })
      .returning();
    return created;
  }

  static async getForecasts(
    tenantId: string,
    limit = 30,
  ): Promise<CashFlowForecast[]> {
    return db.query.cashFlowForecast.findMany({
      where: eq(cashFlowForecast.tenantId, tenantId),
      orderBy: desc(cashFlowForecast.forecastDate),
      limit,
    });
  }

  private static async getCurrentBalance(
    tenantId: string,
  ): Promise<{ currentBalance: string }> {
    const [totalPaid] = await db
      .select({
        total: sql<string>`coalesce(sum(${payments.amount}), '0')`,
      })
      .from(payments)
      .where(
        and(
          eq(payments.tenantId, tenantId),
          eq(payments.status, 'completed'),
        ),
      );

    const [totalInvoiced] = await db
      .select({
        total: sql<string>`coalesce(sum(${invoices.total}), '0')`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          sql`${invoices.status} != 'cancelled'`,
        ),
      );

    const balance =
      Number(totalPaid?.total ?? '0') - Number(totalInvoiced?.total ?? '0');
    return { currentBalance: balance.toFixed(4) };
  }

  private static async getExpectedInflows(
    tenantId: string,
    months: number,
  ): Promise<string[]> {
    const now = new Date();
    const inflows: string[] = [];

    for (let i = 0; i < months; i++) {
      const monthDate = addMonths(now, i);
      const monthEnd = endOfMonth(monthDate);

      const [result] = await db
        .select({
          total: sql<string>`coalesce(sum(${invoices.amountDue}), '0')`,
        })
        .from(invoices)
        .where(
          and(
            eq(invoices.tenantId, tenantId),
            sql`${invoices.status} in ('sent', 'viewed', 'overdue', 'partial')`,
            lte(invoices.dueDate, monthEnd),
          ),
        );

      inflows.push(result?.total ?? '0');
    }

    return inflows;
  }

  private static async getExpectedOutflows(
    tenantId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<string> {
    const subscriptionsTotal = await db
      .select({
        total: sql<string>`coalesce(sum(${subscriptions.recurringAmount}), '0')`,
      })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.tenantId, tenantId),
          eq(subscriptions.status, 'active'),
        ),
      );

    return subscriptionsTotal[0]?.total ?? '0';
  }

  private static async getMonthlyBurnRates(
    tenantId: string,
    months: number,
  ): Promise<{ month: string; burn: string }[]> {
    const now = new Date();
    const burns: { month: string; burn: string }[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);

      const [result] = await db
        .select({
          total: sql<string>`coalesce(sum(${invoices.total}), '0')`,
        })
        .from(invoices)
        .where(
          and(
            eq(invoices.tenantId, tenantId),
            sql`${invoices.status} != 'cancelled'`,
            gte(invoices.issueDate, monthStart),
            lte(invoices.issueDate, monthEnd),
          ),
        );

      burns.push({
        month: format(monthDate, 'yyyy-MM'),
        burn: result?.total ?? '0',
      });
    }

    return burns;
  }

  private static async getAgingBuckets(
    tenantId: string,
  ): Promise<OutflowAnalysis['agingBuckets']> {
    const now = new Date();

    const overdueInvoices = await db
      .select({
        amountDue: invoices.amountDue,
        dueDate: invoices.dueDate,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          sql`${invoices.status} in ('overdue', 'partial', 'sent', 'viewed')`,
        ),
      );

    const buckets = {
      current: 0,
      days1to30: 0,
      days31to60: 0,
      days61to90: 0,
      days90plus: 0,
    };

    for (const inv of overdueInvoices) {
      const dueDate = new Date(inv.dueDate);
      const daysOverdue = Math.max(
        0,
        Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)),
      );
      const amount = Number(inv.amountDue);

      if (daysOverdue <= 0) {
        buckets.current += amount;
      } else if (daysOverdue <= 30) {
        buckets.days1to30 += amount;
      } else if (daysOverdue <= 60) {
        buckets.days31to60 += amount;
      } else if (daysOverdue <= 90) {
        buckets.days61to90 += amount;
      } else {
        buckets.days90plus += amount;
      }
    }

    return {
      current: buckets.current.toFixed(4),
      days1to30: buckets.days1to30.toFixed(4),
      days31to60: buckets.days31to60.toFixed(4),
      days61to90: buckets.days61to90.toFixed(4),
      days90plus: buckets.days90plus.toFixed(4),
    };
  }
}
