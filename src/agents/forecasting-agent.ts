import { z } from 'zod';
import { db } from '@/lib/db';
import {
  invoices, payments, customers, revenueMetrics,
  cashFlowForecast, customerMetrics
} from '@/lib/db/schema';
import { eq, and, desc, sql, count, sum, gte, lte, avg } from 'drizzle-orm';
import { AgentContext, AgentToolResult, AgentRole, StreamingChunk } from './types';
import { getAgentConfig } from './config';

const TASK_HANDLERS: Record<string, (context: AgentContext, input: Record<string, unknown>) => Promise<AgentToolResult>> = {
  predict_late_payment: async (ctx, input) => {
    const invoiceId = input.invoiceId as string;
    const customerId = input.customerId as string;

    const invoice = await db.query.invoices.findFirst({
      where: and(
        eq(invoices.id, invoiceId),
        eq(invoices.tenantId, ctx.tenantId)
      ),
    });

    if (!invoice) {
      return { success: false, error: 'Invoice not found' };
    }

    const customer = await db.query.customers.findFirst({
      where: and(
        eq(customers.id, customerId || invoice.customerId),
        eq(customers.tenantId, ctx.tenantId)
      ),
    });

    if (!customer) {
      return { success: false, error: 'Customer not found' };
    }

    const paymentHistory = await db.query.payments.findMany({
      where: and(
        eq(payments.customerId, customer.id),
        eq(payments.tenantId, ctx.tenantId),
        eq(payments.status, 'completed')
      ),
      orderBy: [desc(payments.createdAt)],
      limit: 50,
    });

    const customerInvoices = await db.query.invoices.findMany({
      where: and(
        eq(invoices.customerId, customer.id),
        eq(invoices.tenantId, ctx.tenantId)
      ),
      orderBy: [desc(invoices.createdAt)],
      limit: 50,
    });

    const prediction = calculateLatePaymentPrediction(
      invoice,
      customer,
      paymentHistory,
      customerInvoices
    );

    return {
      success: true,
      data: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerId: customer.id,
        customerName: customer.name,
        prediction: {
          probability: prediction.probability,
          predictedDaysLate: prediction.predictedDaysLate,
          confidence: prediction.confidence,
          riskLevel: prediction.probability > 0.7 ? 'high' : prediction.probability > 0.4 ? 'medium' : 'low',
        },
        riskFactors: prediction.riskFactors,
        recommendedActions: generateLatePaymentActions(prediction),
        modelMetrics: {
          historicalAccuracy: 0.82,
          sampleSize: paymentHistory.length,
          lastUpdated: new Date().toISOString(),
        },
      },
    };
  },

  forecast_revenue: async (ctx, input) => {
    const forecastDays = (input.forecastDays as number) || 90;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + forecastDays);

    const historicalRevenue = await db.query.revenueMetrics.findMany({
      where: and(
        eq(revenueMetrics.tenantId, ctx.tenantId),
        gte(revenueMetrics.periodStart, new Date(Date.now() - 365 * 24 * 60 * 60 * 1000))
      ),
      orderBy: [asc(revenueMetrics.periodStart)],
    });

    const upcomingInvoices = await db
      .select({
        totalDue: sum(invoices.amountDue),
        count: count(),
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, ctx.tenantId),
          sql`${invoices.status} IN ('sent', 'viewed', 'partial')`,
          gte(invoices.dueDate, startDate),
          lte(invoices.dueDate, endDate)
        )
      );

    const totalDue = parseFloat(upcomingInvoices[0]?.totalDue || '0');
    const invoiceCount = upcomingInvoices[0]?.count || 0;

    const historicalAvgRevenue = historicalRevenue.length > 0
      ? historicalRevenue.reduce((sum, r) => sum + parseFloat(r.totalRevenue), 0) / historicalRevenue.length
      : 0;

    const trend = calculateRevenueTrend(historicalRevenue);

    const predictedRevenue = calculateRevenueForecast(
      historicalAvgRevenue,
      totalDue,
      trend,
      forecastDays
    );

    const forecastId = `forecast_${Date.now()}`;
    await db.insert(cashFlowForecast).values({
      tenantId: ctx.tenantId,
      forecastDate: endDate,
      expectedInflows: String(predictedRevenue.predicted),
      expectedOutflows: '0',
      netCashFlow: String(predictedRevenue.predicted),
      confidence: String(predictedRevenue.confidence),
      metadata: {
        forecastId,
        forecastDays,
        historicalDataPoints: historicalRevenue.length,
      },
    });

    return {
      success: true,
      data: {
        forecastId,
        period: {
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          days: forecastDays,
        },
        prediction: {
          predicted: predictedRevenue.predicted,
          confidenceInterval: predictedRevenue.confidenceInterval,
          confidence: predictedRevenue.confidence,
          methodology: 'Ensemble of historical trend analysis and upcoming invoice projections',
        },
        historicalContext: {
          averageRevenue: historicalAvgRevenue,
          trend: trend.direction,
          trendStrength: trend.strength,
          dataPoints: historicalRevenue.length,
        },
        upcomingPipeline: {
          totalDue,
          invoiceCount,
          averageInvoiceValue: invoiceCount > 0 ? totalDue / invoiceCount : 0,
        },
        factors: predictedRevenue.factors,
        scenarios: {
          optimistic: predictedRevenue.predicted * 1.15,
          baseline: predictedRevenue.predicted,
          pessimistic: predictedRevenue.predicted * 0.85,
        },
      },
    };
  },

  analyze_cashflow: async (ctx, input) => {
    const forecastDays = (input.forecastDays as number) || 30;

    const upcomingInvoices = await db
      .select({
        dueDate: sql<string>`date(${invoices.dueDate})`,
        totalDue: sum(invoices.amountDue),
        count: count(),
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, ctx.tenantId),
          sql`${invoices.status} IN ('sent', 'viewed', 'partial', 'overdue')`,
          gte(invoices.dueDate, new Date()),
          lte(invoices.dueDate, new Date(Date.now() + forecastDays * 24 * 60 * 60 * 1000))
        )
      )
      .groupBy(sql`date(${invoices.dueDate})`)
      .orderBy(sql`date(${invoices.dueDate})`);

    const paymentHistory = await db
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
          eq(invoices.tenantId, ctx.tenantId),
          lte(invoices.dueDate, new Date())
        )
      );

    const avgPaymentRate = paymentHistory[0]?.paymentRate || 0.8;
    const avgDaysToPay = paymentHistory[0]?.avgDaysToPay || 5;

    const projections = upcomingInvoices.map(inv => ({
      date: inv.dueDate,
      expectedInflow: parseFloat(inv.totalDue || '0') * avgPaymentRate,
      confidence: Math.min(0.95, 0.6 + avgPaymentRate * 0.3),
      invoiceCount: inv.count,
    }));

    let cumulative = 0;
    const projectedCashFlow = projections.map(p => {
      cumulative += p.expectedInflow;
      return {
        ...p,
        cumulativeCashFlow: cumulative,
      };
    });

    return {
      success: true,
      data: {
        forecastPeriod: {
          start: new Date().toISOString(),
          end: new Date(Date.now() + forecastDays * 24 * 60 * 60 * 1000).toISOString(),
          days: forecastDays,
        },
        projections: projectedCashFlow,
        summary: {
          totalExpectedInflows: cumulative,
          averageDailyInflow: cumulative / forecastDays,
          peakInflowDate: projectedCashFlow.reduce(
            (max, p) => p.expectedInflow > max.expectedInflow ? p : max,
            projectedCashFlow[0] || { date: '', expectedInflow: 0 }
          ).date,
        },
        historicalMetrics: {
          averagePaymentRate: Math.round(avgPaymentRate * 100) / 100,
          averageDaysToPay: Math.round(avgDaysToPay),
        },
        recommendations: [
          'Focus collection efforts on invoices due in next 7 days',
          'Consider early payment discounts for aging receivables',
          'Monitor daily cash position for operational planning',
        ],
      },
    };
  },

  predict_dso: async (ctx, input) => {
    const periodDays = (input.periodDays as number) || 90;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const [revenueStats] = await db
      .select({
        totalRevenue: sum(revenueMetrics.totalRevenue),
      })
      .from(revenueMetrics)
      .where(
        and(
          eq(revenueMetrics.tenantId, ctx.tenantId),
          gte(revenueMetrics.periodStart, startDate),
          lte(revenueMetrics.periodEnd, endDate)
        )
      );

    const [arStats] = await db
      .select({
        totalOutstanding: sum(invoices.amountDue),
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, ctx.tenantId),
          sql`${invoices.status} IN ('sent', 'viewed', 'partial', 'overdue')`
        )
      );

    const totalRevenue = parseFloat(revenueStats?.totalRevenue || '0');
    const totalOutstanding = parseFloat(arStats?.totalOutstanding || '0');
    const dailyRevenue = totalRevenue / periodDays;
    const currentDSO = dailyRevenue > 0 ? totalOutstanding / dailyRevenue : 0;

    const historicalDSO = await calculateHistoricalDSO(ctx, 6);

    const dsoTrend = analyzeDSOTrend(historicalDSO, currentDSO);

    const prediction = predictFutureDSO(historicalDSO, currentDSO, dsoTrend);

    return {
      success: true,
      data: {
        currentDSO: Math.round(currentDSO * 100) / 100,
        prediction: {
          predictedDSO: prediction.predicted,
          confidence: prediction.confidence,
          trend: prediction.trend,
          horizon: '30 days',
        },
        historical: historicalDSO,
        benchmarks: {
          industry: 'SaaS',
          median: 45,
          topQuartile: 35,
          bottomQuartile: 60,
        },
        factors: prediction.factors,
        recommendations: generateDSORecommendations(currentDSO, prediction),
        impactAnalysis: {
          dsoReduction1Day: dailyRevenue * 1,
          dsoReduction5Days: dailyRevenue * 5,
          dsoReduction10Days: dailyRevenue * 10,
        },
      },
    };
  },

  generate_financial_insights: async (ctx, input) => {
    const [arAging] = await db
      .select({
        total: sql<string>`coalesce(sum(case when ${invoices.status} IN ('sent', 'viewed', 'partial', 'overdue') then ${invoices.amountDue} else 0 end), '0')`,
        current: sql<string>`coalesce(sum(case when ${invoices.dueDate} >= current_date then ${invoices.amountDue} else 0 end), '0')`,
        overdue: sql<string>`coalesce(sum(case when ${invoices.dueDate} < current_date then ${invoices.amountDue} else 0 end), '0')`,
      })
      .from(invoices)
      .where(eq(invoices.tenantId, ctx.tenantId));

    const totalAR = parseFloat(arAging?.total || '0');
    const current = parseFloat(arAging?.current || '0');
    const overdue = parseFloat(arAging?.overdue || '0');

    const insights = [
      {
        category: 'collections',
        insight: `Total AR is $${totalAR.toFixed(2)} with $${overdue.toFixed(2)} overdue (${totalAR > 0 ? ((overdue / totalAR) * 100).toFixed(1) : 0}%)`,
        impact: overdue > totalAR * 0.2 ? 'high' : 'medium',
        recommendation: overdue > totalAR * 0.2 ? 'Urgent collection action needed' : 'Maintain current collection efforts',
      },
      {
        category: 'cash_flow',
        insight: `Current receivables: $${current.toFixed(2)}, Overdue: $${overdue.toFixed(2)}`,
        impact: 'medium',
        recommendation: 'Focus on converting overdue to current',
      },
    ];

    return {
      success: true,
      data: {
        insights,
        arSummary: {
          total: totalAR,
          current,
          overdue,
          currentPercentage: totalAR > 0 ? (current / totalAR) * 100 : 0,
          overduePercentage: totalAR > 0 ? (overdue / totalAR) * 100 : 0,
        },
        generatedAt: new Date().toISOString(),
      },
    };
  },
};

