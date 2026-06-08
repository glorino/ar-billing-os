import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenantStatusEnum, currencyEnum, billingCycleEnum } from './enums';

export const tenants = pgTable('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkOrgId: varchar('clerk_org_id', { length: 255 }),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull(),
  status: tenantStatusEnum('status').notNull().default('trial'),
  domain: varchar('domain', { length: 255 }),
  logoUrl: text('logo_url'),
  defaultCurrency: currencyEnum('default_currency').notNull().default('USD'),
  defaultBillingCycle: billingCycleEnum('default_billing_cycle').notNull().default('monthly'),
  taxId: varchar('tax_id', { length: 50 }),
  registrationNumber: varchar('registration_number', { length: 50 }),
  contactEmail: varchar('contact_email', { length: 255 }).notNull(),
  contactPhone: varchar('contact_phone', { length: 50 }),
  addressLine1: varchar('address_line1', { length: 255 }),
  addressLine2: varchar('address_line2', { length: 255 }),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }),
  country: varchar('country', { length: 2 }).default('US'),
  settings: jsonb('settings').default({}).$type<{
    invoicePrefix?: string;
    paymentTerms?: number;
    lateFeeRate?: number;
    gracePeriodDays?: number;
    autoSendInvoices?: boolean;
    enableCollections?: boolean;
    taxEnabled?: boolean;
    defaultTaxRate?: number;
    notificationEmails?: string[];
    customFields?: Record<string, unknown>;
  }>(),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('tenants_slug_idx').on(table.slug),
  index('tenants_status_idx').on(table.status),
  index('tenants_created_at_idx').on(table.createdAt),
]);

export const tenantsRelations = relations(tenants, ({ many }) => ({
  // Circular relations removed to avoid import cycles
}));

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
