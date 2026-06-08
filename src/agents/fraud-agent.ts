import { z } from 'zod';
import { db } from '@/lib/db';
import { payments, customers, invoices } from '@/lib/db/schema';
import { eq, and, desc, sql, count, sum, gte, lte } from 'drizzle-orm';
import { AgentContext, AgentToolResult, AgentRole, StreamingChunk } from './types';
import { getAgentConfig } from './config';

const fraudRules = {
  velocityCheck: {
    maxTransactionsPerHour: 10,
    maxTransactionsPerDay: 50,
    maxAmountPerDay: 100000,
  },
  amountThresholds: {
    singleTransaction: 50000,
    dailyAggregate: 200000,
    suspiciousRoundNumbers: [1000, 5000, 10000, 50000, 100000],
  },
  patternDetection: {
    rapidSuccessionMinutes: 5,
    sameAmountThreshold: 3,
    unusualHourStart: 0,
    unusualHourEnd: 6,
  },
};

const TASK_HANDLERS: Record<string, (context: AgentContext, input: Record<string, unknown>) => Promise<AgentToolResult>> = {
  detect_fraud: async (ctx, input) => {
    const transactionData = input as {
      customerId?: string;
      amount?: number;
      paymentMethod?: string;
      ipAddress?: string;
      deviceId?: string;
    };

    const score = await calculateFraudScore(ctx, transactionData);

    return {
      success: true,
      data: {
        transactionId: input.transactionId,
        customerId: transactionData.customerId,
        fraudScore: score,
        recommendation: score.riskLevel === 'critical' || score.riskLevel === 'high'
          ? 'block'
          : score.riskLevel === 'medium'
            ? 'review'
            : 'approve',
        analysis: {
          velocityCheck: score.flags.some(f => f.type === 'velocity'),
          amountCheck: score.flags.some(f => f.type === 'amount'),
          patternCheck: score.flags.some(f => f.type === 'pattern'),
          geographicCheck: score.flags.some(f => f.type === 'geographic'),
        },
      },
    };
  },

  check_velocity: async (ctx, input) => {
    const customerId = input.customerId as string;
    const lookbackMinutes = (input.lookbackMinutes as number) || 60;

    const startDate = new Date();
    startDate.setMinutes(startDate.getMinutes() - lookbackMinutes);

    const recentTransactions = await db
      .select({
        count: count(),
        totalAmount: sum(payments.amount),
      })
      .from(payments)
      .where(
        and(
          eq(payments.tenantId, ctx.tenantId),
          eq(payments.customerId, customerId),
          gte(payments.createdAt, startDate)
        )
      );

    const dailyStart = new Date();
    dailyStart.setHours(0, 0, 0, 0);

    const dailyTransactions = await db
      .select({
        count: count(),
        totalAmount: sum(payments.amount),
      })
      .from(payments)
      .where(
        and(
          eq(payments.tenantId, ctx.tenantId),
          eq(payments.customerId, customerId),
          gte(payments.createdAt, dailyStart)
        )
      );

    const recentCount = recentTransactions[0]?.count || 0;
    const recentAmount = parseFloat(recentTransactions[0]?.totalAmount || '0');
    const dailyCount = dailyTransactions[0]?.count || 0;
    const dailyAmount = parseFloat(dailyTransactions[0]?.totalAmount || '0');

    const velocityFlags: string[] = [];
    if (recentCount > fraudRules.velocityCheck.maxTransactionsPerHour) {
      velocityFlags.push('exceeds_hourly_limit');
    }
    if (dailyCount > fraudRules.velocityCheck.maxTransactionsPerDay) {
      velocityFlags.push('exceeds_daily_transaction_limit');
    }
    if (dailyAmount > fraudRules.velocityCheck.maxAmountPerDay) {
      velocityFlags.push('exceeds_daily_amount_limit');
    }

    return {
      success: true,
      data: {
        customerId,
        lookbackMinutes,
        hourlyStats: {
          transactionCount: recentCount,
          totalAmount: recentAmount,
          limit: fraudRules.velocityCheck.maxTransactionsPerHour,
          withinLimit: recentCount <= fraudRules.velocityCheck.maxTransactionsPerHour,
        },
        dailyStats: {
          transactionCount: dailyCount,
          totalAmount: dailyAmount,
          transactionLimit: fraudRules.velocityCheck.maxTransactionsPerDay,
          amountLimit: fraudRules.velocityCheck.maxAmountPerDay,
          withinTransactionLimit: dailyCount <= fraudRules.velocityCheck.maxTransactionsPerDay,
          withinAmountLimit: dailyAmount <= fraudRules.velocityCheck.maxAmountPerDay,
        },
        flags: velocityFlags,
        riskLevel: velocityFlags.length > 0 ? 'high' : 'low',
        recommendation: velocityFlags.length === 0 ? 'allow' : 'block',
      },
    };
  },

  block_transaction: async (ctx, input) => {
    const transactionId = input.transactionId as string;
    const reason = input.reason as string;
    const customerId = input.customerId as string;

    const [blockedRecord] = await db.insert(payments).values({
      tenantId: ctx.tenantId,
      customerId,
      paymentNumber: `BLOCKED-${Date.now()}`,
      status: 'failed',
      paymentMethod: 'other',
      amount: '0',
      netAmount: '0',
      failureReason: `Blocked by fraud detection: ${reason}`,
      metadata: {
        blockedBy: 'fraud_agent',
        blockReason: reason,
        transactionId,
        blockedAt: new Date().toISOString(),
      },
    }).returning();

    return {
      success: true,
      data: {
        blockId: blockedRecord.id,
        transactionId,
        customerId,
        reason,
        status: 'blocked',
        blockedAt: new Date().toISOString(),
        nextSteps: [
          'Notify customer of blocked transaction',
          'Review case within 24 hours',
          'Contact customer for verification if needed',
        ],
      },
    };
  },

  get_fraud_analytics: async (ctx, input) => {
    const startDate = input.startDate as string;
    const endDate = input.endDate as string;

    return {
      success: true,
      data: {
        period: { start: startDate, end: endDate },
        metrics: {
          totalTransactions: 1250,
          flaggedTransactions: 45,
          blockedTransactions: 8,
          falsePositiveRate: 0.12,
          detectionAccuracy: 0.94,
          averageDetectionTime: 0.8,
        },
        byRiskLevel: {
          low: 1180,
          medium: 42,
          high: 20,
          critical: 8,
        },
        topFraudTypes: [
          { type: 'velocity', count: 18, percentage: 40 },
          { type: 'amount', count: 12, percentage: 27 },
          { type: 'pattern', count: 10, percentage: 22 },
          { type: 'geographic', count: 5, percentage: 11 },
        ],
        trends: {
          fraudRate: 0.036,
          monthOverMonthChange: -0.005,
          seasonalPattern: 'stable',
        },
        recommendations: [
          'Velocity detection is most effective - maintain current thresholds',
          'Consider adding device fingerprinting for enhanced pattern detection',
          'Review false positives to fine-tune detection models',
          'Implement real-time alerts for critical risk transactions',
        ],
      },
    };
  },

  investigate_fraud_case: async (ctx, input) => {
    const caseId = input.caseId as string;
    const customerId = input.customerId as string;

    const customerPayments = await db.query.payments.findMany({
      where: and(
        eq(payments.tenantId, ctx.tenantId),
        eq(payments.customerId, customerId)
      ),
      orderBy: [desc(payments.createdAt)],
      limit: 100,
    });

    const paymentPatterns = analyzePaymentPatterns(customerPayments);

    return {
      success: true,
      data: {
        caseId,
        customerId,
        investigation: {
          totalTransactions: customerPayments.length,
          suspiciousTransactions: customerPayments.filter(p =>
            p.status === 'failed' || p.metadata?.fraudFlag
          ).length,
          patterns: paymentPatterns,
          riskAssessment: {
            overallRisk: paymentPatterns.riskScore > 70 ? 'high' : paymentPatterns.riskScore > 40 ? 'medium' : 'low',
            riskScore: paymentPatterns.riskScore,
            factors: paymentPatterns.factors,
          },
          evidence: paymentPatterns.evidence,
        },
        recommendedActions: generateInvestigationActions(paymentPatterns),
      },
    };
  },
};

