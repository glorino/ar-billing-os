import { pgEnum } from 'drizzle-orm/pg-core';

export const tenantStatusEnum = pgEnum('tenant_status', ['active', 'suspended', 'cancelled', 'trial']);
export const billingCycleEnum = pgEnum('billing_cycle', ['monthly', 'quarterly', 'semi_annual', 'annual', 'custom']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['draft', 'pending', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled', 'written_off']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded', 'disputed']);
export const paymentMethodEnum = pgEnum('payment_method', ['credit_card', 'debit_card', 'ach_transfer', 'wire_transfer', 'check', 'cash', 'digital_wallet', 'other']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['trialing', 'active', 'past_due', 'paused', 'cancelled', 'expired']);
export const collectionStatusEnum = pgEnum('collection_status', ['none', 'reminder', 'final_notice', 'collection_agency', 'legal', 'resolved']);
export const collectionActionEnum = pgEnum('collection_action', ['email_reminder', 'phone_call', 'letter_sent', 'final_demand', 'agency_referral', 'legal_action', 'payment_plan', 'write_off']);
export const reconciliationStatusEnum = pgEnum('reconciliation_status', ['pending', 'matched', 'partial', 'unmatched', 'cancelled']);
export const taxRateTypeEnum = pgEnum('tax_rate_type', ['percentage', 'fixed']);
export const taxCategoryEnum = pgEnum('tax_category', ['standard', 'reduced', 'exempt', 'zero_rated']);
export const ledgerEntryTypeEnum = pgEnum('ledger_entry_type', ['debit', 'credit']);
export const ledgerAccountTypeEnum = pgEnum('ledger_account_type', ['asset', 'liability', 'equity', 'revenue', 'expense']);
export const lineItemTypeEnum = pgEnum('line_item_type', ['subscription', 'usage', 'one_time', 'fee', 'discount', 'tax', 'credit']);
export const discountTypeEnum = pgEnum('discount_type', ['percentage', 'fixed_amount']);
export const currencyEnum = pgEnum('currency', ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'NGN', 'GHS', 'KES', 'ZAR', 'TZS', 'UGX', 'RWF', 'XOF', 'XAF']);
export const periodStatusEnum = pgEnum('period_status', ['current', 'closed', 'reconciled']);
