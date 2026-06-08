import { task } from "@trigger.dev/sdk";
import { eq, and, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  subscriptions,
  subscriptionItems,
  invoices,
  invoiceItems,
  customers,
} from "@/lib/db/schema";

interface ProcessRenewalPayload {
  tenantId: string;
  subscriptionId: string;
}

interface BatchRenewalsPayload {
  tenantId: string;
}

function calculateNextBillingDate(
  currentEnd: Date,
  cycle: string,
  interval: number,
): Date {
  const ms = currentEnd.getTime();
  switch (cycle) {
    case "monthly":
      return new Date(ms + interval * 30 * 24 * 60 * 60 * 1000);
    case "quarterly":
      return new Date(ms + interval * 90 * 24 * 60 * 60 * 1000);
    case "semi_annual":
      return new Date(ms + interval * 180 * 24 * 60 * 60 * 1000);
    case "annual":
      return new Date(ms + interval * 365 * 24 * 60 * 60 * 1000);
    default:
      return new Date(ms + interval * 30 * 24 * 60 * 60 * 1000);
  }
}

export default task({
  id: "process-subscription-renewal",
  maxDuration: 120,
  retry: { maxAttempts: 3 },
  run: async (payload: ProcessRenewalPayload, { ctx }) => {
    const { tenantId, subscriptionId } = payload;

    const subscription = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.tenantId, tenantId),
        eq(subscriptions.id, subscriptionId),
        eq(subscriptions.status, "active"),
      ),
      with: { items: { where: eq(subscriptionItems.isActive, true) } },
    });

    if (!subscription) {
      throw new Error(`Active subscription ${subscriptionId} not found`);
    }

    const now = new Date();
    if (!subscription.currentPeriodEnd || subscription.currentPeriodEnd > now) {
      throw new Error(`Subscription ${subscriptionId} period has not ended yet`);
    }

    const customer = await db.query.customers.findFirst({
      where: eq(customers.id, subscription.customerId),
    });

    if (!customer) {
      throw new Error(`Customer ${subscription.customerId} not found`);
    }

    const prefix = "INV";
    const invoiceCount = await db.query.invoices.findMany({
      where: eq(invoices.tenantId, tenantId),
    });
    const invoiceNumber = `${prefix}-${String(invoiceCount.length + 1).padStart(6, "0")}`;

    const items = subscription.items.map((item, index) => {
      const computedDiscountAmount = item.discountType === 'percentage'
        ? String(Number(item.amount) * Number(item.discountValue ?? 0) / 100)
        : (item.discountValue ?? "0");
      return {
        tenantId,
        invoiceId: "" as string,
        lineItemType: item.lineItemType,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount,
        discountType: item.discountType,
        discountValue: item.discountValue,
        discountAmount: computedDiscountAmount,
        taxRate: item.taxRate ?? "0",
        taxAmount: "0",
        periodStart: subscription.currentPeriodStart,
        periodEnd: subscription.currentPeriodEnd,
        metadata: {},
        sortOrder: index,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    const total = subtotal;

    const [invoice] = await db
      .insert(invoices)
      .values({
        tenantId,
        customerId: customer.id,
        invoiceNumber,
        status: "pending",
        currency: subscription.currency,
        subtotal: String(subtotal),
        taxAmount: "0",
        discountAmount: "0",
        total: String(total),
        amountPaid: "0",
        amountDue: String(total),
        issueDate: now,
        dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      })
      .returning();

    await db
      .insert(invoiceItems)
      .values(items.map((item) => ({ ...item, invoiceId: invoice.id })));

    const newPeriodStart = subscription.currentPeriodEnd;
    const newPeriodEnd = calculateNextBillingDate(
      subscription.currentPeriodEnd,
      subscription.billingCycle,
      subscription.billingInterval,
    );
    const newNextBillingDate = calculateNextBillingDate(
      newPeriodEnd,
      subscription.billingCycle,
      subscription.billingInterval,
    );

    await db
      .update(subscriptions)
      .set({
        currentPeriodStart: newPeriodStart,
        currentPeriodEnd: newPeriodEnd,
        nextBillingDate: newNextBillingDate,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscriptionId));

    return {
      subscriptionId,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      total: invoice.total,
      newPeriodStart,
      newPeriodEnd,
      newNextBillingDate,
    };
  },
});

export const batchProcessRenewals = task({
  id: "batch-process-renewals",
  maxDuration: 600,
  retry: { maxAttempts: 2 },
  run: async (payload: BatchRenewalsPayload, { ctx }) => {
    const { tenantId } = payload;
    const now = new Date();

    const dueSubscriptions = await db.query.subscriptions.findMany({
      where: and(
        eq(subscriptions.tenantId, tenantId),
        eq(subscriptions.status, "active"),
        lte(subscriptions.currentPeriodEnd, now),
      ),
    });

    const results = {
      total: dueSubscriptions.length,
      renewed: 0,
      failed: 0,
      errors: [] as { subscriptionId: string; error: string }[],
    };

    for (const subscription of dueSubscriptions) {
      try {
        const newPeriodEnd = calculateNextBillingDate(
          subscription.currentPeriodEnd,
          subscription.billingCycle,
          subscription.billingInterval,
        );

        await db
          .update(subscriptions)
          .set({
            currentPeriodStart: subscription.currentPeriodEnd,
            currentPeriodEnd: newPeriodEnd,
            nextBillingDate: calculateNextBillingDate(
              newPeriodEnd,
              subscription.billingCycle,
              subscription.billingInterval,
            ),
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.id, subscription.id));

        results.renewed++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          subscriptionId: subscription.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });

        // Mark subscription as past_due on failure
        await db
          .update(subscriptions)
          .set({
            status: "past_due",
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.id, subscription.id));
      }
    }

    return results;
  },
});
