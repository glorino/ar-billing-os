import { z } from 'zod';
import { AgentContext, AgentToolResult, AgentRole, StreamingChunk } from './types';
import { getAgentConfig } from './config';
import { getCustomer, getCustomerMetrics } from './tools/customer-tools';
import { getOverdueAccounts } from './tools/collection-tools';

const reminderTemplates = {
  friendly_reminder: {
    subject: 'Friendly Reminder: Invoice {{invoiceNumber}} Due Soon',
    body: 'Hi {{customerName}},\n\nThis is a friendly reminder that invoice {{invoiceNumber}} for {{amount}} is due on {{dueDate}}.\n\nPlease ensure payment is made by the due date to avoid any late fees.\n\nThank you for your business!',
    tone: 'friendly' as const,
  },
  due_today: {
    subject: 'Payment Due Today: Invoice {{invoiceNumber}}',
    body: 'Hi {{customerName}},\n\nYour invoice {{invoiceNumber}} for {{amount}} is due today.\n\nPlease submit your payment at your earliest convenience.\n\nPayment methods: {{paymentLink}}',
    tone: 'neutral' as const,
  },
  overdue_notice: {
    subject: 'Past Due Notice: Invoice {{invoiceNumber}}',
    body: 'Dear {{customerName}},\n\nOur records indicate that invoice {{invoiceNumber}} for {{amount}} was due on {{dueDate}} and is now {{daysOverdue}} days past due.\n\nPlease remit payment immediately to avoid additional late fees and potential service interruption.\n\nOutstanding Balance: {{amount}}\nPayment Link: {{paymentLink}}',
    tone: 'firm' as const,
  },
  final_notice: {
    subject: 'URGENT: Final Notice - Invoice {{invoiceNumber}}',
    body: 'Dear {{customerName}},\n\nThis is your final notice regarding outstanding invoice {{invoiceNumber}} for {{amount}}, which is now {{daysOverdue}} days overdue.\n\nImmediate payment of {{amount}} is required to avoid further collection activity.\n\nIf you have already made payment, please disregard this notice and provide your payment confirmation.\n\nPayment Link: {{paymentLink}}',
    tone: 'urgent' as const,
  },
};