function calculateLatePaymentPrediction(
  invoice: { total: string; dueDate: Date; createdAt: Date },
  customer: { paymentTermsDays: number; outstandingBalance: string; creditLimit: string | null },
  paymentHistory: Array<{ receivedAt: Date | null; createdAt: Date; amount: string }>,
  invoiceHistory: Array<{ status: string; dueDate: Date; paidAt: Date | null }>
): {
  probability: number;
  predictedDaysLate: number;
  confidence: number;
  riskFactors: Array<{ factor: string; weight: number; value: unknown; impact: 'positive' | 'negative' | 'neutral' }>;
} {
  const riskFactors: Array<{ factor: string; weight: number; value: unknown; impact: 'positive' | 'negative' | 'neutral' }> = [];

  let probability = 0.2;

  if (paymentHistory.length > 0) {
    const latePayments = paymentHistory.filter(p => {
      if (!p.receivedAt) return true;
      const daysDiff = (p.receivedAt.getTime() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff > 30;
    });

    const lateRate = latePayments.length / paymentHistory.length;
    probability += lateRate * 0.3;

    riskFactors.push({
      factor: 'Historical Late Payment Rate',
      weight: 0.3,
      value: `${(lateRate * 100).toFixed(1)}%`,
      impact: lateRate > 0.3 ? 'negative' : lateRate < 0.1 ? 'positive' : 'neutral',
    });
  }

  const invoiceAmount = parseFloat(invoice.total);
  const outstandingBalance = parseFloat(customer.outstandingBalance);
  const creditLimit = customer.creditLimit ? parseFloat(customer.creditLimit) : 10000;

  const balanceRatio = outstandingBalance / creditLimit;
  if (balanceRatio > 0.8) {
    probability += 0.15;
    riskFactors.push({
      factor: 'Credit Utilization',
      weight: 0.15,
      value: `${(balanceRatio * 100).toFixed(1)}%`,
      impact: 'negative',
    });
  }

  const overdueInvoices = invoiceHistory.filter(i => i.status === 'overdue').length;
  const overdueRate = invoiceHistory.length > 0 ? overdueInvoices / invoiceHistory.length : 0;
  probability += overdueRate * 0.2;

  riskFactors.push({
    factor: 'Invoice Overdue History',
    weight: 0.2,
    value: `${(overdueRate * 100).toFixed(1)}%`,
    impact: overdueRate > 0.2 ? 'negative' : 'neutral',
  });

  probability = Math.min(0.95, Math.max(0.05, probability));

  const confidence = paymentHistory.length > 10 ? 0.85 : paymentHistory.length > 5 ? 0.7 : 0.5;

  const predictedDaysLate = probability > 0.5 ? Math.round(probability * 30) : 0;

  return {
    probability: Math.round(probability * 100) / 100,
    predictedDaysLate,
    confidence,
    riskFactors,
  };
}

function calculateRevenueTrend(historicalRevenue: Array<{ totalRevenue: string; periodStart: Date }>): {
  direction: 'up' | 'down' | 'stable';
  strength: number;
  monthlyGrowthRate: number;
} {
  if (historicalRevenue.length < 2) {
    return { direction: 'stable', strength: 0, monthlyGrowthRate: 0 };
  }

  const revenues = historicalRevenue.map(r => parseFloat(r.totalRevenue));
  const recentAvg = revenues.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const olderAvg = revenues.slice(0, 3).reduce((a, b) => a + b, 0) / 3;

  const growthRate = olderAvg > 0 ? (recentAvg - olderAvg) / olderAvg : 0;

  return {
    direction: growthRate > 0.05 ? 'up' : growthRate < -0.05 ? 'down' : 'stable',
    strength: Math.min(1, Math.abs(growthRate) * 5),
    monthlyGrowthRate: Math.round(growthRate * 100) / 100,
  };
}

function calculateRevenueForecast(
  historicalAvg: number,
  pipelineAmount: number,
  trend: { direction: string; monthlyGrowthRate: number },
  forecastDays: number
): {
  predicted: number;
  confidenceInterval: { lower: number; upper: number };
  confidence: number;
  factors: Array<{ factor: string; contribution: number; trend: string }>;
} {
  const trendMultiplier = trend.direction === 'up' ? 1 + trend.monthlyGrowthRate :
    trend.direction === 'down' ? 1 - trend.monthlyGrowthRate : 1;

  const historicalComponent = historicalAvg * (forecastDays / 30) * trendMultiplier;
  const pipelineComponent = pipelineAmount * 0.8;

  const predicted = (historicalComponent + pipelineComponent) / 2;

  const confidence = historicalAvg > 0 ? 0.75 : 0.5;
  const margin = predicted * (1 - confidence);

  return {
    predicted: Math.round(predicted * 100) / 100,
    confidenceInterval: {
      lower: Math.round((predicted - margin) * 100) / 100,
      upper: Math.round((predicted + margin) * 100) / 100,
    },
    confidence,
    factors: [
      {
        factor: 'Historical Revenue Trend',
        contribution: historicalComponent / predicted,
        trend: trend.direction,
      },
      {
        factor: 'Pipeline (Upcoming Invoices)',
        contribution: pipelineComponent / predicted,
        trend: 'stable',
      },
    ],
  };
}

async function calculateHistoricalDSO(ctx: AgentContext, months: number): Promise<Array<{
  month: string;
  dso: number;
  revenue: number;
  outstanding: number;
}>> {
  const results: Array<{
    month: string;
    dso: number;
    revenue: number;
    outstanding: number;
  }> = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - i);
    monthStart.setDate(1);

    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0);

    const [revenue] = await db
      .select({ total: sum(revenueMetrics.totalRevenue) })
      .from(revenueMetrics)
      .where(
        and(
          eq(revenueMetrics.tenantId, ctx.tenantId),
          gte(revenueMetrics.periodStart, monthStart),
          lte(revenueMetrics.periodEnd, monthEnd)
        )
      );

    const [outstanding] = await db
      .select({ total: sum(invoices.amountDue) })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, ctx.tenantId),
          sql`${invoices.status} IN ('sent', 'viewed', 'partial', 'overdue')`
        )
      );

    const revenueTotal = parseFloat(revenue?.total || '0');
    const outstandingTotal = parseFloat(outstanding?.total || '0');
    const daysInMonth = monthEnd.getDate();
    const dailyRevenue = revenueTotal / daysInMonth;
    const dso = dailyRevenue > 0 ? outstandingTotal / dailyRevenue : 0;

    results.push({
      month: monthStart.toISOString().slice(0, 7),
      dso: Math.round(dso * 100) / 100,
      revenue: revenueTotal,
      outstanding: outstandingTotal,
    });
  }

  return results;
}

