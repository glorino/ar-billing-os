import { pgTable, uuid, varchar, text, timestamp, boolean, decimal, integer, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants } from './tenant';
import { collectionStatusEnum, currencyEnum } from './enums';

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  externalId: varchar('external_id', { length: 255 }),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  company: varchar('company', { length: 255 }),
  taxId: varchar('tax_id', { length: 50 }),
  currency: currencyEnum('currency').notNull().default('USD'),
  creditLimit: decimal('credit_limit', { precision: 19, scale: 4 }).default('0'),
  outstandingBalance: decimal('outstanding_balance', { precision: 19, scale: 4 }).notNull().default('0'),
  collectionStatus: collectionStatusEnum('collection_status').notNull().default('none'),
  paymentTermsDays: integer('payment_terms_days').notNull().default(30),
  autoPayEnabled: boolean('auto_pay_enabled').notNull().default(false),
  billingAddressLine1: varchar('billing_address_line1', { length: 255 }),
  billingAddressLine2: varchar('billing_address_line2', { length: 255 }),
  billingCity: varchar('billing_city', { length: 100 }),
  billingState: varchar('billing_state', { length: 100 }),
  billingPostalCode: varchar('billing_postal_code', { length: 20 }),
  billingCountry: varchar('billing_country', { length: 2 }),
  shippingAddressLine1: varchar('shipping_address_line1', { length: 255 }),
  shippingAddressLine2: varchar('shipping_address_line2', { length: 255 }),
  shippingCity: varchar('shipping_city', { length: 100 }),
  shippingState: varchar('shipping_state', { length: 100 }),
  shippingPostalCode: varchar('shipping_postal_code', { length: 20 }),
  shippingCountry: varchar('shipping_country', { length: 2 }),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  tags: jsonb('tags').default([]).$type<string[]>(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('customers_tenant_id_idx').on(table.tenantId),
  uniqueIndex('customers_tenant_external_id_idx').on(table.tenantId, table.externalId),
  index('customers_tenant_email_idx').on(table.tenantId, table.email),
  index('customers_tenant_name_idx').on(table.tenantId, table.name),
  index('customers_tenant_collection_status_idx').on(table.tenantId, table.collectionStatus),
  index('customers_tenant_active_idx').on(table.tenantId, table.isActive),
]);

export const customersRelations = relations(customers, ({ one }) => ({
  tenant: one(tenants, {
    fields: [customers.tenantId],
    references: [tenants.id],
  }),
}));

export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
