import { task } from "@trigger.dev/sdk";
import { eq, and, lte, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  subscriptions,
  subscriptionItems,
  invoices,
  invoiceItems,
  customers,
  currencyEnum,
} from "@/lib/db/schema";

interface GenerateInvoicePayload {
  tenantId: string;
  subscriptionId: string;
}

interface BulkGenerateInvoicesPayload {
  tenantId: string;
}

interface TriggerPdfPayload {
  tenantId: string;
  invoiceId: string;
}

export default task({
  id: "generate-invoice",
  maxDuration: 120,
  retry: { maxAttempts: 3 },
  run: async (payload: GenerateInvoicePayload, { ctx }) => {
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
      throw new Error(`Active subscription ${subscriptionId} not found for tenant ${tenantId}`);
    }

    const now = new Date();
    if (!subscription.nextBillingDate || subscription.nextBillingDate > now) {
      throw new Error(`Subscription ${subscriptionId} is not due for billing yet`);
    }

    const customer = await db.query.customers.findFirst({
      where: eq(customers.id, subscription.customerId),
    });

    if (!customer) {
      throw new Error(`Customer ${subscription.customerId} not found`);
    }

    const tenantSettings = await db.query.tenants.findFirst({
      where: (tenants, { eq }) => eq(tenants.id, tenantId),
    });

    const prefix = tenantSettings?.settings?.invoicePrefix ?? "INV";
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
    const taxAmount = items.reduce((sum, item) => {
      const rate = parseFloat(item.taxRate);
      return sum + (parseFloat(item.amount) * rate) / 100;
    }, 0);
    const total = subtotal + taxAmount;

    const [invoice] = await db
      .insert(invoices)
      .values({
        tenantId,
        customerId: customer.id,
        invoiceNumber,
        status: "pending",
        currency: subscription.currency as typeof currencyEnum.enumValues[number],
        subtotal: String(subtotal),
        taxAmount: String(taxAmount),
        discountAmount: "0",
        total: String(total),
        amountPaid: "0",
        amountDue: String(total),
        issueDate: now,
        dueDate: new Date(now.getTime() + (customer.paymentTermsDays ?? 30) * 24 * 60 * 60 * 1000),
        billingAddress: {
          line1: customer.billingAddressLine1 ?? undefined,
          line2: customer.billingAddressLine2 ?? undefined,
          city: customer.billingCity ?? undefined,
          state: customer.billingState ?? undefined,
          postalCode: customer.billingPostalCode ?? undefined,
          country: customer.billingCountry ?? undefined,
        },
      })
      .returning();

    const invoiceItemsWithId = items.map((item) => ({
      ...item,
      invoiceId: invoice.id,
    }));

    await db.insert(invoiceItems).values(invoiceItemsWithId);

    return {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      total: invoice.total,
      amountDue: invoice.amountDue,
    };
  },
});

export const bulkGenerateInvoices = task({
  id: "bulk-generate-invoices",
  maxDuration: 600,
  retry: { maxAttempts: 2 },
  run: async (payload: BulkGenerateInvoicesPayload, { ctx }) => {
    const { tenantId } = payload;

    const now = new Date();
    const dueSubscriptions = await db.query.subscriptions.findMany({
      where: and(
        eq(subscriptions.tenantId, tenantId),
        eq(subscriptions.status, "active"),
        lte(subscriptions.nextBillingDate, now),
      ),
    });

    const results = {
      total: dueSubscriptions.length,
      generated: 0,
      failed: 0,
      errors: [] as { subscriptionId: string; error: string }[],
    };

    for (const subscription of dueSubscriptions) {
      try {
        const invoiceCount = await db.query.invoices.findMany({
          where: eq(invoices.tenantId, tenantId),
        });

        const prefix = "INV";
        const invoiceNumber = `${prefix}-${String(invoiceCount.length + results.generated + 1).padStart(6, "0")}`;

        const subItems = await db.query.subscriptionItems.findMany({
          where: and(
            eq(subscriptionItems.subscriptionId, subscription.id),
            eq(subscriptionItems.isActive, true),
          ),
        });

        const customer = await db.query.customers.findFirst({
          where: eq(customers.id, subscription.customerId),
        });

        if (!customer) {
          throw new Error(`Customer ${subscription.customerId} not found`);
        }

        const items = subItems.map((item, index) => {
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
        const taxAmount = items.reduce((sum, item) => {
          const rate = parseFloat(item.taxRate);
          return sum + (parseFloat(item.amount) * rate) / 100;
        }, 0);
        const total = subtotal + taxAmount;

        const [invoice] = await db
          .insert(invoices)
          .values({
            tenantId,
            customerId: customer.id,
            invoiceNumber,
            status: "pending",
            currency: subscription.currency as typeof currencyEnum.enumValues[number],
            subtotal: String(subtotal),
            taxAmount: String(taxAmount),
            discountAmount: "0",
            total: String(total),
            amountPaid: "0",
            amountDue: String(total),
            issueDate: now,
            dueDate: new Date(
              now.getTime() + (customer.paymentTermsDays ?? 30) * 24 * 60 * 60 * 1000,
            ),
            billingAddress: {
              line1: customer.billingAddressLine1 ?? undefined,
              line2: customer.billingAddressLine2 ?? undefined,
              city: customer.billingCity ?? undefined,
              state: customer.billingState ?? undefined,
              postalCode: customer.billingPostalCode ?? undefined,
              country: customer.billingCountry ?? undefined,
            },
          })
          .returning();

        await db
          .insert(invoiceItems)
          .values(items.map((item) => ({ ...item, invoiceId: invoice.id })));

        results.generated++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          subscriptionId: subscription.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  },
});

export const triggerInvoicePdf = task({
  id: "trigger-invoice-pdf",
  maxDuration: 60,
  retry: { maxAttempts: 3 },
  run: async (payload: TriggerPdfPayload, { ctx }) => {
    const { tenantId, invoiceId } = payload;

    const invoice = await db.query.invoices.findFirst({
      where: and(
        eq(invoices.tenantId, tenantId),
        eq(invoices.id, invoiceId),
      ),
      with: {
        customer: true,
        items: true,
      },
    });

    if (!invoice) {
      throw new Error(`Invoice ${invoiceId} not found for tenant ${tenantId}`);
    }

    await db
      .update(invoices)
      .set({ status: "sent", updatedAt: new Date() })
      .where(eq(invoices.id, invoiceId));

    return {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      status: "sent",
    };
  },
});