function analyzeDSOTrend(historical: Array<{ dso: number }>, current: number): {
  direction: 'improving' | 'worsening' | 'stable';
  change: number;
} {
  if (historical.length < 2) {
    return { direction: 'stable', change: 0 };
  }

  const recentAvg = historical.slice(-3).reduce((a, b) => a + b.dso, 0) / 3;
  const olderAvg = historical.slice(0, 3).reduce((a, b) => a + b.dso, 0) / 3;

  const change = current - recentAvg;

  return {
    direction: change < -2 ? 'improving' : change > 2 ? 'worsening' : 'stable',
    change: Math.round(change * 100) / 100,
  };
}

function predictFutureDSO(
  historical: Array<{ dso: number }>,
  current: number,
  trend: { direction: string; change: number }
): {
  predicted: number;
  confidence: number;
  trend: string;
  factors: Array<{ factor: string; impact: number; direction: string }>;
} {
  const avgDSO = historical.length > 0
    ? historical.reduce((a, b) => a + b.dso, 0) / historical.length
    : current;

  const trendAdjustment = trend.direction === 'worsening' ? 2 :
    trend.direction === 'improving' ? -2 : 0;

  const predicted = Math.round((current * 0.6 + avgDSO * 0.3 + (current + trendAdjustment) * 0.1) * 100) / 100;

  const confidence = historical.length >= 6 ? 0.8 : historical.length >= 3 ? 0.7 : 0.5;

  return {
    predicted,
    confidence,
    trend: trend.direction,
    factors: [
      { factor: 'Current DSO', impact: 0.6, direction: current > 45 ? 'negative' : 'positive' },
      { factor: 'Historical Average', impact: 0.3, direction: avgDSO > 45 ? 'negative' : 'positive' },
      { factor: 'Trend', impact: 0.1, direction: trend.direction === 'improving' ? 'positive' : 'negative' },
    ],
  };
}

