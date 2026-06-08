import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CollectionService, AppError } from '@/server/services/collection';

function getTenantId(request: NextRequest): string {
  const tenantId = request.headers.get('x-tenant-id');
  if (!tenantId) {
    throw new AppError('Missing tenant context', 'MISSING_TENANT', 401);
  }
  return tenantId;
}

const createCaseSchema = z.object({
  customerId: z.string().uuid(),
  invoiceId: z.string().uuid().optional(),
  status: z.enum(['reminder', 'final_notice', 'collection_agency', 'legal']).optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
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
      | 'reminder' | 'final_notice' | 'collection_agency' | 'legal' | 'resolved'
      | null;
    const minOverdueDays = searchParams.get('minOverdueDays')
      ? parseInt(searchParams.get('minOverdueDays')!, 10)
      : undefined;

    const result = await CollectionService.listCases(tenantId, {
      limit,
      offset,
      customerId,
      status: status ?? undefined,
      minOverdueDays,
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
    console.error('GET /api/v1/collections error:', error);
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
    const data = createCaseSchema.parse(body);

    const collectionCase = await CollectionService.createCase(tenantId, {
      ...data,
      caseNumber: `COL-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    });

    return NextResponse.json({ data: collectionCase }, { status: 201 });
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
    console.error('POST /api/v1/collections error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 },
    );
  }
}
