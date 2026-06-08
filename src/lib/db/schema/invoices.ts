import { pgTable, uuid, varchar, text, timestamp, boolean, decimal, integer, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants } from './tenant';
import { customers } from './customers';
import { invoiceStatusEnum, lineItemTypeEnum, discountTypeEnum, currencyEnum } from './enums';
import { paymentLineItems } from './payments';

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').notNull().references(() => customers.id, { onDelete: 'restrict' }),
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull(),
  status: invoiceStatusEnum('status').notNull().default('draft'),
  currency: currencyEnum('currency').notNull().default('USD'),
  subtotal: decimal('subtotal', { precision: 19, scale: 4 }).notNull().default('0'),
  taxAmount: decimal('tax_amount', { precision: 19, scale: 4 }).notNull().default('0'),
  discountAmount: decimal('discount_amount', { precision: 19, scale: 4 }).notNull().default('0'),
  total: decimal('total', { precision: 19, scale: 4 }).notNull().default('0'),
  amountPaid: decimal('amount_paid', { precision: 19, scale: 4 }).notNull().default('0'),
  amountDue: decimal('amount_due', { precision: 19, scale: 4 }).notNull().default('0'),
  issueDate: timestamp('issue_date', { withTimezone: true }).notNull(),
  dueDate: timestamp('due_date', { withTimezone: true }).notNull(),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  voidedAt: timestamp('voided_at', { withTimezone: true }),
  voidedReason: text('voided_reason'),
  notes: text('notes'),
  terms: text('terms'),
  memo: text('memo'),
  billingAddress: jsonb('billing_address').$type<{
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>(),
  shippingAddress: jsonb('shipping_address').$type<{
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>(),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('invoices_tenant_id_idx').on(table.tenantId),
  index('invoices_customer_id_idx').on(table.customerId),
  index('invoices_tenant_status_idx').on(table.tenantId, table.status),
  index('invoices_tenant_due_date_idx').on(table.tenantId, table.dueDate),
  index('invoices_tenant_issue_date_idx').on(table.tenantId, table.issueDate),
  index('invoices_tenant_customer_status_idx').on(table.tenantId, table.customerId, table.status),
  uniqueIndex('invoices_tenant_number_idx').on(table.tenantId, table.invoiceNumber),
  index('invoices_tenant_created_at_idx').on(table.tenantId, table.createdAt),
]);

export const invoiceItems = pgTable('invoice_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  lineItemType: lineItemTypeEnum('line_item_type').notNull(),
  description: varchar('description', { length: 500 }).notNull(),
  quantity: decimal('quantity', { precision: 19, scale: 6 }).notNull().default('1'),
  unitPrice: decimal('unit_price', { precision: 19, scale: 4 }).notNull(),
  amount: decimal('amount', { precision: 19, scale: 4 }).notNull(),
  discountType: discountTypeEnum('discount_type'),
  discountValue: decimal('discount_value', { precision: 19, scale: 4 }),
  discountAmount: decimal('discount_amount', { precision: 19, scale: 4 }).default('0'),
  taxRate: decimal('tax_rate', { precision: 8, scale: 4 }).default('0'),
  taxAmount: decimal('tax_amount', { precision: 19, scale: 4 }).default('0'),
  periodStart: timestamp('period_start', { withTimezone: true }),
  periodEnd: timestamp('period_end', { withTimezone: true }),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('invoice_items_tenant_id_idx').on(table.tenantId),
  index('invoice_items_invoice_id_idx').on(table.invoiceId),
  index('invoice_items_tenant_invoice_idx').on(table.tenantId, table.invoiceId),
  index('invoice_items_line_item_type_idx').on(table.lineItemType),
]);

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [invoices.tenantId],
    references: [tenants.id],
  }),
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
  items: many(invoiceItems),
  payments: many(paymentLineItems),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  tenant: one(tenants, {
    fields: [invoiceItems.tenantId],
    references: [tenants.id],
  }),
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
}));

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type NewInvoiceItem = typeof invoiceItems.$inferInsert;
