import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { InvoiceService, AppError } from '@/server/services/invoice';

function getTenantId(request: NextRequest): string {
  const tenantId = request.headers.get('x-tenant-id');
  if (!tenantId) {
    throw new AppError('Missing tenant context', 'MISSING_TENANT', 401);
  }
  return tenantId;
}

const voidInvoiceSchema = z.object({
  reason: z.string().min(1).max(500).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const tenantId = getTenantId(request);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const data = voidInvoiceSchema.parse(body);

    const invoice = await InvoiceService.updateStatus(tenantId, id, 'cancelled');

    return NextResponse.json({
      data: {
        ...invoice,
        voidReason: data.reason,
        voidedAt: new Date().toISOString(),
      },
    });
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
    console.error('POST /api/v1/invoices/[id]/void error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 },
    );
  }
}
