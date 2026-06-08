import { pgTable, uuid, varchar, timestamp, decimal, integer, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants } from './tenant';
import { currencyEnum } from './enums';

export const revenueMetrics = pgTable('revenue_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
  periodEnd: timestamp('period_end', { withTimezone: true }).notNull(),
  totalRevenue: decimal('total_revenue', { precision: 19, scale: 4 }).notNull().default('0'),
  recurringRevenue: decimal('recurring_revenue', { precision: 19, scale: 4 }).notNull().default('0'),
  oneTimeRevenue: decimal('one_time_revenue', { precision: 19, scale: 4 }).notNull().default('0'),
  usageRevenue: decimal('usage_revenue', { precision: 19, scale: 4 }).notNull().default('0'),
  totalInvoices: integer('total_invoices').notNull().default(0),
  paidInvoices: integer('paid_invoices').notNull().default(0),
  overdueInvoices: integer('overdue_invoices').notNull().default(0),
  averageInvoiceValue: decimal('average_invoice_value', { precision: 19, scale: 4 }).notNull().default('0'),
  currency: currencyEnum('currency').notNull().default('USD'),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('revenue_metrics_tenant_id_idx').on(table.tenantId),
  index('revenue_metrics_tenant_period_idx').on(table.tenantId, table.periodStart, table.periodEnd),
  index('revenue_metrics_tenant_created_at_idx').on(table.tenantId, table.createdAt),
]);

export const arAging = pgTable('ar_aging', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').notNull(),
  snapshotDate: timestamp('snapshot_date', { withTimezone: true }).notNull(),
  currentAmount: decimal('current_amount', { precision: 19, scale: 4 }).notNull().default('0'),
  days1to30: decimal('days_1_to_30', { precision: 19, scale: 4 }).notNull().default('0'),
  days31to60: decimal('days_31_to_60', { precision: 19, scale: 4 }).notNull().default('0'),
  days61to90: decimal('days_61_to_90', { precision: 19, scale: 4 }).notNull().default('0'),
  days90plus: decimal('days_90_plus', { precision: 19, scale: 4 }).notNull().default('0'),
  totalOutstanding: decimal('total_outstanding', { precision: 19, scale: 4 }).notNull().default('0'),
  currency: currencyEnum('currency').notNull().default('USD'),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('ar_aging_tenant_id_idx').on(table.tenantId),
  index('ar_aging_customer_id_idx').on(table.customerId),
  index('ar_aging_tenant_snapshot_date_idx').on(table.tenantId, table.snapshotDate),
  index('ar_aging_tenant_customer_snapshot_idx').on(table.tenantId, table.customerId, table.snapshotDate),
]);

export const customerMetrics = pgTable('customer_metrics', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').notNull(),
  totalLifetimeValue: decimal('total_lifetime_value', { precision: 19, scale: 4 }).notNull().default('0'),
  totalInvoices: integer('total_invoices').notNull().default(0),
  paidInvoices: integer('paid_invoices').notNull().default(0),
  overdueInvoices: integer('overdue_invoices').notNull().default(0),
  averagePaymentDays: integer('average_payment_days').default(0),
  lastPaymentDate: timestamp('last_payment_date', { withTimezone: true }),
  lastInvoiceDate: timestamp('last_invoice_date', { withTimezone: true }),
  creditScore: integer('credit_score'),
  riskLevel: varchar('risk_level', { length: 50 }),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('customer_metrics_tenant_id_idx').on(table.tenantId),
  index('customer_metrics_customer_id_idx').on(table.customerId),
  index('customer_metrics_tenant_customer_idx').on(table.tenantId, table.customerId),
  index('customer_metrics_tenant_risk_level_idx').on(table.tenantId, table.riskLevel),
]);

export const cashFlowForecast = pgTable('cash_flow_forecast', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  forecastDate: timestamp('forecast_date', { withTimezone: true }).notNull(),
  expectedInflows: decimal('expected_inflows', { precision: 19, scale: 4 }).notNull().default('0'),
  expectedOutflows: decimal('expected_outflows', { precision: 19, scale: 4 }).notNull().default('0'),
  netCashFlow: decimal('net_cash_flow', { precision: 19, scale: 4 }).notNull().default('0'),
  confidence: decimal('confidence', { precision: 5, scale: 2 }).default('0'),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('cash_flow_forecast_tenant_id_idx').on(table.tenantId),
  index('cash_flow_forecast_tenant_forecast_date_idx').on(table.tenantId, table.forecastDate),
]);

export const revenueMetricsRelations = relations(revenueMetrics, ({ one }) => ({
  tenant: one(tenants, {
    fields: [revenueMetrics.tenantId],
    references: [tenants.id],
  }),
}));

export const arAgingRelations = relations(arAging, ({ one }) => ({
  tenant: one(tenants, {
    fields: [arAging.tenantId],
    references: [tenants.id],
  }),
}));

export const customerMetricsRelations = relations(customerMetrics, ({ one }) => ({
  tenant: one(tenants, {
    fields: [customerMetrics.tenantId],
    references: [tenants.id],
  }),
}));

export const cashFlowForecastRelations = relations(cashFlowForecast, ({ one }) => ({
  tenant: one(tenants, {
    fields: [cashFlowForecast.tenantId],
    references: [tenants.id],
  }),
}));

export type RevenueMetric = typeof revenueMetrics.$inferSelect;
export type NewRevenueMetric = typeof revenueMetrics.$inferInsert;
export type ArAging = typeof arAging.$inferSelect;
export type NewArAging = typeof arAging.$inferInsert;
export type CustomerMetric = typeof customerMetrics.$inferSelect;
export type NewCustomerMetric = typeof customerMetrics.$inferInsert;
export type CashFlowForecast = typeof cashFlowForecast.$inferSelect;
export type NewCashFlowForecast = typeof cashFlowForecast.$inferInsert;
