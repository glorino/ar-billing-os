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

const updateInvoiceSchema = z.object({
  customerId: z.string().uuid().optional(),
  invoiceNumber: z.string().min(1).max(100).optional(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF']).optional(),
  issueDate: z.coerce.date().optional(),
  dueDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  memo: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const tenantId = getTenantId(request);
    const { id } = await params;
    const { invoice, items } = await InvoiceService.getWithItems(tenantId, id);
    return NextResponse.json({ data: { ...invoice, items } });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.statusCode },
      );
    }
    console.error('GET /api/v1/invoices/[id] error:', error);
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
    const data = updateInvoiceSchema.parse(body);

    const invoice = await InvoiceService.update(tenantId, id, data);
    return NextResponse.json({ data: invoice });
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
    console.error('PUT /api/v1/invoices/[id] error:', error);
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
    await InvoiceService.delete(tenantId, id);
    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.statusCode },
      );
    }
    console.error('DELETE /api/v1/invoices/[id] error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 },
    );
  }
}
