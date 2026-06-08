import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ReportingService } from '@/server/services/reporting';
import { db } from '@/lib/db';
import { sql, eq } from 'drizzle-orm';
import { AppError } from '@/server/services/customer';

function getTenantId(request: NextRequest): string {
  const tenantId = request.headers.get('x-tenant-id');
  if (!tenantId) {
    throw new AppError('Missing tenant context', 'MISSING_TENANT', 401);
  }
  return tenantId;
}

const generateReportSchema = z.object({
  type: z.enum(['profit_loss', 'balance_sheet', 'ar_aging', 'revenue', 'cashflow']),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  format: z.enum(['json', 'csv', 'pdf']).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const tenantId = getTenantId(request);
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
    const offset = (page - 1) * limit;
    const type = searchParams.get('type') as string | null;

    const conditions = [sql`tenant_id = ${tenantId}`];
    if (type) conditions.push(sql`report_type = ${type}`);

    const where = sql`${sql.join(conditions, sql` AND `)}`;

    const [countResult, data] = await Promise.all([
      db.execute<{ count: number }>(
        sql`SELECT count(*)::int as count FROM revenue_metrics WHERE tenant_id = ${tenantId}`
      ),
      db.execute(
        sql`SELECT * FROM revenue_metrics WHERE tenant_id = ${tenantId} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
      ),
    ]);

    const total = Array.isArray(countResult) ? (countResult[0] as { count: number })?.count ?? 0 : 0;

    return NextResponse.json({
      data,
      meta: {
        page,
        limit,
        total,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.statusCode },
      );
    }
    console.error('GET /api/v1/reports error:', error);
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
    const data = generateReportSchema.parse(body);

    let reportData: unknown;

    switch (data.type) {
      case 'profit_loss':
        reportData = await ReportingService.getProfitAndLoss(
          tenantId,
          data.periodStart,
          data.periodEnd,
        );
        break;
      case 'balance_sheet':
        reportData = await ReportingService.getBalanceSheet(tenantId, data.periodEnd);
        break;
      case 'ar_aging':
        reportData = await ReportingService.getARAgingReport(tenantId, data.periodEnd);
        break;
      case 'revenue':
        reportData = await ReportingService.getDSO(tenantId);
        break;
      case 'cashflow':
        reportData = { message: 'Cashflow report generated via analytics endpoint' };
        break;
      default:
        return NextResponse.json(
          { error: { code: 'INVALID_REPORT_TYPE', message: 'Unknown report type' } },
          { status: 400 },
        );
    }

    return NextResponse.json({
      data: {
        reportType: data.type,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        format: data.format ?? 'json',
        generatedAt: new Date().toISOString(),
        content: reportData,
      },
    }, { status: 201 });
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
    console.error('POST /api/v1/reports error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 },
    );
  }
}
