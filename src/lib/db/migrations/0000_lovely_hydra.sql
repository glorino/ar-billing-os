CREATE TYPE "public"."billing_cycle" AS ENUM('monthly', 'quarterly', 'semi_annual', 'annual', 'custom');--> statement-breakpoint
CREATE TYPE "public"."collection_action" AS ENUM('email_reminder', 'phone_call', 'letter_sent', 'final_demand', 'agency_referral', 'legal_action', 'payment_plan', 'write_off');--> statement-breakpoint
CREATE TYPE "public"."collection_status" AS ENUM('none', 'reminder', 'final_notice', 'collection_agency', 'legal', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."currency" AS ENUM('USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'NGN', 'GHS', 'KES', 'ZAR', 'TZS', 'UGX', 'RWF', 'XOF', 'XAF');--> statement-breakpoint
CREATE TYPE "public"."discount_type" AS ENUM('percentage', 'fixed_amount');--> statement-breakpoint
CREATE TYPE "public"."invoice_status" AS ENUM('draft', 'pending', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled', 'written_off');--> statement-breakpoint
CREATE TYPE "public"."ledger_account_type" AS ENUM('asset', 'liability', 'equity', 'revenue', 'expense');--> statement-breakpoint
CREATE TYPE "public"."ledger_entry_type" AS ENUM('debit', 'credit');--> statement-breakpoint
CREATE TYPE "public"."line_item_type" AS ENUM('subscription', 'usage', 'one_time', 'fee', 'discount', 'tax', 'credit');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('credit_card', 'debit_card', 'ach_transfer', 'wire_transfer', 'check', 'cash', 'digital_wallet', 'other');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded', 'disputed');--> statement-breakpoint
CREATE TYPE "public"."period_status" AS ENUM('current', 'closed', 'reconciled');--> statement-breakpoint
CREATE TYPE "public"."reconciliation_status" AS ENUM('pending', 'matched', 'partial', 'unmatched', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('trialing', 'active', 'past_due', 'paused', 'cancelled', 'expired');--> statement-breakpoint
CREATE TYPE "public"."tax_category" AS ENUM('standard', 'reduced', 'exempt', 'zero_rated');--> statement-breakpoint
CREATE TYPE "public"."tax_rate_type" AS ENUM('percentage', 'fixed');--> statement-breakpoint
CREATE TYPE "public"."tenant_status" AS ENUM('active', 'suspended', 'cancelled', 'trial');--> statement-breakpoint
CREATE TABLE "ar_aging" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"snapshot_date" timestamp with time zone NOT NULL,
	"current_amount" numeric(19, 4) DEFAULT '0' NOT NULL,
	"days_1_to_30" numeric(19, 4) DEFAULT '0' NOT NULL,
	"days_31_to_60" numeric(19, 4) DEFAULT '0' NOT NULL,
	"days_61_to_90" numeric(19, 4) DEFAULT '0' NOT NULL,
	"days_90_plus" numeric(19, 4) DEFAULT '0' NOT NULL,
	"total_outstanding" numeric(19, 4) DEFAULT '0' NOT NULL,
	"currency" "currency" DEFAULT 'USD' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cash_flow_forecast" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"forecast_date" timestamp with time zone NOT NULL,
	"expected_inflows" numeric(19, 4) DEFAULT '0' NOT NULL,
	"expected_outflows" numeric(19, 4) DEFAULT '0' NOT NULL,
	"net_cash_flow" numeric(19, 4) DEFAULT '0' NOT NULL,
	"confidence" numeric(5, 2) DEFAULT '0',
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customer_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"total_lifetime_value" numeric(19, 4) DEFAULT '0' NOT NULL,
	"total_invoices" integer DEFAULT 0 NOT NULL,
	"paid_invoices" integer DEFAULT 0 NOT NULL,
	"overdue_invoices" integer DEFAULT 0 NOT NULL,
	"average_payment_days" integer DEFAULT 0,
	"last_payment_date" timestamp with time zone,
	"last_invoice_date" timestamp with time zone,
	"credit_score" integer,
	"risk_level" varchar(50),
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "revenue_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"total_revenue" numeric(19, 4) DEFAULT '0' NOT NULL,
	"recurring_revenue" numeric(19, 4) DEFAULT '0' NOT NULL,
	"one_time_revenue" numeric(19, 4) DEFAULT '0' NOT NULL,
	"usage_revenue" numeric(19, 4) DEFAULT '0' NOT NULL,
	"total_invoices" integer DEFAULT 0 NOT NULL,
	"paid_invoices" integer DEFAULT 0 NOT NULL,
	"overdue_invoices" integer DEFAULT 0 NOT NULL,
	"average_invoice_value" numeric(19, 4) DEFAULT '0' NOT NULL,
	"currency" "currency" DEFAULT 'USD' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"key_hash" varchar(255) NOT NULL,
	"prefix" varchar(50) NOT NULL,
	"scopes" jsonb DEFAULT '["*"]'::jsonb,
	"expires_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"last_used_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"user_id" varchar(255),
	"user_agent" varchar(500),
	"ip_address" varchar(45),
	"action" varchar(100) NOT NULL,
	"resource_type" varchar(100) NOT NULL,
	"resource_id" varchar(255) NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"changes" jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "compliance_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"record_type" varchar(100) NOT NULL,
	"resource_id" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"required_by" varchar(255),
	"due_date" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"notes" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collection_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"case_number" varchar(50) NOT NULL,
	"status" "collection_status" DEFAULT 'reminder' NOT NULL,
	"total_outstanding" numeric(19, 4) DEFAULT '0' NOT NULL,
	"overdue_days" integer DEFAULT 0 NOT NULL,
	"assigned_to" varchar(255),
	"agency_name" varchar(255),
	"agency_reference" varchar(255),
	"payment_plan_id" varchar(255),
	"notes" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"opened_at" timestamp with time zone DEFAULT now() NOT NULL,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collection_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"case_id" uuid NOT NULL,
	"action" "collection_action" NOT NULL,
	"description" text NOT NULL,
	"outcome" text,
	"performed_by" varchar(255),
	"scheduled_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collection_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"overdue_days_threshold" integer NOT NULL,
	"action" "collection_action" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"external_id" varchar(255),
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"phone" varchar(50),
	"company" varchar(255),
	"tax_id" varchar(50),
	"currency" "currency" DEFAULT 'USD' NOT NULL,
	"credit_limit" numeric(19, 4) DEFAULT '0',
	"outstanding_balance" numeric(19, 4) DEFAULT '0' NOT NULL,
	"collection_status" "collection_status" DEFAULT 'none' NOT NULL,
	"payment_terms_days" integer DEFAULT 30 NOT NULL,
	"auto_pay_enabled" boolean DEFAULT false NOT NULL,
	"billing_address_line1" varchar(255),
	"billing_address_line2" varchar(255),
	"billing_city" varchar(100),
	"billing_state" varchar(100),
	"billing_postal_code" varchar(20),
	"billing_country" varchar(2),
	"shipping_address_line1" varchar(255),
	"shipping_address_line2" varchar(255),
	"shipping_city" varchar(100),
	"shipping_state" varchar(100),
	"shipping_postal_code" varchar(20),
	"shipping_country" varchar(2),
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_org_id" varchar(255),
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"status" "tenant_status" DEFAULT 'trial' NOT NULL,
	"domain" varchar(255),
	"logo_url" text,
	"default_currency" "currency" DEFAULT 'USD' NOT NULL,
	"default_billing_cycle" "billing_cycle" DEFAULT 'monthly' NOT NULL,
	"tax_id" varchar(50),
	"registration_number" varchar(50),
	"contact_email" varchar(255) NOT NULL,
	"contact_phone" varchar(50),
	"address_line1" varchar(255),
	"address_line2" varchar(255),
	"city" varchar(100),
	"state" varchar(100),
	"postal_code" varchar(20),
	"country" varchar(2) DEFAULT 'US',
	"settings" jsonb DEFAULT '{}'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"clerk_user_id" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"full_name" varchar(200),
	"avatar_url" text,
	"role" varchar(50) DEFAULT 'member' NOT NULL,
	"permissions" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"line_item_type" "line_item_type" NOT NULL,
	"description" varchar(500) NOT NULL,
	"quantity" numeric(19, 6) DEFAULT '1' NOT NULL,
	"unit_price" numeric(19, 4) NOT NULL,
	"amount" numeric(19, 4) NOT NULL,
	"discount_type" "discount_type",
	"discount_value" numeric(19, 4),
	"discount_amount" numeric(19, 4) DEFAULT '0',
	"tax_rate" numeric(8, 4) DEFAULT '0',
	"tax_amount" numeric(19, 4) DEFAULT '0',
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"invoice_number" varchar(50) NOT NULL,
	"status" "invoice_status" DEFAULT 'draft' NOT NULL,
	"currency" "currency" DEFAULT 'USD' NOT NULL,
	"subtotal" numeric(19, 4) DEFAULT '0' NOT NULL,
	"tax_amount" numeric(19, 4) DEFAULT '0' NOT NULL,
	"discount_amount" numeric(19, 4) DEFAULT '0' NOT NULL,
	"total" numeric(19, 4) DEFAULT '0' NOT NULL,
	"amount_paid" numeric(19, 4) DEFAULT '0' NOT NULL,
	"amount_due" numeric(19, 4) DEFAULT '0' NOT NULL,
	"issue_date" timestamp with time zone NOT NULL,
	"due_date" timestamp with time zone NOT NULL,
	"paid_at" timestamp with time zone,
	"voided_at" timestamp with time zone,
	"voided_reason" text,
	"notes" text,
	"terms" text,
	"memo" text,
	"billing_address" jsonb,
	"shipping_address" jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_line_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"payment_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"amount" numeric(19, 4) NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_refunds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"payment_id" uuid NOT NULL,
	"amount" numeric(19, 4) NOT NULL,
	"reason" text,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"processed_at" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"payment_number" varchar(50) NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"currency" "currency" DEFAULT 'USD' NOT NULL,
	"amount" numeric(19, 4) NOT NULL,
	"amount_refunded" numeric(19, 4) DEFAULT '0' NOT NULL,
	"net_amount" numeric(19, 4) NOT NULL,
	"exchange_rate" numeric(19, 8) DEFAULT '1',
	"provider" varchar(50) DEFAULT 'stripe' NOT NULL,
	"provider_payment_id" varchar(255),
	"reference_number" varchar(255),
	"transaction_id" varchar(255),
	"gateway_response" jsonb,
	"failure_reason" text,
	"notes" text,
	"received_at" timestamp with time zone,
	"processed_at" timestamp with time zone,
	"reconciled_at" timestamp with time zone,
	"reconciliation_status" "reconciliation_status" DEFAULT 'pending' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"subscription_id" uuid NOT NULL,
	"line_item_type" "line_item_type" NOT NULL,
	"description" varchar(500) NOT NULL,
	"quantity" numeric(19, 6) DEFAULT '1' NOT NULL,
	"unit_price" numeric(19, 4) NOT NULL,
	"amount" numeric(19, 4) NOT NULL,
	"discount_type" "discount_type",
	"discount_value" numeric(19, 4),
	"tax_rate" numeric(8, 4) DEFAULT '0',
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"subscription_id" uuid NOT NULL,
	"metric_name" varchar(255) NOT NULL,
	"quantity" numeric(19, 6) NOT NULL,
	"period_start" timestamp with time zone NOT NULL,
	"period_end" timestamp with time zone NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"subscription_number" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"status" "subscription_status" DEFAULT 'trialing' NOT NULL,
	"currency" "currency" DEFAULT 'USD' NOT NULL,
	"recurring_amount" numeric(19, 4) NOT NULL,
	"billing_cycle" "billing_cycle" DEFAULT 'monthly' NOT NULL,
	"billing_interval" integer DEFAULT 1 NOT NULL,
	"trial_start" timestamp with time zone,
	"trial_end" timestamp with time zone,
	"current_period_start" timestamp with time zone NOT NULL,
	"current_period_end" timestamp with time zone NOT NULL,
	"next_billing_date" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"cancel_reason" text,
	"notes" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reconciliation_batches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"batch_number" varchar(50) NOT NULL,
	"status" "reconciliation_status" DEFAULT 'pending' NOT NULL,
	"source" varchar(100) NOT NULL,
	"total_transactions" integer DEFAULT 0 NOT NULL,
	"matched_count" integer DEFAULT 0 NOT NULL,
	"unmatched_count" integer DEFAULT 0 NOT NULL,
	"total_amount" numeric(19, 4) DEFAULT '0' NOT NULL,
	"matched_amount" numeric(19, 4) DEFAULT '0' NOT NULL,
	"unmatched_amount" numeric(19, 4) DEFAULT '0' NOT NULL,
	"currency" "currency" DEFAULT 'USD' NOT NULL,
	"statement_date" timestamp with time zone,
	"notes" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reconciliation_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"batch_id" uuid NOT NULL,
	"payment_id" uuid,
	"status" "reconciliation_status" DEFAULT 'pending' NOT NULL,
	"transaction_date" timestamp with time zone NOT NULL,
	"transaction_reference" varchar(255),
	"transaction_description" text,
	"transaction_amount" numeric(19, 4) NOT NULL,
	"payment_amount" numeric(19, 4),
	"difference" numeric(19, 4),
	"notes" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tax_exemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"exemption_type" varchar(50) NOT NULL,
	"exemption_number" varchar(255),
	"valid_from" timestamp with time zone NOT NULL,
	"valid_to" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tax_rates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(50) NOT NULL,
	"type" "tax_rate_type" DEFAULT 'percentage' NOT NULL,
	"rate" numeric(8, 4) NOT NULL,
	"category" "tax_category" DEFAULT 'standard' NOT NULL,
	"jurisdiction" varchar(255),
	"country" varchar(2),
	"region" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"valid_from" timestamp with time zone DEFAULT now() NOT NULL,
	"valid_to" timestamp with time zone,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tax_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"tax_rate_id" uuid NOT NULL,
	"product_category" varchar(255),
	"customer_type" varchar(50),
	"shipping_country" varchar(2),
	"shipping_region" varchar(100),
	"priority" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ledger_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "ledger_account_type" NOT NULL,
	"parent_account_id" uuid,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ledger_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"entry_type" "ledger_entry_type" NOT NULL,
	"amount" numeric(19, 4) NOT NULL,
	"currency" "currency" DEFAULT 'USD' NOT NULL,
	"exchange_rate" numeric(19, 8) DEFAULT '1',
	"debit_amount" numeric(19, 4) DEFAULT '0' NOT NULL,
	"credit_amount" numeric(19, 4) DEFAULT '0' NOT NULL,
	"description" text NOT NULL,
	"reference_type" varchar(100),
	"reference_id" varchar(255),
	"period_id" uuid,
	"is_reversed" boolean DEFAULT false NOT NULL,
	"reversed_by_entry_id" uuid,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ledger_journal_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"entry_number" varchar(50) NOT NULL,
	"description" text NOT NULL,
	"reference_type" varchar(100),
	"reference_id" varchar(255),
	"posted_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_reversed" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ledger_periods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"status" "period_status" DEFAULT 'current' NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"closed_at" timestamp with time zone,
	"closed_by" varchar(255),
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ar_aging" ADD CONSTRAINT "ar_aging_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_flow_forecast" ADD CONSTRAINT "cash_flow_forecast_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_metrics" ADD CONSTRAINT "customer_metrics_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revenue_metrics" ADD CONSTRAINT "revenue_metrics_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compliance_records" ADD CONSTRAINT "compliance_records_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_cases" ADD CONSTRAINT "collection_cases_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_cases" ADD CONSTRAINT "collection_cases_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_events" ADD CONSTRAINT "collection_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_events" ADD CONSTRAINT "collection_events_case_id_collection_cases_id_fk" FOREIGN KEY ("case_id") REFERENCES "public"."collection_cases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_rules" ADD CONSTRAINT "collection_rules_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_line_items" ADD CONSTRAINT "payment_line_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_line_items" ADD CONSTRAINT "payment_line_items_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_line_items" ADD CONSTRAINT "payment_line_items_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_refunds" ADD CONSTRAINT "payment_refunds_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_refunds" ADD CONSTRAINT "payment_refunds_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_items" ADD CONSTRAINT "subscription_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_items" ADD CONSTRAINT "subscription_items_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_usage" ADD CONSTRAINT "subscription_usage_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_usage" ADD CONSTRAINT "subscription_usage_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reconciliation_batches" ADD CONSTRAINT "reconciliation_batches_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reconciliation_items" ADD CONSTRAINT "reconciliation_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reconciliation_items" ADD CONSTRAINT "reconciliation_items_batch_id_reconciliation_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."reconciliation_batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reconciliation_items" ADD CONSTRAINT "reconciliation_items_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_exemptions" ADD CONSTRAINT "tax_exemptions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_rates" ADD CONSTRAINT "tax_rates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_rules" ADD CONSTRAINT "tax_rules_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tax_rules" ADD CONSTRAINT "tax_rules_tax_rate_id_tax_rates_id_fk" FOREIGN KEY ("tax_rate_id") REFERENCES "public"."tax_rates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_accounts" ADD CONSTRAINT "ledger_accounts_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_account_id_ledger_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."ledger_accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_journal_entries" ADD CONSTRAINT "ledger_journal_entries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledger_periods" ADD CONSTRAINT "ledger_periods_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ar_aging_tenant_id_idx" ON "ar_aging" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "ar_aging_customer_id_idx" ON "ar_aging" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "ar_aging_tenant_snapshot_date_idx" ON "ar_aging" USING btree ("tenant_id","snapshot_date");--> statement-breakpoint
CREATE INDEX "ar_aging_tenant_customer_snapshot_idx" ON "ar_aging" USING btree ("tenant_id","customer_id","snapshot_date");--> statement-breakpoint
CREATE INDEX "cash_flow_forecast_tenant_id_idx" ON "cash_flow_forecast" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cash_flow_forecast_tenant_forecast_date_idx" ON "cash_flow_forecast" USING btree ("tenant_id","forecast_date");--> statement-breakpoint
CREATE INDEX "customer_metrics_tenant_id_idx" ON "customer_metrics" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "customer_metrics_customer_id_idx" ON "customer_metrics" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "customer_metrics_tenant_customer_idx" ON "customer_metrics" USING btree ("tenant_id","customer_id");--> statement-breakpoint
CREATE INDEX "customer_metrics_tenant_risk_level_idx" ON "customer_metrics" USING btree ("tenant_id","risk_level");--> statement-breakpoint
CREATE INDEX "revenue_metrics_tenant_id_idx" ON "revenue_metrics" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "revenue_metrics_tenant_period_idx" ON "revenue_metrics" USING btree ("tenant_id","period_start","period_end");--> statement-breakpoint
CREATE INDEX "revenue_metrics_tenant_created_at_idx" ON "revenue_metrics" USING btree ("tenant_id","created_at");--> statement-breakpoint
CREATE INDEX "api_keys_tenant_id_idx" ON "api_keys" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "api_keys_prefix_idx" ON "api_keys" USING btree ("prefix");--> statement-breakpoint
CREATE INDEX "api_keys_tenant_name_idx" ON "api_keys" USING btree ("tenant_id","name");--> statement-breakpoint
CREATE INDEX "audit_logs_tenant_id_idx" ON "audit_logs" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_logs_action_idx" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_logs_resource_type_idx" ON "audit_logs" USING btree ("resource_type");--> statement-breakpoint
CREATE INDEX "audit_logs_resource_id_idx" ON "audit_logs" USING btree ("resource_id");--> statement-breakpoint
CREATE INDEX "audit_logs_tenant_created_at_idx" ON "audit_logs" USING btree ("tenant_id","created_at");--> statement-breakpoint
CREATE INDEX "audit_logs_tenant_action_resource_idx" ON "audit_logs" USING btree ("tenant_id","action","resource_type");--> statement-breakpoint
CREATE INDEX "audit_logs_tenant_user_created_at_idx" ON "audit_logs" USING btree ("tenant_id","user_id","created_at");--> statement-breakpoint
CREATE INDEX "compliance_records_tenant_id_idx" ON "compliance_records" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "compliance_records_tenant_record_type_idx" ON "compliance_records" USING btree ("tenant_id","record_type");--> statement-breakpoint
CREATE INDEX "compliance_records_tenant_status_idx" ON "compliance_records" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "compliance_records_tenant_due_date_idx" ON "compliance_records" USING btree ("tenant_id","due_date");--> statement-breakpoint
CREATE INDEX "compliance_records_tenant_resource_idx" ON "compliance_records" USING btree ("tenant_id","record_type","resource_id");--> statement-breakpoint
CREATE INDEX "collection_cases_tenant_id_idx" ON "collection_cases" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "collection_cases_customer_id_idx" ON "collection_cases" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "collection_cases_tenant_status_idx" ON "collection_cases" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "collection_cases_tenant_customer_idx" ON "collection_cases" USING btree ("tenant_id","customer_id");--> statement-breakpoint
CREATE INDEX "collection_cases_tenant_overdue_days_idx" ON "collection_cases" USING btree ("tenant_id","overdue_days");--> statement-breakpoint
CREATE INDEX "collection_events_tenant_id_idx" ON "collection_events" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "collection_events_case_id_idx" ON "collection_events" USING btree ("case_id");--> statement-breakpoint
CREATE INDEX "collection_events_tenant_case_idx" ON "collection_events" USING btree ("tenant_id","case_id");--> statement-breakpoint
CREATE INDEX "collection_events_tenant_action_idx" ON "collection_events" USING btree ("tenant_id","action");--> statement-breakpoint
CREATE INDEX "collection_events_tenant_created_at_idx" ON "collection_events" USING btree ("tenant_id","created_at");--> statement-breakpoint
CREATE INDEX "collection_rules_tenant_id_idx" ON "collection_rules" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "collection_rules_tenant_active_idx" ON "collection_rules" USING btree ("tenant_id","is_active");--> statement-breakpoint
CREATE INDEX "collection_rules_tenant_overdue_days_idx" ON "collection_rules" USING btree ("tenant_id","overdue_days_threshold");--> statement-breakpoint
CREATE INDEX "customers_tenant_id_idx" ON "customers" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "customers_tenant_external_id_idx" ON "customers" USING btree ("tenant_id","external_id");--> statement-breakpoint
CREATE INDEX "customers_tenant_email_idx" ON "customers" USING btree ("tenant_id","email");--> statement-breakpoint
CREATE INDEX "customers_tenant_name_idx" ON "customers" USING btree ("tenant_id","name");--> statement-breakpoint
CREATE INDEX "customers_tenant_collection_status_idx" ON "customers" USING btree ("tenant_id","collection_status");--> statement-breakpoint
CREATE INDEX "customers_tenant_active_idx" ON "customers" USING btree ("tenant_id","is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "tenants_slug_idx" ON "tenants" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "tenants_status_idx" ON "tenants" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tenants_created_at_idx" ON "tenants" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_clerk_user_id_idx" ON "users" USING btree ("clerk_user_id");--> statement-breakpoint
CREATE INDEX "users_tenant_id_idx" ON "users" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_tenant_role_idx" ON "users" USING btree ("tenant_id","role");--> statement-breakpoint
CREATE INDEX "invoice_items_tenant_id_idx" ON "invoice_items" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "invoice_items_invoice_id_idx" ON "invoice_items" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "invoice_items_tenant_invoice_idx" ON "invoice_items" USING btree ("tenant_id","invoice_id");--> statement-breakpoint
CREATE INDEX "invoice_items_line_item_type_idx" ON "invoice_items" USING btree ("line_item_type");--> statement-breakpoint
CREATE INDEX "invoices_tenant_id_idx" ON "invoices" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "invoices_customer_id_idx" ON "invoices" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "invoices_tenant_status_idx" ON "invoices" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "invoices_tenant_due_date_idx" ON "invoices" USING btree ("tenant_id","due_date");--> statement-breakpoint
CREATE INDEX "invoices_tenant_issue_date_idx" ON "invoices" USING btree ("tenant_id","issue_date");--> statement-breakpoint
CREATE INDEX "invoices_tenant_customer_status_idx" ON "invoices" USING btree ("tenant_id","customer_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_tenant_number_idx" ON "invoices" USING btree ("tenant_id","invoice_number");--> statement-breakpoint
CREATE INDEX "invoices_tenant_created_at_idx" ON "invoices" USING btree ("tenant_id","created_at");--> statement-breakpoint
CREATE INDEX "payment_line_items_tenant_id_idx" ON "payment_line_items" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "payment_line_items_payment_id_idx" ON "payment_line_items" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "payment_line_items_invoice_id_idx" ON "payment_line_items" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "payment_line_items_tenant_payment_idx" ON "payment_line_items" USING btree ("tenant_id","payment_id");--> statement-breakpoint
CREATE INDEX "payment_line_items_tenant_invoice_idx" ON "payment_line_items" USING btree ("tenant_id","invoice_id");--> statement-breakpoint
CREATE INDEX "payment_refunds_tenant_id_idx" ON "payment_refunds" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "payment_refunds_payment_id_idx" ON "payment_refunds" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "payment_refunds_tenant_payment_idx" ON "payment_refunds" USING btree ("tenant_id","payment_id");--> statement-breakpoint
CREATE INDEX "payments_tenant_id_idx" ON "payments" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "payments_customer_id_idx" ON "payments" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "payments_tenant_status_idx" ON "payments" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "payments_tenant_payment_method_idx" ON "payments" USING btree ("tenant_id","payment_method");--> statement-breakpoint
CREATE INDEX "payments_tenant_received_at_idx" ON "payments" USING btree ("tenant_id","received_at");--> statement-breakpoint
CREATE UNIQUE INDEX "payments_tenant_number_idx" ON "payments" USING btree ("tenant_id","payment_number");--> statement-breakpoint
CREATE INDEX "payments_tenant_reconciliation_status_idx" ON "payments" USING btree ("tenant_id","reconciliation_status");--> statement-breakpoint
CREATE INDEX "payments_tenant_customer_status_idx" ON "payments" USING btree ("tenant_id","customer_id","status");--> statement-breakpoint
CREATE INDEX "subscription_items_tenant_id_idx" ON "subscription_items" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "subscription_items_subscription_id_idx" ON "subscription_items" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "subscription_items_tenant_subscription_idx" ON "subscription_items" USING btree ("tenant_id","subscription_id");--> statement-breakpoint
CREATE INDEX "subscription_usage_tenant_id_idx" ON "subscription_usage" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "subscription_usage_subscription_id_idx" ON "subscription_usage" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "subscription_usage_tenant_subscription_period_idx" ON "subscription_usage" USING btree ("tenant_id","subscription_id","period_start");--> statement-breakpoint
CREATE INDEX "subscriptions_tenant_id_idx" ON "subscriptions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "subscriptions_customer_id_idx" ON "subscriptions" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "subscriptions_tenant_status_idx" ON "subscriptions" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "subscriptions_tenant_next_billing_date_idx" ON "subscriptions" USING btree ("tenant_id","next_billing_date");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_tenant_number_idx" ON "subscriptions" USING btree ("tenant_id","subscription_number");--> statement-breakpoint
CREATE INDEX "subscriptions_tenant_customer_status_idx" ON "subscriptions" USING btree ("tenant_id","customer_id","status");--> statement-breakpoint
CREATE INDEX "reconciliation_batches_tenant_id_idx" ON "reconciliation_batches" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "reconciliation_batches_tenant_status_idx" ON "reconciliation_batches" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "reconciliation_batches_tenant_number_idx" ON "reconciliation_batches" USING btree ("tenant_id","batch_number");--> statement-breakpoint
CREATE INDEX "reconciliation_batches_tenant_statement_date_idx" ON "reconciliation_batches" USING btree ("tenant_id","statement_date");--> statement-breakpoint
CREATE INDEX "reconciliation_items_tenant_id_idx" ON "reconciliation_items" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "reconciliation_items_batch_id_idx" ON "reconciliation_items" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "reconciliation_items_payment_id_idx" ON "reconciliation_items" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "reconciliation_items_tenant_batch_idx" ON "reconciliation_items" USING btree ("tenant_id","batch_id");--> statement-breakpoint
CREATE INDEX "reconciliation_items_tenant_status_idx" ON "reconciliation_items" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "tax_exemptions_tenant_id_idx" ON "tax_exemptions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "tax_exemptions_customer_id_idx" ON "tax_exemptions" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "tax_exemptions_tenant_customer_idx" ON "tax_exemptions" USING btree ("tenant_id","customer_id");--> statement-breakpoint
CREATE INDEX "tax_exemptions_tenant_active_idx" ON "tax_exemptions" USING btree ("tenant_id","is_active");--> statement-breakpoint
CREATE INDEX "tax_rates_tenant_id_idx" ON "tax_rates" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tax_rates_tenant_code_idx" ON "tax_rates" USING btree ("tenant_id","code");--> statement-breakpoint
CREATE INDEX "tax_rates_tenant_active_idx" ON "tax_rates" USING btree ("tenant_id","is_active");--> statement-breakpoint
CREATE INDEX "tax_rates_tenant_jurisdiction_idx" ON "tax_rates" USING btree ("tenant_id","jurisdiction");--> statement-breakpoint
CREATE INDEX "tax_rates_valid_from_to_idx" ON "tax_rates" USING btree ("valid_from","valid_to");--> statement-breakpoint
CREATE INDEX "tax_rules_tenant_id_idx" ON "tax_rules" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "tax_rules_tax_rate_id_idx" ON "tax_rules" USING btree ("tax_rate_id");--> statement-breakpoint
CREATE INDEX "tax_rules_tenant_product_category_idx" ON "tax_rules" USING btree ("tenant_id","product_category");--> statement-breakpoint
CREATE INDEX "tax_rules_tenant_active_idx" ON "tax_rules" USING btree ("tenant_id","is_active");--> statement-breakpoint
CREATE INDEX "ledger_accounts_tenant_id_idx" ON "ledger_accounts" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ledger_accounts_tenant_code_idx" ON "ledger_accounts" USING btree ("tenant_id","code");--> statement-breakpoint
CREATE INDEX "ledger_accounts_tenant_type_idx" ON "ledger_accounts" USING btree ("tenant_id","type");--> statement-breakpoint
CREATE INDEX "ledger_accounts_tenant_active_idx" ON "ledger_accounts" USING btree ("tenant_id","is_active");--> statement-breakpoint
CREATE INDEX "ledger_accounts_parent_account_id_idx" ON "ledger_accounts" USING btree ("parent_account_id");--> statement-breakpoint
CREATE INDEX "ledger_entries_tenant_id_idx" ON "ledger_entries" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "ledger_entries_account_id_idx" ON "ledger_entries" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "ledger_entries_tenant_account_idx" ON "ledger_entries" USING btree ("tenant_id","account_id");--> statement-breakpoint
CREATE INDEX "ledger_entries_tenant_entry_type_idx" ON "ledger_entries" USING btree ("tenant_id","entry_type");--> statement-breakpoint
CREATE INDEX "ledger_entries_reference_idx" ON "ledger_entries" USING btree ("reference_type","reference_id");--> statement-breakpoint
CREATE INDEX "ledger_entries_tenant_created_at_idx" ON "ledger_entries" USING btree ("tenant_id","created_at");--> statement-breakpoint
CREATE INDEX "ledger_entries_period_id_idx" ON "ledger_entries" USING btree ("period_id");--> statement-breakpoint
CREATE INDEX "ledger_entries_tenant_account_created_at_idx" ON "ledger_entries" USING btree ("tenant_id","account_id","created_at");--> statement-breakpoint
CREATE INDEX "ledger_journal_entries_tenant_id_idx" ON "ledger_journal_entries" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ledger_journal_entries_tenant_number_idx" ON "ledger_journal_entries" USING btree ("tenant_id","entry_number");--> statement-breakpoint
CREATE INDEX "ledger_journal_entries_tenant_posted_at_idx" ON "ledger_journal_entries" USING btree ("tenant_id","posted_at");--> statement-breakpoint
CREATE INDEX "ledger_journal_entries_reference_idx" ON "ledger_journal_entries" USING btree ("reference_type","reference_id");--> statement-breakpoint
CREATE INDEX "ledger_periods_tenant_id_idx" ON "ledger_periods" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "ledger_periods_tenant_status_idx" ON "ledger_periods" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "ledger_periods_tenant_start_date_idx" ON "ledger_periods" USING btree ("tenant_id","start_date");--> statement-breakpoint
CREATE UNIQUE INDEX "ledger_periods_tenant_name_idx" ON "ledger_periods" USING btree ("tenant_id","name");