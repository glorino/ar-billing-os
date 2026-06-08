import { z } from 'zod';
import { db } from '@/lib/db';
import { invoices, invoiceItems, customers, subscriptions, subscriptionItems, taxRates, taxRules, taxExemptions, payments } from '@/lib/db/schema';
import { eq, and, desc, asc, sql, gte, lte, count } from 'drizzle-orm';
import { AgentContext, AgentToolResult } from '../types';

export const generateInvoiceInputSchema = z.object({
  customerId: z.string().uuid(),
  subscriptionId: z.string().uuid().optional(),
  lineItems: z.array(z.object({
    description: z.string(),
    lineItemType: z.enum(['subscription', 'usage', 'one_time', 'fee', 'discount', 'tax', 'credit']),
    quantity: z.number().positive(),
    unitPrice: z.number().min(0),
    taxRateId: z.string().uuid().optional(),
    discountType: z.enum(['percentage', 'fixed_amount']).optional(),
    discountValue: z.number().min(0).optional(),
    periodStart: z.string().datetime().optional(),
    periodEnd: z.string().datetime().optional(),
  })),
  notes: z.string().optional(),
  terms: z.string().optional(),
  memo: z.string().optional(),
  issueDate: z.string().datetime().optional(),
  paymentTermsDays: z.number().int().min(1).max(365).optional(),
});

export const validateInvoiceInputSchema = z.object({
  invoiceId: z.string().uuid(),
  strict: z.boolean().optional().default(true),
});

export const optimizeTimingInputSchema = z.object({
  customerId: z.string().uuid(),
  proposedAmount: z.number().positive(),
  proposedDueDate: z.string().datetime(),
});

export async function generateInvoice(
  context: AgentContext,
  input: z.infer<typeof generateInvoiceInputSchema>
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

    const tenant = await db.query.tenants.findFirst({
      where: eq(sql`id`, context.tenantId),
    });

    const prefix = tenant?.settings?.invoicePrefix || 'INV';
    const lastInvoice = await db.query.invoices.findFirst({
      where: eq(invoices.tenantId, context.tenantId),
      orderBy: [desc(invoices.createdAt)],
    });

    const nextNumber = lastInvoice
      ? parseInt(lastInvoice.invoiceNumber.replace(`${prefix}-`, '')) + 1
      : 1;
    const invoiceNumber = `${prefix}-${String(nextNumber).padStart(6, '0')}`;

    const issueDate = input.issueDate ? new Date(input.issueDate) : new Date();
    const paymentTerms = input.paymentTermsDays || customer.paymentTermsDays || 30;
    const dueDate = new Date(issueDate);
    dueDate.setDate(dueDate.getDate() + paymentTerms);

    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    const processedItems = await Promise.all(
      input.lineItems.map(async (item, index) => {
        let amount = item.quantity * item.unitPrice;
        let discountAmount = 0;
        let taxAmount = 0;

        if (item.discountType && item.discountValue) {
          discountAmount = item.discountType === 'percentage'
            ? amount * (item.discountValue / 100)
            : Math.min(item.discountValue, amount);
          amount -= discountAmount;
        }

        if (item.taxRateId) {
          const taxRate = await db.query.taxRates.findFirst({
            where: and(
              eq(taxRates.id, item.taxRateId),
              eq(taxRates.tenantId, context.tenantId),
              eq(taxRates.isActive, true)
            ),
          });

          if (taxRate) {
            const hasExemption = await db.query.taxExemptions.findFirst({
              where: and(
                eq(taxExemptions.customerId, input.customerId),
                eq(taxExemptions.tenantId, context.tenantId),
                eq(taxExemptions.isActive, true),
                lte(taxExemptions.validFrom, new Date()),
                gte(taxExemptions.validTo, new Date())
              ),
            });

            if (!hasExemption) {
              taxAmount = taxRate.type === 'percentage'
                ? amount * (parseFloat(taxRate.rate) / 100)
                : parseFloat(taxRate.rate);
            }
          }
        }

        subtotal += amount;
        totalTax += taxAmount;
        totalDiscount += discountAmount;

        return {
          tenantId: context.tenantId,
          lineItemType: item.lineItemType,
          description: item.description,
          quantity: String(item.quantity),
          unitPrice: String(item.unitPrice),
          amount: String(amount),
          discountType: item.discountType || null,
          discountValue: item.discountValue ? String(item.discountValue) : null,
          discountAmount: String(discountAmount),
          taxRate: item.taxRateId ? String(totalTax / (subtotal || 1) * 100) : '0',
          taxAmount: String(taxAmount),
          periodStart: item.periodStart ? new Date(item.periodStart) : null,
          periodEnd: item.periodEnd ? new Date(item.periodEnd) : null,
          sortOrder: index,
        };
      })
    );

    const total = subtotal + totalTax;

    const [invoice] = await db.insert(invoices).values({
      tenantId: context.tenantId,
      customerId: input.customerId,
      invoiceNumber,
      status: 'draft',
      currency: customer.currency || 'USD',
      subtotal: String(subtotal),
      taxAmount: String(totalTax),
      discountAmount: String(totalDiscount),
      total: String(total),
      amountPaid: '0',
      amountDue: String(total),
      issueDate,
      dueDate,
      notes: input.notes,
      terms: input.terms,
      memo: input.memo,
      billingAddress: {
        line1: customer.billingAddressLine1 || undefined,
        line2: customer.billingAddressLine2 || undefined,
        city: customer.billingCity || undefined,
        state: customer.billingState || undefined,
        postalCode: customer.billingPostalCode || undefined,
        country: customer.billingCountry || undefined,
      },
    }).returning();

    await db.insert(invoiceItems).values(
      processedItems.map(item => ({
        ...item,
        invoiceId: invoice.id,
      }))
    );

    return {
      success: true,
      data: {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        total: invoice.total,
        dueDate: invoice.dueDate,
        status: invoice.status,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate invoice',
    };
  }
}

