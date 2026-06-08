import { z } from 'zod';
import { db } from '@/lib/db';
import { payments, paymentLineItems, paymentRefunds, invoices, customers } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { AgentContext, AgentToolResult } from '../types';

export const processPaymentInputSchema = z.object({
  customerId: z.string().uuid(),
  amount: z.number().positive(),
  paymentMethod: z.enum([
    'credit_card', 'debit_card', 'ach_transfer', 'wire_transfer',
    'check', 'cash', 'digital_wallet', 'other'
  ]),
  currency: z.string().length(3).optional().default('USD'),
  invoiceIds: z.array(z.string().uuid()).optional(),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const retryPaymentInputSchema = z.object({
  paymentId: z.string().uuid(),
  maxRetries: z.number().int().min(1).max(10).optional().default(3),
  delayMs: z.number().int().min(1000).optional().default(1000),
});

export const processRefundInputSchema = z.object({
  paymentId: z.string().uuid(),
  amount: z.number().positive(),
  reason: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function processPayment(
  context: AgentContext,
  input: z.infer<typeof processPaymentInputSchema>
): Promise<AgentToolResult> {
  try {
    const customer = await db.query.customers.findFirst({
      where: and(
        eq(customers.id, input.customerId),
        eq(customers.tenantId, context.tenantId)
      ),
    });

    if (!customer) {
      return { success: false, error: 'Customer not found' };
    }

    const lastPayment = await db.query.payments.findFirst({
      where: eq(payments.tenantId, context.tenantId),
      orderBy: [desc(payments.createdAt)],
    });

    const prefix = 'PAY';
    const nextNumber = lastPayment
      ? parseInt(lastPayment.paymentNumber.replace(`${prefix}-`, '')) + 1
      : 1;
    const paymentNumber = `${prefix}-${String(nextNumber).padStart(6, '0')}`;

    const [payment] = await db.insert(payments).values({
      tenantId: context.tenantId,
      customerId: input.customerId,
      paymentNumber,
      status: 'processing',
      paymentMethod: input.paymentMethod,
      currency: (input.currency || customer.currency || 'USD') as 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY' | 'CHF',
      amount: String(input.amount),
      netAmount: String(input.amount),
      referenceNumber: input.referenceNumber,
      notes: input.notes,
      metadata: input.metadata,
    }).returning();

    let totalApplied = 0;
    const appliedInvoices: { invoiceId: string; amount: number }[] = [];

    if (input.invoiceIds && input.invoiceIds.length > 0) {
      for (const invoiceId of input.invoiceIds) {
        const invoice = await db.query.invoices.findFirst({
          where: and(
            eq(invoices.id, invoiceId),
            eq(invoices.tenantId, context.tenantId)
          ),
        });

        if (!invoice) continue;

        const amountDue = parseFloat(invoice.amountDue);
        const remainingPayment = input.amount - totalApplied;
        const applyAmount = Math.min(amountDue, remainingPayment);

        if (applyAmount > 0) {
          await db.insert(paymentLineItems).values({
            tenantId: context.tenantId,
            paymentId: payment.id,
            invoiceId,
            amount: String(applyAmount),
          });

          const newAmountPaid = parseFloat(invoice.amountPaid) + applyAmount;
          const newAmountDue = parseFloat(invoice.total) - newAmountPaid;

          let newStatus: typeof invoices.status.enumValues[number] = 'partial';
          if (newAmountDue <= 0) {
            newStatus = 'paid';
          } else if (newAmountPaid > 0) {
            newStatus = 'partial';
          }

          await db.update(invoices)
            .set({
              amountPaid: String(newAmountPaid),
              amountDue: String(Math.max(0, newAmountDue)),
              status: newStatus,
              paidAt: newAmountDue <= 0 ? new Date() : null,
              updatedAt: new Date(),
            })
            .where(eq(invoices.id, invoiceId));

          totalApplied += applyAmount;
          appliedInvoices.push({ invoiceId, amount: applyAmount });

          if (totalApplied >= input.amount) break;
        }
      }
    }

    const newOutstandingBalance = parseFloat(customer.outstandingBalance) - totalApplied;
    await db.update(customers)
      .set({
        outstandingBalance: String(Math.max(0, newOutstandingBalance)),
        updatedAt: new Date(),
      })
      .where(eq(customers.id, input.customerId));

    await db.update(payments)
      .set({
        status: 'completed',
        receivedAt: new Date(),
        processedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id));

    return {
      success: true,
      data: {
        paymentId: payment.id,
        paymentNumber: payment.paymentNumber,
        status: 'completed',
        amount: input.amount,
        amountApplied: totalApplied,
        unappliedAmount: input.amount - totalApplied,
        appliedInvoices,
        processedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process payment',
    };
  }
}

export async function retryPayment(
  context: AgentContext,
  input: z.infer<typeof retryPaymentInputSchema>
): Promise<AgentToolResult> {
  try {
    const payment = await db.query.payments.findFirst({
      where: and(
        eq(payments.id, input.paymentId),
        eq(payments.tenantId, context.tenantId)
      ),
    });

    if (!payment) {
      return { success: false, error: 'Payment not found' };
    }

    if (payment.status !== 'failed') {
      return { success: false, error: 'Can only retry failed payments' };
    }

    const retryAttempts = (payment.metadata as Record<string, unknown>)?.retryAttempts as number || 0;
    if (retryAttempts >= input.maxRetries) {
      return {
        success: false,
        error: `Maximum retry attempts (${input.maxRetries}) reached`,
      };
    }

    const delay = input.delayMs * Math.pow(2, retryAttempts);

    await db.update(payments)
      .set({
        status: 'processing',
        metadata: {
          ...payment.metadata,
          retryAttempts: retryAttempts + 1,
          lastRetryAt: new Date().toISOString(),
          nextRetryAt: new Date(Date.now() + delay * 2).toISOString(),
        },
        updatedAt: new Date(),
      })
      .where(eq(payments.id, input.paymentId));

    return {
      success: true,
      data: {
        paymentId: payment.id,
        paymentNumber: payment.paymentNumber,
        retryAttempt: retryAttempts + 1,
        maxRetries: input.maxRetries,
        nextRetryAt: new Date(Date.now() + delay * 2).toISOString(),
        status: 'processing',
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retry payment',
    };
  }
}

export async function processRefund(
  context: AgentContext,
  input: z.infer<typeof processRefundInputSchema>
): Promise<AgentToolResult> {
  try {
    const payment = await db.query.payments.findFirst({
      where: and(
        eq(payments.id, input.paymentId),
        eq(payments.tenantId, context.tenantId)
      ),
    });

    if (!payment) {
      return { success: false, error: 'Payment not found' };
    }

    if (payment.status !== 'completed') {
      return { success: false, error: 'Can only refund completed payments' };
    }

    const originalAmount = parseFloat(payment.amount);
    const alreadyRefunded = parseFloat(payment.amountRefunded);
    const refundableAmount = originalAmount - alreadyRefunded;

    if (input.amount > refundableAmount) {
      return {
        success: false,
        error: `Refund amount ${input.amount} exceeds refundable amount ${refundableAmount}`,
      };
    }

    const [refund] = await db.insert(paymentRefunds).values({
      tenantId: context.tenantId,
      paymentId: input.paymentId,
      amount: String(input.amount),
      reason: input.reason,
      status: 'pending',
      metadata: input.metadata,
    }).returning();

    const newAmountRefunded = alreadyRefunded + input.amount;
    const newNetAmount = originalAmount - newAmountRefunded;

    let newPaymentStatus: typeof payments.status.enumValues[number] = 'completed';
    if (newAmountRefunded >= originalAmount) {
      newPaymentStatus = 'refunded';
    } else if (newAmountRefunded > 0) {
      newPaymentStatus = 'partially_refunded';
    }

    await db.update(payments)
      .set({
        amountRefunded: String(newAmountRefunded),
        netAmount: String(newNetAmount),
        status: newPaymentStatus,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, input.paymentId));

    await db.update(paymentRefunds)
      .set({
        status: 'completed',
        processedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(paymentRefunds.id, refund.id));

    const lineItems = await db.query.paymentLineItems.findMany({
      where: eq(paymentLineItems.paymentId, input.paymentId),
    });

    for (const lineItem of lineItems) {
      const invoice = await db.query.invoices.findFirst({
        where: eq(invoices.id, lineItem.invoiceId),
      });

      if (invoice) {
        const proportionalRefund = (parseFloat(lineItem.amount) / originalAmount) * input.amount;
        const newAmountPaid = parseFloat(invoice.amountPaid) - proportionalRefund;
        const newAmountDue = parseFloat(invoice.total) - newAmountPaid;

        let newInvoiceStatus: typeof invoices.status.enumValues[number] = 'partial';
        if (newAmountPaid <= 0) {
          newInvoiceStatus = 'sent';
        } else if (newAmountPaid < parseFloat(invoice.total)) {
          newInvoiceStatus = 'partial';
        }

        await db.update(invoices)
          .set({
            amountPaid: String(Math.max(0, newAmountPaid)),
            amountDue: String(Math.max(0, newAmountDue)),
            status: newInvoiceStatus,
            paidAt: null,
            updatedAt: new Date(),
          })
          .where(eq(invoices.id, lineItem.invoiceId));
      }
    }

    return {
      success: true,
      data: {
        refundId: refund.id,
        paymentId: input.paymentId,
        amount: input.amount,
        status: 'completed',
        paymentStatus: newPaymentStatus,
        totalRefunded: newAmountRefunded,
        remainingRefundable: refundableAmount - input.amount,
        processedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process refund',
    };
  }
}

export const paymentTools = {
  processPayment: {
    name: 'process_payment',
    description: 'Process a payment transaction and apply to invoices',
    inputSchema: processPaymentInputSchema,
    handler: processPayment,
  },
  retryPayment: {
    name: 'retry_payment',
    description: 'Retry a failed payment with exponential backoff',
    inputSchema: retryPaymentInputSchema,
    handler: retryPayment,
  },
  processRefund: {
    name: 'process_refund',
    description: 'Process a full or partial refund on a payment',
    inputSchema: processRefundInputSchema,
    handler: processRefund,
  },
};
