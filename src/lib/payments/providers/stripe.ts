import Stripe from 'stripe';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { tenants } from '@/lib/db/schema';
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

export class StripeAdapter implements PaymentProviderAdapter {
  readonly provider = 'stripe' as const;
  private stripe: Stripe;

  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2024-12-18.acacia' as any,
    });
  }

  async createCustomer(input: CustomerInput): Promise<CustomerOutput> {
    const customer = await this.stripe.customers.create({
      email: input.email,
      name: input.name,
      phone: input.phone,
      metadata: input.metadata,
    });

    return {
      id: customer.id,
      provider: 'stripe',
      email: customer.email!,
      name: customer.name ?? undefined,
      createdAt: new Date(customer.created * 1000),
    };
  }

  async getCustomer(id: string): Promise<CustomerOutput | null> {
    try {
      const customer = await this.stripe.customers.retrieve(id);
      if (customer.deleted) return null;
      return {
        id: customer.id,
        provider: 'stripe',
        email: customer.email!,
        name: customer.name ?? undefined,
        createdAt: new Date(customer.created * 1000),
      };
    } catch {
      return null;
    }
  }

  async updateCustomer(id: string, input: Partial<CustomerInput>): Promise<CustomerOutput> {
    const customer = await this.stripe.customers.update(id, {
      email: input.email,
      name: input.name,
      phone: input.phone,
      metadata: input.metadata,
    });

    return {
      id: customer.id,
      provider: 'stripe',
      email: customer.email!,
      name: customer.name ?? undefined,
      createdAt: new Date(customer.created * 1000),
    };
  }

  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<CreatePaymentIntentOutput> {
    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(input.amount * 100),
      currency: input.currency.toLowerCase(),
      customer: input.customerId,
      description: input.description,
      receipt_email: input.customerEmail,
      metadata: {
        ...input.metadata,
        invoiceId: input.invoiceId ?? '',
        subscriptionId: input.subscriptionId ?? '',
      },
      automatic_payment_methods: { enabled: true },
    });

    const paymentIntent: PaymentIntent = {
      id: intent.id,
      provider: 'stripe',
      amount: intent.amount / 100,
      currency: intent.currency.toUpperCase(),
      status: this.mapStatus(intent.status),
      customerEmail: input.customerEmail,
      metadata: input.metadata,
      clientSecret: intent.client_secret ?? undefined,
      createdAt: new Date(intent.created * 1000),
    };

    return {
      intent: paymentIntent,
      clientSecret: intent.client_secret ?? '',
    };
  }

  async getPaymentIntent(id: string): Promise<PaymentIntent | null> {
    try {
      const intent = await this.stripe.paymentIntents.retrieve(id);
      return {
        id: intent.id,
        provider: 'stripe',
        amount: intent.amount / 100,
        currency: intent.currency.toUpperCase(),
        status: this.mapStatus(intent.status),
        customerEmail: (intent.receipt_email as string) ?? '',
        metadata: intent.metadata as Record<string, string>,
        createdAt: new Date(intent.created * 1000),
      };
    } catch {
      return null;
    }
  }

  async cancelPaymentIntent(id: string): Promise<void> {
    await this.stripe.paymentIntents.cancel(id);
  }

  async createRefund(input: RefundInput): Promise<RefundOutput> {
    const refund = await this.stripe.refunds.create({
      payment_intent: input.paymentId,
      amount: input.amount ? Math.round(input.amount * 100) : undefined,
      reason: input.reason as Stripe.RefundCreateParams.Reason | undefined,
    });

    return {
      refundId: refund.id,
      status: refund.status === 'succeeded' ? 'succeeded' : 'pending',
      amount: (refund.amount ?? 0) / 100,
    };
  }

  async createSubscription(input: SubscriptionInput): Promise<SubscriptionOutput> {
    const subscription = await this.stripe.subscriptions.create({
      customer: input.customerId,
      items: [{ price: input.priceId, quantity: input.quantity }],
      trial_period_days: input.trialPeriodDays,
      metadata: input.metadata,
    });

    return {
      id: subscription.id,
      provider: 'stripe',
      status: subscription.status as SubscriptionOutput['status'],
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    };
  }

  async cancelSubscription(id: string): Promise<void> {
    await this.stripe.subscriptions.cancel(id);
  }

  async getSubscription(id: string): Promise<SubscriptionOutput | null> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(id);
      return {
        id: subscription.id,
        provider: 'stripe',
        status: subscription.status as SubscriptionOutput['status'],
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      };
    } catch {
      return null;
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      return true;
    } catch {
      return false;
    }
  }

  parseWebhookEvent(payload: string, signature: string): WebhookEvent {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    return {
      id: event.id,
      type: event.type,
      provider: 'stripe',
      data: event.data.object as unknown as Record<string, unknown>,
      timestamp: new Date(event.created * 1000),
      signature,
    };
  }

  private mapStatus(status: string): PaymentIntent['status'] {
    const statusMap: Record<string, PaymentIntent['status']> = {
      requires_payment_method: 'pending',
      requires_confirmation: 'pending',
      requires_action: 'processing',
      processing: 'processing',
      succeeded: 'succeeded',
      canceled: 'cancelled',
    };
    return statusMap[status] ?? 'pending';
  }
}
