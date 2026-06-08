import { NextRequest, NextResponse } from 'next/server';
import { ReportingService } from '@/server/services/reporting';
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
    const asOfDate = searchParams.get('asOf') ? new Date(searchParams.get('asOf')!) : undefined;
    const dsoPeriod = parseInt(searchParams.get('dsoPeriod') ?? '30', 10);

    const [agingReport, dso] = await Promise.all([
      ReportingService.getARAgingReport(tenantId, asOfDate),
      ReportingService.getDSO(tenantId, dsoPeriod),
    ]);

    const totalOutstanding = agingReport.reduce(
      (sum, row) => sum + Number(row.totalOutstanding),
      0,
    );

    return NextResponse.json({
      data: {
        aging: agingReport,
        dso,
        summary: {
          totalOutstanding: totalOutstanding.toFixed(4),
          customerCount: agingReport.length,
        },
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.statusCode },
      );
    }
    console.error('GET /api/v1/analytics/ar-aging error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 },
    );
  }
}
