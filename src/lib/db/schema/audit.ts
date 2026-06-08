import { pgTable, uuid, varchar, text, timestamp, jsonb, index, bigint } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants } from './tenant';

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  userId: varchar('user_id', { length: 255 }),
  userAgent: varchar('user_agent', { length: 500 }),
  ipAddress: varchar('ip_address', { length: 45 }),
  action: varchar('action', { length: 100 }).notNull(),
  resourceType: varchar('resource_type', { length: 100 }).notNull(),
  resourceId: varchar('resource_id', { length: 255 }).notNull(),
  oldValues: jsonb('old_values').$type<Record<string, unknown>>(),
  newValues: jsonb('new_values').$type<Record<string, unknown>>(),
  changes: jsonb('changes').$type<Record<string, { old: unknown; new: unknown }>>(),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('audit_logs_tenant_id_idx').on(table.tenantId),
  index('audit_logs_user_id_idx').on(table.userId),
  index('audit_logs_action_idx').on(table.action),
  index('audit_logs_resource_type_idx').on(table.resourceType),
  index('audit_logs_resource_id_idx').on(table.resourceId),
  index('audit_logs_tenant_created_at_idx').on(table.tenantId, table.createdAt),
  index('audit_logs_tenant_action_resource_idx').on(table.tenantId, table.action, table.resourceType),
  index('audit_logs_tenant_user_created_at_idx').on(table.tenantId, table.userId, table.createdAt),
]);

export const complianceRecords = pgTable('compliance_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  recordType: varchar('record_type', { length: 100 }).notNull(),
  resourceId: varchar('resource_id', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  requiredBy: varchar('required_by', { length: 255 }),
  dueDate: timestamp('due_date', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  notes: text('notes'),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('compliance_records_tenant_id_idx').on(table.tenantId),
  index('compliance_records_tenant_record_type_idx').on(table.tenantId, table.recordType),
  index('compliance_records_tenant_status_idx').on(table.tenantId, table.status),
  index('compliance_records_tenant_due_date_idx').on(table.tenantId, table.dueDate),
  index('compliance_records_tenant_resource_idx').on(table.tenantId, table.recordType, table.resourceId),
]);

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  tenant: one(tenants, {
    fields: [auditLogs.tenantId],
    references: [tenants.id],
  }),
}));

export const complianceRecordsRelations = relations(complianceRecords, ({ one }) => ({
  tenant: one(tenants, {
    fields: [complianceRecords.tenantId],
    references: [tenants.id],
  }),
}));

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type ComplianceRecord = typeof complianceRecords.$inferSelect;
export type NewComplianceRecord = typeof complianceRecords.$inferInsert;
