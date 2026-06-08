import { z } from 'zod';
import { AgentContext, AgentToolResult, AgentRole, StreamingChunk } from './types';
import { getAgentConfig } from './config';
import {
  generateInvoice, validateInvoice, optimizeInvoiceTiming,
  generateInvoiceInputSchema, validateInvoiceInputSchema, optimizeTimingInputSchema
} from './tools/invoice-tools';
import { getCustomer, getCustomerMetrics } from './tools/customer-tools';

const TASK_HANDLERS: Record<string, (context: AgentContext, input: Record<string, unknown>) => Promise<AgentToolResult>> = {
  generate_invoice: async (ctx, input) => {
    const validated = generateInvoiceInputSchema.parse(input);
    return generateInvoice(ctx, validated);
  },
  validate_invoice: async (ctx, input) => {
    const validated = validateInvoiceInputSchema.parse(input);
    return validateInvoice(ctx, validated);
  },
  optimize_invoice_timing: async (ctx, input) => {
    const validated = optimizeTimingInputSchema.parse(input);
    return optimizeInvoiceTiming(ctx, validated);
  },
  send_invoice: async (ctx, input) => {
    const invoiceId = input.invoiceId as string;
    if (!invoiceId) {
      return { success: false, error: 'invoiceId is required' };
    }

    const result = await validateInvoice(ctx, { invoiceId, strict: false });
    if (!result.success) {
      return result;
    }

    const validationResult = result.data as Record<string, unknown> | undefined;
    if (!validationResult?.isValid) {
      return {
        success: false,
        error: 'Invoice has validation errors that must be fixed before sending',
        data: {
          errors: validationResult?.errors,
          warnings: validationResult?.warnings,
        },
      };
    }

    return {
      success: true,
      data: {
        invoiceId,
        status: 'sent',
        sentAt: new Date().toISOString(),
        message: 'Invoice validated and ready for delivery',
      },
    };
  },
};

async function processTaskWithInsights(
  context: AgentContext,
  taskType: string,
  input: Record<string, unknown>,
  onChunk?: (chunk: StreamingChunk) => void
): Promise<AgentToolResult> {
  const handler = TASK_HANDLERS[taskType];
  if (!handler) {
    return { success: false, error: `Unknown task type: ${taskType}` };
  }

  onChunk?.({
    type: 'text',
    content: `Invoice Agent: Processing ${taskType}`,
    agentRole: 'invoice',
    timestamp: new Date(),
  });

  const result = await handler(context, input);

  if (result.success && taskType === 'generate_invoice') {
    const customerResult = await getCustomer(context, {
      customerId: input.customerId as string,
      includeHistory: true,
    });

    if (customerResult.success && (customerResult.data as Record<string, unknown>)?.history) {
      const customerData = customerResult.data as Record<string, unknown>;
      const history = customerData.history as { overdueInvoices: number; paidInvoices: number };
      result.data = {
        ...(result.data as Record<string, unknown>),
        customerInsights: {
          historicalOverdueRate: history.paidInvoices > 0
            ? history.overdueInvoices / (history.paidInvoices + history.overdueInvoices)
            : 0,
          recommendation: history.overdueInvoices > 3
            ? 'Consider shorter payment terms for this customer'
            : 'Standard payment terms appropriate',
        },
      };
    }
  }

  return result;
}

export const invoiceAgent = {
  role: 'invoice' as AgentRole,
  config: getAgentConfig('invoice'),

  async process(
    context: AgentContext,
    input: Record<string, unknown>,
    onChunk?: (chunk: StreamingChunk) => void
  ): Promise<AgentToolResult> {
    const taskType = input.taskType as string || 'generate_invoice';
    return processTaskWithInsights(context, taskType, input, onChunk);
  },

  async handleHandoff(
    from: AgentRole,
    context: AgentContext,
    data: Record<string, unknown>
  ): Promise<AgentToolResult> {
    if (from === 'collection' && data.action === 'generate_invoice') {
      return processTaskWithInsights(context, 'generate_invoice', data);
    }

    if (from === 'forecasting' && data.action === 'validate_invoice_timing') {
      return processTaskWithInsights(context, 'optimize_invoice_timing', data);
    }

    return {
      success: true,
      data: {
        message: `Invoice Agent received handoff from ${from}`,
        action: data.action,
      },
    };
  },

  async generateInvoiceWithValidation(
    context: AgentContext,
    input: z.infer<typeof generateInvoiceInputSchema>
  ): Promise<AgentToolResult> {
    const generateResult = await generateInvoice(context, input);
    if (!generateResult.success) {
      return generateResult;
    }

    const validateResult = await validateInvoice(context, {
      invoiceId: (generateResult.data as Record<string, unknown>).invoiceId as string,
      strict: true,
    });

    return {
      success: validateResult.success,
      data: {
        ...(generateResult.data as Record<string, unknown>),
        validation: validateResult.data,
      },
      error: validateResult.error,
    };
  },

  async bulkGenerateInvoices(
    context: AgentContext,
    customerId: string
  ): Promise<AgentToolResult> {
    const customerResult = await getCustomerMetrics(context, { customerId });
    if (!customerResult.success) {
      return customerResult;
    }

    return {
      success: true,
      data: {
        customerId,
        customerMetrics: customerResult.data as Record<string, unknown>,
        message: 'Customer metrics retrieved for bulk invoice generation',
      },
    };
  },
};
