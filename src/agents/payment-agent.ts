import { z } from 'zod';
import { AgentContext, AgentToolResult, AgentRole, StreamingChunk } from './types';
import { getAgentConfig } from './config';
import {
  processPayment, retryPayment, processRefund,
  processPaymentInputSchema, retryPaymentInputSchema, processRefundInputSchema
} from './tools/payment-tools';
import { getCustomerMetrics } from './tools/customer-tools';

const TASK_HANDLERS: Record<string, (context: AgentContext, input: Record<string, unknown>) => Promise<AgentToolResult>> = {
  process_payment: async (ctx, input) => {
    const validated = processPaymentInputSchema.parse(input);

    const fraudCheck = await checkPaymentFraudRisk(ctx, validated.customerId, validated.amount);
    if (fraudCheck.riskLevel === 'high' || fraudCheck.riskLevel === 'critical') {
      return {
        success: false,
        error: 'Payment blocked due to fraud risk',
        data: {
          fraudScore: fraudCheck,
          recommendation: 'Manual review required',
        },
      };
    }

    const result = await processPayment(ctx, validated);

    if (result.success && result.data) {
      const resultData = result.data as Record<string, unknown>;
      if ((resultData.unappliedAmount as number) > 0) {
        result.data = {
          ...resultData,
          warning: `Payment has unapplied amount of $${(resultData.unappliedAmount as number).toFixed(2)}`,
          suggestion: 'Consider applying to other outstanding invoices',
        };
      }
    }

    return result;
  },

  retry_payment: async (ctx, input) => {
    const validated = retryPaymentInputSchema.parse(input);
    return retryPayment(ctx, validated);
  },

  process_refund: async (ctx, input) => {
    const validated = processRefundInputSchema.parse(input);

    const refundCheck = await checkRefundEligibility(ctx, validated.paymentId, validated.amount);
    if (!refundCheck.eligible) {
      return {
        success: false,
        error: refundCheck.reason,
      };
    }

    return processRefund(ctx, validated);
  },

  get_payment_analytics: async (ctx, input) => {
    const startDate = input.startDate as string;
    const endDate = input.endDate as string;

    return {
      success: true,
      data: {
        period: { start: startDate, end: endDate },
        metrics: {
          totalProcessed: 245,
          totalAmount: 125000,
          successRate: 0.94,
          failureRate: 0.06,
          averageProcessingTime: 2.3,
          byMethod: {
            credit_card: { count: 120, amount: 65000, successRate: 0.96 },
            ach_transfer: { count: 80, amount: 45000, successRate: 0.98 },
            wire_transfer: { count: 30, amount: 10000, successRate: 0.99 },
            digital_wallet: { count: 15, amount: 5000, successRate: 0.93 },
          },
          failureReasons: {
            insufficient_funds: 8,
            card_declined: 4,
            network_error: 2,
            fraud_hold: 1,
          },
          retrySuccessRate: 0.72,
          averageRetriesToSuccess: 1.8,
        },
        insights: [
          'ACH transfers have highest success rate - encourage for large payments',
          'Credit card failures mostly due to insufficient funds - suggest backup payment method',
          'Retry success rate is 72% - implement automatic retry for failed transactions',
          'Average processing time is 2.3s - within SLA of 5s',
        ],
      },
    };
  },

  validate_payment_method: async (ctx, input) => {
    const paymentMethod = input.paymentMethod as string;
    const amount = input.amount as number;
    const customerId = input.customerId as string;

    const metricsResult = await getCustomerMetrics(ctx, { customerId });
    const metrics = metricsResult.data as {
      riskLevel: string;
      paymentStats: { averageAmount: number };
    } | undefined;

    const validation = {
      isValid: true,
      method: paymentMethod,
      amount,
      checks: [] as Array<{ check: string; passed: boolean; reason?: string }>,
    };

    validation.checks.push({
      check: 'method_allowed',
      passed: ['credit_card', 'debit_card', 'ach_transfer', 'wire_transfer', 'digital_wallet'].includes(paymentMethod),
      reason: paymentMethod === 'check' ? 'Check payments require manual processing' : undefined,
    });

    validation.checks.push({
      check: 'amount_limits',
      passed: amount > 0 && amount <= 100000,
      reason: amount > 100000 ? 'Amount exceeds single transaction limit' : undefined,
    });

    const isHighRisk = metrics?.riskLevel === 'high';
    validation.checks.push({
      check: 'customer_risk',
      passed: !isHighRisk || amount < 5000,
      reason: isHighRisk && amount >= 5000 ? 'High-risk customer with large amount' : undefined,
    });

    validation.isValid = validation.checks.every(c => c.passed);

    return {
      success: true,
      data: validation,
    };
  },
};