const TASK_HANDLERS: Record<string, (context: AgentContext, input: Record<string, unknown>) => Promise<AgentToolResult>> = {
  send_reminder: async (ctx, input) => {
    const customerId = input.customerId as string;
    const invoiceId = input.invoiceId as string;
    const channel = (input.channel as 'email' | 'sms' | 'push') || 'email';
    const template = (input.template as keyof typeof reminderTemplates) || 'friendly_reminder';

    const customerResult = await getCustomer(ctx, { customerId, includeHistory: true });
    if (!customerResult.success) return customerResult;

    const customer = customerResult.data as {
      name: string;
      email: string | null;
      phone: string | null;
      outstandingBalance: number;
    };

    const templateContent = reminderTemplates[template];
    const personalizedBody = templateContent.body
      .replace(/\{\{customerName\}\}/g, customer.name)
      .replace(/\{\{invoiceNumber\}\}/g, invoiceId)
      .replace(/\{\{amount\}\}/g, `$${customer.outstandingBalance.toFixed(2)}`)
      .replace(/\{\{dueDate\}\}/g, new Date().toLocaleDateString())
      .replace(/\{\{daysOverdue\}\}/g, '30')
      .replace(/\{\{paymentLink\}\}/g, `${process.env.NEXT_PUBLIC_APP_URL}/pay/${invoiceId}`);

    return {
      success: true,
      data: {
        reminderId: `rem_${Date.now()}`,
        customerId,
        invoiceId,
        channel,
        template,
        tone: templateContent.tone,
        recipient: channel === 'email' ? customer.email : customer.phone,
        subject: templateContent.subject.replace(/\{\{invoiceNumber\}\}/g, invoiceId),
        body: personalizedBody,
        status: 'queued',
        scheduledAt: new Date().toISOString(),
        metadata: {
          customerName: customer.name,
          outstandingBalance: customer.outstandingBalance,
        },
      },
    };
  },

  schedule_reminders: async (ctx, input) => {
    const customerId = input.customerId as string;
    const invoiceIds = input.invoiceIds as string[];
    const schedule = input.schedule as string || 'standard';

    const customerResult = await getCustomer(ctx, { customerId, includeHistory: false });
    if (!customerResult.success) return customerResult;

    const scheduledReminders: Array<{
      invoiceId: string;
      channel: string;
      template: string;
      scheduledFor: string;
    }> = [];

    const scheduleConfig: Array<{ daysBefore?: number; daysAfter?: number; channel: string; template: string }> = schedule === 'aggressive'
      ? [
          { daysBefore: 7, channel: 'email', template: 'friendly_reminder' },
          { daysBefore: 1, channel: 'email', template: 'due_today' },
          { daysAfter: 3, channel: 'sms', template: 'overdue_notice' },
          { daysAfter: 7, channel: 'email', template: 'final_notice' },
          { daysAfter: 14, channel: 'sms', template: 'final_notice' },
        ]
      : [
          { daysBefore: 3, channel: 'email', template: 'friendly_reminder' },
          { daysAfter: 1, channel: 'email', template: 'overdue_notice' },
          { daysAfter: 7, channel: 'email', template: 'final_notice' },
        ];

    for (const invoiceId of invoiceIds) {
      for (const config of scheduleConfig) {
        const scheduledDate = new Date();
        const offset = config.daysBefore ?? -(config.daysAfter ?? 0);
        scheduledDate.setDate(scheduledDate.getDate() + offset);

        scheduledReminders.push({
          invoiceId,
          channel: config.channel,
          template: config.template,
          scheduledFor: scheduledDate.toISOString(),
        });
      }
    }

    return {
      success: true,
      data: {
        customerId,
        scheduleType: schedule,
        totalReminders: scheduledReminders.length,
        reminders: scheduledReminders,
        customer: customerResult.data,
        configuration: {
          channels: [...new Set(scheduledReminders.map(r => r.channel))],
          startDate: scheduledReminders[0]?.scheduledFor,
          endDate: scheduledReminders[scheduledReminders.length - 1]?.scheduledFor,
        },
      },
    };
  },

  get_reminder_analytics: async (ctx, input) => {
    const startDate = input.startDate as string;
    const endDate = input.endDate as string;

    return {
      success: true,
      data: {
        period: { start: startDate, end: endDate },
        metrics: {
          totalSent: 156,
          emailSent: 120,
          smsSent: 36,
          openRate: 0.68,
          clickRate: 0.42,
          paymentRate: 0.35,
          averageDaysToPaymentAfterReminder: 4.2,
          channelEffectiveness: {
            email: { sent: 120, opened: 82, clicked: 50, paid: 42 },
            sms: { sent: 36, opened: 28, clicked: 15, paid: 12 },
          },
          templateEffectiveness: {
            friendly_reminder: { sent: 60, paid: 25, effectiveness: 0.42 },
            due_today: { sent: 40, paid: 18, effectiveness: 0.45 },
            overdue_notice: { sent: 36, paid: 8, effectiveness: 0.22 },
            final_notice: { sent: 20, paid: 3, effectiveness: 0.15 },
          },
          optimalSendTimes: {
            email: { bestHour: 10, bestDay: 'Tuesday' },
            sms: { bestHour: 12, bestDay: 'Thursday' },
          },
        },
        recommendations: [
          'Increase SMS usage for overdue accounts - 22% higher response rate',
          'Send reminders Tuesday mornings for highest open rates',
          'Final notices have low effectiveness - consider earlier escalation',
          'Follow up friendly reminders with SMS after 3 days if no response',
        ],
      },
    };
  },

  optimize_reminder_strategy: async (ctx, input) => {
    const customerId = input.customerId as string;
    const metricsResult = await getCustomerMetrics(ctx, { customerId });
    if (!metricsResult.success) return metricsResult;

    const metrics = metricsResult.data as {
      paymentStats: { averageDaysToPay: number };
      collectionRate: number;
      invoiceStats: { overdue: number };
      riskLevel: string;
    };

    const avgDaysToPay = metrics.paymentStats.averageDaysToPay;
    const collectionRate = metrics.collectionRate;
    const hasOverdue = metrics.invoiceStats.overdue > 0;

    let recommendedStrategy: string;
    let channels: string[];
    let frequency: string;
    let tone: string;

    if (collectionRate > 0.9 && !hasOverdue) {
      recommendedStrategy = 'minimal';
      channels = ['email'];
      frequency = 'low';
      tone = 'friendly';
    } else if (collectionRate > 0.7) {
      recommendedStrategy = 'standard';
      channels = ['email'];
      frequency = 'medium';
      tone = 'neutral';
    } else if (collectionRate > 0.5) {
      recommendedStrategy = 'enhanced';
      channels = ['email', 'sms'];
      frequency = 'high';
      tone = 'firm';
    } else {
      recommendedStrategy = 'aggressive';
      channels = ['email', 'sms', 'push'];
      frequency = 'very_high';
      tone = 'urgent';
    }

    return {
      success: true,
      data: {
        customerId,
        currentMetrics: metricsResult.data,
        recommendedStrategy,
        configuration: {
          channels,
          frequency,
          tone,
          optimalSendTimes: {
            email: avgDaysToPay < 15 ? '9 AM' : '10 AM',
            sms: '12 PM',
            push: '6 PM',
          },
          escalationRules: [
            { trigger: 'no_response_3_days', action: 'switch_channel' },
            { trigger: 'no_response_7_days', action: 'escalate_tone' },
            { trigger: 'no_response_14_days', action: 'handoff_to_collection' },
          ],
        },
        estimatedImpact: {
          currentCollectionRate: collectionRate,
          projectedCollectionRate: Math.min(0.95, collectionRate + 0.15),
          estimatedRecoveryImprovement: `$${((Math.min(0.95, collectionRate + 0.15) - collectionRate) * 10000).toFixed(2)}`,
        },
      },
    };
  },
};

