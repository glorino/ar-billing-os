import { pgTable, uuid, varchar, text, timestamp, decimal, integer, jsonb, index, uniqueIndex, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tenants } from './tenant';
import { ledgerEntryTypeEnum, ledgerAccountTypeEnum, currencyEnum, periodStatusEnum } from './enums';

export const ledgerAccounts = pgTable('ledger_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 50 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  type: ledgerAccountTypeEnum('type').notNull(),
  parentAccountId: uuid('parent_account_id'),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('ledger_accounts_tenant_id_idx').on(table.tenantId),
  uniqueIndex('ledger_accounts_tenant_code_idx').on(table.tenantId, table.code),
  index('ledger_accounts_tenant_type_idx').on(table.tenantId, table.type),
  index('ledger_accounts_tenant_active_idx').on(table.tenantId, table.isActive),
  index('ledger_accounts_parent_account_id_idx').on(table.parentAccountId),
]);

export const ledgerEntries = pgTable('ledger_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  accountId: uuid('account_id').notNull().references(() => ledgerAccounts.id, { onDelete: 'restrict' }),
  entryType: ledgerEntryTypeEnum('entry_type').notNull(),
  amount: decimal('amount', { precision: 19, scale: 4 }).notNull(),
  currency: currencyEnum('currency').notNull().default('USD'),
  exchangeRate: decimal('exchange_rate', { precision: 19, scale: 8 }).default('1'),
  debitAmount: decimal('debit_amount', { precision: 19, scale: 4 }).notNull().default('0'),
  creditAmount: decimal('credit_amount', { precision: 19, scale: 4 }).notNull().default('0'),
  description: text('description').notNull(),
  referenceType: varchar('reference_type', { length: 100 }),
  referenceId: varchar('reference_id', { length: 255 }),
  periodId: uuid('period_id'),
  isReversed: boolean('is_reversed').notNull().default(false),
  reversedByEntryId: uuid('reversed_by_entry_id'),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('ledger_entries_tenant_id_idx').on(table.tenantId),
  index('ledger_entries_account_id_idx').on(table.accountId),
  index('ledger_entries_tenant_account_idx').on(table.tenantId, table.accountId),
  index('ledger_entries_tenant_entry_type_idx').on(table.tenantId, table.entryType),
  index('ledger_entries_reference_idx').on(table.referenceType, table.referenceId),
  index('ledger_entries_tenant_created_at_idx').on(table.tenantId, table.createdAt),
  index('ledger_entries_period_id_idx').on(table.periodId),
  index('ledger_entries_tenant_account_created_at_idx').on(table.tenantId, table.accountId, table.createdAt),
]);

export const ledgerPeriods = pgTable('ledger_periods', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  status: periodStatusEnum('status').notNull().default('current'),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  closedBy: varchar('closed_by', { length: 255 }),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('ledger_periods_tenant_id_idx').on(table.tenantId),
  index('ledger_periods_tenant_status_idx').on(table.tenantId, table.status),
  index('ledger_periods_tenant_start_date_idx').on(table.tenantId, table.startDate),
  uniqueIndex('ledger_periods_tenant_name_idx').on(table.tenantId, table.name),
]);

export const ledgerJournalEntries = pgTable('ledger_journal_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  entryNumber: varchar('entry_number', { length: 50 }).notNull(),
  description: text('description').notNull(),
  referenceType: varchar('reference_type', { length: 100 }),
  referenceId: varchar('reference_id', { length: 255 }),
  postedAt: timestamp('posted_at', { withTimezone: true }).notNull().defaultNow(),
  isReversed: boolean('is_reversed').notNull().default(false),
  metadata: jsonb('metadata').default({}).$type<Record<string, unknown>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index('ledger_journal_entries_tenant_id_idx').on(table.tenantId),
  uniqueIndex('ledger_journal_entries_tenant_number_idx').on(table.tenantId, table.entryNumber),
  index('ledger_journal_entries_tenant_posted_at_idx').on(table.tenantId, table.postedAt),
  index('ledger_journal_entries_reference_idx').on(table.referenceType, table.referenceId),
]);

export const ledgerAccountsRelations = relations(ledgerAccounts, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [ledgerAccounts.tenantId],
    references: [tenants.id],
  }),
  entries: many(ledgerEntries),
}));

export const ledgerEntriesRelations = relations(ledgerEntries, ({ one }) => ({
  tenant: one(tenants, {
    fields: [ledgerEntries.tenantId],
    references: [tenants.id],
  }),
  account: one(ledgerAccounts, {
    fields: [ledgerEntries.accountId],
    references: [ledgerAccounts.id],
  }),
  period: one(ledgerPeriods, {
    fields: [ledgerEntries.periodId],
    references: [ledgerPeriods.id],
  }),
}));

export const ledgerPeriodsRelations = relations(ledgerPeriods, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [ledgerPeriods.tenantId],
    references: [tenants.id],
  }),
  entries: many(ledgerEntries),
}));

export const ledgerJournalEntriesRelations = relations(ledgerJournalEntries, ({ one }) => ({
  tenant: one(tenants, {
    fields: [ledgerJournalEntries.tenantId],
    references: [tenants.id],
  }),
}));

export type LedgerAccount = typeof ledgerAccounts.$inferSelect;
export type NewLedgerAccount = typeof ledgerAccounts.$inferInsert;
export type LedgerEntry = typeof ledgerEntries.$inferSelect;
export type NewLedgerEntry = typeof ledgerEntries.$inferInsert;
export type LedgerPeriod = typeof ledgerPeriods.$inferSelect;
export type NewLedgerPeriod = typeof ledgerPeriods.$inferInsert;
export type LedgerJournalEntry = typeof ledgerJournalEntries.$inferSelect;
export type NewLedgerJournalEntry = typeof ledgerJournalEntries.$inferInsert;
