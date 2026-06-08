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

const lineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.string(),
  taxRate: z.number().min(0).max(100).optional(),
  discountType: z.enum(['percentage', 'fixed_amount']).optional(),
  discountValue: z.string().optional(),
  lineItemType: z.enum(['subscription', 'usage', 'one_time', 'fee', 'discount', 'tax', 'credit']).optional(),
});

const createInvoiceSchema = z.object({
  customerId: z.string().uuid(),
  invoiceNumber: z.string().min(1).max(100),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF']).optional(),
  issueDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  memo: z.string().optional(),
  items: z.array(lineItemSchema).optional(),
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
    const status = searchParams.get('status') as 'draft' | 'pending' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'cancelled' | 'written_off' | null;
    const from = searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined;
    const to = searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined;

    const result = await InvoiceService.list(tenantId, {
      limit,
      offset,
      customerId,
      status: status ?? undefined,
      from,
      to,
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
    console.error('GET /api/v1/invoices error:', error);
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
    const data = createInvoiceSchema.parse(body);

    const invoice = await InvoiceService.create(tenantId, {
      customerId: data.customerId,
      invoiceNumber: data.invoiceNumber,
      currency: data.currency,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      notes: data.notes,
      terms: data.terms,
      memo: data.memo,
      items: data.items?.map(item => ({
        ...item,
        quantity: String(item.quantity),
        taxRate: item.taxRate != null ? String(item.taxRate) : undefined,
        lineItemType: item.lineItemType ?? 'one_time' as const,
        amount: String(parseFloat(item.unitPrice) * item.quantity),
      })),
      metadata: data.metadata,
    });

    return NextResponse.json({ data: invoice }, { status: 201 });
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
    console.error('POST /api/v1/invoices error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 },
    );
  }
}
