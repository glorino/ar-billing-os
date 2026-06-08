import { z } from 'zod';
import { AgentContext, AgentToolResult, AgentRole, StreamingChunk } from './types';
import { getAgentConfig } from './config';
import {
  getOverdueAccounts, createCollectionCase, getCollectionStrategy,
  negotiatePaymentPlan, recordCollectionAction,
  getOverdueAccountsInputSchema, createCollectionCaseInputSchema,
  getCollectionStrategyInputSchema, negotiatePaymentPlanInputSchema,
  recordCollectionActionInputSchema
} from './tools/collection-tools';
import { getCustomer, getCustomerMetrics } from './tools/customer-tools';

const TASK_HANDLERS: Record<string, (context: AgentContext, input: Record<string, unknown>) => Promise<AgentToolResult>> = {
  collect_payment: async (ctx, input) => {
    const customerId = input.customerId as string;
    if (!customerId) {
      return { success: false, error: 'customerId is required' };
    }

    const metricsResult = await getCustomerMetrics(ctx, { customerId });
    const strategyResult = await getCollectionStrategy(ctx, {
      customerId,
      totalOutstanding: (input.totalOutstanding as number) || 0,
      overdueDays: (input.overdueDays as number) || 0,
    });

    const overdueResult = await getOverdueAccounts(ctx, {
      minOverdueDays: 1,
      maxOverdueDays: 365,
      minAmount: 0,
      limit: 100,
    });

    return {
      success: true,
      data: {
        customerMetrics: metricsResult.data,
        strategy: strategyResult.data,
        overdueAccounts: overdueResult.data,
      },
    };
  },

  negotiate_payment_plan: async (ctx, input) => {
    const validated = negotiatePaymentPlanInputSchema.parse(input);
    const planResult = await negotiatePaymentPlan(ctx, validated);
    if (!planResult.success) return planResult;

    const customerResult = await getCustomerMetrics(ctx, {
      customerId: validated.customerId,
    });

    return {
      success: true,
      data: {
        paymentPlan: planResult.data,
        customerContext: customerResult.data,
        negotiationTips: generateNegotiationTips(
          validated.totalAmount,
          validated.maxInstallments,
          planResult.data && typeof planResult.data === 'object' && 'acceptanceProbability' in planResult.data
            ? (planResult.data as Record<string, unknown>).acceptanceProbability as number
            : 0
        ),
      },
    };
  },

  escalate_collection: async (ctx, input) => {
    const customerId = input.customerId as string;
    const escalateTo = input.escalateTo as string;

    const metricsResult = await getCustomerMetrics(ctx, { customerId });
    const strategyResult = await getCollectionStrategy(ctx, {
      customerId,
      totalOutstanding: (input.totalOutstanding as number) || 0,
      overdueDays: (input.overdueDays as number) || 30,
    });

    if (escalateTo) {
      const existingCase = input.caseId as string;
      if (existingCase) {
        await recordCollectionAction(ctx, {
          caseId: existingCase,
          action: escalateTo === 'legal' ? 'legal_action' : 'agency_referral',
          description: `Escalating collection to ${escalateTo}`,
          metadata: { escalatedFrom: 'agent', reason: input.reason },
        });
      }
    }

    return {
      success: true,
      data: {
        escalation: {
          to: escalateTo,
          customerId,
          customerMetrics: metricsResult.data,
          strategy: strategyResult.data,
          escalatedAt: new Date().toISOString(),
        },
      },
    };
  },
};

function generateNegotiationTips(
  totalAmount: number,
  maxInstallments: number,
  acceptanceProbability: number
): string[] {
  const tips: string[] = [];

  if (acceptanceProbability < 0.5) {
    tips.push('Customer may resist - prepare to offer incentives like early payment discounts');
    tips.push('Consider offering a smaller down payment to reduce commitment barrier');
  }

  if (totalAmount > 10000) {
    tips.push('Large amount - break into smaller, more manageable installments');
    tips.push('Consider requiring a larger initial payment (20-30%)');
  }

  if (maxInstallments > 6) {
    tips.push('Long payment plans increase default risk - include escalation clauses');
    tips.push('Request automatic payment setup for reliability');
  }

  tips.push('Emphasize consequences of non-payment vs benefits of payment plan');
  tips.push('Document all agreed terms in writing immediately');

  return tips;
}