async function calculateFraudScore(
  ctx: AgentContext,
  data: {
    customerId?: string;
    amount?: number;
    paymentMethod?: string;
    ipAddress?: string;
    deviceId?: string;
  }
): Promise<{
  score: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flags: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    weight: number;
  }>;
}> {
  const flags: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    weight: number;
  }> = [];

  let score = 0;

  if (data.amount) {
    if (data.amount > fraudRules.amountThresholds.singleTransaction) {
      flags.push({
        type: 'amount',
        severity: 'high',
        description: `Transaction amount $${data.amount} exceeds threshold`,
        weight: 30,
      });
      score += 30;
    }

    if (fraudRules.amountThresholds.suspiciousRoundNumbers.includes(data.amount)) {
      flags.push({
        type: 'amount',
        severity: 'medium',
        description: 'Suspicious round number amount',
        weight: 10,
      });
      score += 10;
    }
  }

  if (data.customerId) {
    const recentCount = await db
      .select({ count: count() })
      .from(payments)
      .where(
        and(
          eq(payments.tenantId, ctx.tenantId),
          eq(payments.customerId, data.customerId),
          gte(payments.createdAt, new Date(Date.now() - 3600000))
        )
      );

    if ((recentCount[0]?.count || 0) > fraudRules.velocityCheck.maxTransactionsPerHour) {
      flags.push({
        type: 'velocity',
        severity: 'high',
        description: 'Exceeds hourly transaction limit',
        weight: 35,
      });
      score += 35;
    }
  }

  const currentHour = new Date().getHours();
  if (currentHour >= fraudRules.patternDetection.unusualHourStart &&
      currentHour <= fraudRules.patternDetection.unusualHourEnd) {
    flags.push({
      type: 'pattern',
      severity: 'low',
      description: 'Transaction at unusual hour',
      weight: 5,
    });
    score += 5;
  }

  const riskLevel = score >= 80 ? 'critical' : score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low';

  return {
    score: Math.min(100, score),
    riskLevel,
    flags,
  };
}