export async function validateInvoice(
  context: AgentContext,
  input: z.infer<typeof validateInvoiceInputSchema>
): Promise<AgentToolResult> {
  try {
    const invoice = await db.query.invoices.findFirst({
      where: and(
        eq(invoices.id, input.invoiceId),
        eq(invoices.tenantId, context.tenantId)
      ),
    });

    if (!invoice) {
      return { success: false, error: 'Invoice not found' };
    }

    const items = await db.query.invoiceItems.findMany({
      where: eq(invoiceItems.invoiceId, invoice.id),
      orderBy: [asc(invoiceItems.sortOrder)],
    });

    const validationErrors: string[] = [];
    const warnings: string[] = [];

    let calculatedSubtotal = 0;
    let calculatedTax = 0;
    let calculatedDiscount = 0;

    for (const item of items) {
      const itemAmount = parseFloat(item.amount);
      const itemQuantity = parseFloat(item.quantity);
      const itemUnitPrice = parseFloat(item.unitPrice);
      const expectedAmount = itemQuantity * itemUnitPrice;

      if (Math.abs(itemAmount - expectedAmount) > 0.01) {
        validationErrors.push(
          `Item "${item.description}": Amount ${itemAmount} doesn't match quantity * unitPrice (${expectedAmount})`
        );
      }

      calculatedSubtotal += itemAmount - parseFloat(item.discountAmount || '0');
      calculatedTax += parseFloat(item.taxAmount || '0');
      calculatedDiscount += parseFloat(item.discountAmount || '0');

      if (!item.description || item.description.trim().length === 0) {
        validationErrors.push(`Item "${item.id}": Missing description`);
      }

      if (itemQuantity <= 0) {
        validationErrors.push(`Item "${item.description}": Invalid quantity (${itemQuantity})`);
      }

      if (itemUnitPrice < 0) {
        validationErrors.push(`Item "${item.description}": Negative unit price`);
      }
    }

    const invoiceSubtotal = parseFloat(invoice.subtotal);
    const invoiceTax = parseFloat(invoice.taxAmount);
    const invoiceDiscount = parseFloat(invoice.discountAmount);
    const invoiceTotal = parseFloat(invoice.total);

    if (Math.abs(calculatedSubtotal - invoiceSubtotal) > 0.01) {
      validationErrors.push(
        `Subtotal mismatch: Calculated ${calculatedSubtotal} vs Invoice ${invoiceSubtotal}`
      );
    }

    if (Math.abs(calculatedTax - invoiceTax) > 0.01) {
      validationErrors.push(
        `Tax mismatch: Calculated ${calculatedTax} vs Invoice ${invoiceTax}`
      );
    }

    if (Math.abs(calculatedDiscount - invoiceDiscount) > 0.01) {
      validationErrors.push(
        `Discount mismatch: Calculated ${calculatedDiscount} vs Invoice ${invoiceDiscount}`
      );
    }

    const expectedTotal = invoiceSubtotal + invoiceTax;
    if (Math.abs(expectedTotal - invoiceTotal) > 0.01) {
      validationErrors.push(
        `Total mismatch: Expected ${expectedTotal} vs Invoice ${invoiceTotal}`
      );
    }

    if (!invoice.customerId) {
      validationErrors.push('Missing customer reference');
    }

    if (!invoice.issueDate || !invoice.dueDate) {
      validationErrors.push('Missing issue date or due date');
    }

    if (invoice.dueDate && invoice.issueDate && invoice.dueDate < invoice.issueDate) {
      validationErrors.push('Due date is before issue date');
    }

    if (items.length === 0) {
      warnings.push('Invoice has no line items');
    }

    return {
      success: true,
      data: {
        invoiceId: invoice.id,
        isValid: validationErrors.length === 0,
        errors: validationErrors,
        warnings,
        calculatedSubtotal,
        calculatedTax,
        calculatedDiscount,
        calculatedTotal: calculatedSubtotal + calculatedTax,
        itemCount: items.length,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to validate invoice',
    };
  }
}

export async function optimizeInvoiceTiming(
  context: AgentContext,
  input: z.infer<typeof optimizeTimingInputSchema>
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

    const paymentHistory = await db.query.payments.findMany({
      where: and(
        eq(payments.customerId, input.customerId),
        eq(payments.tenantId, context.tenantId)
      ),
      orderBy: [desc(payments.receivedAt)],
      limit: 50,
    });

    const avgPaymentDays = paymentHistory.length > 0
      ? paymentHistory.reduce((sum, p) => {
          const received = p.receivedAt ? new Date(p.receivedAt).getTime() : Date.now();
          const created = new Date(p.createdAt).getTime();
          return sum + (received - created) / (1000 * 60 * 60 * 24);
        }, 0) / paymentHistory.length
      : customer.paymentTermsDays || 30;

    const proposedDueDate = new Date(input.proposedDueDate);
    const dayOfWeek = proposedDueDate.getDay();

    let suggestedDueDate = new Date(proposedDueDate);
    if (dayOfWeek === 0) {
      suggestedDueDate.setDate(suggestedDueDate.getDate() + 1);
    } else if (dayOfWeek === 6) {
      suggestedDueDate.setDate(suggestedDueDate.getDate() + 2);
    }

    const month = suggestedDueDate.getMonth();
    if (suggestedDueDate.getDate() > 28) {
      suggestedDueDate.setDate(28);
    }

    const suggestedPaymentTerms = Math.ceil(
      (suggestedDueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return {
      success: true,
      data: {
        customerId: input.customerId,
        averagePaymentDays: Math.round(avgPaymentDays),
        suggestedDueDate: suggestedDueDate.toISOString(),
        suggestedPaymentTerms,
        adjustments: {
          weekendAdjusted: dayOfWeek === 0 || dayOfWeek === 6,
          monthEndAdjusted: proposedDueDate.getDate() > 28,
        },
        customerHistory: {
          totalPayments: paymentHistory.length,
          averageDaysToPay: Math.round(avgPaymentDays),
          onTimePaymentRate: paymentHistory.filter(p => {
            const received = p.receivedAt ? new Date(p.receivedAt) : new Date();
            const created = new Date(p.createdAt);
            const days = (received.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
            return days <= (customer.paymentTermsDays || 30);
          }).length / (paymentHistory.length || 1),
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to optimize invoice timing',
    };
  }
}

export const invoiceTools = {
  generateInvoice: {
    name: 'generate_invoice',
    description: 'Generate a new invoice for a customer with line items, taxes, and discounts',
    inputSchema: generateInvoiceInputSchema,
    handler: generateInvoice,
  },
  validateInvoice: {
    name: 'validate_invoice',
    description: 'Validate an existing invoice for accuracy and completeness',
    inputSchema: validateInvoiceInputSchema,
    handler: validateInvoice,
  },
  optimizeTiming: {
    name: 'optimize_invoice_timing',
    description: 'Suggest optimal invoice timing based on customer payment history',
    inputSchema: optimizeTimingInputSchema,
    handler: optimizeInvoiceTiming,
  },
};
