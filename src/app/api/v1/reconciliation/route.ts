import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ReconciliationService, AppError } from '@/server/services/reconciliation';

function getTenantId(request: NextRequest): string {
  const tenantId = request.headers.get('x-tenant-id');
  if (!tenantId) {
    throw new AppError('Missing tenant context', 'MISSING_TENANT', 401);
  }
  return tenantId;
}

const reconciliationItemSchema = z.object({
  paymentId: z.string().uuid().optional(),
  transactionDate: z.coerce.date(),
  transactionReference: z.string().max(255).optional(),
  transactionDescription: z.string().max(500).optional(),
  transactionAmount: z.string(),
});

const startReconciliationSchema = z.object({
  source: z.string().min(1).max(255),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF']).optional(),
  statementDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  items: z.array(reconciliationItemSchema).min(1),
});

export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantId(request);
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
    const offset = (page - 1) * limit;
    const status = searchParams.get('status') as
      | 'pending' | 'matched' | 'partial' | 'unmatched' | 'cancelled'
      | null;

    const result = await ReconciliationService.listBatches(tenantId, {
      limit,
      offset,
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
    console.error('GET /api/v1/reconciliation error:', error);
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
    const data = startReconciliationSchema.parse(body);

    const batch = await ReconciliationService.processBatchReconciliation(tenantId, {
      source: data.source,
      currency: data.currency,
      statementDate: data.statementDate,
      notes: data.notes,
      items: data.items,
    });

    return NextResponse.json({ data: batch }, { status: 201 });
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
    console.error('POST /api/v1/reconciliation error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 },
    );
  }
}
