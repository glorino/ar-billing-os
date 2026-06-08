import { z } from 'zod';

export const PaymentProviderEnum = z.enum(['stripe', 'paystack']);
export type PaymentProvider = z.infer<typeof PaymentProviderEnum>;

export const AfricanCountries = [
  'NG', 'GH', 'KE', 'ZA', 'TZ', 'UG', 'RW', 'SN', 'CI', 'CM',
  'ET', 'MO', 'MZ', 'ZM', 'ZW', 'BW', 'NA', 'MU', 'MG', 'RE',
] as const;
export type AfricanCountry = (typeof AfricanCountries)[number];

export const StripeCountries = [
  'US', 'GB', 'CA', 'AU', 'DE', 'FR', 'JP', 'BR', 'MX', 'IN',
  'SG', 'HK', 'NL', 'SE', 'DK', 'FI', 'IE', 'PT', 'AT', 'BE',
  'CH', 'NO', 'NZ', 'IT', 'ES', 'PL', 'CZ', 'RO', 'HU', 'BG',
] as const;
export type StripeCountry = (typeof StripeCountries)[number];

export function getPaymentProvider(country: string): PaymentProvider {
  if ((AfricanCountries as readonly string[]).includes(country)) {
    return 'paystack';
  }
  return 'stripe';
}

// ─── Shared Types ───────────────────────────────────────────────

export interface PaymentIntent {
  id: string;
  provider: PaymentProvider;
  amount: number;
  currency: string;
  status: PaymentIntentStatus;
  customerEmail: string;
  customerName?: string;
  metadata?: Record<string, string>;
  clientSecret?: string;
  reference?: string;
  createdAt: Date;
}

export type PaymentIntentStatus =
  | 'pending'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

export interface CreatePaymentIntentInput {
  amount: number;
  currency: string;
  customerId: string;
  customerEmail: string;
  customerName?: string;
  description?: string;
  invoiceId?: string;
  subscriptionId?: string;
  metadata?: Record<string, string>;
  returnUrl?: string;
}

export interface CreatePaymentIntentOutput {
  intent: PaymentIntent;
  clientSecret: string;
  checkoutUrl?: string;
}

export interface RefundInput {
  paymentId: string;
  amount?: number;
  reason?: string;
}

export interface RefundOutput {
  refundId: string;
  status: 'succeeded' | 'pending' | 'failed';
  amount: number;
}

export interface WebhookEvent {
  id: string;
  type: string;
  provider: PaymentProvider;
  data: Record<string, unknown>;
  timestamp: Date;
  signature: string;
}

export interface CustomerInput {
  email: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, string>;
}

export interface CustomerOutput {
  id: string;
  provider: PaymentProvider;
  email: string;
  name?: string;
  createdAt: Date;
}

export interface SubscriptionInput {
  customerId: string;
  priceId: string;
  quantity?: number;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
}

export interface SubscriptionOutput {
  id: string;
  provider: PaymentProvider;
  status: 'active' | 'past_due' | 'cancelled' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
}

// ─── Provider Interface ─────────────────────────────────────────

export interface PaymentProviderAdapter {
  readonly provider: PaymentProvider;

  // Customer management
  createCustomer(input: CustomerInput): Promise<CustomerOutput>;
  getCustomer(id: string): Promise<CustomerOutput | null>;
  updateCustomer(id: string, input: Partial<CustomerInput>): Promise<CustomerOutput>;

  // Payment intents
  createPaymentIntent(input: CreatePaymentIntentInput): Promise<CreatePaymentIntentOutput>;
  getPaymentIntent(id: string): Promise<PaymentIntent | null>;
  cancelPaymentIntent(id: string): Promise<void>;

  // Refunds
  createRefund(input: RefundInput): Promise<RefundOutput>;

  // Subscriptions
  createSubscription(input: SubscriptionInput): Promise<SubscriptionOutput>;
  cancelSubscription(id: string): Promise<void>;
  getSubscription(id: string): Promise<SubscriptionOutput | null>;

  // Webhooks
  verifyWebhookSignature(payload: string, signature: string): boolean;
  parseWebhookEvent(payload: string, signature: string): WebhookEvent;
}
