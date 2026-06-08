import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SubscriptionService, AppError } from '@/server/services/subscription';

function getTenantId(request: NextRequest): string {
  const tenantId = request.headers.get('x-tenant-id');
  if (!tenantId) {
    throw new AppError('Missing tenant context', 'MISSING_TENANT', 401);
  }
  return tenantId;
}

const subscriptionItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive().optional(),
  unitPrice: z.string(),
  lineItemType: z.enum(['subscription', 'usage', 'one_time', 'fee', 'discount', 'tax', 'credit']).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  metadata: z.record(z.unknown()).optional(),
});

const createSubscriptionSchema = z.object({
  customerId: z.string().uuid(),
  subscriptionNumber: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF']).optional(),
  recurringAmount: z.string(),
  billingCycle: z.enum(['monthly', 'quarterly', 'semi_annual', 'annual', 'custom']).optional(),
  billingInterval: z.number().int().positive().optional(),
  trialStart: z.coerce.date().optional(),
  trialEnd: z.coerce.date().optional(),
  notes: z.string().optional(),
  items: z.array(subscriptionItemSchema).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantId(request);
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
    const offset = (page - 1) * limit;
    const customerId = searchParams.get('customerId') ?? undefined;
    const status = searchParams.get('status') as
      | 'trialing' | 'active' | 'past_due' | 'paused' | 'cancelled' | 'expired'
      | null;

    const result = await SubscriptionService.list(tenantId, {
      limit,
      offset,
      customerId,
      status: status ?? undefined,
    });

    return NextResponse.json({
      data: result.data,
      meta: {
        page,
        limit,
        total: result.total,
        hasMore: result.hasMore,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.statusCode },
      );
    }
    console.error('GET /api/v1/subscriptions error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantId(request);
    const body = await request.json();
    const data = createSubscriptionSchema.parse(body);

    const subscription = await SubscriptionService.create(tenantId, {
      customerId: data.customerId,
      subscriptionNumber: data.subscriptionNumber,
      name: data.name,
      currency: data.currency,
      recurringAmount: data.recurringAmount,
      billingCycle: data.billingCycle,
      billingInterval: data.billingInterval,
      trialStart: data.trialStart,
      trialEnd: data.trialEnd,
      notes: data.notes,
      items: data.items?.map(item => ({
        ...item,
        quantity: item.quantity != null ? String(item.quantity) : undefined,
        taxRate: item.taxRate != null ? String(item.taxRate) : undefined,
        lineItemType: item.lineItemType ?? 'subscription' as const,
        amount: String(parseFloat(item.unitPrice) * (item.quantity ?? 1)),
      })),
      metadata: data.metadata,
    });

    return NextResponse.json({ data: subscription }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details: error.errors } },
        { status: 400 },
      );
    }
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.statusCode },
      );
    }
    console.error('POST /api/v1/subscriptions error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 },
    );
  }
}
