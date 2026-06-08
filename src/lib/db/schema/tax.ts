import { pgTable, uuid, varchar, text, timestamp, boolean, decimal, integer, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants } from './tenant';
import { taxRateTypeEnum, taxCategoryEnum } from './enums';

export const taxRates = pgTable('tax_rates', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }).notNull(),
  type: taxRateTypeEnum('type').notNull().default('percentage'),
  rate: decimal('rate', { precision: 8, scale: 4 }).notNull(),
  category: taxCategoryEnum('category').notNull().default('standard'),
  jurisdiction: varchar('jurisdiction', { length: 255 }),
  country: varchar('country', { length: 2 }),
  region: varchar('region', { length: 100 }),
  isActive: boolean('is_active').notNull().default(true),
  validFrom: timestamp('valid_from', { withTimezone: true }).notNull().defaultNow(),
  validTo: timestamp('valid_to', { withTimezone: true }),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('tax_rates_tenant_id_idx').on(table.tenantId),
  uniqueIndex('tax_rates_tenant_code_idx').on(table.tenantId, table.code),
  index('tax_rates_tenant_active_idx').on(table.tenantId, table.isActive),
  index('tax_rates_tenant_jurisdiction_idx').on(table.tenantId, table.jurisdiction),
  index('tax_rates_valid_from_to_idx').on(table.validFrom, table.validTo),
]);

export const taxRules = pgTable('tax_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  taxRateId: uuid('tax_rate_id').notNull().references(() => taxRates.id, { onDelete: 'cascade' }),
  productCategory: varchar('product_category', { length: 255 }),
  customerType: varchar('customer_type', { length: 50 }),
  shippingCountry: varchar('shipping_country', { length: 2 }),
  shippingRegion: varchar('shipping_region', { length: 100 }),
  priority: integer('priority').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('tax_rules_tenant_id_idx').on(table.tenantId),
  index('tax_rules_tax_rate_id_idx').on(table.taxRateId),
  index('tax_rules_tenant_product_category_idx').on(table.tenantId, table.productCategory),
  index('tax_rules_tenant_active_idx').on(table.tenantId, table.isActive),
]);

export const taxExemptions = pgTable('tax_exemptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').notNull(),
  exemptionType: varchar('exemption_type', { length: 50 }).notNull(),
  exemptionNumber: varchar('exemption_number', { length: 255 }),
  validFrom: timestamp('valid_from', { withTimezone: true }).notNull(),
  validTo: timestamp('valid_to', { withTimezone: true }),
  isActive: boolean('is_active').notNull().default(true),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('tax_exemptions_tenant_id_idx').on(table.tenantId),
  index('tax_exemptions_customer_id_idx').on(table.customerId),
  index('tax_exemptions_tenant_customer_idx').on(table.tenantId, table.customerId),
  index('tax_exemptions_tenant_active_idx').on(table.tenantId, table.isActive),
]);

export const taxRatesRelations = relations(taxRates, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [taxRates.tenantId],
    references: [tenants.id],
  }),
  rules: many(taxRules),
}));

export const taxRulesRelations = relations(taxRules, ({ one }) => ({
  tenant: one(tenants, {
    fields: [taxRules.tenantId],
    references: [tenants.id],
  }),
  taxRate: one(taxRates, {
    fields: [taxRules.taxRateId],
    references: [taxRates.id],
  }),
}));

export const taxExemptionsRelations = relations(taxExemptions, ({ one }) => ({
  tenant: one(tenants, {
    fields: [taxExemptions.tenantId],
    references: [tenants.id],
  }),
}));

export type TaxRate = typeof taxRates.$inferSelect;
export type NewTaxRate = typeof taxRates.$inferInsert;
export type TaxRule = typeof taxRules.$inferSelect;
export type NewTaxRule = typeof taxRules.$inferInsert;
export type TaxExemption = typeof taxExemptions.$inferSelect;
export type NewTaxExemption = typeof taxExemptions.$inferInsert;
