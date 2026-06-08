import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { payments, customers } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { PaymentService } from '@/lib/payments';
import { AppError } from '@/server/services/customer';

function getTenantId(request: NextRequest): string {
  const tenantId = request.headers.get('x-tenant-id');
  if (!tenantId) {
    throw new AppError('Missing tenant context', 'MISSING_TENANT', 401);
  }
  return tenantId;
}

const createPaymentSchema = z.object({
  customerId: z.string().uuid(),
  invoiceId: z.string().uuid().optional(),
  amount: z.number().positive(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF']).default('USD'),
  paymentMethod: z.enum([
    'credit_card', 'debit_card', 'ach_transfer', 'wire_transfer',
    'check', 'cash', 'digital_wallet', 'other',
  ]).optional(),
  description: z.string().max(500).optional(),
  metadata: z.record(z.string()).optional(),
  returnUrl: z.string().url().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantId(request);
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
    const offset = (page - 1) * limit;
    const customerId = searchParams.get('customerId') ?? undefined;
    const status = searchParams.get('status') as string | null;

    const conditions = [eq(payments.tenantId, tenantId)];
    if (customerId) conditions.push(eq(payments.customerId, customerId));
    if (status) conditions.push(eq(payments.status, status as 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded' | 'disputed'));

    const where = and(...conditions);

    const [countResult, data] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(payments).where(where),
      db
        .select()
        .from(payments)
        .where(where)
        .orderBy(desc(payments.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    const total = countResult[0]?.count ?? 0;

    return NextResponse.json({
      data,
      meta: {
        page,
        limit,
        total,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.statusCode },
      );
    }
    console.error('GET /api/v1/payments error:', error);
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
    const data = createPaymentSchema.parse(body);

    const customer = await db.query.customers.findFirst({
      where: and(eq(customers.tenantId, tenantId), eq(customers.id, data.customerId)),
    });

    if (!customer) {
      return NextResponse.json(
        { error: { code: 'CUSTOMER_NOT_FOUND', message: 'Customer not found' } },
        { status: 404 },
      );
    }

    const country = customer.billingCountry ?? 'US';
    const result = await PaymentService.createPayment({
      tenantId,
      customerId: data.customerId,
      invoiceId: data.invoiceId,
      amount: data.amount,
      currency: data.currency,
      customerEmail: customer.email ?? '',
      customerName: customer.name,
      description: data.description,
      metadata: data.metadata,
      returnUrl: data.returnUrl,
      country,
    });

    return NextResponse.json({
      data: {
        paymentIntent: result.intent,
        clientSecret: result.clientSecret,
        checkoutUrl: result.checkoutUrl,
      },
    }, { status: 201 });
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
    console.error('POST /api/v1/payments error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 },
    );
  }
}
