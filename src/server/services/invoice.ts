import { db } from '@/lib/db';
import {
  invoices,
  invoiceItems,
  customers,
  type Invoice,
  type NewInvoice,
  type InvoiceItem,
  type NewInvoiceItem,
  invoiceStatusEnum,
  currencyEnum,
} from '@/lib/db/schema';
import { eq, and, desc, sql, gte, lte, inArray } from 'drizzle-orm';
import { addDays } from 'date-fns';

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface CreateInvoiceInput {
  customerId: string;
  invoiceNumber: string;
  currency?: string;
  issueDate: Date;
  dueDate: Date;
  notes?: string;
  terms?: string;
  memo?: string;
  items?: Omit<NewInvoiceItem, 'id' | 'tenantId' | 'invoiceId' | 'createdAt' | 'updatedAt'>[];
  metadata?: Record<string, unknown>;
}

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['pending', 'cancelled'],
  pending: ['sent', 'cancelled'],
  sent: ['viewed', 'paid', 'partial', 'overdue', 'cancelled'],
  viewed: ['paid', 'partial', 'overdue', 'cancelled'],
  partial: ['paid', 'overdue', 'cancelled'],
  overdue: ['paid', 'partial', 'cancelled', 'written_off'],
  paid: [],
  cancelled: [],
  written_off: [],
};

export class InvoiceService {
  static async create(tenantId: string, input: CreateInvoiceInput): Promise<Invoice> {
    const customer = await db.query.customers.findFirst({
      where: and(
        eq(customers.tenantId, tenantId),
        eq(customers.id, input.customerId),
      ),
    });
    if (!customer) {
      throw new AppError('Customer not found', 'CUSTOMER_NOT_FOUND', 404);
    }

    const existing = await db.query.invoices.findFirst({
      where: and(
        eq(invoices.tenantId, tenantId),
        eq(invoices.invoiceNumber, input.invoiceNumber),
      ),
    });
    if (existing) {
      throw new AppError(
        'Invoice number already exists',
        'INVOICE_NUMBER_EXISTS',
        409,
      );
    }

    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;

    const lineItems = (input.items ?? []).map((item, index) => {
      const itemAmount = Number(item.quantity) * Number(item.unitPrice);
      let itemDiscount = 0;
      if (item.discountType && item.discountValue) {
        itemDiscount =
          item.discountType === 'percentage'
            ? itemAmount * (Number(item.discountValue) / 100)
            : Number(item.discountValue);
      }
      const itemTax = (itemAmount - itemDiscount) * (Number(item.taxRate ?? 0) / 100);
      subtotal += itemAmount;
      discountAmount += itemDiscount;
      taxAmount += itemTax;

      return {
        ...item,
        tenantId,
        invoiceId: '', // placeholder, set after insert
        amount: String(itemAmount - itemDiscount),
        discountAmount: String(itemDiscount),
        taxAmount: String(itemTax),
        sortOrder: index,
      };
    });

    const total = subtotal - discountAmount + taxAmount;

    const [created] = await db
      .insert(invoices)
      .values({
        tenantId,
        customerId: input.customerId,
        invoiceNumber: input.invoiceNumber,
        currency: (input.currency ?? 'USD') as typeof currencyEnum.enumValues[number],
        subtotal: String(subtotal),
        taxAmount: String(taxAmount),
        discountAmount: String(discountAmount),
        total: String(total),
        amountPaid: '0',
        amountDue: String(total),
        issueDate: input.issueDate,
        dueDate: input.dueDate,
        notes: input.notes,
        terms: input.terms,
        memo: input.memo,
        metadata: input.metadata,
        status: 'draft',
      })
      .returning();

    if (lineItems.length > 0) {
      const itemsWithInvoiceId = lineItems.map((item) => ({
        ...item,
        invoiceId: created.id,
      }));
      await db.insert(invoiceItems).values(itemsWithInvoiceId);
    }

    return created;
  }

  static async getById(tenantId: string, invoiceId: string): Promise<Invoice> {
    const invoice = await db.query.invoices.findFirst({
      where: and(
        eq(invoices.tenantId, tenantId),
        eq(invoices.id, invoiceId),
      ),
    });
    if (!invoice) {
      throw new AppError('Invoice not found', 'INVOICE_NOT_FOUND', 404);
    }
    return invoice;
  }

  static async getWithItems(
    tenantId: string,
    invoiceId: string,
  ): Promise<{ invoice: Invoice; items: InvoiceItem[] }> {
    const invoice = await this.getById(tenantId, invoiceId);
    const items = await db.query.invoiceItems.findMany({
      where: and(
        eq(invoiceItems.tenantId, tenantId),
        eq(invoiceItems.invoiceId, invoiceId),
      ),
      orderBy: asc(invoiceItems.sortOrder),
    });
    return { invoice, items };
  }

