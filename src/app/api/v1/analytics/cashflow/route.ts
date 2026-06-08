import { NextRequest, NextResponse } from 'next/server';
import { CashflowService } from '@/server/services/cashflow';
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
    const months = parseInt(searchParams.get('months') ?? '6', 10);

    const [projections, runway, inflowAnalysis, outflowAnalysis] = await Promise.all([
      CashflowService.getProjections(tenantId, months),
      CashflowService.getRunway(tenantId),
      CashflowService.getInflowAnalysis(tenantId),
      CashflowService.getOutflowAnalysis(tenantId),
    ]);

    return NextResponse.json({
      data: {
        projections,
        runway,
        inflows: inflowAnalysis,
        outflows: outflowAnalysis,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.statusCode },
      );
    }
    console.error('GET /api/v1/analytics/cashflow error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 },
    );
  }
}
