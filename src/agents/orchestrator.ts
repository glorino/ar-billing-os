import { z } from 'zod';
import { AgentContext, AgentToolResult, TaskRequest, StreamingChunk, AgentRole } from './types';
import { ORCHESTRATION_CONFIG, getAgentConfig, AGENT_CONFIG } from './config';
import { invoiceAgent } from './invoice-agent';
import { collectionAgent } from './collection-agent';
import { reminderAgent } from './reminder-agent';
import { paymentAgent } from './payment-agent';
import { reconciliationAgent } from './reconciliation-agent';
import { auditAgent } from './audit-agent';
import { fraudAgent } from './fraud-agent';
import { forecastingAgent } from './forecasting-agent';

const TASK_ROUTE_MAP: Record<string, AgentRole> = {
  generate_invoice: 'invoice',
  validate_invoice: 'invoice',
  optimize_invoice_timing: 'invoice',
  send_invoice: 'invoice',
  collect_payment: 'collection',
  negotiate_payment_plan: 'collection',
  escalate_collection: 'collection',
  send_reminder: 'reminder',
  schedule_reminders: 'reminder',
  process_payment: 'payment',
  retry_payment: 'payment',
  process_refund: 'payment',
  reconcile_payments: 'reconciliation',
  match_payment_to_invoice: 'reconciliation',
  detect_discrepancies: 'reconciliation',
  run_audit: 'audit',
  detect_anomalies: 'audit',
  generate_compliance_report: 'audit',
  detect_fraud: 'fraud',
  check_velocity: 'fraud',
  block_transaction: 'fraud',
  forecast_revenue: 'forecasting',
  predict_late_payment: 'forecasting',
  analyze_cashflow: 'forecasting',
  predict_dso: 'forecasting',
};

const agentInstances = new Map<AgentRole, AgentInstance>();

interface AgentInstance {
  role: AgentRole;
  config: ReturnType<typeof getAgentConfig>;
  processTask: (context: AgentContext, input: Record<string, unknown>) => Promise<AgentToolResult>;
  handleHandoff: (from: AgentRole, context: AgentContext, data: Record<string, unknown>) => Promise<AgentToolResult>;
}

function getAgentInstance(role: AgentRole): AgentInstance {
  if (agentInstances.has(role)) {
    return agentInstances.get(role)!;
  }

  const agentMap: Record<AgentRole, () => AgentInstance> = {
    orchestrator: () => ({
      role: 'orchestrator',
      config: getAgentConfig('orchestrator'),
      processTask: async (ctx, input) => processOrchestratorTask(ctx, input),
      handleHandoff: async (from, ctx, data) => handleOrchestratorHandoff(from, ctx, data),
    }),
    invoice: () => ({
      role: 'invoice',
      config: getAgentConfig('invoice'),
      processTask: async (ctx, input) => invoiceAgent.process(ctx, input),
      handleHandoff: async (from, ctx, data) => invoiceAgent.handleHandoff(from, ctx, data),
    }),
    collection: () => ({
      role: 'collection',
      config: getAgentConfig('collection'),
      processTask: async (ctx, input) => collectionAgent.process(ctx, input),
      handleHandoff: async (from, ctx, data) => collectionAgent.handleHandoff(from, ctx, data),
    }),
    reminder: () => ({
      role: 'reminder',
      config: getAgentConfig('reminder'),
      processTask: async (ctx, input) => reminderAgent.process(ctx, input),
      handleHandoff: async (from, ctx, data) => reminderAgent.handleHandoff(from, ctx, data),
    }),
    payment: () => ({
      role: 'payment',
      config: getAgentConfig('payment'),
      processTask: async (ctx, input) => paymentAgent.process(ctx, input),
      handleHandoff: async (from, ctx, data) => paymentAgent.handleHandoff(from, ctx, data),
    }),
    reconciliation: () => ({
      role: 'reconciliation',
      config: getAgentConfig('reconciliation'),
      processTask: async (ctx, input) => reconciliationAgent.process(ctx, input),
      handleHandoff: async (from, ctx, data) => reconciliationAgent.handleHandoff(from, ctx, data),
    }),
    audit: () => ({
      role: 'audit',
      config: getAgentConfig('audit'),
      processTask: async (ctx, input) => auditAgent.process(ctx, input),
      handleHandoff: async (from, ctx, data) => auditAgent.handleHandoff(from, ctx, data),
    }),
    fraud: () => ({
      role: 'fraud',
      config: getAgentConfig('fraud'),
      processTask: async (ctx, input) => fraudAgent.process(ctx, input),
      handleHandoff: async (from, ctx, data) => fraudAgent.handleHandoff(from, ctx, data),
    }),
    forecasting: () => ({
      role: 'forecasting',
      config: getAgentConfig('forecasting'),
      processTask: async (ctx, input) => forecastingAgent.process(ctx, input),
      handleHandoff: async (from, ctx, data) => forecastingAgent.handleHandoff(from, ctx, data),
    }),
  };

  const instance = agentMap[role]();
  agentInstances.set(role, instance);
  return instance;
}

async function processOrchestratorTask(
  context: AgentContext,
  input: Record<string, unknown>
): Promise<AgentToolResult> {
  return {
    success: true,
    data: {
      message: 'Orchestrator is routing this task to the appropriate agent',
      availableAgents: Object.keys(AGENT_CONFIG).filter(r => r !== 'orchestrator'),
    },
  };
}

