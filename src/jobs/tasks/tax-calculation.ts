import { task } from "@trigger.dev/sdk";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  invoices,
  invoiceItems,
  taxRates,
  taxRules,
  taxExemptions,
} from "@/lib/db/schema";

interface BatchCalculateTaxPayload {
  tenantId: string;
  invoiceIds?: string[];
}

interface CalculateInvoiceTaxPayload {
  tenantId: string;
  invoiceId: string;
}

async function getEffectiveTaxRate(
  tenantId: string,
  customerId: string,
  lineItemType: string,
): Promise<{ rate: number; taxRateId: string | null }> {
  // Check for customer tax exemption
  const exemption = await db.query.taxExemptions.findFirst({
    where: and(
      eq(taxExemptions.tenantId, tenantId),
      eq(taxExemptions.customerId, customerId),
      eq(taxExemptions.isActive, true),
      sql`NOW() >= ${taxExemptions.validFrom}`,
      sql`(${taxExemptions.validTo} IS NULL OR NOW() <= ${taxExemptions.validTo})`,
    ),
  });

  if (exemption) {
    return { rate: 0, taxRateId: null };
  }

  // Find applicable tax rule
  const rule = await db.query.taxRules.findFirst({
    where: and(
      eq(taxRules.tenantId, tenantId),
      eq(taxRules.isActive, true),
    ),
    orderBy: (taxRules, { desc }) => [desc(taxRules.priority)],
  });

  if (!rule) {
    return { rate: 0, taxRateId: null };
  }

  const taxRate = await db.query.taxRates.findFirst({
    where: and(
      eq(taxRates.id, rule.taxRateId),
      eq(taxRates.isActive, true),
      sql`NOW() >= ${taxRates.validFrom}`,
      sql`(${taxRates.validTo} IS NULL OR NOW() <= ${taxRates.validTo})`,
    ),
  });

  if (!taxRate) {
    return { rate: 0, taxRateId: null };
  }

  return {
    rate: parseFloat(taxRate.rate),
    taxRateId: taxRate.id,
  };
}

export default task({
  id: "batch-calculate-tax",
  maxDuration: 300,
  retry: { maxAttempts: 3 },
  run: async (payload: BatchCalculateTaxPayload, { ctx }) => {
    const { tenantId, invoiceIds } = payload;

    let targetInvoices;
    if (invoiceIds && invoiceIds.length > 0) {
      targetInvoices = await Promise.all(
        invoiceIds.map((id) =>
          db.query.invoices.findFirst({
            where: and(
              eq(invoices.tenantId, tenantId),
              eq(invoices.id, id),
            ),
          }),
        ),
      );
      targetInvoices = targetInvoices.filter(Boolean);
    } else {
      targetInvoices = await db.query.invoices.findMany({
        where: and(
          eq(invoices.tenantId, tenantId),
          sql`${invoices.status} IN ('draft', 'pending')`,
        ),
      });
    }

    const results = {
      total: targetInvoices.length,
      calculated: 0,
      skipped: 0,
      totalTax: 0,
      invoices: [] as Array<{
        invoiceId: string;
        invoiceNumber: string;
        subtotal: string;
        taxAmount: string;
        total: string;
      }>,
    };

    for (const invoice of targetInvoices) {
      if (!invoice) {
        results.skipped++;
        continue;
      }

      const items = await db.query.invoiceItems.findMany({
        where: eq(invoiceItems.invoiceId, invoice.id),
      });

      let invoiceTaxTotal = 0;

      for (const item of items) {
        const { rate, taxRateId } = await getEffectiveTaxRate(
          tenantId,
          invoice.customerId,
          item.lineItemType,
        );

        const itemAmount = parseFloat(item.amount);
        const itemTax = (itemAmount * rate) / 100;
        invoiceTaxTotal += itemTax;

        await db
          .update(invoiceItems)
          .set({
            taxRate: String(rate),
            taxAmount: String(itemTax),
            updatedAt: new Date(),
          })
          .where(eq(invoiceItems.id, item.id));
      }

      const subtotal = items.reduce(
        (sum, item) => sum + parseFloat(item.amount),
        0,
      );
      const newTotal = subtotal + invoiceTaxTotal;

      await db
        .update(invoices)
        .set({
          subtotal: String(subtotal),
          taxAmount: String(invoiceTaxTotal),
          total: String(newTotal),
          amountDue: String(newTotal - parseFloat(invoice.amountPaid)),
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, invoice.id));

      results.calculated++;
      results.totalTax += invoiceTaxTotal;
      results.invoices.push({
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        subtotal: String(subtotal),
        taxAmount: String(invoiceTaxTotal),
        total: String(newTotal),
      });
    }

    return {
      ...results,
      totalTax: String(results.totalTax),
    };
  },
});

export const calculateInvoiceTax = task({
  id: "calculate-invoice-tax",
  maxDuration: 60,
  retry: { maxAttempts: 3 },
  run: async (payload: CalculateInvoiceTaxPayload, { ctx }) => {
    const { tenantId, invoiceId } = payload;

    const invoice = await db.query.invoices.findFirst({
      where: and(
        eq(invoices.tenantId, tenantId),
        eq(invoices.id, invoiceId),
      ),
    });

    if (!invoice) {
      throw new Error(`Invoice ${invoiceId} not found`);
    }

    const items = await db.query.invoiceItems.findMany({
      where: eq(invoiceItems.invoiceId, invoiceId),
    });

    let totalTax = 0;

    for (const item of items) {
      const { rate } = await getEffectiveTaxRate(
        tenantId,
        invoice.customerId,
        item.lineItemType,
      );

      const itemAmount = parseFloat(item.amount);
      const itemTax = (itemAmount * rate) / 100;
      totalTax += itemTax;

      await db
        .update(invoiceItems)
        .set({
          taxRate: String(rate),
          taxAmount: String(itemTax),
          updatedAt: new Date(),
        })
        .where(eq(invoiceItems.id, item.id));
    }

    const subtotal = items.reduce(
      (sum, item) => sum + parseFloat(item.amount),
      0,
    );
    const newTotal = subtotal + totalTax;

    await db
      .update(invoices)
      .set({
        subtotal: String(subtotal),
        taxAmount: String(totalTax),
        total: String(newTotal),
        amountDue: String(newTotal - parseFloat(invoice.amountPaid)),
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoiceId));

    return {
      invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      subtotal: String(subtotal),
      taxAmount: String(totalTax),
      total: String(newTotal),
    };
  },
});
