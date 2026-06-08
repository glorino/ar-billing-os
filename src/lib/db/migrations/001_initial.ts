import { sql } from 'drizzle-orm';

export async function up(db: any) {
  await db.execute(sql`
    CREATE TYPE tenant_status AS ENUM ('active', 'suspended', 'cancelled', 'trial');
    CREATE TYPE billing_cycle AS ENUM ('monthly', 'quarterly', 'semi_annual', 'annual', 'custom');
    CREATE TYPE invoice_status AS ENUM ('draft', 'pending', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'cancelled', 'written_off');
    CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded', 'disputed');
    CREATE TYPE payment_method AS ENUM ('credit_card', 'debit_card', 'ach_transfer', 'wire_transfer', 'check', 'cash', 'digital_wallet', 'other');
    CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'paused', 'cancelled', 'expired');
    CREATE TYPE collection_status AS ENUM ('none', 'reminder', 'final_notice', 'collection_agency', 'legal', 'resolved');
    CREATE TYPE collection_action AS ENUM ('email_reminder', 'phone_call', 'letter_sent', 'final_demand', 'agency_referral', 'legal_action', 'payment_plan', 'write_off');
    CREATE TYPE reconciliation_status AS ENUM ('pending', 'matched', 'partial', 'unmatched', 'cancelled');
    CREATE TYPE tax_rate_type AS ENUM ('percentage', 'fixed');
    CREATE TYPE tax_category AS ENUM ('standard', 'reduced', 'exempt', 'zero_rated');
    CREATE TYPE ledger_entry_type AS ENUM ('debit', 'credit');
    CREATE TYPE ledger_account_type AS ENUM ('asset', 'liability', 'equity', 'revenue', 'expense');
    CREATE TYPE line_item_type AS ENUM ('subscription', 'usage', 'one_time', 'fee', 'discount', 'tax', 'credit');
    CREATE TYPE discount_type AS ENUM ('percentage', 'fixed_amount');
    CREATE TYPE currency AS ENUM ('USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF');
    CREATE TYPE period_status AS ENUM ('current', 'closed', 'reconciled');
  `);

  await db.execute(sql`
    CREATE TABLE tenants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(100) NOT NULL UNIQUE,
      status tenant_status NOT NULL DEFAULT 'trial',
      domain VARCHAR(255),
      logo_url TEXT,
      default_currency currency NOT NULL DEFAULT 'USD',
      default_billing_cycle billing_cycle NOT NULL DEFAULT 'monthly',
      tax_id VARCHAR(50),
      registration_number VARCHAR(50),
      contact_email VARCHAR(255) NOT NULL,
      contact_phone VARCHAR(50),
      address_line1 VARCHAR(255),
      address_line2 VARCHAR(255),
      city VARCHAR(100),
      state VARCHAR(100),
      postal_code VARCHAR(20),
      country VARCHAR(2) DEFAULT 'US',
      settings JSONB DEFAULT '{}',
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX tenants_status_idx ON tenants(status);
    CREATE INDEX tenants_created_at_idx ON tenants(created_at);
  `);

  await db.execute(sql`
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      clerk_user_id VARCHAR(255) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      full_name VARCHAR(200),
      avatar_url TEXT,
      role VARCHAR(50) NOT NULL DEFAULT 'member',
      permissions JSONB DEFAULT '[]',
      is_active BOOLEAN NOT NULL DEFAULT true,
      last_login_at TIMESTAMPTZ,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX users_tenant_id_idx ON users(tenant_id);
    CREATE INDEX users_email_idx ON users(email);
    CREATE INDEX users_tenant_role_idx ON users(tenant_id, role);
  `);

  await db.execute(sql`
    CREATE TABLE customers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      external_id VARCHAR(255),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(50),
      company VARCHAR(255),
      tax_id VARCHAR(50),
      currency currency NOT NULL DEFAULT 'USD',
      credit_limit DECIMAL(19,4) DEFAULT '0',
      outstanding_balance DECIMAL(19,4) NOT NULL DEFAULT '0',
      collection_status collection_status NOT NULL DEFAULT 'none',
      payment_terms_days INTEGER NOT NULL DEFAULT 30,
      auto_pay_enabled BOOLEAN NOT NULL DEFAULT false,
      billing_address_line1 VARCHAR(255),
      billing_address_line2 VARCHAR(255),
      billing_city VARCHAR(100),
      billing_state VARCHAR(100),
      billing_postal_code VARCHAR(20),
      billing_country VARCHAR(2),
      shipping_address_line1 VARCHAR(255),
      shipping_address_line2 VARCHAR(255),
      shipping_city VARCHAR(100),
      shipping_state VARCHAR(100),
      shipping_postal_code VARCHAR(20),
      shipping_country VARCHAR(2),
      metadata JSONB DEFAULT '{}',
      tags JSONB DEFAULT '[]',
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX customers_tenant_id_idx ON customers(tenant_id);
    CREATE UNIQUE INDEX customers_tenant_external_id_idx ON customers(tenant_id, external_id) WHERE external_id IS NOT NULL;
    CREATE INDEX customers_tenant_email_idx ON customers(tenant_id, email);
    CREATE INDEX customers_tenant_name_idx ON customers(tenant_id, name);
    CREATE INDEX customers_tenant_collection_status_idx ON customers(tenant_id, collection_status);
    CREATE INDEX customers_tenant_active_idx ON customers(tenant_id, is_active);
  `);

  await db.execute(sql`
    CREATE TABLE invoices (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
      invoice_number VARCHAR(50) NOT NULL,
      status invoice_status NOT NULL DEFAULT 'draft',
      currency currency NOT NULL DEFAULT 'USD',
      subtotal DECIMAL(19,4) NOT NULL DEFAULT '0',
      tax_amount DECIMAL(19,4) NOT NULL DEFAULT '0',
      discount_amount DECIMAL(19,4) NOT NULL DEFAULT '0',
      total DECIMAL(19,4) NOT NULL DEFAULT '0',
      amount_paid DECIMAL(19,4) NOT NULL DEFAULT '0',
      amount_due DECIMAL(19,4) NOT NULL DEFAULT '0',
      issue_date TIMESTAMPTZ NOT NULL,
      due_date TIMESTAMPTZ NOT NULL,
      paid_at TIMESTAMPTZ,
      voided_at TIMESTAMPTZ,
      voided_reason TEXT,
      notes TEXT,
      terms TEXT,
      memo TEXT,
      billing_address JSONB,
      shipping_address JSONB,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX invoices_tenant_id_idx ON invoices(tenant_id);
    CREATE INDEX invoices_customer_id_idx ON invoices(customer_id);
    CREATE INDEX invoices_tenant_status_idx ON invoices(tenant_id, status);
    CREATE INDEX invoices_tenant_due_date_idx ON invoices(tenant_id, due_date);
    CREATE INDEX invoices_tenant_issue_date_idx ON invoices(tenant_id, issue_date);
    CREATE INDEX invoices_tenant_customer_status_idx ON invoices(tenant_id, customer_id, status);
    CREATE UNIQUE INDEX invoices_tenant_number_idx ON invoices(tenant_id, invoice_number);
    CREATE INDEX invoices_tenant_created_at_idx ON invoices(tenant_id, created_at);
  `);

  await db.execute(sql`
    CREATE TABLE invoice_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
      line_item_type line_item_type NOT NULL,
      description VARCHAR(500) NOT NULL,
      quantity DECIMAL(19,6) NOT NULL DEFAULT '1',
      unit_price DECIMAL(19,4) NOT NULL,
      amount DECIMAL(19,4) NOT NULL,
      discount_type discount_type,
      discount_value DECIMAL(19,4),
      discount_amount DECIMAL(19,4) DEFAULT '0',
      tax_rate DECIMAL(8,4) DEFAULT '0',
      tax_amount DECIMAL(19,4) DEFAULT '0',
      period_start TIMESTAMPTZ,
      period_end TIMESTAMPTZ,
      metadata JSONB DEFAULT '{}',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX invoice_items_tenant_id_idx ON invoice_items(tenant_id);
    CREATE INDEX invoice_items_invoice_id_idx ON invoice_items(invoice_id);
    CREATE INDEX invoice_items_tenant_invoice_idx ON invoice_items(tenant_id, invoice_id);
    CREATE INDEX invoice_items_line_item_type_idx ON invoice_items(line_item_type);
  `);

  await db.execute(sql`
    CREATE TABLE payments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
      payment_number VARCHAR(50) NOT NULL,
      status payment_status NOT NULL DEFAULT 'pending',
      payment_method payment_method NOT NULL,
      currency currency NOT NULL DEFAULT 'USD',
      amount DECIMAL(19,4) NOT NULL,
      amount_refunded DECIMAL(19,4) NOT NULL DEFAULT '0',
      net_amount DECIMAL(19,4) NOT NULL,
      exchange_rate DECIMAL(19,8) DEFAULT '1',
      reference_number VARCHAR(255),
      transaction_id VARCHAR(255),
      gateway_response JSONB,
      failure_reason TEXT,
      notes TEXT,
      received_at TIMESTAMPTZ,
      processed_at TIMESTAMPTZ,
      reconciled_at TIMESTAMPTZ,
      reconciliation_status reconciliation_status NOT NULL DEFAULT 'pending',
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX payments_tenant_id_idx ON payments(tenant_id);
    CREATE INDEX payments_customer_id_idx ON payments(customer_id);
    CREATE INDEX payments_tenant_status_idx ON payments(tenant_id, status);
    CREATE INDEX payments_tenant_payment_method_idx ON payments(tenant_id, payment_method);
    CREATE INDEX payments_tenant_received_at_idx ON payments(tenant_id, received_at);
    CREATE UNIQUE INDEX payments_tenant_number_idx ON payments(tenant_id, payment_number);
    CREATE INDEX payments_tenant_reconciliation_status_idx ON payments(tenant_id, reconciliation_status);
    CREATE INDEX payments_tenant_customer_status_idx ON payments(tenant_id, customer_id, status);
  `);

  await db.execute(sql`
    CREATE TABLE payment_line_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
      invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
      amount DECIMAL(19,4) NOT NULL,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX payment_line_items_tenant_id_idx ON payment_line_items(tenant_id);
    CREATE INDEX payment_line_items_payment_id_idx ON payment_line_items(payment_id);
    CREATE INDEX payment_line_items_invoice_id_idx ON payment_line_items(invoice_id);
    CREATE INDEX payment_line_items_tenant_payment_idx ON payment_line_items(tenant_id, payment_id);
    CREATE INDEX payment_line_items_tenant_invoice_idx ON payment_line_items(tenant_id, invoice_id);
  `);

  await db.execute(sql`
    CREATE TABLE payment_refunds (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
      amount DECIMAL(19,4) NOT NULL,
      reason TEXT,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      processed_at TIMESTAMPTZ,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX payment_refunds_tenant_id_idx ON payment_refunds(tenant_id);
    CREATE INDEX payment_refunds_payment_id_idx ON payment_refunds(payment_id);
    CREATE INDEX payment_refunds_tenant_payment_idx ON payment_refunds(tenant_id, payment_id);
  `);

  await db.execute(sql`
    CREATE TABLE subscriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
      subscription_number VARCHAR(50) NOT NULL,
      name VARCHAR(255) NOT NULL,
      status subscription_status NOT NULL DEFAULT 'trialing',
      currency currency NOT NULL DEFAULT 'USD',
      recurring_amount DECIMAL(19,4) NOT NULL,
      billing_cycle billing_cycle NOT NULL DEFAULT 'monthly',
      billing_interval INTEGER NOT NULL DEFAULT 1,
      trial_start TIMESTAMPTZ,
      trial_end TIMESTAMPTZ,
      current_period_start TIMESTAMPTZ NOT NULL,
      current_period_end TIMESTAMPTZ NOT NULL,
      next_billing_date TIMESTAMPTZ,
      cancelled_at TIMESTAMPTZ,
      cancel_reason TEXT,
      notes TEXT,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX subscriptions_tenant_id_idx ON subscriptions(tenant_id);
    CREATE INDEX subscriptions_customer_id_idx ON subscriptions(customer_id);
    CREATE INDEX subscriptions_tenant_status_idx ON subscriptions(tenant_id, status);
    CREATE INDEX subscriptions_tenant_next_billing_date_idx ON subscriptions(tenant_id, next_billing_date);
    CREATE UNIQUE INDEX subscriptions_tenant_number_idx ON subscriptions(tenant_id, subscription_number);
    CREATE INDEX subscriptions_tenant_customer_status_idx ON subscriptions(tenant_id, customer_id, status);
  `);

  await db.execute(sql`
    CREATE TABLE subscription_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
      line_item_type line_item_type NOT NULL,
      description VARCHAR(500) NOT NULL,
      quantity DECIMAL(19,6) NOT NULL DEFAULT '1',
      unit_price DECIMAL(19,4) NOT NULL,
      amount DECIMAL(19,4) NOT NULL,
      discount_type discount_type,
      discount_value DECIMAL(19,4),
      tax_rate DECIMAL(8,4) DEFAULT '0',
      is_active BOOLEAN NOT NULL DEFAULT true,
      metadata JSONB DEFAULT '{}',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX subscription_items_tenant_id_idx ON subscription_items(tenant_id);
    CREATE INDEX subscription_items_subscription_id_idx ON subscription_items(subscription_id);
    CREATE INDEX subscription_items_tenant_subscription_idx ON subscription_items(tenant_id, subscription_id);
  `);

  await db.execute(sql`
    CREATE TABLE subscription_usage (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
      metric_name VARCHAR(255) NOT NULL,
      quantity DECIMAL(19,6) NOT NULL,
      period_start TIMESTAMPTZ NOT NULL,
      period_end TIMESTAMPTZ NOT NULL,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX subscription_usage_tenant_id_idx ON subscription_usage(tenant_id);
    CREATE INDEX subscription_usage_subscription_id_idx ON subscription_usage(subscription_id);
    CREATE INDEX subscription_usage_tenant_subscription_period_idx ON subscription_usage(tenant_id, subscription_id, period_start);
  `);

  await db.execute(sql`
    CREATE TABLE collection_cases (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
      case_number VARCHAR(50) NOT NULL,
      status collection_status NOT NULL DEFAULT 'reminder',
      total_outstanding DECIMAL(19,4) NOT NULL DEFAULT '0',
      overdue_days INTEGER NOT NULL DEFAULT 0,
      assigned_to VARCHAR(255),
      agency_name VARCHAR(255),
      agency_reference VARCHAR(255),
      payment_plan_id VARCHAR(255),
      notes TEXT,
      metadata JSONB DEFAULT '{}',
      opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      resolved_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX collection_cases_tenant_id_idx ON collection_cases(tenant_id);
    CREATE INDEX collection_cases_customer_id_idx ON collection_cases(customer_id);
    CREATE INDEX collection_cases_tenant_status_idx ON collection_cases(tenant_id, status);
    CREATE INDEX collection_cases_tenant_customer_idx ON collection_cases(tenant_id, customer_id);
    CREATE INDEX collection_cases_tenant_overdue_days_idx ON collection_cases(tenant_id, overdue_days);
  `);

  await db.execute(sql`
    CREATE TABLE collection_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      case_id UUID NOT NULL REFERENCES collection_cases(id) ON DELETE CASCADE,
      action collection_action NOT NULL,
      description TEXT NOT NULL,
      outcome TEXT,
      performed_by VARCHAR(255),
      scheduled_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX collection_events_tenant_id_idx ON collection_events(tenant_id);
    CREATE INDEX collection_events_case_id_idx ON collection_events(case_id);
    CREATE INDEX collection_events_tenant_case_idx ON collection_events(tenant_id, case_id);
    CREATE INDEX collection_events_tenant_action_idx ON collection_events(tenant_id, action);
    CREATE INDEX collection_events_tenant_created_at_idx ON collection_events(tenant_id, created_at);
  `);

  await db.execute(sql`
    CREATE TABLE collection_rules (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      overdue_days_threshold INTEGER NOT NULL,
      action collection_action NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT true,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX collection_rules_tenant_id_idx ON collection_rules(tenant_id);
    CREATE INDEX collection_rules_tenant_active_idx ON collection_rules(tenant_id, is_active);
    CREATE INDEX collection_rules_tenant_overdue_days_idx ON collection_rules(tenant_id, overdue_days_threshold);
  `);

  await db.execute(sql`
    CREATE TABLE reconciliation_batches (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      batch_number VARCHAR(50) NOT NULL,
      status reconciliation_status NOT NULL DEFAULT 'pending',
      source VARCHAR(100) NOT NULL,
      total_transactions INTEGER NOT NULL DEFAULT 0,
      matched_count INTEGER NOT NULL DEFAULT 0,
      unmatched_count INTEGER NOT NULL DEFAULT 0,
      total_amount DECIMAL(19,4) NOT NULL DEFAULT '0',
      matched_amount DECIMAL(19,4) NOT NULL DEFAULT '0',
      unmatched_amount DECIMAL(19,4) NOT NULL DEFAULT '0',
      currency currency NOT NULL DEFAULT 'USD',
      statement_date TIMESTAMPTZ,
      notes TEXT,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX reconciliation_batches_tenant_id_idx ON reconciliation_batches(tenant_id);
    CREATE INDEX reconciliation_batches_tenant_status_idx ON reconciliation_batches(tenant_id, status);
    CREATE UNIQUE INDEX reconciliation_batches_tenant_number_idx ON reconciliation_batches(tenant_id, batch_number);
    CREATE INDEX reconciliation_batches_tenant_statement_date_idx ON reconciliation_batches(tenant_id, statement_date);
  `);

  await db.execute(sql`
    CREATE TABLE reconciliation_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      batch_id UUID NOT NULL REFERENCES reconciliation_batches(id) ON DELETE CASCADE,
      payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
      status reconciliation_status NOT NULL DEFAULT 'pending',
      transaction_date TIMESTAMPTZ NOT NULL,
      transaction_reference VARCHAR(255),
      transaction_description TEXT,
      transaction_amount DECIMAL(19,4) NOT NULL,
      payment_amount DECIMAL(19,4),
      difference DECIMAL(19,4),
      notes TEXT,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX reconciliation_items_tenant_id_idx ON reconciliation_items(tenant_id);
    CREATE INDEX reconciliation_items_batch_id_idx ON reconciliation_items(batch_id);
    CREATE INDEX reconciliation_items_payment_id_idx ON reconciliation_items(payment_id);
    CREATE INDEX reconciliation_items_tenant_batch_idx ON reconciliation_items(tenant_id, batch_id);
    CREATE INDEX reconciliation_items_tenant_status_idx ON reconciliation_items(tenant_id, status);
  `);

  await db.execute(sql`
    CREATE TABLE tax_rates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(50) NOT NULL,
      type tax_rate_type NOT NULL DEFAULT 'percentage',
      rate DECIMAL(8,4) NOT NULL,
      category tax_category NOT NULL DEFAULT 'standard',
      jurisdiction VARCHAR(255),
      country VARCHAR(2),
      region VARCHAR(100),
      is_active BOOLEAN NOT NULL DEFAULT true,
      valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      valid_to TIMESTAMPTZ,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX tax_rates_tenant_id_idx ON tax_rates(tenant_id);
    CREATE UNIQUE INDEX tax_rates_tenant_code_idx ON tax_rates(tenant_id, code);
    CREATE INDEX tax_rates_tenant_active_idx ON tax_rates(tenant_id, is_active);
    CREATE INDEX tax_rates_tenant_jurisdiction_idx ON tax_rates(tenant_id, jurisdiction);
    CREATE INDEX tax_rates_valid_from_to_idx ON tax_rates(valid_from, valid_to);
  `);

  await db.execute(sql`
    CREATE TABLE tax_rules (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      tax_rate_id UUID NOT NULL REFERENCES tax_rates(id) ON DELETE CASCADE,
      product_category VARCHAR(255),
      customer_type VARCHAR(50),
      shipping_country VARCHAR(2),
      shipping_region VARCHAR(100),
      priority INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT true,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX tax_rules_tenant_id_idx ON tax_rules(tenant_id);
    CREATE INDEX tax_rules_tax_rate_id_idx ON tax_rules(tax_rate_id);
    CREATE INDEX tax_rules_tenant_product_category_idx ON tax_rules(tenant_id, product_category);
    CREATE INDEX tax_rules_tenant_active_idx ON tax_rules(tenant_id, is_active);
  `);

  await db.execute(sql`
    CREATE TABLE tax_exemptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      customer_id UUID NOT NULL,
      exemption_type VARCHAR(50) NOT NULL,
      exemption_number VARCHAR(255),
      valid_from TIMESTAMPTZ NOT NULL,
      valid_to TIMESTAMPTZ,
      is_active BOOLEAN NOT NULL DEFAULT true,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX tax_exemptions_tenant_id_idx ON tax_exemptions(tenant_id);
    CREATE INDEX tax_exemptions_customer_id_idx ON tax_exemptions(customer_id);
    CREATE INDEX tax_exemptions_tenant_customer_idx ON tax_exemptions(tenant_id, customer_id);
    CREATE INDEX tax_exemptions_tenant_active_idx ON tax_exemptions(tenant_id, is_active);
  `);

  await db.execute(sql`
    CREATE TABLE audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      user_id VARCHAR(255),
      user_agent VARCHAR(500),
      ip_address VARCHAR(45),
      action VARCHAR(100) NOT NULL,
      resource_type VARCHAR(100) NOT NULL,
      resource_id VARCHAR(255) NOT NULL,
      old_values JSONB,
      new_values JSONB,
      changes JSONB,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX audit_logs_tenant_id_idx ON audit_logs(tenant_id);
    CREATE INDEX audit_logs_user_id_idx ON audit_logs(user_id);
    CREATE INDEX audit_logs_action_idx ON audit_logs(action);
    CREATE INDEX audit_logs_resource_type_idx ON audit_logs(resource_type);
    CREATE INDEX audit_logs_resource_id_idx ON audit_logs(resource_id);
    CREATE INDEX audit_logs_tenant_created_at_idx ON audit_logs(tenant_id, created_at);
    CREATE INDEX audit_logs_tenant_action_resource_idx ON audit_logs(tenant_id, action, resource_type);
    CREATE INDEX audit_logs_tenant_user_created_at_idx ON audit_logs(tenant_id, user_id, created_at);
  `);

  await db.execute(sql`
    CREATE TABLE compliance_records (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      record_type VARCHAR(100) NOT NULL,
      resource_id VARCHAR(255) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      required_by VARCHAR(255),
      due_date TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      notes TEXT,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX compliance_records_tenant_id_idx ON compliance_records(tenant_id);
    CREATE INDEX compliance_records_tenant_record_type_idx ON compliance_records(tenant_id, record_type);
    CREATE INDEX compliance_records_tenant_status_idx ON compliance_records(tenant_id, status);
    CREATE INDEX compliance_records_tenant_due_date_idx ON compliance_records(tenant_id, due_date);
    CREATE INDEX compliance_records_tenant_resource_idx ON compliance_records(tenant_id, record_type, resource_id);
  `);

  await db.execute(sql`
    CREATE TABLE ledger_accounts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      code VARCHAR(50) NOT NULL,
      name VARCHAR(255) NOT NULL,
      type ledger_account_type NOT NULL,
      parent_account_id UUID,
      description TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX ledger_accounts_tenant_id_idx ON ledger_accounts(tenant_id);
    CREATE UNIQUE INDEX ledger_accounts_tenant_code_idx ON ledger_accounts(tenant_id, code);
    CREATE INDEX ledger_accounts_tenant_type_idx ON ledger_accounts(tenant_id, type);
    CREATE INDEX ledger_accounts_tenant_active_idx ON ledger_accounts(tenant_id, is_active);
    CREATE INDEX ledger_accounts_parent_account_id_idx ON ledger_accounts(parent_account_id);
  `);

  await db.execute(sql`
    CREATE TABLE ledger_periods (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      status period_status NOT NULL DEFAULT 'current',
      start_date TIMESTAMPTZ NOT NULL,
      end_date TIMESTAMPTZ NOT NULL,
      closed_at TIMESTAMPTZ,
      closed_by VARCHAR(255),
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX ledger_periods_tenant_id_idx ON ledger_periods(tenant_id);
    CREATE INDEX ledger_periods_tenant_status_idx ON ledger_periods(tenant_id, status);
    CREATE INDEX ledger_periods_tenant_start_date_idx ON ledger_periods(tenant_id, start_date);
    CREATE UNIQUE INDEX ledger_periods_tenant_name_idx ON ledger_periods(tenant_id, name);
  `);

  await db.execute(sql`
    CREATE TABLE ledger_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      account_id UUID NOT NULL REFERENCES ledger_accounts(id) ON DELETE RESTRICT,
      entry_type ledger_entry_type NOT NULL,
      amount DECIMAL(19,4) NOT NULL,
      currency currency NOT NULL DEFAULT 'USD',
      exchange_rate DECIMAL(19,8) DEFAULT '1',
      debit_amount DECIMAL(19,4) NOT NULL DEFAULT '0',
      credit_amount DECIMAL(19,4) NOT NULL DEFAULT '0',
      description TEXT NOT NULL,
      reference_type VARCHAR(100),
      reference_id VARCHAR(255),
      period_id UUID REFERENCES ledger_periods(id),
      is_reversed BOOLEAN NOT NULL DEFAULT false,
      reversed_by_entry_id UUID,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX ledger_entries_tenant_id_idx ON ledger_entries(tenant_id);
    CREATE INDEX ledger_entries_account_id_idx ON ledger_entries(account_id);
    CREATE INDEX ledger_entries_tenant_account_idx ON ledger_entries(tenant_id, account_id);
    CREATE INDEX ledger_entries_tenant_entry_type_idx ON ledger_entries(tenant_id, entry_type);
    CREATE INDEX ledger_entries_reference_idx ON ledger_entries(reference_type, reference_id);
    CREATE INDEX ledger_entries_tenant_created_at_idx ON ledger_entries(tenant_id, created_at);
    CREATE INDEX ledger_entries_period_id_idx ON ledger_entries(period_id);
    CREATE INDEX ledger_entries_tenant_account_created_at_idx ON ledger_entries(tenant_id, account_id, created_at);
  `);

  await db.execute(sql`
    CREATE TABLE ledger_journal_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      entry_number VARCHAR(50) NOT NULL,
      description TEXT NOT NULL,
      reference_type VARCHAR(100),
      reference_id VARCHAR(255),
      posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      is_reversed BOOLEAN NOT NULL DEFAULT false,
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX ledger_journal_entries_tenant_id_idx ON ledger_journal_entries(tenant_id);
    CREATE UNIQUE INDEX ledger_journal_entries_tenant_number_idx ON ledger_journal_entries(tenant_id, entry_number);
    CREATE INDEX ledger_journal_entries_tenant_posted_at_idx ON ledger_journal_entries(tenant_id, posted_at);
    CREATE INDEX ledger_journal_entries_reference_idx ON ledger_journal_entries(reference_type, reference_id);
  `);

  await db.execute(sql`
    CREATE TABLE revenue_metrics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      period_start TIMESTAMPTZ NOT NULL,
      period_end TIMESTAMPTZ NOT NULL,
      total_revenue DECIMAL(19,4) NOT NULL DEFAULT '0',
      recurring_revenue DECIMAL(19,4) NOT NULL DEFAULT '0',
      one_time_revenue DECIMAL(19,4) NOT NULL DEFAULT '0',
      usage_revenue DECIMAL(19,4) NOT NULL DEFAULT '0',
      total_invoices INTEGER NOT NULL DEFAULT 0,
      paid_invoices INTEGER NOT NULL DEFAULT 0,
      overdue_invoices INTEGER NOT NULL DEFAULT 0,
      average_invoice_value DECIMAL(19,4) NOT NULL DEFAULT '0',
      currency currency NOT NULL DEFAULT 'USD',
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX revenue_metrics_tenant_id_idx ON revenue_metrics(tenant_id);
    CREATE INDEX revenue_metrics_tenant_period_idx ON revenue_metrics(tenant_id, period_start, period_end);
    CREATE INDEX revenue_metrics_tenant_created_at_idx ON revenue_metrics(tenant_id, created_at);
  `);

  await db.execute(sql`
    CREATE TABLE ar_aging (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      customer_id UUID NOT NULL,
      snapshot_date TIMESTAMPTZ NOT NULL,
      current_amount DECIMAL(19,4) NOT NULL DEFAULT '0',
      days_1_to_30 DECIMAL(19,4) NOT NULL DEFAULT '0',
      days_31_to_60 DECIMAL(19,4) NOT NULL DEFAULT '0',
      days_61_to_90 DECIMAL(19,4) NOT NULL DEFAULT '0',
      days_90_plus DECIMAL(19,4) NOT NULL DEFAULT '0',
      total_outstanding DECIMAL(19,4) NOT NULL DEFAULT '0',
      currency currency NOT NULL DEFAULT 'USD',
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX ar_aging_tenant_id_idx ON ar_aging(tenant_id);
    CREATE INDEX ar_aging_customer_id_idx ON ar_aging(customer_id);
    CREATE INDEX ar_aging_tenant_snapshot_date_idx ON ar_aging(tenant_id, snapshot_date);
    CREATE INDEX ar_aging_tenant_customer_snapshot_idx ON ar_aging(tenant_id, customer_id, snapshot_date);
  `);

  await db.execute(sql`
    CREATE TABLE customer_metrics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      customer_id UUID NOT NULL,
      total_lifetime_value DECIMAL(19,4) NOT NULL DEFAULT '0',
      total_invoices INTEGER NOT NULL DEFAULT 0,
      paid_invoices INTEGER NOT NULL DEFAULT 0,
      overdue_invoices INTEGER NOT NULL DEFAULT 0,
      average_payment_days INTEGER DEFAULT 0,
      last_payment_date TIMESTAMPTZ,
      last_invoice_date TIMESTAMPTZ,
      credit_score INTEGER,
      risk_level VARCHAR(50),
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX customer_metrics_tenant_id_idx ON customer_metrics(tenant_id);
    CREATE INDEX customer_metrics_customer_id_idx ON customer_metrics(customer_id);
    CREATE INDEX customer_metrics_tenant_customer_idx ON customer_metrics(tenant_id, customer_id);
    CREATE INDEX customer_metrics_tenant_risk_level_idx ON customer_metrics(tenant_id, risk_level);
  `);

  await db.execute(sql`
    CREATE TABLE cash_flow_forecast (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      forecast_date TIMESTAMPTZ NOT NULL,
      expected_inflows DECIMAL(19,4) NOT NULL DEFAULT '0',
      expected_outflows DECIMAL(19,4) NOT NULL DEFAULT '0',
      net_cash_flow DECIMAL(19,4) NOT NULL DEFAULT '0',
      confidence DECIMAL(5,2) DEFAULT '0',
      metadata JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX cash_flow_forecast_tenant_id_idx ON cash_flow_forecast(tenant_id);
    CREATE INDEX cash_flow_forecast_tenant_forecast_date_idx ON cash_flow_forecast(tenant_id, forecast_date);
  `);
}