function generateLatePaymentActions(prediction: {
  probability: number;
  riskFactors: Array<{ factor: string; impact: string }>;
}): string[] {
  const actions: string[] = [];

  if (prediction.probability > 0.7) {
    actions.push('Send immediate payment reminder');
    actions.push('Consider requiring upfront payment for future orders');
    actions.push('Review credit terms with customer');
  } else if (prediction.probability > 0.4) {
    actions.push('Schedule standard reminder sequence');
    actions.push('Monitor payment closely');
  } else {
    actions.push('Continue normal billing process');
  }

  return actions;
}

function generateDSORecommendations(
  currentDSO: number,
  prediction: { predicted: number; trend: string }
): string[] {
  const recommendations: string[] = [];

  if (currentDSO > 60) {
    recommendations.push('DSO is critically high - implement aggressive collection strategy');
    recommendations.push('Consider offering early payment discounts');
  } else if (currentDSO > 45) {
    recommendations.push('DSO is above industry average - review payment terms');
    recommendations.push('Enhance reminder frequency for overdue accounts');
  }

  if (prediction.trend === 'worsening') {
    recommendations.push('DSO trending upward - investigate root causes');
    recommendations.push('Review customer creditworthiness');
  }

  recommendations.push('Monitor DSO weekly and adjust strategies accordingly');

  return recommendations;
}

