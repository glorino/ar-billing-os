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

const PAYSTACK_API_URL = 'https://api.paystack.co';

interface PaystackResponse<T = unknown> {
  status: boolean;
  message: string;
  data: T;
}

interface PaystackCustomer {
  id: number;
  customer_code: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  integration: number;
}

interface PaystackTransaction {
  id: number;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  metadata?: Record<string, unknown>;
  customer: { customer_code: string; email: string };
  created_at: string;
  authorization?: { authorization_code: string; channel: string };
  paid_at?: string;
}

interface PaystackSubscription {
  id: number;
  subscription_code: string;
  status: string;
  amount: number;
  currency: string;
  customer: PaystackCustomer;
  plan: { plan_code: string; name: string };
  created_at: string;
  next_payment_date: string;
}

interface PaystackSplit {
  id: number;
  name: string;
  type: string;
  currency: string;
}

export class PaystackAdapter implements PaymentProviderAdapter {
  readonly provider = 'paystack' as const;
  private secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  private async request<T>(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: Record<string, unknown>
  ): Promise<PaystackResponse<T>> {
    const url = `${PAYSTACK_API_URL}${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    };

    const options: RequestInit = { method, headers };
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json();

    if (!data.status) {
      throw new Error(`Paystack API error: ${data.message}`);
    }

    return data;
  }

  async createCustomer(input: CustomerInput): Promise<CustomerOutput> {
    const nameParts = (input.name ?? '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const result = await this.request<PaystackCustomer>('/customer', 'POST', {
      email: input.email,
      first_name: firstName,
      last_name: lastName,
      phone: input.phone,
      metadata: input.metadata,
    });

    return {
      id: result.data.customer_code,
      provider: 'paystack',
      email: result.data.email,
      name: input.name,
      createdAt: new Date(result.data.created_at),
    };
  }

  async getCustomer(id: string): Promise<CustomerOutput | null> {
    try {
      const result = await this.request<PaystackCustomer>(`/customer/${id}`);
      return {
        id: result.data.customer_code,
        provider: 'paystack',
        email: result.data.email,
        name: [result.data.first_name, result.data.last_name].filter(Boolean).join(' ') || undefined,
        createdAt: new Date(result.data.created_at),
      };
    } catch {
      return null;
    }
  }

  async updateCustomer(id: string, input: Partial<CustomerInput>): Promise<CustomerOutput> {
    const nameParts = (input.name ?? '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const result = await this.request<PaystackCustomer>(`/customer/${id}`, 'PUT', {
      email: input.email,
      first_name: firstName,
      last_name: lastName,
      phone: input.phone,
      metadata: input.metadata,
    });

    return {
      id: result.data.customer_code,
      provider: 'paystack',
      email: result.data.email,
      name: input.name,
      createdAt: new Date(result.data.created_at),
    };
  }

  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<CreatePaymentIntentOutput> {
    const reference = `INV_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const result = await this.request<{
      reference: string;
      authorization_url: string;
      access_code: string;
      amount: number;
      currency: string;
    }>('/transaction/initialize', 'POST', {
      email: input.customerEmail,
      amount: Math.round(input.amount * 100),
      currency: this.mapCurrency(input.currency),
      reference,
      callback_url: input.returnUrl ?? `${process.env.NEXT_PUBLIC_APP_URL}/api/v1/payments/paystack/callback`,
      metadata: {
        invoiceId: input.invoiceId ?? '',
        subscriptionId: input.subscriptionId ?? '',
        customer_id: input.customerId,
        custom_fields: [
          {
            display_name: 'Description',
            variable_name: 'description',
            value: input.description ?? 'Invoice Payment',
          },
        ],
        ...input.metadata,
      },
    });

    const paymentIntent: PaymentIntent = {
      id: reference,
      provider: 'paystack',
      amount: input.amount,
      currency: input.currency.toUpperCase(),
      status: 'pending',
      customerEmail: input.customerEmail,
      customerName: input.customerName,
      metadata: input.metadata,
      reference,
      clientSecret: result.data.access_code,
      createdAt: new Date(),
    };

    return {
      intent: paymentIntent,
      clientSecret: result.data.access_code,
      checkoutUrl: result.data.authorization_url,
    };
  }

  async getPaymentIntent(id: string): Promise<PaymentIntent | null> {
    try {
      const result = await this.request<PaystackTransaction>(`/transaction/verify/${id}`);
      const tx = result.data;

      return {
        id: tx.reference,
        provider: 'paystack',
        amount: tx.amount / 100,
        currency: tx.currency.toUpperCase(),
        status: this.mapStatus(tx.status),
        customerEmail: tx.customer.email,
        metadata: tx.metadata as Record<string, string>,
        reference: tx.reference,
        createdAt: new Date(tx.created_at),
      };
    } catch {
      return null;
    }
  }

  async cancelPaymentIntent(_id: string): Promise<void> {
    // Paystack doesn't support cancelling pending transactions.
    // The transaction will timeout automatically.
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
    }>('/refund', 'POST', {
      transaction: input.paymentId,
      amount: Math.round(refundAmount * 100),
      reason: input.reason,
      currency: this.mapCurrency(transaction.currency),
    });