export async function down(db: any) {
  await db.execute(sql`
    DROP TABLE IF EXISTS cash_flow_forecast;
    DROP TABLE IF EXISTS customer_metrics;
    DROP TABLE IF EXISTS ar_aging;
    DROP TABLE IF EXISTS revenue_metrics;
    DROP TABLE IF EXISTS ledger_journal_entries;
    DROP TABLE IF EXISTS ledger_entries;
    DROP TABLE IF EXISTS ledger_periods;
    DROP TABLE IF EXISTS ledger_accounts;
    DROP TABLE IF EXISTS compliance_records;
    DROP TABLE IF EXISTS audit_logs;
    DROP TABLE IF EXISTS tax_exemptions;
    DROP TABLE IF EXISTS tax_rules;
    DROP TABLE IF EXISTS tax_rates;
    DROP TABLE IF EXISTS reconciliation_items;
    DROP TABLE IF EXISTS reconciliation_batches;
    DROP TABLE IF EXISTS collection_rules;
    DROP TABLE IF EXISTS collection_events;
    DROP TABLE IF EXISTS collection_cases;
    DROP TABLE IF EXISTS subscription_usage;
    DROP TABLE IF EXISTS subscription_items;
    DROP TABLE IF EXISTS subscriptions;
    DROP TABLE IF EXISTS payment_refunds;
    DROP TABLE IF EXISTS payment_line_items;
    DROP TABLE IF EXISTS payments;
    DROP TABLE IF EXISTS invoice_items;
    DROP TABLE IF EXISTS invoices;
    DROP TABLE IF EXISTS customers;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS tenants;
  `);

  await db.execute(sql`
    DROP TYPE IF EXISTS period_status;
    DROP TYPE IF EXISTS currency;
    DROP TYPE IF EXISTS discount_type;
    DROP TYPE IF EXISTS line_item_type;
    DROP TYPE IF EXISTS ledger_account_type;
    DROP TYPE IF EXISTS ledger_entry_type;
    DROP TYPE IF EXISTS tax_category;
    DROP TYPE IF EXISTS tax_rate_type;
    DROP TYPE IF EXISTS reconciliation_status;
    DROP TYPE IF EXISTS collection_action;
    DROP TYPE IF EXISTS collection_status;
    DROP TYPE IF EXISTS subscription_status;
    DROP TYPE IF EXISTS payment_method;
    DROP TYPE IF EXISTS payment_status;
    DROP TYPE IF EXISTS invoice_status;
    DROP TYPE IF EXISTS billing_cycle;
    DROP TYPE IF EXISTS tenant_status;
  `);
}
