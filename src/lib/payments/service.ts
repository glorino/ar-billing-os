import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db';
import { payments, invoices, customers, currencyEnum } from '@/lib/db/schema';
import { StripeAdapter } from './providers/stripe';
import { PaystackAdapter } from './providers/paystack';
import { getPaymentProvider, type PaymentProvider, type PaymentProviderAdapter } from './types';
import type {
  CreatePaymentIntentInput,
  CreatePaymentIntentOutput,
  RefundInput,
  RefundOutput,
  WebhookEvent,
} from './types';

let stripeInstance: StripeAdapter | null = null;
let paystackInstance: PaystackAdapter | null = null;

function getStripe(): StripeAdapter {
  if (!stripeInstance) {
    stripeInstance = new StripeAdapter(process.env.STRIPE_SECRET_KEY!);
  }
  return stripeInstance;
}

function getPaystack(): PaystackAdapter {
  if (!paystackInstance) {
    paystackInstance = new PaystackAdapter(process.env.PAYSTACK_SECRET_KEY!);
  }
  return paystackInstance;
}

export function getAdapter(provider: PaymentProvider): PaymentProviderAdapter {
  switch (provider) {
    case 'stripe':
      return getStripe();
    case 'paystack':
      return getPaystack();
    default:
      throw new Error(`Unknown payment provider: ${provider}`);
  }
}

export function getAdapterForCountry(country: string): PaymentProviderAdapter {
  const provider = getPaymentProvider(country);
  return getAdapter(provider);
}

// ─── Unified Payment Service ────────────────────────────────────

export interface ProcessPaymentInput extends CreatePaymentIntentInput {
  tenantId: string;
  country?: string;
}

export class PaymentService {
  static async createPayment(input: ProcessPaymentInput): Promise<CreatePaymentIntentOutput> {
    const provider = input.country
      ? getPaymentProvider(input.country)
      : 'stripe';
    const adapter = getAdapter(provider);

    const result = await adapter.createPaymentIntent(input);

    // Record payment in database
    await db.insert(payments).values({
      tenantId: input.tenantId,
      customerId: input.customerId,
      paymentNumber: `PAY-${Date.now()}`,
      paymentMethod: 'credit_card',
      amount: input.amount.toString(),
      netAmount: input.amount.toString(),
      currency: input.currency as typeof currencyEnum.enumValues[number],
      provider: provider,
      providerPaymentId: result.intent.id,
      status: 'pending',
      metadata: input.metadata ?? {},
    });

    return result;
  }

  static async processWebhook(
    provider: PaymentProvider,
    payload: string,
    signature: string,
    tenantId: string
  ): Promise<WebhookEvent | null> {
    const adapter = getAdapter(provider);

    if (!adapter.verifyWebhookSignature(payload, signature)) {
      console.error(`Invalid webhook signature for ${provider}`);
      return null;
    }

    const event = adapter.parseWebhookEvent(payload, signature);

    // Process the event
    await PaymentService.handleWebhookEvent(event, tenantId);

    return event;
  }

  static async handleWebhookEvent(event: WebhookEvent, tenantId: string): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await PaymentService.handlePaymentSucceeded(event, tenantId);
        break;
      case 'payment_intent.failed':
        await PaymentService.handlePaymentFailed(event, tenantId);
        break;
      case 'refund.created':
      case 'refund.succeeded':
        await PaymentService.handleRefund(event, tenantId);
        break;
      default:
        console.log(`Unhandled webhook event: ${event.type}`);
    }
  }

  private static async handlePaymentSucceeded(event: WebhookEvent, tenantId: string): Promise<void> {
    const reference = (event.data.reference as string) ?? (event.data.id as string);
    if (!reference) return;

    // Update payment record
    await db
      .update(payments)
      .set({ status: 'completed', updatedAt: new Date() })
      .where(
        and(
          eq(payments.tenantId, tenantId),
          eq(payments.providerPaymentId, reference)
        )
      );

    // Update invoice if linked
    const invoiceId = event.data.invoiceId as string | undefined;
    if (invoiceId) {
      await db
        .update(invoices)
        .set({
          status: 'paid',
          paidAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(invoices.tenantId, tenantId),
            eq(invoices.id, invoiceId)
          )
        );
    }
  }

  private static async handlePaymentFailed(event: WebhookEvent, tenantId: string): Promise<void> {
    const reference = (event.data.reference as string) ?? (event.data.id as string);
    if (!reference) return;

    await db
      .update(payments)
      .set({ status: 'failed', updatedAt: new Date() })
      .where(
        and(
          eq(payments.tenantId, tenantId),
          eq(payments.providerPaymentId, reference)
        )
      );
  }

  private static async handleRefund(event: WebhookEvent, tenantId: string): Promise<void> {
    const reference = (event.data.reference as string) ?? (event.data.transaction as string);
    if (!reference) return;

    await db
      .update(payments)
      .set({ status: 'refunded', updatedAt: new Date() })
      .where(
        and(
          eq(payments.tenantId, tenantId),
          eq(payments.providerPaymentId, reference)
        )
      );
  }

  static async refund(input: RefundInput & { tenantId: string }): Promise<RefundOutput> {
    // Look up the payment to determine provider
    const payment = await db.query.payments.findFirst({
      where: and(
        eq(payments.tenantId, input.tenantId),
        eq(payments.id, input.paymentId)
      ),
    });

    if (!payment) throw new Error('Payment not found');

    const provider = payment.provider as PaymentProvider;
    const adapter = getAdapter(provider);

    return adapter.createRefund({
      paymentId: payment.providerPaymentId!,
      amount: input.amount,
      reason: input.reason,
    });
  }

  static async getPaymentStatus(
    paymentId: string,
    tenantId: string
  ): Promise<{ status: string; provider: PaymentProvider } | null> {
    const payment = await db.query.payments.findFirst({
      where: and(
        eq(payments.tenantId, tenantId),
        eq(payments.id, paymentId)
      ),
    });

    if (!payment) return null;

    return {
      status: payment.status,
      provider: payment.provider as PaymentProvider,
    };
  }

  // ─── Provider-specific access ─────────────────────────────────

  static get stripe(): StripeAdapter {
    return getStripe();
  }

  static get paystack(): PaystackAdapter {
    return getPaystack();
  }
}
