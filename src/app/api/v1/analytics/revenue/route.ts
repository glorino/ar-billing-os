import { NextRequest, NextResponse } from 'next/server';
import { RevenueService } from '@/server/services/revenue';
import { AppError } from '@/server/services/customer';

function getTenantId(request: NextRequest): string {
  const tenantId = request.headers.get('x-tenant-id');
  if (!tenantId) {
    throw new AppError('Missing tenant context', 'MISSING_TENANT', 401);
  }
  return tenantId;
}

export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantId(request);
    const { searchParams } = new URL(request.url);
    const months = parseInt(searchParams.get('months') ?? '12', 10);

    const [mrr, arr, breakdown, historical, churn] = await Promise.all([
      RevenueService.getMRR(tenantId),
      RevenueService.getARR(tenantId),
      RevenueService.getRevenueBreakdown(tenantId),
      RevenueService.getHistoricalMetrics(tenantId, months),
      RevenueService.getChurnRate(tenantId),
    ]);

    return NextResponse.json({
      data: {
        mrr,
        arr,
        breakdown,
        churn,
        historical,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.statusCode },
      );
    }
    console.error('GET /api/v1/analytics/revenue error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 },
    );
  }
}
