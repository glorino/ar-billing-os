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

const updateSubscriptionSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  recurringAmount: z.string().optional(),
  billingCycle: z.enum(['monthly', 'quarterly', 'semi_annual', 'annual', 'custom']).optional(),
  billingInterval: z.number().int().positive().optional(),
  notes: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

const cancelSubscriptionSchema = z.object({
  reason: z.string().max(500).optional(),
  immediate: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const tenantId = getTenantId(request);
    const { id } = await params;
    const { subscription, items } = await SubscriptionService.getWithItems(tenantId, id);
    return NextResponse.json({ data: { ...subscription, items } });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.statusCode },
      );
    }
    console.error('GET /api/v1/subscriptions/[id] error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const tenantId = getTenantId(request);
    const { id } = await params;
    const body = await request.json();
    const data = updateSubscriptionSchema.parse(body);

    const subscription = await SubscriptionService.update(tenantId, id, data);
    return NextResponse.json({ data: subscription });
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
    console.error('PUT /api/v1/subscriptions/[id] error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const tenantId = getTenantId(request);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const data = cancelSubscriptionSchema.parse(body);

    const subscription = await SubscriptionService.cancel(
      tenantId,
      id,
      data.reason,
      data.immediate,
    );
    return NextResponse.json({ data: subscription });
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
    console.error('DELETE /api/v1/subscriptions/[id] error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 },
    );
  }
}