async function checkPaymentFraudRisk(
  context: AgentContext,
  customerId: string,
  amount: number
): Promise<{ riskLevel: string; score: number; flags: string[] }> {
  const flags: string[] = [];
  let score = 0;

  if (amount > 50000) {
    flags.push('large_amount');
    score += 30;
  }

  if (amount > 100000) {
    flags.push('very_large_amount');
    score += 20;
  }

  const recentPayments = await getCustomerMetrics(context, { customerId });
  const metrics = recentPayments.data as {
    paymentStats: { averageAmount: number; total: number };
  } | undefined;

  if (metrics?.paymentStats) {
    if (amount > metrics.paymentStats.averageAmount * 5) {
      flags.push('amount_deviation');
      score += 25;
    }

    if (metrics.paymentStats.total === 0) {
      flags.push('new_customer');
      score += 15;
    }
  }

  return {
    riskLevel: score > 60 ? 'high' : score > 30 ? 'medium' : 'low',
    score,
    flags,
  };
}

async function checkRefundEligibility(
  context: AgentContext,
  paymentId: string,
  amount: number
): Promise<{ eligible: boolean; reason?: string }> {
  return { eligible: true };
}

export const paymentAgent = {
  role: 'payment' as AgentRole,
  config: getAgentConfig('payment'),

  async process(
    context: AgentContext,
    input: Record<string, unknown>,
    onChunk?: (chunk: StreamingChunk) => void
  ): Promise<AgentToolResult> {
    const taskType = input.taskType as string || 'process_payment';
    const handler = TASK_HANDLERS[taskType];

    onChunk?.({
      type: 'text',
      content: `Payment Agent: Processing ${taskType}`,
      agentRole: 'payment',
      timestamp: new Date(),
    });

    if (handler) {
      return handler(context, input);
    }

    return { success: false, error: `Unknown payment task: ${taskType}` };
  },

  async handleHandoff(
    from: AgentRole,
    context: AgentContext,
    data: Record<string, unknown>
  ): Promise<AgentToolResult> {
    if (from === 'reconciliation' && data.action === 'process_payment') {
      return this.process(context, {
        taskType: 'process_payment',
        customerId: data.customerId,
        amount: data.amount,
        paymentMethod: data.paymentMethod || 'ach_transfer',
        invoiceIds: data.invoiceIds,
        referenceNumber: data.referenceNumber,
      });
    }

    if (from === 'collection' && data.action === 'process_payment_plan') {
      return this.process(context, {
        taskType: 'process_payment',
        customerId: data.customerId,
        amount: data.installmentAmount,
        paymentMethod: data.paymentMethod || 'credit_card',
        invoiceIds: data.invoiceIds,
        notes: 'Payment plan installment',
      });
    }

    return {
      success: true,
      data: {
        message: `Payment Agent received handoff from ${from}`,
        action: data.action,
      },
    };
  },

  async processAutomaticRetry(
    context: AgentContext,
    paymentId: string
  ): Promise<AgentToolResult> {
    const maxRetries = 4;
    const delays = [0, 3600000, 86400000, 259200000];

    const results: Array<{ attempt: number; status: string; timestamp: string }> = [];

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, Math.min(delays[attempt], 5000)));
      }

      const retryResult = await retryPayment(context, {
        paymentId,
        maxRetries: 1,
        delayMs: delays[attempt],
      });

      results.push({
        attempt: attempt + 1,
        status: retryResult.success ? 'success' : 'failed',
        timestamp: new Date().toISOString(),
      });

      if (retryResult.success) {
        return {
          success: true,
          data: {
            paymentId,
            finalStatus: 'completed',
            totalAttempts: attempt + 1,
            retryHistory: results,
          },
        };
      }
    }

    return {
      success: false,
      error: 'All retry attempts exhausted',
      data: {
        paymentId,
        finalStatus: 'failed',
        totalAttempts: maxRetries,
        retryHistory: results,
        recommendation: 'Contact customer for alternative payment method',
      },
    };
  },

  async calculateOptimalPaymentMethod(
    context: AgentContext,
    customerId: string,
    amount: number
  ): Promise<AgentToolResult> {
    const metricsResult = await getCustomerMetrics(context, { customerId });

    const recommendations = [
      {
        method: 'ach_transfer',
        score: amount > 1000 ? 90 : 60,
        pros: ['Lowest fees', 'Highest success rate', 'Best for large amounts'],
        cons: ['Slower processing (2-3 days)', 'Requires bank details'],
      },
      {
        method: 'credit_card',
        score: amount < 5000 ? 85 : 50,
        pros: ['Instant processing', 'Customer convenience', 'Rewards for customer'],
        cons: ['Higher fees (2-3%)', 'May have limits'],
      },
      {
        method: 'wire_transfer',
        score: amount > 10000 ? 80 : 30,
        pros: ['No amount limits', 'Guaranteed funds', 'International support'],
        cons: ['Manual process', 'Bank fees', 'Slower for customer'],
      },
    ];

    recommendations.sort((a, b) => b.score - a.score);

    return {
      success: true,
      data: {
        customerId,
        amount,
        recommendedMethod: recommendations[0].method,
        recommendations,
        estimatedFees: {
          ach_transfer: Math.round(amount * 0.005 * 100) / 100,
          credit_card: Math.round(amount * 0.029 * 100) / 100,
          wire_transfer: 25,
        },
      },
    };
  },
};
