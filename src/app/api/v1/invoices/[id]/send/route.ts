import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { InvoiceService, AppError } from '@/server/services/invoice';
import { db } from '@/lib/db';
import { invoices, customers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

function getTenantId(request: NextRequest): string {
  const tenantId = request.headers.get('x-tenant-id');
  if (!tenantId) {
    throw new AppError('Missing tenant context', 'MISSING_TENANT', 401);
  }
  return tenantId;
}

const sendInvoiceSchema = z.object({
  recipientEmail: z.string().email().optional(),
  cc: z.array(z.string().email()).optional(),
  subject: z.string().max(255).optional(),
  message: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const tenantId = getTenantId(request);
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const data = sendInvoiceSchema.parse(body);

    const invoice = await InvoiceService.getById(tenantId, id);

    if (invoice.status !== 'draft' && invoice.status !== 'pending') {
      return NextResponse.json(
        { error: { code: 'INVALID_STATUS', message: 'Invoice must be in draft or pending status to send' } },
        { status: 400 },
      );
    }

    const customer = await db.query.customers.findFirst({
      where: and(eq(customers.tenantId, tenantId), eq(customers.id, invoice.customerId)),
    });

    if (!customer?.email && !data.recipientEmail) {
      return NextResponse.json(
        { error: { code: 'MISSING_EMAIL', message: 'No recipient email available' } },
        { status: 400 },
      );
    }

    const recipientEmail = data.recipientEmail ?? customer!.email;

    // Update status to sent
    await InvoiceService.updateStatus(tenantId, id, 'sent');

    // In production, this would integrate with an email service (SendGrid, SES, etc.)
    console.log(`Invoice ${invoice.invoiceNumber} sent to ${recipientEmail}`);

    return NextResponse.json({
      data: {
        invoiceId: id,
        status: 'sent',
        recipientEmail,
        sentAt: new Date().toISOString(),
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
    console.error('POST /api/v1/invoices/[id]/send error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 },
    );
  }
}
