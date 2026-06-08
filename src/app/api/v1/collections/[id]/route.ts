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

const updateCaseSchema = z.object({
  status: z.enum(['reminder', 'final_notice', 'collection_agency', 'legal', 'resolved']).optional(),
  notes: z.string().optional(),
  assignedTo: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const tenantId = getTenantId(request);
    const { id } = await params;
    const collectionCase = await CollectionService.getCaseById(tenantId, id);
    const events = await CollectionService.getEvents(tenantId, id);

    return NextResponse.json({ data: { ...collectionCase, events } });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.statusCode },
      );
    }
    console.error('GET /api/v1/collections/[id] error:', error);
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
    const data = updateCaseSchema.parse(body);

    const collectionCase = await CollectionService.getCaseById(tenantId, id);

    let updated = collectionCase;
    if (data.status && data.status !== collectionCase.status) {
      if (data.status === 'resolved') {
        updated = await CollectionService.resolve(tenantId, id, data.notes ?? 'Resolved');
      } else {
        updated = await CollectionService.escalate(tenantId, id);
      }
    }

    if (data.notes) {
      await CollectionService.addEvent(tenantId, id, {
        action: 'email_reminder',
        description: data.notes,
      });
    }

    return NextResponse.json({ data: updated });
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
    console.error('PUT /api/v1/collections/[id] error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 },
    );
  }
}
