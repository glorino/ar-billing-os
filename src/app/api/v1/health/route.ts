import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Check database connectivity
    const dbResult = await db.execute<{ ok: number }>(
      sql`SELECT 1 as ok`
    );

    const isHealthy = dbResult.rows.length > 0;

    return NextResponse.json({
      data: {
        status: isHealthy ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version ?? '1.0.0',
        environment: process.env.NODE_ENV ?? 'development',
        services: {
          database: isHealthy ? 'connected' : 'disconnected',
          stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured',
          paystack: process.env.PAYSTACK_SECRET_KEY ? 'configured' : 'not_configured',
          flutterwave: process.env.FLUTTERWAVE_SECRET_KEY ? 'configured' : 'not_configured',
          clerk: process.env.CLERK_SECRET_KEY ? 'configured' : 'not_configured',
        },
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        data: {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: 'Database connection failed',
        },
      },
      { status: 503 },
    );
  }
}