  static async list(
    tenantId: string,
    params: PaginationParams & {
      customerId?: string;
      status?: Invoice['status'];
      from?: Date;
      to?: Date;
    } = {},
  ): Promise<PaginatedResult<Invoice>> {
    const { limit = 20, offset = 0, customerId, status, from, to } = params;
    const conditions = [eq(invoices.tenantId, tenantId)];
    if (customerId) conditions.push(eq(invoices.customerId, customerId));
    if (status) conditions.push(eq(invoices.status, status));
    if (from) conditions.push(gte(invoices.issueDate, from));
    if (to) conditions.push(lte(invoices.issueDate, to));

    const where = and(...conditions);

    const [countResult, data] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(invoices)
        .where(where),
      db
        .select()
        .from(invoices)
        .where(where)
        .orderBy(desc(invoices.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    const total = countResult[0]?.count ?? 0;
    return {
      data,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  static async update(
    tenantId: string,
    invoiceId: string,
    data: Partial<Omit<NewInvoice, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Invoice> {
    const existing = await this.getById(tenantId, invoiceId);
    if (existing.status !== 'draft') {
      throw new AppError(
        'Only draft invoices can be edited',
        'INVOICE_NOT_EDITABLE',
        400,
      );
    }

    const [updated] = await db
      .update(invoices)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(eq(invoices.tenantId, tenantId), eq(invoices.id, invoiceId)),
      )
      .returning();
    return updated;
  }

  static async updateStatus(
    tenantId: string,
    invoiceId: string,
    newStatus: Invoice['status'],
  ): Promise<Invoice> {
    const existing = await this.getById(tenantId, invoiceId);
    const allowed = VALID_STATUS_TRANSITIONS[existing.status] ?? [];
    if (!allowed.includes(newStatus)) {
      throw new AppError(
        `Cannot transition from ${existing.status} to ${newStatus}`,
        'INVALID_STATUS_TRANSITION',
        400,
      );
    }

    const updates: Record<string, unknown> = { status: newStatus, updatedAt: new Date() };
    if (newStatus === 'paid') {
      updates.paidAt = new Date();
      updates.amountPaid = existing.total;
      updates.amountDue = '0';
    } else if (newStatus === 'cancelled') {
      updates.voidedAt = new Date();
    }

    const [updated] = await db
      .update(invoices)
      .set(updates)
      .where(
        and(eq(invoices.tenantId, tenantId), eq(invoices.id, invoiceId)),
      )
      .returning();
    return updated;
  }

  static async delete(tenantId: string, invoiceId: string): Promise<void> {
    const existing = await this.getById(tenantId, invoiceId);
    if (existing.status !== 'draft') {
      throw new AppError(
        'Only draft invoices can be deleted',
        'INVOICE_NOT_DELETABLE',
        400,
      );
    }
    await db
      .delete(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoiceId));
    await db
      .delete(invoices)
      .where(
        and(eq(invoices.tenantId, tenantId), eq(invoices.id, invoiceId)),
      );
  }

  static async addLineItem(
    tenantId: string,
    invoiceId: string,
    item: Omit<NewInvoiceItem, 'id' | 'tenantId' | 'invoiceId' | 'createdAt' | 'updatedAt'>,
  ): Promise<InvoiceItem> {
    const existing = await this.getById(tenantId, invoiceId);
    if (existing.status !== 'draft') {
      throw new AppError(
        'Only draft invoices can have items added',
        'INVOICE_NOT_EDITABLE',
        400,
      );
    }

    const amount = Number(item.quantity) * Number(item.unitPrice);
    const [created] = await db
      .insert(invoiceItems)
      .values({ ...item, tenantId, invoiceId, amount: String(amount) })
      .returning();

    await this.recalculateTotals(tenantId, invoiceId);
    return created;
  }

  static async removeLineItem(
    tenantId: string,
    invoiceId: string,
    itemId: string,
  ): Promise<void> {
    const existing = await this.getById(tenantId, invoiceId);
    if (existing.status !== 'draft') {
      throw new AppError(
        'Only draft invoices can have items removed',
        'INVOICE_NOT_EDITABLE',
        400,
      );
    }
    await db
      .delete(invoiceItems)
      .where(
        and(
          eq(invoiceItems.tenantId, tenantId),
          eq(invoiceItems.invoiceId, invoiceId),
          eq(invoiceItems.id, itemId),
        ),
      );
    await this.recalculateTotals(tenantId, invoiceId);
  }

  static async recalculateTotals(
    tenantId: string,
    invoiceId: string,
  ): Promise<Invoice> {
    const items = await db.query.invoiceItems.findMany({
      where: and(
        eq(invoiceItems.tenantId, tenantId),
        eq(invoiceItems.invoiceId, invoiceId),
      ),
    });

    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;

    for (const item of items) {
      subtotal += Number(item.amount);
      taxAmount += Number(item.taxAmount ?? 0);
      discountAmount += Number(item.discountAmount ?? 0);
    }

    const total = subtotal - discountAmount + taxAmount;
    const existing = await this.getById(tenantId, invoiceId);
    const amountPaid = Number(existing.amountPaid);
    const amountDue = total - amountPaid;

    const [updated] = await db
      .update(invoices)
      .set({
        subtotal: String(subtotal),
        taxAmount: String(taxAmount),
        discountAmount: String(discountAmount),
        total: String(total),
        amountDue: String(amountDue),
        updatedAt: new Date(),
      })
      .where(
        and(eq(invoices.tenantId, tenantId), eq(invoices.id, invoiceId)),
      )
      .returning();
    return updated;
  }

  static async getOverdue(tenantId: string): Promise<Invoice[]> {
    return db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          eq(invoices.status, 'overdue'),
        ),
      )
      .orderBy(asc(invoices.dueDate));
  }

  static async bulkUpdateStatus(
    tenantId: string,
    invoiceIds: string[],
    status: Invoice['status'],
  ): Promise<number> {
    if (invoiceIds.length === 0) return 0;
    const result = await db
      .update(invoices)
      .set({ status, updatedAt: new Date() })
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          inArray(invoices.id, invoiceIds),
        ),
      );
    return invoiceIds.length;
  }

  static async triggerPdfGeneration(
    tenantId: string,
    invoiceId: string,
  ): Promise<{ invoiceId: string; pdfUrl: string }> {
    await this.getById(tenantId, invoiceId);
    const pdfUrl = `/api/invoices/${invoiceId}/pdf`;
    return { invoiceId, pdfUrl };
  }
}

function asc(column: { getSQL: () => any }) {
  return sql`${column} asc`;
}