export const reminderAgent = {
  role: 'reminder' as AgentRole,
  config: getAgentConfig('reminder'),

  async process(
    context: AgentContext,
    input: Record<string, unknown>,
    onChunk?: (chunk: StreamingChunk) => void
  ): Promise<AgentToolResult> {
    const taskType = input.taskType as string || 'send_reminder';
    const handler = TASK_HANDLERS[taskType];

    onChunk?.({
      type: 'text',
      content: `Reminder Agent: Processing ${taskType}`,
      agentRole: 'reminder',
      timestamp: new Date(),
    });

    if (handler) {
      return handler(context, input);
    }

    return { success: false, error: `Unknown reminder task: ${taskType}` };
  },

  async handleHandoff(
    from: AgentRole,
    context: AgentContext,
    data: Record<string, unknown>
  ): Promise<AgentToolResult> {
    if (from === 'invoice' && data.action === 'send_payment_reminder') {
      return this.process(context, {
        taskType: 'send_reminder',
        customerId: data.customerId,
        invoiceId: data.invoiceId,
        channel: 'email',
        template: 'friendly_reminder',
      });
    }

    if (from === 'collection' && data.action === 'schedule_escalation_reminders') {
      return this.process(context, {
        taskType: 'schedule_reminders',
        customerId: data.customerId,
        invoiceIds: data.invoiceIds,
        schedule: 'aggressive',
      });
    }

    return {
      success: true,
      data: {
        message: `Reminder Agent received handoff from ${from}`,
        action: data.action,
      },
    };
  },

  async getPersonalizedTiming(
    context: AgentContext,
    customerId: string
  ): Promise<AgentToolResult> {
    const metricsResult = await getCustomerMetrics(context, { customerId });
    if (!metricsResult.success) return metricsResult;

    const metrics = metricsResult.data as {
      paymentStats: { averageDaysToPay: number; lastPaymentDate: Date | null };
    };

    const avgDaysToPay = metrics.paymentStats.averageDaysToPay;
    const lastPayment = metrics.paymentStats.lastPaymentDate;

    const optimalTiming = calculateOptimalTiming(avgDaysToPay, lastPayment);

    return {
      success: true,
      data: {
        customerId,
        avgDaysToPay,
        lastPaymentDate: lastPayment,
        optimalTiming,
        recommendations: {
          reminderDaysBeforeDue: avgDaysToPay > 30 ? 7 : avgDaysToPay > 15 ? 5 : 3,
          followUpDaysAfterDue: 3,
          escalateDaysAfterDue: avgDaysToPay > 30 ? 14 : 7,
          bestTimeOfDay: optimalTiming.bestTime,
          bestDayOfWeek: optimalTiming.bestDay,
        },
      },
    };
  },
};

function calculateOptimalTiming(
  avgDaysToPay: number,
  lastPaymentDate: Date | null
): { bestTime: string; bestDay: string; confidence: number } {
  if (avgDaysToPay <= 15) {
    return { bestTime: '09:00', bestDay: 'Tuesday', confidence: 0.85 };
  } else if (avgDaysToPay <= 30) {
    return { bestTime: '10:00', bestDay: 'Wednesday', confidence: 0.75 };
  } else {
    return { bestTime: '14:00', bestDay: 'Thursday', confidence: 0.65 };
  }
}
