import { pgTable, uuid, varchar, text, timestamp, decimal, integer, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants } from './tenant';
import { payments } from './payments';
import { reconciliationStatusEnum, currencyEnum } from './enums';

export const reconciliationBatches = pgTable('reconciliation_batches', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  batchNumber: varchar('batch_number', { length: 50 }).notNull(),
  status: reconciliationStatusEnum('status').notNull().default('pending'),
  source: varchar('source', { length: 100 }).notNull(),
  totalTransactions: integer('total_transactions').notNull().default(0),
  matchedCount: integer('matched_count').notNull().default(0),
  unmatchedCount: integer('unmatched_count').notNull().default(0),
  totalAmount: decimal('total_amount', { precision: 19, scale: 4 }).notNull().default('0'),
  matchedAmount: decimal('matched_amount', { precision: 19, scale: 4 }).notNull().default('0'),
  unmatchedAmount: decimal('unmatched_amount', { precision: 19, scale: 4 }).notNull().default('0'),
  currency: currencyEnum('currency').notNull().default('USD'),
  statementDate: timestamp('statement_date', { withTimezone: true }),
  notes: text('notes'),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('reconciliation_batches_tenant_id_idx').on(table.tenantId),
  index('reconciliation_batches_tenant_status_idx').on(table.tenantId, table.status),
  uniqueIndex('reconciliation_batches_tenant_number_idx').on(table.tenantId, table.batchNumber),
  index('reconciliation_batches_tenant_statement_date_idx').on(table.tenantId, table.statementDate),
]);

export const reconciliationItems = pgTable('reconciliation_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  batchId: uuid('batch_id').notNull().references(() => reconciliationBatches.id, { onDelete: 'cascade' }),
  paymentId: uuid('payment_id').references(() => payments.id, { onDelete: 'set null' }),
  status: reconciliationStatusEnum('status').notNull().default('pending'),
  transactionDate: timestamp('transaction_date', { withTimezone: true }).notNull(),
  transactionReference: varchar('transaction_reference', { length: 255 }),
  transactionDescription: text('transaction_description'),
  transactionAmount: decimal('transaction_amount', { precision: 19, scale: 4 }).notNull(),
  paymentAmount: decimal('payment_amount', { precision: 19, scale: 4 }),
  difference: decimal('difference', { precision: 19, scale: 4 }),
  notes: text('notes'),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('reconciliation_items_tenant_id_idx').on(table.tenantId),
  index('reconciliation_items_batch_id_idx').on(table.batchId),
  index('reconciliation_items_payment_id_idx').on(table.paymentId),
  index('reconciliation_items_tenant_batch_idx').on(table.tenantId, table.batchId),
  index('reconciliation_items_tenant_status_idx').on(table.tenantId, table.status),
]);

export const reconciliationBatchesRelations = relations(reconciliationBatches, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [reconciliationBatches.tenantId],
    references: [tenants.id],
  }),
  items: many(reconciliationItems),
}));

export const reconciliationItemsRelations = relations(reconciliationItems, ({ one }) => ({
  tenant: one(tenants, {
    fields: [reconciliationItems.tenantId],
    references: [tenants.id],
  }),
  batch: one(reconciliationBatches, {
    fields: [reconciliationItems.batchId],
    references: [reconciliationBatches.id],
  }),
  payment: one(payments, {
    fields: [reconciliationItems.paymentId],
    references: [payments.id],
  }),
}));

export type ReconciliationBatch = typeof reconciliationBatches.$inferSelect;
export type NewReconciliationBatch = typeof reconciliationBatches.$inferInsert;
export type ReconciliationItem = typeof reconciliationItems.$inferSelect;
export type NewReconciliationItem = typeof reconciliationItems.$inferInsert;
