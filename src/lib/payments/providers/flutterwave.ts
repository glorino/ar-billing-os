import type {
  PaymentProviderAdapter,
  CustomerInput,
  CustomerOutput,
  CreatePaymentIntentInput,
  CreatePaymentIntentOutput,
  PaymentIntent,
  RefundInput,
  RefundOutput,
  SubscriptionInput,
  SubscriptionOutput,
  WebhookEvent,
} from '../types';
import crypto from 'crypto';

const FLUTTERWAVE_API_URL = 'https://api.flutterwave.com/v3';

interface FlutterwaveResponse<T = unknown> {
  status: string;
  message: string;
  data: T;
}

interface FlutterwaveCustomer {
  id: number;
  email: string;
  name?: string;
  created_at: string;
}

interface FlutterwaveTransaction {
  id: number;
  tx_ref: string;
  flw_ref: string;
  amount: number;
  currency: string;
  status: string;
  customer: { email: string; name?: string };
  created_at: string;
  paid_at?: string;
}

interface FlutterwaveSubscription {
  id: number;
  amount: number;
  currency: string;
  status: string;
  plan: { id: number; name: string };
  customer: FlutterwaveCustomer;
  created_at: string;
  next_payment_date: string;
}

export class FlutterwaveAdapter implements PaymentProviderAdapter {
  readonly provider = 'flutterwave' as const;
  private secretKey: string;
  private encryptionKey: string;

  constructor(secretKey: string, encryptionKey?: string) {
    this.secretKey = secretKey;
    this.encryptionKey = encryptionKey ?? '';
  }

  private async request<T>(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: Record<string, unknown>
  ): Promise<FlutterwaveResponse<T>> {
    const url = `${FLUTTERWAVE_API_URL}${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };

    const options: RequestInit = { method, headers };
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (data.status !== 'success') {
      throw new Error(`Flutterwave API error: ${data.message}`);
    }

    return data;
  }

  async createCustomer(input: CustomerInput): Promise<CustomerOutput> {
    const result = await this.request<FlutterwaveCustomer>('/customers', 'POST', {
      email: input.email,
      name: input.name ?? '',
    });

    return {
      id: String(result.data.id),
      provider: 'flutterwave',
      email: result.data.email,
      name: input.name,
      createdAt: new Date(result.data.created_at),
    };
  }

  async getCustomer(id: string): Promise<CustomerOutput | null> {
    try {
      const result = await this.request<FlutterwaveCustomer>(`/customers/${id}`);
      return {
        id: String(result.data.id),
        provider: 'flutterwave',
        email: result.data.email,
        name: result.data.name,
        createdAt: new Date(result.data.created_at),
      };
    } catch {
      return null;
    }
  }

  async updateCustomer(id: string, input: Partial<CustomerInput>): Promise<CustomerOutput> {
    const result = await this.request<FlutterwaveCustomer>(`/customers/${id}`, 'PUT', {
      email: input.email,
      name: input.name,
    });

    return {
      id: String(result.data.id),
      provider: 'flutterwave',
      email: result.data.email,
      name: input.name ?? result.data.name,
      createdAt: new Date(result.data.created_at),
    };
  }

  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<CreatePaymentIntentOutput> {
    const txRef = `INV_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const result = await this.request<{
      id: number;
      tx_ref: string;
      flw_ref: string;
      link: { url: string };
    }>('/transactions', 'POST', {
      amount: input.amount,
      currency: this.mapCurrency(input.currency),
      email: input.customerEmail,
      tx_ref: txRef,
      redirect_url: input.returnUrl ?? `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/payments/flutterwave/callback`,
      customer: {
        email: input.customerEmail,
        name: input.customerName ?? '',
      },
      meta: {
        invoiceId: input.invoiceId ?? '',
        subscriptionId: input.subscriptionId ?? '',
        customer_id: input.customerId,
        description: input.description ?? 'Invoice Payment',
        ...input.metadata,
      },
    });

    const paymentIntent: PaymentIntent = {
      id: txRef,
      provider: 'flutterwave',
      amount: input.amount,
      currency: input.currency.toUpperCase(),
      status: 'pending',
      customerEmail: input.customerEmail,
      customerName: input.customerName,
      metadata: input.metadata,
      reference: txRef,
      clientSecret: this.secretKey,
      createdAt: new Date(),
    };

    return {
      intent: paymentIntent,
      clientSecret: this.secretKey,
      checkoutUrl: result.data.link?.url,
    };
  }

  async getPaymentIntent(id: string): Promise<PaymentIntent | null> {
    try {
      const result = await this.request<FlutterwaveTransaction>(`/transactions/verify/${id}`);
      const tx = result.data;

      return {
        id: tx.tx_ref,
        provider: 'flutterwave',
        amount: tx.amount,
        currency: tx.currency.toUpperCase(),
        status: this.mapStatus(tx.status),
        customerEmail: tx.customer.email,
        customerName: tx.customer.name,
        reference: tx.tx_ref,
        createdAt: new Date(tx.created_at),
      };
    } catch {
      return null;
    }
  }

