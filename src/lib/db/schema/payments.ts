import { pgTable, uuid, varchar, text, timestamp, decimal, integer, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants } from './tenant';
import { customers } from './customers';
import { invoices } from './invoices';
import { paymentStatusEnum, paymentMethodEnum, currencyEnum, reconciliationStatusEnum } from './enums';

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').notNull().references(() => customers.id, { onDelete: 'restrict' }),
  paymentNumber: varchar('payment_number', { length: 50 }).notNull(),
  status: paymentStatusEnum('status').notNull().default('pending'),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  currency: currencyEnum('currency').notNull().default('USD'),
  amount: decimal('amount', { precision: 19, scale: 4 }).notNull(),
  amountRefunded: decimal('amount_refunded', { precision: 19, scale: 4 }).notNull().default('0'),
  netAmount: decimal('net_amount', { precision: 19, scale: 4 }).notNull(),
  exchangeRate: decimal('exchange_rate', { precision: 19, scale: 8 }).default('1'),
  provider: varchar('provider', { length: 50 }).notNull().default('stripe'),
  providerPaymentId: varchar('provider_payment_id', { length: 255 }),
  referenceNumber: varchar('reference_number', { length: 255 }),
  transactionId: varchar('transaction_id', { length: 255 }),
  gatewayResponse: jsonb('gateway_response').$type<Record<string, unknown>>(),
  failureReason: text('failure_reason'),
  notes: text('notes'),
  receivedAt: timestamp('received_at', { withTimezone: true }),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  reconciledAt: timestamp('reconciled_at', { withTimezone: true }),
  reconciliationStatus: reconciliationStatusEnum('reconciliation_status').notNull().default('pending'),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('payments_tenant_id_idx').on(table.tenantId),
  index('payments_customer_id_idx').on(table.customerId),
  index('payments_tenant_status_idx').on(table.tenantId, table.status),
  index('payments_tenant_payment_method_idx').on(table.tenantId, table.paymentMethod),
  index('payments_tenant_received_at_idx').on(table.tenantId, table.receivedAt),
  uniqueIndex('payments_tenant_number_idx').on(table.tenantId, table.paymentNumber),
  index('payments_tenant_reconciliation_status_idx').on(table.tenantId, table.reconciliationStatus),
  index('payments_tenant_customer_status_idx').on(table.tenantId, table.customerId, table.status),
]);

export const paymentLineItems = pgTable('payment_line_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  paymentId: uuid('payment_id').notNull().references(() => payments.id, { onDelete: 'cascade' }),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id, { onDelete: 'restrict' }),
  amount: decimal('amount', { precision: 19, scale: 4 }).notNull(),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('payment_line_items_tenant_id_idx').on(table.tenantId),
  index('payment_line_items_payment_id_idx').on(table.paymentId),
  index('payment_line_items_invoice_id_idx').on(table.invoiceId),
  index('payment_line_items_tenant_payment_idx').on(table.tenantId, table.paymentId),
  index('payment_line_items_tenant_invoice_idx').on(table.tenantId, table.invoiceId),
]);

export const paymentRefunds = pgTable('payment_refunds', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  paymentId: uuid('payment_id').notNull().references(() => payments.id, { onDelete: 'restrict' }),
  amount: decimal('amount', { precision: 19, scale: 4 }).notNull(),
  reason: text('reason'),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('payment_refunds_tenant_id_idx').on(table.tenantId),
  index('payment_refunds_payment_id_idx').on(table.paymentId),
  index('payment_refunds_tenant_payment_idx').on(table.tenantId, table.paymentId),
]);

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [payments.tenantId],
    references: [tenants.id],
  }),
  customer: one(customers, {
    fields: [payments.customerId],
    references: [customers.id],
  }),
  lineItems: many(paymentLineItems),
  refunds: many(paymentRefunds),
}));

export const paymentLineItemsRelations = relations(paymentLineItems, ({ one }) => ({
  tenant: one(tenants, {
    fields: [paymentLineItems.tenantId],
    references: [tenants.id],
  }),
  payment: one(payments, {
    fields: [paymentLineItems.paymentId],
    references: [payments.id],
  }),
  invoice: one(invoices, {
    fields: [paymentLineItems.invoiceId],
    references: [invoices.id],
  }),
}));

export const paymentRefundsRelations = relations(paymentRefunds, ({ one }) => ({
  tenant: one(tenants, {
    fields: [paymentRefunds.tenantId],
    references: [tenants.id],
  }),
  payment: one(payments, {
    fields: [paymentRefunds.paymentId],
    references: [payments.id],
  }),
}));

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type PaymentLineItem = typeof paymentLineItems.$inferSelect;
export type NewPaymentLineItem = typeof paymentLineItems.$inferInsert;
export type PaymentRefund = typeof paymentRefunds.$inferSelect;
export type NewPaymentRefund = typeof paymentRefunds.$inferInsert;
