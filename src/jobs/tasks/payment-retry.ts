import { task } from "@trigger.dev/sdk";
import { eq, and, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  payments,
  invoices,
  customers,
} from "@/lib/db/schema";

interface RetryPaymentPayload {
  tenantId: string;
  paymentId: string;
}

interface BatchRetryPaymentsPayload {
  tenantId: string;
}

const MAX_RETRIES = 4;
const BACKOFF_INTERVALS_MS = [
  1 * 60 * 60 * 1000,     // 1 hour
  6 * 60 * 60 * 1000,     // 6 hours
  24 * 60 * 60 * 1000,    // 24 hours
  72 * 60 * 60 * 1000,    // 72 hours
];

function calculateBackoff(attempt: number): number {
  if (attempt < 1 || attempt > MAX_RETRIES) {
    return BACKOFF_INTERVALS_MS[BACKOFF_INTERVALS_MS.length - 1];
  }
  return BACKOFF_INTERVALS_MS[attempt - 1];
}

async function processPaymentRetry(payment: {
  id: string;
  tenantId: string;
  customerId: string;
  amount: string;
  paymentMethod: string;
  currency: string;
  metadata: Record<string, unknown> | null;
}): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  // In production, integrate with Stripe/payment gateway
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  // const result = await stripe.paymentIntents.create({
  //   amount: Math.round(parseFloat(payment.amount) * 100),
  //   currency: payment.currency.toLowerCase(),
  //   customer: payment.metadata?.stripeCustomerId as string,
  //   payment_method: payment.metadata?.paymentMethodId as string,
  //   off_session: true,
  //   confirm: true,
  // });

  // Simulate gateway response
  const success = Math.random() > 0.3;
  if (success) {
    return { success: true, transactionId: `txn_${Date.now()}` };
  }
  return { success: false, error: "Insufficient funds" };
}

export default task({
  id: "retry-payment",
  maxDuration: 120,
  retry: { maxAttempts: 2 },
  run: async (payload: RetryPaymentPayload, { ctx }) => {
    const { tenantId, paymentId } = payload;

    const payment = await db.query.payments.findFirst({
      where: and(
        eq(payments.tenantId, tenantId),
        eq(payments.id, paymentId),
        eq(payments.status, "failed"),
      ),
    });

    if (!payment) {
      throw new Error(`Failed payment ${paymentId} not found for tenant ${tenantId}`);
    }

    const retryCount = (payment.metadata?.retryCount as number) ?? 0;
    if (retryCount >= MAX_RETRIES) {
      await db
        .update(payments)
        .set({
          metadata: { ...payment.metadata, maxRetriesReached: true },
          updatedAt: new Date(),
        })
        .where(eq(payments.id, paymentId));
      return { success: false, reason: "Max retries exceeded" };
    }

    const backoffMs = calculateBackoff(retryCount + 1);
    const nextRetryAt = new Date(Date.now() + backoffMs);

    const result = await processPaymentRetry({
      id: payment.id,
      tenantId: payment.tenantId,
      customerId: payment.customerId,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      currency: payment.currency,
      metadata: payment.metadata,
    });

    if (result.success) {
      await db
        .update(payments)
        .set({
          status: "completed",
          transactionId: result.transactionId,
          processedAt: new Date(),
          metadata: { ...payment.metadata, retryCount: retryCount + 1, lastRetryAt: new Date().toISOString() },
          updatedAt: new Date(),
        })
        .where(eq(payments.id, paymentId));

      // Update invoice amount paid
      const paymentLineItems = await db.query.paymentLineItems.findMany({
        where: eq(payments.id, paymentId),
      });

      for (const lineItem of paymentLineItems) {
        const invoice = await db.query.invoices.findFirst({
          where: eq(invoices.id, lineItem.invoiceId),
        });
        if (invoice) {
          const newAmountPaid = parseFloat(invoice.amountPaid) + parseFloat(lineItem.amount);
          const newAmountDue = parseFloat(invoice.total) - newAmountPaid;
          await db
            .update(invoices)
            .set({
              amountPaid: String(newAmountPaid),
              amountDue: String(Math.max(0, newAmountDue)),
              status: newAmountDue <= 0 ? "paid" : invoice.status,
              paidAt: newAmountDue <= 0 ? new Date() : invoice.paidAt,
              updatedAt: new Date(),
            })
            .where(eq(invoices.id, lineItem.invoiceId));
        }
      }

      return { success: true, transactionId: result.transactionId };
    }

    // Schedule next retry
    await db
      .update(payments)
      .set({
        failureReason: result.error,
        metadata: {
          ...payment.metadata,
          retryCount: retryCount + 1,
          nextRetryAt: nextRetryAt.toISOString(),
          lastRetryAt: new Date().toISOString(),
          lastError: result.error,
        },
        updatedAt: new Date(),
      })
      .where(eq(payments.id, paymentId));

    return {
      success: false,
      nextRetryAt: nextRetryAt.toISOString(),
      attempt: retryCount + 1,
      maxRetries: MAX_RETRIES,
      error: result.error,
    };
  },
});

export const batchRetryPayments = task({
  id: "batch-retry-payments",
  maxDuration: 600,
  retry: { maxAttempts: 2 },
  run: async (payload: BatchRetryPaymentsPayload, { ctx }) => {
    const { tenantId } = payload;
    const now = new Date();

    const failedPayments = await db.query.payments.findMany({
      where: and(
        eq(payments.tenantId, tenantId),
        eq(payments.status, "failed"),
      ),
    });

    const results = {
      total: failedPayments.length,
      retried: 0,
      skipped: 0,
      succeeded: 0,
      failed: 0,
    };

    for (const payment of failedPayments) {
      const retryCount = (payment.metadata?.retryCount as number) ?? 0;
      const nextRetryAt = payment.metadata?.nextRetryAt
        ? new Date(payment.metadata.nextRetryAt as string)
        : null;

      if (retryCount >= MAX_RETRIES) {
        results.skipped++;
        continue;
      }

      if (nextRetryAt && nextRetryAt > now) {
        results.skipped++;
        continue;
      }

      results.retried++;

      try {
        const result = await processPaymentRetry({
          id: payment.id,
          tenantId: payment.tenantId,
          customerId: payment.customerId,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          currency: payment.currency,
          metadata: payment.metadata,
        });

        if (result.success) {
          results.succeeded++;
        } else {
          results.failed++;
        }
      } catch {
        results.failed++;
      }
    }

    return results;
  },
});