    return {
      refundId: String(result.data.id),
      status: result.data.status === 'success' ? 'succeeded' : 'pending',
      amount: result.data.amount / 100,
    };
  }

  async createSubscription(input: SubscriptionInput): Promise<SubscriptionOutput> {
    const result = await this.request<PaystackSubscription>('/subscription', 'POST', {
      customer: input.customerId,
      plan: input.priceId,
      start_date: new Date().toISOString(),
    });

    return {
      id: result.data.subscription_code,
      provider: 'paystack',
      status: this.mapSubscriptionStatus(result.data.status),
      currentPeriodStart: new Date(result.data.created_at),
      currentPeriodEnd: new Date(result.data.next_payment_date),
    };
  }

  async cancelSubscription(id: string): Promise<void> {
    await this.request(`/subscription/${id}/disable`, 'POST', {
      code: id,
      token: id,
    });
  }

  async getSubscription(id: string): Promise<SubscriptionOutput | null> {
    try {
      const result = await this.request<PaystackSubscription>(`/subscription/${id}`);
      return {
        id: result.data.subscription_code,
        provider: 'paystack',
        status: this.mapSubscriptionStatus(result.data.status),
        currentPeriodStart: new Date(result.data.created_at),
        currentPeriodEnd: new Date(result.data.next_payment_date),
      };
    } catch {
      return null;
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    // Paystack uses HMAC SHA512
    const secretKey = process.env.PAYSTACK_WEBHOOK_SECRET ?? this.secretKey;
    const hash = crypto.createHmac('sha512', secretKey).update(payload).digest('hex');
    return hash === signature;
  }

  parseWebhookEvent(payload: string, signature: string): WebhookEvent {
    const data = JSON.parse(payload);

    const eventTypeMap: Record<string, string> = {
      'charge.success': 'payment_intent.succeeded',
      'charge.failed': 'payment_intent.failed',
      'invoice.created': 'invoice.created',
      'invoice.updated': 'invoice.updated',
      'subscription.create': 'subscription.created',
      'subscription.disable': 'subscription.cancelled',
      'refund.created': 'refund.created',
      'refund.processed': 'refund.succeeded',
    };

    return {
      id: `paystack_${Date.now()}`,
      type: eventTypeMap[data.event] ?? data.event,
      provider: 'paystack',
      data: data.data,
      timestamp: new Date(),
      signature,
    };
  }

  private mapStatus(status: string): PaymentIntent['status'] {
    const map: Record<string, PaymentIntent['status']> = {
      success: 'succeeded',
      failed: 'failed',
      abandoned: 'cancelled',
      pending: 'pending',
      reversed: 'refunded',
    };
    return map[status.toLowerCase()] ?? 'pending';
  }

  private mapSubscriptionStatus(status: string): SubscriptionOutput['status'] {
    const map: Record<string, SubscriptionOutput['status']> = {
      active: 'active',
      attention: 'past_due',
      canceled: 'cancelled',
    };
    return map[status.toLowerCase()] ?? 'active';
  }

  private mapCurrency(currency: string): string {
    const afrCurrencyMap: Record<string, string> = {
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
      ETB: 'ETB',
      MZN: 'MZN',
      ZMW: 'ZMW',
      ZWL: 'ZWL',
      BWP: 'BWP',
      NAD: 'NAD',
      MUR: 'MUR',
      MGA: 'MGA',
    };
    return afrCurrencyMap[currency.toUpperCase()] ?? currency.toUpperCase();
  }

  // ─── Paystack-Specific Helpers ────────────────────────────────

  async createPlan(input: {
    name: string;
    amount: number;
    interval: 'daily' | 'weekly' | 'monthly' | 'annually';
    currency?: string;
  }): Promise<{ planCode: string; id: number }> {
    const result = await this.request<{ plan_code: string; id: number }>(
      '/plan',
      'POST',
      {
        name: input.name,
        amount: Math.round(input.amount * 100),
        interval: input.interval,
        currency: input.currency ?? 'NGN',
      }
    );

    return { planCode: result.data.plan_code, id: result.data.id };
  }

  async initiateTransfer(input: {
    source: string;
    amount: number;
    recipient: string;
    reason?: string;
    currency?: string;
  }): Promise<{ transferCode: string; status: string }> {
    const result = await this.request<{ transfer_code: string; status: string }>(
      '/transfer',
      'POST',
      {
        source: input.source,
        amount: Math.round(input.amount * 100),
        recipient: input.recipient,
        reason: input.reason,
        currency: input.currency ?? 'NGN',
      }
    );

    return { transferCode: result.data.transfer_code, status: result.data.status };
  }

  async createTransferRecipient(input: {
    name: string;
    type: 'nuban' | 'mobile_money' | 'ghipss';
    accountNumber: string;
    bankCode: string;
    currency?: string;
  }): Promise<{ recipientCode: string }> {
    const result = await this.request<{ recipient_code: string }>(
      '/transferrecipient',
      'POST',
      {
        type: input.type,
        name: input.name,
        account_number: input.accountNumber,
        bank_code: input.bankCode,
        currency: input.currency ?? 'NGN',
      }
    );

    return { recipientCode: result.data.recipient_code };
  }

  async listBanks(country: string = 'nigeria'): Promise<Array<{ name: string; code: string }>> {
    const result = await this.request<Array<{ name: string; code: string }>>(
      `/bank?country=${country}`
    );
    return result.data;
  }
}
