import { task } from "@trigger.dev/sdk";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  payments,
  reconciliationBatches,
  reconciliationItems,
  invoices,
} from "@/lib/db/schema";

interface ReconcileBatchPayload {
  tenantId: string;
  batchId: string;
}

interface AutoReconcilePayload {
  tenantId: string;
  statementDate: string;
}

export default task({
  id: "reconcile-batch",
  maxDuration: 600,
  retry: { maxAttempts: 3 },
  run: async (payload: ReconcileBatchPayload, { ctx }) => {
    const { tenantId, batchId } = payload;

    const batch = await db.query.reconciliationBatches.findFirst({
      where: and(
        eq(reconciliationBatches.tenantId, tenantId),
        eq(reconciliationBatches.id, batchId),
      ),
      with: { items: true },
    });

    if (!batch) {
      throw new Error(`Reconciliation batch ${batchId} not found`);
    }

    let matchedCount = 0;
    let unmatchedCount = 0;
    let matchedAmount = 0;
    let unmatchedAmount = 0;

    for (const item of batch.items) {
      let matchedPaymentId: string | null = null;
      let difference = 0;

      // Match by reference number first
      if (item.transactionReference) {
        const refPayment = await db.query.payments.findFirst({
          where: and(
            eq(payments.tenantId, tenantId),
            eq(payments.referenceNumber, item.transactionReference),
            eq(payments.status, "completed"),
          ),
        });
        if (refPayment) {
          matchedPaymentId = refPayment.id;
          difference = Math.abs(
            parseFloat(item.transactionAmount) - parseFloat(refPayment.amount),
          );
        }
      }

      // If no reference match, try exact amount match
      if (!matchedPaymentId) {
        const amountMatch = await db.query.payments.findFirst({
          where: and(
            eq(payments.tenantId, tenantId),
            eq(payments.status, "completed"),
            sql`CAST(${payments.amount} AS DECIMAL(19,4)) = CAST(${item.transactionAmount} AS DECIMAL(19,4))`,
            sql`${payments.id} NOT IN (SELECT payment_id FROM reconciliation_items WHERE payment_id IS NOT NULL AND batch_id != ${batchId})`,
          ),
        });
        if (amountMatch) {
          matchedPaymentId = amountMatch.id;
          difference = 0;
        }
      }

      const status = matchedPaymentId ? "matched" : "unmatched";
      const paymentAmount = matchedPaymentId
        ? (await db.query.payments.findFirst({ where: eq(payments.id, matchedPaymentId) }))?.amount ?? null
        : null;

      await db
        .update(reconciliationItems)
        .set({
          paymentId: matchedPaymentId,
          status,
          paymentAmount,
          difference: String(difference),
          updatedAt: new Date(),
        })
        .where(eq(reconciliationItems.id, item.id));

      if (matchedPaymentId) {
        matchedCount++;
        matchedAmount += parseFloat(item.transactionAmount);
      } else {
        unmatchedCount++;
        unmatchedAmount += parseFloat(item.transactionAmount);
      }
    }

    const batchStatus =
      unmatchedCount === 0
        ? "matched"
        : matchedCount === 0
          ? "unmatched"
          : "partial";

    await db
      .update(reconciliationBatches)
      .set({
        status: batchStatus,
        matchedCount,
        unmatchedCount,
        matchedAmount: String(matchedAmount),
        unmatchedAmount: String(unmatchedAmount),
        updatedAt: new Date(),
      })
      .where(eq(reconciliationBatches.id, batchId));

    return {
      batchId,
      status: batchStatus,
      matchedCount,
      unmatchedCount,
      matchedAmount: String(matchedAmount),
      unmatchedAmount: String(unmatchedAmount),
    };
  },
});

export const autoReconcile = task({
  id: "auto-reconcile",
  maxDuration: 300,
  retry: { maxAttempts: 2 },
  run: async (payload: AutoReconcilePayload, { ctx }) => {
    const { tenantId, statementDate } = payload;

    const completedPayments = await db.query.payments.findMany({
      where: and(
        eq(payments.tenantId, tenantId),
        eq(payments.status, "completed"),
        eq(payments.reconciliationStatus, "pending"),
      ),
    });

    const results = {
      total: completedPayments.length,
      matched: 0,
      flagged: 0,
      discrepancies: [] as { paymentId: string; invoiceId: string; difference: number }[],
    };

    for (const payment of completedPayments) {
      const paymentLineItems = await db.query.paymentLineItems.findMany({
        where: eq(payments.id, payment.id),
      });

      for (const lineItem of paymentLineItems) {
        const invoice = await db.query.invoices.findFirst({
          where: eq(invoices.id, lineItem.invoiceId),
        });

        if (!invoice) continue;

        const amountDifference =
          parseFloat(payment.amount) - parseFloat(invoice.amountDue);

        if (Math.abs(amountDifference) < 0.01) {
          // Exact match - auto reconcile
          await db
            .update(payments)
            .set({
              reconciliationStatus: "matched",
              reconciledAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(payments.id, payment.id));

          results.matched++;
        } else if (Math.abs(amountDifference) <= 1.0) {
          // Small difference - flag as partial
          await db
            .update(payments)
            .set({
              reconciliationStatus: "partial",
              updatedAt: new Date(),
            })
            .where(eq(payments.id, payment.id));

          results.flagged++;
          results.discrepancies.push({
            paymentId: payment.id,
            invoiceId: lineItem.invoiceId,
            difference: amountDifference,
          });
        } else {
          // Large difference - flag as unmatched
          await db
            .update(payments)
            .set({
              reconciliationStatus: "unmatched",
              updatedAt: new Date(),
            })
            .where(eq(payments.id, payment.id));

          results.flagged++;
          results.discrepancies.push({
            paymentId: payment.id,
            invoiceId: lineItem.invoiceId,
            difference: amountDifference,
          });
        }
      }
    }

    return results;
  },
});
