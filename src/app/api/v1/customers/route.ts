import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CustomerService, AppError } from '@/server/services/customer';

function getTenantId(request: NextRequest): string {
  const tenantId = request.headers.get('x-tenant-id');
  if (!tenantId) {
    throw new AppError('Missing tenant context', 'MISSING_TENANT', 401);
  }
  return tenantId;
}

const createCustomerSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().optional(),
  phone: z.string().max(50).optional(),
  company: z.string().max(255).optional(),
  address: z.string().optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(2).optional(),
  taxId: z.string().max(50).optional(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF']).optional(),
  paymentTerms: z.number().int().min(0).max(365).optional(),
  creditLimit: z.string().optional(),
  notes: z.string().optional(),
  externalId: z.string().max(255).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantId(request);
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
    const offset = (page - 1) * limit;
    const search = searchParams.get('search') ?? undefined;
    const isActiveParam = searchParams.get('isActive');
    const isActive = isActiveParam !== null ? isActiveParam === 'true' : undefined;
    const collectionStatus = searchParams.get('collectionStatus') as
      | 'none' | 'reminder' | 'final_notice' | 'collection_agency' | 'legal' | 'resolved'
      | null;

    const result = await CustomerService.list(tenantId, {
      limit,
      offset,
      search,
      isActive,
      collectionStatus: collectionStatus ?? undefined,
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
    console.error('GET /api/v1/customers error:', error);
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
    const data = createCustomerSchema.parse(body);

    const customer = await CustomerService.create(tenantId, data);

    return NextResponse.json({ data: customer }, { status: 201 });
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
    console.error('POST /api/v1/customers error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 },
    );
  }
}
