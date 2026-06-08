import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { orchestrator } from '@/agents/orchestrator';
import { TaskType } from '@/agents/types';
import { AppError } from '@/server/services/customer';

function getTenantId(request: NextRequest): string {
  const tenantId = request.headers.get('x-tenant-id');
  if (!tenantId) {
    throw new AppError('Missing tenant context', 'MISSING_TENANT', 401);
  }
  return tenantId;
}

function getUserId(request: NextRequest): string | undefined {
  return request.headers.get('x-user-id') ?? undefined;
}

const invokeAgentSchema = z.object({
  taskType: z.string().min(1),
  input: z.record(z.unknown()).default({}),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const tenantId = getTenantId(request);
    const userId = getUserId(request);
    const body = await request.json();
    const data = invokeAgentSchema.parse(body);

    const requestId = crypto.randomUUID();

    const result = await orchestrator.processTask({
      id: requestId,
      tenantId,
      taskType: data.taskType as TaskType,
      input: data.input,
      userId,
      priority: data.priority,
      metadata: data.metadata,
    });

    return NextResponse.json({
      data: {
        requestId,
        ...result,
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
    console.error('POST /api/v1/ai/agents error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 },
    );
  }
}
