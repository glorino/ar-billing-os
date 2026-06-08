import { pgTable, uuid, varchar, text, timestamp, decimal, integer, boolean, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants } from './tenant';
import { customers } from './customers';
import { collectionStatusEnum, collectionActionEnum } from './enums';

export const collectionCases = pgTable('collection_cases', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').notNull().references(() => customers.id, { onDelete: 'restrict' }),
  caseNumber: varchar('case_number', { length: 50 }).notNull(),
  status: collectionStatusEnum('status').notNull().default('reminder'),
  totalOutstanding: decimal('total_outstanding', { precision: 19, scale: 4 }).notNull().default('0'),
  overdueDays: integer('overdue_days').notNull().default(0),
  assignedTo: varchar('assigned_to', { length: 255 }),
  agencyName: varchar('agency_name', { length: 255 }),
  agencyReference: varchar('agency_reference', { length: 255 }),
  paymentPlanId: varchar('payment_plan_id', { length: 255 }),
  notes: text('notes'),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  openedAt: timestamp('opened_at', { withTimezone: true }).notNull().defaultNow(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('collection_cases_tenant_id_idx').on(table.tenantId),
  index('collection_cases_customer_id_idx').on(table.customerId),
  index('collection_cases_tenant_status_idx').on(table.tenantId, table.status),
  index('collection_cases_tenant_customer_idx').on(table.tenantId, table.customerId),
  index('collection_cases_tenant_overdue_days_idx').on(table.tenantId, table.overdueDays),
]);

export const collectionEvents = pgTable('collection_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  caseId: uuid('case_id').notNull().references(() => collectionCases.id, { onDelete: 'cascade' }),
  action: collectionActionEnum('action').notNull(),
  description: text('description').notNull(),
  outcome: text('outcome'),
  performedBy: varchar('performed_by', { length: 255 }),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('collection_events_tenant_id_idx').on(table.tenantId),
  index('collection_events_case_id_idx').on(table.caseId),
  index('collection_events_tenant_case_idx').on(table.tenantId, table.caseId),
  index('collection_events_tenant_action_idx').on(table.tenantId, table.action),
  index('collection_events_tenant_created_at_idx').on(table.tenantId, table.createdAt),
]);

export const collectionRules = pgTable('collection_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  overdueDaysThreshold: integer('overdue_days_threshold').notNull(),
  action: collectionActionEnum('action').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('collection_rules_tenant_id_idx').on(table.tenantId),
  index('collection_rules_tenant_active_idx').on(table.tenantId, table.isActive),
  index('collection_rules_tenant_overdue_days_idx').on(table.tenantId, table.overdueDaysThreshold),
]);

export const collectionCasesRelations = relations(collectionCases, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [collectionCases.tenantId],
    references: [tenants.id],
  }),
  customer: one(customers, {
    fields: [collectionCases.customerId],
    references: [customers.id],
  }),
  events: many(collectionEvents),
}));

export const collectionEventsRelations = relations(collectionEvents, ({ one }) => ({
  tenant: one(tenants, {
    fields: [collectionEvents.tenantId],
    references: [tenants.id],
  }),
  case: one(collectionCases, {
    fields: [collectionEvents.caseId],
    references: [collectionCases.id],
  }),
}));

export const collectionRulesRelations = relations(collectionRules, ({ one }) => ({
  tenant: one(tenants, {
    fields: [collectionRules.tenantId],
    references: [tenants.id],
  }),
}));

export type CollectionCase = typeof collectionCases.$inferSelect;
export type NewCollectionCase = typeof collectionCases.$inferInsert;
export type CollectionEvent = typeof collectionEvents.$inferSelect;
export type NewCollectionEvent = typeof collectionEvents.$inferInsert;
export type CollectionRule = typeof collectionRules.$inferSelect;
export type NewCollectionRule = typeof collectionRules.$inferInsert;
