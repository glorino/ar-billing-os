import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { payments } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { PaymentService } from '@/lib/payments';
import { AppError } from '@/server/services/customer';

function getTenantId(request: NextRequest): string {
  const tenantId = request.headers.get('x-tenant-id');
  if (!tenantId) {
    throw new AppError('Missing tenant context', 'MISSING_TENANT', 401);
  }
  return tenantId;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const tenantId = getTenantId(request);
    const { id } = await params;

    const payment = await db.query.payments.findFirst({
      where: and(eq(payments.tenantId, tenantId), eq(payments.id, id)),
    });

    if (!payment) {
      return NextResponse.json(
        { error: { code: 'PAYMENT_NOT_FOUND', message: 'Payment not found' } },
        { status: 404 },
      );
    }

    const statusInfo = await PaymentService.getPaymentStatus(id, tenantId);

    return NextResponse.json({
      data: {
        ...payment,
        providerStatus: statusInfo?.status,
        provider: statusInfo?.provider,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.statusCode },
      );
    }
    console.error('GET /api/v1/payments/[id] error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 },
    );
  }
}
