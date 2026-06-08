import { pgTable, uuid, varchar, text, timestamp, boolean, decimal, integer, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants } from './tenant';
import { customers } from './customers';
import { subscriptionStatusEnum, billingCycleEnum, lineItemTypeEnum, discountTypeEnum, currencyEnum } from './enums';

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').notNull().references(() => customers.id, { onDelete: 'restrict' }),
  subscriptionNumber: varchar('subscription_number', { length: 50 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  status: subscriptionStatusEnum('status').notNull().default('trialing'),
  currency: currencyEnum('currency').notNull().default('USD'),
  recurringAmount: decimal('recurring_amount', { precision: 19, scale: 4 }).notNull(),
  billingCycle: billingCycleEnum('billing_cycle').notNull().default('monthly'),
  billingInterval: integer('billing_interval').notNull().default(1),
  trialStart: timestamp('trial_start', { withTimezone: true }),
  trialEnd: timestamp('trial_end', { withTimezone: true }),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }).notNull(),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }).notNull(),
  nextBillingDate: timestamp('next_billing_date', { withTimezone: true }),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  cancelReason: text('cancel_reason'),
  notes: text('notes'),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('subscriptions_tenant_id_idx').on(table.tenantId),
  index('subscriptions_customer_id_idx').on(table.customerId),
  index('subscriptions_tenant_status_idx').on(table.tenantId, table.status),
  index('subscriptions_tenant_next_billing_date_idx').on(table.tenantId, table.nextBillingDate),
  uniqueIndex('subscriptions_tenant_number_idx').on(table.tenantId, table.subscriptionNumber),
  index('subscriptions_tenant_customer_status_idx').on(table.tenantId, table.customerId, table.status),
]);

export const subscriptionItems = pgTable('subscription_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  subscriptionId: uuid('subscription_id').notNull().references(() => subscriptions.id, { onDelete: 'cascade' }),
  lineItemType: lineItemTypeEnum('line_item_type').notNull(),
  description: varchar('description', { length: 500 }).notNull(),
  quantity: decimal('quantity', { precision: 19, scale: 6 }).notNull().default('1'),
  unitPrice: decimal('unit_price', { precision: 19, scale: 4 }).notNull(),
  amount: decimal('amount', { precision: 19, scale: 4 }).notNull(),
  discountType: discountTypeEnum('discount_type'),
  discountValue: decimal('discount_value', { precision: 19, scale: 4 }),
  taxRate: decimal('tax_rate', { precision: 8, scale: 4 }).default('0'),
  isActive: boolean('is_active').notNull().default(true),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('subscription_items_tenant_id_idx').on(table.tenantId),
  index('subscription_items_subscription_id_idx').on(table.subscriptionId),
  index('subscription_items_tenant_subscription_idx').on(table.tenantId, table.subscriptionId),
]);

export const subscriptionUsage = pgTable('subscription_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  subscriptionId: uuid('subscription_id').notNull().references(() => subscriptions.id, { onDelete: 'cascade' }),
  metricName: varchar('metric_name', { length: 255 }).notNull(),
  quantity: decimal('quantity', { precision: 19, scale: 6 }).notNull(),
  periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
  periodEnd: timestamp('period_end', { withTimezone: true }).notNull(),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('subscription_usage_tenant_id_idx').on(table.tenantId),
  index('subscription_usage_subscription_id_idx').on(table.subscriptionId),
  index('subscription_usage_tenant_subscription_period_idx').on(table.tenantId, table.subscriptionId, table.periodStart),
]);

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [subscriptions.tenantId],
    references: [tenants.id],
  }),
  customer: one(customers, {
    fields: [subscriptions.customerId],
    references: [customers.id],
  }),
  items: many(subscriptionItems),
  usage: many(subscriptionUsage),
}));

export const subscriptionItemsRelations = relations(subscriptionItems, ({ one }) => ({
  tenant: one(tenants, {
    fields: [subscriptionItems.tenantId],
    references: [tenants.id],
  }),
  subscription: one(subscriptions, {
    fields: [subscriptionItems.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export const subscriptionUsageRelations = relations(subscriptionUsage, ({ one }) => ({
  tenant: one(tenants, {
    fields: [subscriptionUsage.tenantId],
    references: [tenants.id],
  }),
  subscription: one(subscriptions, {
    fields: [subscriptionUsage.subscriptionId],
    references: [subscriptions.id],
  }),
}));

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type SubscriptionItem = typeof subscriptionItems.$inferSelect;
export type NewSubscriptionItem = typeof subscriptionItems.$inferInsert;
export type SubscriptionUsage = typeof subscriptionUsage.$inferSelect;
export type NewSubscriptionUsage = typeof subscriptionUsage.$inferInsert;