export const collectionAgent = {
  role: 'collection' as AgentRole,
  config: getAgentConfig('collection'),

  async process(
    context: AgentContext,
    input: Record<string, unknown>,
    onChunk?: (chunk: StreamingChunk) => void
  ): Promise<AgentToolResult> {
    const taskType = input.taskType as string || 'collect_payment';
    const handler = TASK_HANDLERS[taskType];

    onChunk?.({
      type: 'text',
      content: `Collection Agent: Processing ${taskType}`,
      agentRole: 'collection',
      timestamp: new Date(),
    });

    if (handler) {
      return handler(context, input);
    }

    switch (taskType) {
      case 'get_overdue_accounts':
        return getOverdueAccounts(context, getOverdueAccountsInputSchema.parse(input));
      case 'create_collection_case':
        return createCollectionCase(context, createCollectionCaseInputSchema.parse(input));
      case 'get_collection_strategy':
        return getCollectionStrategy(context, getCollectionStrategyInputSchema.parse(input));
      case 'record_collection_action':
        return recordCollectionAction(context, recordCollectionActionInputSchema.parse(input));
      default:
        return { success: false, error: `Unknown collection task: ${taskType}` };
    }
  },

  async handleHandoff(
    from: AgentRole,
    context: AgentContext,
    data: Record<string, unknown>
  ): Promise<AgentToolResult> {
    if (from === 'reminder' && data.action === 'escalate') {
      return this.process(context, {
        taskType: 'escalate_collection',
        customerId: data.customerId,
        totalOutstanding: data.totalOutstanding,
        overdueDays: data.overdueDays,
        escalateTo: data.escalateTo || 'final_notice',
        reason: 'Reminder escalation - no response to reminders',
      });
    }

    if (from === 'fraud' && data.action === 'flag_for_collection') {
      return this.process(context, {
        taskType: 'create_collection_case',
        customerId: data.customerId,
        initialNotes: `Flagged by Fraud Agent: ${data.reason}`,
      });
    }

    return {
      success: true,
      data: {
        message: `Collection Agent received handoff from ${from}`,
        action: data.action,
      },
    };
  },

  async assessAccountRisk(
    context: AgentContext,
    customerId: string
  ): Promise<AgentToolResult> {
    const metricsResult = await getCustomerMetrics(context, { customerId });
    if (!metricsResult.success) return metricsResult;

    const metrics = metricsResult.data as {
      collectionRate: number;
      invoiceStats: { overdue: number; overdueAmount: number };
      paymentStats: { averageDaysToPay: number };
      riskLevel: string;
    };

    const riskScore = calculateCollectionRiskScore(metrics);

    return {
      success: true,
      data: {
        customerId,
        riskScore,
        riskLevel: riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low',
        metrics: metricsResult.data,
        recommendedActions: getRiskBasedActions(riskScore),
      },
    };
  },

  async generateCollectionReport(
    context: AgentContext,
    startDate?: string,
    endDate?: string
  ): Promise<AgentToolResult> {
    const overdueResult = await getOverdueAccounts(context, {
      minOverdueDays: 1,
      maxOverdueDays: 365,
      minAmount: 0,
      limit: 100,
    });

    if (!overdueResult.success) return overdueResult;

    const accounts = (overdueResult.data as { overdueAccounts: Array<{
      totalOutstanding: number;
      maxOverdueDays: number;
      invoiceCount: number;
    }> }).overdueAccounts;

    const totalOutstanding = accounts.reduce((sum, a) => sum + a.totalOutstanding, 0);
    const totalCustomers = accounts.length;
    const avgOverdueDays = accounts.length > 0
      ? accounts.reduce((sum, a) => sum + a.maxOverdueDays, 0) / accounts.length
      : 0;

    return {
      success: true,
      data: {
        reportPeriod: { start: startDate, end: endDate },
        summary: {
          totalOutstanding,
          totalCustomers,
          totalInvoices: accounts.reduce((sum, a) => sum + a.invoiceCount, 0),
          averageOverdueDays: Math.round(avgOverdueDays),
        },
        aging: {
          current: accounts.filter(a => a.maxOverdueDays <= 30).reduce((sum, a) => sum + a.totalOutstanding, 0),
          days31to60: accounts.filter(a => a.maxOverdueDays > 30 && a.maxOverdueDays <= 60).reduce((sum, a) => sum + a.totalOutstanding, 0),
          days61to90: accounts.filter(a => a.maxOverdueDays > 60 && a.maxOverdueDays <= 90).reduce((sum, a) => sum + a.totalOutstanding, 0),
          days90plus: accounts.filter(a => a.maxOverdueDays > 90).reduce((sum, a) => sum + a.totalOutstanding, 0),
        },
        topDelinquent: accounts
          .sort((a, b) => b.totalOutstanding - a.totalOutstanding)
          .slice(0, 10),
        generatedAt: new Date().toISOString(),
      },
    };
  },
};

function calculateCollectionRiskScore(metrics: {
  collectionRate: number;
  invoiceStats: { overdue: number; overdueAmount: number };
  paymentStats: { averageDaysToPay: number };
}): number {
  let score = 0;

  score += (1 - metrics.collectionRate) * 30;
  score += Math.min(metrics.invoiceStats.overdue / 10, 1) * 25;
  score += Math.min(metrics.paymentStats.averageDaysToPay / 60, 1) * 20;
  score += Math.min(metrics.invoiceStats.overdueAmount / 10000, 1) * 25;

  return Math.min(100, Math.round(score));
}

function getRiskBasedActions(riskScore: number): string[] {
  if (riskScore > 70) {
    return [
      'Immediate phone call required',
      'Consider agency referral',
      'Review credit terms',
      'Block future orders pending payment',
    ];
  } else if (riskScore > 40) {
    return [
      'Send firm payment reminder',
      'Schedule follow-up call',
      'Offer payment plan options',
      'Review for next invoice terms',
    ];
  } else {
    return [
      'Standard reminder schedule',
      'Monitor for changes',
      'Maintain positive relationship',
    ];
  }
}