async function handleOrchestratorHandoff(
  from: AgentRole,
  context: AgentContext,
  data: Record<string, unknown>
): Promise<AgentToolResult> {
  return {
    success: true,
    data: {
      message: `Orchestrator received handoff from ${from}`,
      data,
    },
  };
}

export function routeTask(taskType: string): AgentRole {
  const role = TASK_ROUTE_MAP[taskType];
  if (!role) {
    throw new Error(`No agent found for task type: ${taskType}`);
  }
  return role;
}

export async function processTask(
  request: TaskRequest,
  onChunk?: (chunk: StreamingChunk) => void
): Promise<AgentToolResult> {
  const startTime = Date.now();
  const context: AgentContext = {
    tenantId: request.tenantId,
    userId: request.userId,
    requestId: request.id,
    metadata: request.metadata,
  };

  try {
    const agentRole = routeTask(request.taskType);
    const agent = getAgentInstance(agentRole);

    onChunk?.({
      type: 'text',
      content: `Routing to ${agent.config.name}...`,
      agentRole,
      timestamp: new Date(),
    });

    let lastResult: AgentToolResult | null = null;
    let currentRole: AgentRole = agentRole;
    let currentInput = request.input;
    let handoffCount = 0;

    while (handoffCount < ORCHESTRATION_CONFIG.maxRetries) {
      const currentAgent = getAgentInstance(currentRole);

      onChunk?.({
        type: 'tool_call',
        content: `Executing ${currentAgent.config.name}`,
        agentRole: currentRole,
        toolName: request.taskType,
        timestamp: new Date(),
      });

      const result = await executeWithRetry(
        () => currentAgent.processTask(context, currentInput),
        ORCHESTRATION_CONFIG.maxRetries,
        ORCHESTRATION_CONFIG.retryDelayMs
      );

      onChunk?.({
        type: 'tool_result',
        content: JSON.stringify(result),
        agentRole: currentRole,
        toolName: request.taskType,
        timestamp: new Date(),
      });

      if (result.success && (result.data as Record<string, unknown>)?.handoffTo) {
        const resultData = result.data as Record<string, unknown>;
        const nextRole = resultData.handoffTo as AgentRole;
        currentRole = nextRole;
        currentInput = (resultData.handoffData as Record<string, unknown>) || {};
        handoffCount++;

        onChunk?.({
          type: 'text',
          content: `Handing off to ${AGENT_CONFIG[nextRole].name}`,
          agentRole: nextRole,
          timestamp: new Date(),
        });
      } else {
        lastResult = result;
        break;
      }
    }

    if (!lastResult) {
      lastResult = {
        success: false,
        error: 'Maximum handoff depth exceeded',
      };
    }

    onChunk?.({
      type: 'done',
      content: 'Task completed',
      timestamp: new Date(),
    });

    return lastResult;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown orchestrator error';

    onChunk?.({
      type: 'error',
      content: errorMessage,
      timestamp: new Date(),
    });

    return {
      success: false,
      error: errorMessage,
      metadata: {
        processingTimeMs: Date.now() - startTime,
        requestId: request.id,
      },
    };
  }
}

async function executeWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  delayMs: number
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        const backoffDelay = delayMs * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

export async function* processTaskStream(
  request: TaskRequest
): AsyncGenerator<StreamingChunk> {
  const context: AgentContext = {
    tenantId: request.tenantId,
    userId: request.userId,
    requestId: request.id,
    metadata: request.metadata,
  };

  try {
    const agentRole = routeTask(request.taskType);
    const agent = getAgentInstance(agentRole);

    yield {
      type: 'text',
      content: `Starting task processing with ${agent.config.name}`,
      agentRole,
      timestamp: new Date(),
    };

    yield {
      type: 'tool_call',
      content: `Processing ${request.taskType}`,
      agentRole,
      toolName: request.taskType,
      timestamp: new Date(),
    };

    const result = await agent.processTask(context, request.input);

    yield {
      type: 'tool_result',
      content: JSON.stringify(result),
      agentRole,
      toolName: request.taskType,
      timestamp: new Date(),
    };

    yield {
      type: 'done',
      content: 'Task completed successfully',
      agentRole,
      timestamp: new Date(),
    };
  } catch (error) {
    yield {
      type: 'error',
      content: error instanceof Error ? error.message : 'Task processing failed',
      timestamp: new Date(),
    };
  }
}

export function getAgentStatus() {
  return {
    availableAgents: Object.keys(AGENT_CONFIG).map(role => ({
      role,
      name: AGENT_CONFIG[role as AgentRole].name,
      description: AGENT_CONFIG[role as AgentRole].description,
    })),
    taskRoutes: TASK_ROUTE_MAP,
    config: ORCHESTRATION_CONFIG,
  };
}

export function registerCustomTaskRoute(
  taskType: string,
  agentRole: AgentRole
): void {
  if (!AGENT_CONFIG[agentRole]) {
    throw new Error(`Invalid agent role: ${agentRole}`);
  }
  TASK_ROUTE_MAP[taskType] = agentRole;
}

export const orchestrator = {
  processTask,
  processTaskStream,
  routeTask,
  getAgentStatus,
  registerCustomTaskRoute,
  getAgentInstance,
};