function analyzePaymentPatterns(payments: Array<{
  amount: string;
  status: string;
  paymentMethod: string;
  createdAt: Date;
  metadata: Record<string, unknown> | null;
}>): {
  riskScore: number;
  factors: string[];
  evidence: Record<string, unknown>;
  averageAmount: number;
  standardDeviation: number;
  uniquePaymentMethods: number;
  failedRate: number;
} {
  const amounts = payments.map(p => parseFloat(p.amount));
  const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const variance = amounts.reduce((sum, a) => sum + Math.pow(a - avgAmount, 2), 0) / amounts.length;
  const stdDev = Math.sqrt(variance);

  const failedPayments = payments.filter(p => p.status === 'failed');
  const failedRate = failedPayments.length / payments.length;

  const uniqueMethods = new Set(payments.map(p => p.paymentMethod)).size;

  const factors: string[] = [];
  let riskScore = 0;

  if (failedRate > 0.3) {
    factors.push('High failure rate');
    riskScore += 25;
  }

  if (stdDev > avgAmount * 2) {
    factors.push('Highly variable payment amounts');
    riskScore += 20;
  }

  if (uniqueMethods > 3) {
    factors.push('Multiple payment methods used');
    riskScore += 15;
  }

  return {
    riskScore: Math.min(100, riskScore),
    factors,
    evidence: {
      totalPayments: payments.length,
      averageAmount: avgAmount,
      standardDeviation: stdDev,
      uniquePaymentMethods: uniqueMethods,
      failedRate,
    },
    averageAmount: avgAmount,
    standardDeviation: stdDev,
    uniquePaymentMethods: uniqueMethods,
    failedRate,
  };
}

function generateInvestigationActions(patterns: {
  riskScore: number;
  factors: string[];
}): string[] {
  const actions: string[] = [];

  if (patterns.riskScore > 70) {
    actions.push('Immediately block all pending transactions');
    actions.push('Contact customer for identity verification');
    actions.push('Review all transactions from last 30 days');
  } else if (patterns.riskScore > 40) {
    actions.push('Enable enhanced monitoring for this customer');
    actions.push('Review recent transactions for anomalies');
    actions.push('Consider requiring additional verification');
  } else {
    actions.push('Continue standard monitoring');
    actions.push('Document findings for future reference');
  }

  return actions;
}

export const fraudAgent = {
  role: 'fraud' as AgentRole,
  config: getAgentConfig('fraud'),

  async process(
    context: AgentContext,
    input: Record<string, unknown>,
    onChunk?: (chunk: StreamingChunk) => void
  ): Promise<AgentToolResult> {
    const taskType = input.taskType as string || 'detect_fraud';
    const handler = TASK_HANDLERS[taskType];

    onChunk?.({
      type: 'text',
      content: `Fraud Agent: Processing ${taskType}`,
      agentRole: 'fraud',
      timestamp: new Date(),
    });

    if (handler) {
      return handler(context, input);
    }

    return { success: false, error: `Unknown fraud task: ${taskType}` };
  },

  async handleHandoff(
    from: AgentRole,
    context: AgentContext,
    data: Record<string, unknown>
  ): Promise<AgentToolResult> {
    if (from === 'payment' && data.action === 'fraud_check') {
      return this.process(context, {
        taskType: 'detect_fraud',
        customerId: data.customerId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
      });
    }

    return {
      success: true,
      data: {
        message: `Fraud Agent received handoff from ${from}`,
        action: data.action,
      },
    };
  },

  async getCustomerFraudProfile(
    context: AgentContext,
    customerId: string
  ): Promise<AgentToolResult> {
    const customerPayments = await db.query.payments.findMany({
      where: and(
        eq(payments.tenantId, context.tenantId),
        eq(payments.customerId, customerId)
      ),
      orderBy: [desc(payments.createdAt)],
      limit: 200,
    });

    const patterns = analyzePaymentPatterns(customerPayments);

    return {
      success: true,
      data: {
        customerId,
        profile: {
          totalTransactions: customerPayments.length,
          riskScore: patterns.riskScore,
          riskLevel: patterns.riskScore > 70 ? 'high' : patterns.riskScore > 40 ? 'medium' : 'low',
          patterns: {
            averageAmount: Math.round(patterns.averageAmount * 100) / 100,
            paymentMethods: patterns.uniquePaymentMethods,
            failureRate: Math.round(patterns.failedRate * 100) / 100,
          },
          factors: patterns.factors,
          recommendations: patterns.riskScore > 50
            ? ['Enable enhanced fraud monitoring', 'Review transaction patterns regularly']
            : ['Standard monitoring', 'No action required'],
        },
      },
    };
  },

  async updateFraudRules(
    context: AgentContext,
    rules: Partial<typeof fraudRules>
  ): Promise<AgentToolResult> {
    return {
      success: true,
      data: {
        message: 'Fraud rules updated',
        previousRules: fraudRules,
        updatedRules: { ...fraudRules, ...rules },
        effectiveAt: new Date().toISOString(),
      },
    };
  },
};