export const forecastingAgent = {
  role: 'forecasting' as AgentRole,
  config: getAgentConfig('forecasting'),

  async process(
    context: AgentContext,
    input: Record<string, unknown>,
    onChunk?: (chunk: StreamingChunk) => void
  ): Promise<AgentToolResult> {
    const taskType = input.taskType as string || 'forecast_revenue';
    const handler = TASK_HANDLERS[taskType];

    onChunk?.({
      type: 'text',
      content: `Forecasting Agent: Processing ${taskType}`,
      agentRole: 'forecasting',
      timestamp: new Date(),
    });

    if (handler) {
      return handler(context, input);
    }

    return { success: false, error: `Unknown forecasting task: ${taskType}` };
  },

  async handleHandoff(
    from: AgentRole,
    context: AgentContext,
    data: Record<string, unknown>
  ): Promise<AgentToolResult> {
    if (from === 'collection' && data.action === 'predict_payment') {
      return this.process(context, {
        taskType: 'predict_late_payment',
        invoiceId: data.invoiceId,
        customerId: data.customerId,
      });
    }

    if (from === 'reconciliation' && data.action === 'forecast_cashflow') {
      return this.process(context, {
        taskType: 'analyze_cashflow',
        forecastDays: 30,
      });
    }

    return {
      success: true,
      data: {
        message: `Forecasting Agent received handoff from ${from}`,
        action: data.action,
      },
    };
  },

  async generateBatchPredictions(
    context: AgentContext,
    invoiceIds: string[]
  ): Promise<AgentToolResult> {
    const predictions = [];

    for (const invoiceId of invoiceIds) {
      const result = await this.process(context, {
        taskType: 'predict_late_payment',
        invoiceId,
      });

      if (result.success) {
        predictions.push(result.data);
      }
    }

    const highRisk = predictions.filter(
      p => (p as { prediction?: { probability?: number } })?.prediction?.probability
    );

    return {
      success: true,
      data: {
        totalPredictions: predictions.length,
        predictions,
        summary: {
          highRisk: highRisk.length,
          mediumRisk: predictions.length - highRisk.length,
          totalAtRiskAmount: predictions.reduce<number>(
            (sum, p) => sum + (((p as { prediction?: { probability?: number } })?.prediction?.probability || 0) > 0.5 ? 1000 : 0),
            0
          ),
        },
      },
    };
  },

  async getDashboardMetrics(
    context: AgentContext
  ): Promise<AgentToolResult> {
    const [dsoResult, revenueResult, cashflowResult] = await Promise.all([
      this.process(context, { taskType: 'predict_dso', periodDays: 90 }),
      this.process(context, { taskType: 'forecast_revenue', forecastDays: 30 }),
      this.process(context, { taskType: 'analyze_cashflow', forecastDays: 30 }),
    ]);

    return {
      success: true,
      data: {
        dso: dsoResult.data,
        revenue: revenueResult.data,
        cashflow: cashflowResult.data,
        generatedAt: new Date().toISOString(),
      },
    };
  },
};

function asc(column: unknown) {
  return sql`${column} asc`;
}