  async cancelPaymentIntent(_id: string): Promise<void> {
    // Flutterwave doesn't support cancelling pending transactions.
  }

  async createRefund(input: RefundInput): Promise<RefundOutput> {
    const transaction = await this.getPaymentIntent(input.paymentId);
    if (!transaction) {
      throw new Error(`Transaction not found: ${input.paymentId}`);
    }

    const refundAmount = input.amount ?? transaction.amount;

    const result = await this.request<{
      id: number;
      status: string;
      amount: number;
    }>('/refunds', 'POST', {
      transaction_id: input.paymentId,
      amount: refundAmount,
      reason: input.reason,
    });

    return {
      refundId: String(result.data.id),
      status: result.data.status === 'successful' ? 'succeeded' : 'pending',
      amount: result.data.amount,
    };
  }

  async createSubscription(input: SubscriptionInput): Promise<SubscriptionOutput> {
    const result = await this.request<FlutterwaveSubscription>('/subscriptions', 'POST', {
      amount: 0,
      email: input.customerId,
      currency: 'NGN',
      plan_name: input.priceId,
      interval: 'monthly',
    });

    return {
      id: String(result.data.id),
      provider: 'flutterwave',
      status: this.mapSubscriptionStatus(result.data.status),
      currentPeriodStart: new Date(result.data.created_at),
      currentPeriodEnd: new Date(result.data.next_payment_date),
    };
  }

  async cancelSubscription(id: string): Promise<void> {
    await this.request(`/subscriptions/${id}`, 'DELETE');
  }

  async getSubscription(id: string): Promise<SubscriptionOutput | null> {
    try {
      const result = await this.request<FlutterwaveSubscription>(`/subscriptions/${id}`);
      return {
        id: String(result.data.id),
        provider: 'flutterwave',
        status: this.mapSubscriptionStatus(result.data.status),
        currentPeriodStart: new Date(result.data.created_at),
        currentPeriodEnd: new Date(result.data.next_payment_date),
      };
    } catch {
      return null;
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const secretKey = process.env.FLUTTERWAVE_WEBHOOK_SECRET ?? this.secretKey;
    const hash = crypto.createHmac('sha256', secretKey).update(payload).digest('hex');
    return hash === signature;
  }

  parseWebhookEvent(payload: string, signature: string): WebhookEvent {
    const data = JSON.parse(payload);

    const eventTypeMap: Record<string, string> = {
      'charge.success': 'payment_intent.succeeded',
      'charge.failed': 'payment_intent.failed',
      'subscription.create': 'subscription.created',
      'subscription.cancel': 'subscription.cancelled',
      'refund.created': 'refund.created',
      'refund.processed': 'refund.succeeded',
    };

    return {
      id: `flutterwave_${Date.now()}`,
      type: eventTypeMap[data.event] ?? data.event,
      provider: 'flutterwave',
      data: data.data,
      timestamp: new Date(),
      signature,
    };
  }

  private mapStatus(status: string): PaymentIntent['status'] {
    const map: Record<string, PaymentIntent['status']> = {
      successful: 'succeeded',
      completed: 'succeeded',
      failed: 'failed',
      cancelled: 'cancelled',
      pending: 'pending',
      reversed: 'refunded',
    };
    return map[status.toLowerCase()] ?? 'pending';
  }

  private mapSubscriptionStatus(status: string): SubscriptionOutput['status'] {
    const map: Record<string, SubscriptionOutput['status']> = {
      active: 'active',
      past_due: 'past_due',
      cancelled: 'cancelled',
    };
    return map[status.toLowerCase()] ?? 'active';
  }

  private mapCurrency(currency: string): string {
    const currencyMap: Record<string, string> = {
      USD: 'USD',
      NGN: 'NGN',
      GHS: 'GHS',
      KES: 'KES',
      ZAR: 'ZAR',
      TZS: 'TZS',
      UGX: 'UGX',
      RWF: 'RWF',
      XOF: 'XOF',
      XAF: 'XAF',
    };
    return currencyMap[currency.toUpperCase()] ?? currency.toUpperCase();
  }

  // ─── Flutterwave-Specific Helpers ──────────────────────────────

  async createPlan(input: {
    name: string;
    amount: number;
    interval: 'daily' | 'weekly' | 'monthly' | 'annually';
    currency?: string;
  }): Promise<{ planId: string; id: number }> {
    const result = await this.request<{ id: number }>(
      '/plans',
      'POST',
      {
        amount: input.amount,
        currency: input.currency ?? 'NGN',
        name: input.name,
        interval: input.interval,
      }
    );

    return { planId: String(result.data.id), id: result.data.id };
  }

  async listBanks(country: string = 'NG'): Promise<Array<{ name: string; code: string }>> {
    const result = await this.request<Array<{ name: string; code: string }>>(
      `/banks/${country}`
    );
    return result.data;
  }
}
