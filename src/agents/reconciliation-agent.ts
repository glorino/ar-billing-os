import { z } from 'zod';
import { db } from '@/lib/db';
import {
  reconciliationBatches, reconciliationItems, payments,
  paymentLineItems, invoices
} from '@/lib/db/schema';
import { eq, and, desc, sql, count, sum } from 'drizzle-orm';
import { AgentContext, AgentToolResult, AgentRole, StreamingChunk } from './types';
import { getAgentConfig } from './config';

const TASK_HANDLERS: Record<string, (context: AgentContext, input: Record<string, unknown>) => Promise<AgentToolResult>> = {
  reconcile_payments: async (ctx, input) => {
    const source = (input.source as string) || 'manual';
    const statementDate = input.statementDate as string;

    const unreconciledPayments = await db.query.payments.findMany({
      where: and(
        eq(payments.tenantId, ctx.tenantId),
        eq(payments.status, 'completed'),
        eq(payments.reconciliationStatus, 'pending')
      ),
      orderBy: [desc(payments.receivedAt)],
    });

    const lastBatch = await db.query.reconciliationBatches.findFirst({
      where: eq(reconciliationBatches.tenantId, ctx.tenantId),
      orderBy: [desc(reconciliationBatches.createdAt)],
    });

    const batchNumber = lastBatch
      ? `REC-${String(parseInt(lastBatch.batchNumber.replace('REC-', '')) + 1).padStart(6, '0')}`
      : 'REC-000001';

    const [batch] = await db.insert(reconciliationBatches).values({
      tenantId: ctx.tenantId,
      batchNumber,
      status: 'pending',
      source,
      totalTransactions: unreconciledPayments.length,
      totalAmount: String(unreconciledPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0)),
      currency: 'USD',
      statementDate: statementDate ? new Date(statementDate) : new Date(),
    }).returning();

    let matchedCount = 0;
    let unmatchedCount = 0;
    let matchedAmount = 0;
    let unmatchedAmount = 0;

    for (const payment of unreconciledPayments) {
      const lineItems = await db.query.paymentLineItems.findMany({
        where: eq(paymentLineItems.paymentId, payment.id),
      });

      let isMatched = false;

      for (const lineItem of lineItems) {
        const invoice = await db.query.invoices.findFirst({
          where: eq(invoices.id, lineItem.invoiceId),
        });

        if (invoice) {
          const paymentAmount = parseFloat(lineItem.amount);
          const invoiceAmount = parseFloat(invoice.amountDue) + parseFloat(lineItem.amount);

          if (Math.abs(paymentAmount - parseFloat(lineItem.amount)) < 0.01) {
            isMatched = true;

            await db.insert(reconciliationItems).values({
              tenantId: ctx.tenantId,
              batchId: batch.id,
              paymentId: payment.id,
              status: 'matched',
              transactionDate: payment.receivedAt || new Date(),
              transactionReference: payment.referenceNumber || payment.paymentNumber,
              transactionDescription: `Payment ${payment.paymentNumber} for invoice ${invoice.invoiceNumber}`,
              transactionAmount: payment.amount,
              paymentAmount: lineItem.amount,
              difference: '0',
            });

            await db.update(payments)
              .set({
                reconciliationStatus: 'matched',
                reconciledAt: new Date(),
                updatedAt: new Date(),
              })
              .where(eq(payments.id, payment.id));
          }
        }
      }

      if (isMatched) {
        matchedCount++;
        matchedAmount += parseFloat(payment.amount);
      } else {
        unmatchedCount++;
        unmatchedAmount += parseFloat(payment.amount);

        await db.insert(reconciliationItems).values({
          tenantId: ctx.tenantId,
          batchId: batch.id,
          paymentId: payment.id,
          status: 'unmatched',
          transactionDate: payment.receivedAt || new Date(),
          transactionReference: payment.referenceNumber || payment.paymentNumber,
          transactionDescription: `Payment ${payment.paymentNumber} - no matching invoice found`,
          transactionAmount: payment.amount,
        });
      }
    }

    await db.update(reconciliationBatches)
      .set({
        status: matchedCount > 0 && unmatchedCount === 0 ? 'matched' : 'partial',
        matchedCount,
        unmatchedCount,
        matchedAmount: String(matchedAmount),
        unmatchedAmount: String(unmatchedAmount),
        updatedAt: new Date(),
      })
      .where(eq(reconciliationBatches.id, batch.id));

    return {
      success: true,
      data: {
        batchId: batch.id,
        batchNumber,
        summary: {
          totalTransactions: unreconciledPayments.length,
          matchedCount,
          unmatchedCount,
          matchedAmount,
          unmatchedAmount,
          matchRate: unreconciledPayments.length > 0
            ? (matchedCount / unreconciledPayments.length) * 100
            : 0,
        },
        status: unmatchedCount === 0 ? 'fully_matched' : 'partial',
        unmatchedItems: unmatchedCount > 0
          ? 'Review unmatched items for manual resolution'
          : null,
      },
    };
  },

  match_payment_to_invoice: async (ctx, input) => {
    const paymentId = input.paymentId as string;
    const invoiceId = input.invoiceId as string;
    const amount = input.amount as number;

    const payment = await db.query.payments.findFirst({
      where: and(
        eq(payments.id, paymentId),
        eq(payments.tenantId, ctx.tenantId)
      ),
    });

    if (!payment) {
      return { success: false, error: 'Payment not found' };
    }

    const invoice = await db.query.invoices.findFirst({
      where: and(
        eq(invoices.id, invoiceId),
        eq(invoices.tenantId, ctx.tenantId)
      ),
    });

    if (!invoice) {
      return { success: false, error: 'Invoice not found' };
    }

    const paymentAmount = amount || parseFloat(payment.amount);
    const invoiceDue = parseFloat(invoice.amountDue);

    const matchType = Math.abs(paymentAmount - invoiceDue) < 0.01
      ? 'exact'
      : paymentAmount < invoiceDue
        ? 'partial'
        : 'overpayment';

    await db.insert(paymentLineItems).values({
      tenantId: ctx.tenantId,
      paymentId,
      invoiceId,
      amount: String(paymentAmount),
    });

    const newAmountPaid = parseFloat(invoice.amountPaid) + paymentAmount;
    const newAmountDue = parseFloat(invoice.total) - newAmountPaid;

    let newStatus: typeof invoices.status.enumValues[number] = 'partial';
    if (newAmountDue <= 0) {
      newStatus = 'paid';
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

    await db.update(payments)
      .set({
        reconciliationStatus: matchType === 'exact' ? 'matched' : 'partial',
        reconciledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(payments.id, paymentId));

    return {
      success: true,
      data: {
        matchId: `match_${Date.now()}`,
        paymentId,
        invoiceId,
        matchType,
        paymentAmount,
        invoiceTotal: parseFloat(invoice.total),
        previousAmountPaid: parseFloat(invoice.amountPaid),
        newAmountPaid,
        newAmountDue: Math.max(0, newAmountDue),
        invoiceStatus: newStatus,
      },
    };
  },

  detect_discrepancies: async (ctx, input) => {
    const startDate = input.startDate as string;
    const endDate = input.endDate as string;

    const conditions = [
      eq(reconciliationItems.tenantId, ctx.tenantId),
      eq(reconciliationItems.status, 'unmatched'),
    ];

    if (startDate) {
      conditions.push(sql`${reconciliationItems.createdAt} >= ${new Date(startDate)}`);
    }
    if (endDate) {
      conditions.push(sql`${reconciliationItems.createdAt} <= ${new Date(endDate)}`);
    }

    const unmatchedItems = await db.query.reconciliationItems.findMany({
      where: and(...conditions),
      orderBy: [desc(reconciliationItems.createdAt)],
    });

    const discrepancies = unmatchedItems.map(item => ({
      itemId: item.id,
      paymentId: item.paymentId,
      transactionAmount: parseFloat(item.transactionAmount),
      transactionReference: item.transactionReference,
      transactionDate: item.transactionDate,
      type: categorizeDiscrepancy(item),
      severity: assessDiscrepancySeverity(item),
      suggestedAction: getSuggestedAction(item),
    }));

    const summary = {
      total: discrepancies.length,
      totalAmount: discrepancies.reduce((sum, d) => sum + d.transactionAmount, 0),
      byType: {
        no_matching_invoice: discrepancies.filter(d => d.type === 'no_matching_invoice').length,
        amount_mismatch: discrepancies.filter(d => d.type === 'amount_mismatch').length,
        missing_reference: discrepancies.filter(d => d.type === 'missing_reference').length,
        duplicate_payment: discrepancies.filter(d => d.type === 'duplicate_payment').length,
      },
      bySeverity: {
        high: discrepancies.filter(d => d.severity === 'high').length,
        medium: discrepancies.filter(d => d.severity === 'medium').length,
        low: discrepancies.filter(d => d.severity === 'low').length,
      },
    };

    return {
      success: true,
      data: {
        period: { start: startDate, end: endDate },
        summary,
        discrepancies: discrepancies.slice(0, 50),
        recommendations: generateDiscrepancyRecommendations(discrepancies),
      },
    };
  },

  get_reconciliation_status: async (ctx, input) => {
    const [batchStats] = await db
      .select({
        totalBatches: count(),
        pendingBatches: sql<number>`count(*) filter (where ${reconciliationBatches.status} = 'pending')`,
        matchedBatches: sql<number>`count(*) filter (where ${reconciliationBatches.status} = 'matched')`,
        partialBatches: sql<number>`count(*) filter (where ${reconciliationBatches.status} = 'partial')`,
        unmatchedBatches: sql<number>`count(*) filter (where ${reconciliationBatches.status} = 'unmatched')`,
      })
      .from(reconciliationBatches)
      .where(eq(reconciliationBatches.tenantId, ctx.tenantId));

    const [itemStats] = await db
      .select({
        totalItems: count(),
        matchedItems: sql<number>`count(*) filter (where ${reconciliationItems.status} = 'matched')`,
        unmatchedItems: sql<number>`count(*) filter (where ${reconciliationItems.status} = 'unmatched')`,
        totalAmount: sum(reconciliationItems.transactionAmount),
        matchedAmount: sql<string>`coalesce(sum(case when ${reconciliationItems.status} = 'matched' then ${reconciliationItems.transactionAmount} else 0 end), '0')`,
      })
      .from(reconciliationItems)
      .where(eq(reconciliationItems.tenantId, ctx.tenantId));

    return {
      success: true,
      data: {
        batches: batchStats,
        items: itemStats,
        reconciliationRate: itemStats.totalItems > 0
          ? (itemStats.matchedItems / itemStats.totalItems) * 100
          : 100,
        unreconciledAmount: parseFloat(itemStats.totalAmount || '0') - parseFloat(itemStats.matchedAmount || '0'),
      },
    };
  },
};

function categorizeDiscrepancy(item: {
  transactionAmount: string;
  paymentAmount: string | null;
  transactionReference: string | null;
}): string {
  if (!item.transactionReference) return 'missing_reference';
  if (!item.paymentAmount) return 'no_matching_invoice';
  const diff = Math.abs(parseFloat(item.transactionAmount) - parseFloat(item.paymentAmount));
  if (diff > 0.01) return 'amount_mismatch';
  return 'no_matching_invoice';
}

function assessDiscrepancySeverity(item: {
  transactionAmount: string;
}): 'high' | 'medium' | 'low' {
  const amount = parseFloat(item.transactionAmount);
  if (amount > 10000) return 'high';
  if (amount > 1000) return 'medium';
  return 'low';
}

function getSuggestedAction(item: {
  transactionAmount: string;
  paymentAmount: string | null;
}): string {
  if (!item.paymentAmount) return 'Find matching invoice or create adjustment';
  const diff = parseFloat(item.transactionAmount) - parseFloat(item.paymentAmount);
  if (diff > 0) return 'Investigate overpayment - may need refund or credit';
  if (diff < 0) return 'Investigate underpayment - may need additional collection';
  return 'Review and approve match';
}

function generateDiscrepancyRecommendations(
  discrepancies: Array<{ type: string; severity: string; transactionAmount: number }>
): string[] {
  const recommendations: string[] = [];

  const highSeverity = discrepancies.filter(d => d.severity === 'high');
  if (highSeverity.length > 0) {
    recommendations.push(`URGENT: ${highSeverity.length} high-severity discrepancies totaling $${highSeverity.reduce((sum, d) => sum + d.transactionAmount, 0).toFixed(2)} require immediate attention`);
  }

  const noMatch = discrepancies.filter(d => d.type === 'no_matching_invoice');
  if (noMatch.length > 5) {
    recommendations.push(`${noMatch.length} payments without matching invoices - verify customer reference numbers`);
  }

  const amountMismatch = discrepancies.filter(d => d.type === 'amount_mismatch');
  if (amountMismatch.length > 0) {
    recommendations.push(`${amountMismatch.length} amount mismatches detected - review for potential partial payments or overpayments`);
  }

  recommendations.push('Schedule weekly reconciliation review to prevent accumulation');

  return recommendations;
}

export const reconciliationAgent = {
  role: 'reconciliation' as AgentRole,
  config: getAgentConfig('reconciliation'),

  async process(
    context: AgentContext,
    input: Record<string, unknown>,
    onChunk?: (chunk: StreamingChunk) => void
  ): Promise<AgentToolResult> {
    const taskType = input.taskType as string || 'reconcile_payments';
    const handler = TASK_HANDLERS[taskType];

    onChunk?.({
      type: 'text',
      content: `Reconciliation Agent: Processing ${taskType}`,
      agentRole: 'reconciliation',
      timestamp: new Date(),
    });

    if (handler) {
      return handler(context, input);
    }

    return { success: false, error: `Unknown reconciliation task: ${taskType}` };
  },

  async handleHandoff(
    from: AgentRole,
    context: AgentContext,
    data: Record<string, unknown>
  ): Promise<AgentToolResult> {
    if (from === 'payment' && data.action === 'auto_reconcile') {
      return this.process(context, {
        taskType: 'reconcile_payments',
        source: 'automatic',
      });
    }

    if (from === 'audit' && data.action === 'reconciliation_check') {
      return this.process(context, {
        taskType: 'get_reconciliation_status',
      });
    }

    return {
      success: true,
      data: {
        message: `Reconciliation Agent received handoff from ${from}`,
        action: data.action,
      },
    };
  },

  async autoMatchPayments(
    context: AgentContext
  ): Promise<AgentToolResult> {
    const unmatchedPayments = await db.query.payments.findMany({
      where: and(
        eq(payments.tenantId, context.tenantId),
        eq(payments.status, 'completed'),
        eq(payments.reconciliationStatus, 'pending')
      ),
    });

    let matched = 0;
    let unmatched = 0;

    for (const payment of unmatchedPayments) {
      if (payment.referenceNumber) {
        const invoice = await db.query.invoices.findFirst({
          where: and(
            eq(invoices.tenantId, context.tenantId),
            eq(invoices.invoiceNumber, payment.referenceNumber)
          ),
        });

        if (invoice && parseFloat(invoice.amountDue) > 0) {
          const amount = parseFloat(payment.amount);
          const due = parseFloat(invoice.amountDue);

          if (Math.abs(amount - due) < 0.01) {
            await this.process(context, {
              taskType: 'match_payment_to_invoice',
              paymentId: payment.id,
              invoiceId: invoice.id,
              amount,
            });
            matched++;
            continue;
          }
        }
      }

      unmatched++;
    }

    return {
      success: true,
      data: {
        totalProcessed: unmatchedPayments.length,
        matched,
        unmatched,
        matchRate: unmatchedPayments.length > 0
          ? (matched / unmatchedPayments.length) * 100
          : 100,
      },
    };
  },
};
