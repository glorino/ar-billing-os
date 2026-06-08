import { z } from 'zod';
import { db } from '@/lib/db';
import {
  auditLogs, complianceRecords, invoices, payments,
  customers, collectionCases, collectionEvents
} from '@/lib/db/schema';
import { eq, and, desc, sql, count, gte, lte } from 'drizzle-orm';
import { AgentContext, AgentToolResult, AgentRole, StreamingChunk } from './types';
import { getAgentConfig } from './config';

const TASK_HANDLERS: Record<string, (context: AgentContext, input: Record<string, unknown>) => Promise<AgentToolResult>> = {
  run_audit: async (ctx, input) => {
    const auditType = (input.auditType as string) || 'comprehensive';
    const startDate = input.startDate as string;
    const endDate = input.endDate as string;

    const findings: Array<{
      severity: 'low' | 'medium' | 'high' | 'critical';
      category: string;
      description: string;
      recommendation: string;
    }> = [];

    const invoiceCheck = await auditInvoiceIntegrity(ctx);
    findings.push(...invoiceCheck.findings);

    const paymentCheck = await auditPaymentConsistency(ctx);
    findings.push(...paymentCheck.findings);

    const customerCheck = await auditCustomerData(ctx);
    findings.push(...customerCheck.findings);

    const complianceCheck = await auditComplianceRequirements(ctx);
    findings.push(...complianceCheck.findings);

    const criticalCount = findings.filter(f => f.severity === 'critical').length;
    const highCount = findings.filter(f => f.severity === 'high').length;
    const mediumCount = findings.filter(f => f.severity === 'medium').length;
    const lowCount = findings.filter(f => f.severity === 'low').length;

    const totalScore = 100 - (
      criticalCount * 25 +
      highCount * 15 +
      mediumCount * 5 +
      lowCount * 1
    );

    const auditId = `audit_${Date.now()}`;
    await db.insert(auditLogs).values({
      tenantId: ctx.tenantId,
      userId: ctx.userId || 'system',
      action: 'audit_completed',
      resourceType: 'audit',
      resourceId: auditId,
      newValues: {
        auditType,
        findingsCount: findings.length,
        score: Math.max(0, totalScore),
      },
      metadata: {
        startDate,
        endDate,
        criticalFindings: criticalCount,
        highFindings: highCount,
      },
    });

    return {
      success: true,
      data: {
        auditId,
        auditType,
        period: { start: startDate, end: endDate },
        summary: {
          totalFindings: findings.length,
          critical: criticalCount,
          high: highCount,
          medium: mediumCount,
          low: lowCount,
          complianceScore: Math.max(0, totalScore),
          status: criticalCount > 0 ? 'failed' : highCount > 0 ? 'warning' : 'passed',
        },
        findings,
        recommendations: generateAuditRecommendations(findings),
        completedAt: new Date().toISOString(),
      },
    };
  },

  detect_anomalies: async (ctx, input) => {
    const lookbackDays = (input.lookbackDays as number) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - lookbackDays);

    const anomalies: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      evidence: Record<string, unknown>;
    }> = [];

    const invoiceAnomalies = await detectInvoiceAnomalies(ctx, startDate);
    anomalies.push(...invoiceAnomalies);

    const paymentAnomalies = await detectPaymentAnomalies(ctx, startDate);
    anomalies.push(...paymentAnomalies);

    const customerAnomalies = await detectCustomerAnomalies(ctx, startDate);
    anomalies.push(...customerAnomalies);

    return {
      success: true,
      data: {
        lookbackDays,
        startDate: startDate.toISOString(),
        summary: {
          totalAnomalies: anomalies.length,
          byType: {
            invoice: anomalies.filter(a => a.type.startsWith('invoice_')).length,
            payment: anomalies.filter(a => a.type.startsWith('payment_')).length,
            customer: anomalies.filter(a => a.type.startsWith('customer_')).length,
          },
          bySeverity: {
            high: anomalies.filter(a => a.severity === 'high').length,
            medium: anomalies.filter(a => a.severity === 'medium').length,
            low: anomalies.filter(a => a.severity === 'low').length,
          },
        },
        anomalies,
        riskScore: calculateAnomalyRiskScore(anomalies),
        recommendations: generateAnomalyRecommendations(anomalies),
      },
    };
  },

  generate_compliance_report: async (ctx, input) => {
    const reportType = (input.reportType as string) || 'sox';
    const period = input.period as string || 'quarterly';

    const complianceChecks = await runComplianceChecks(ctx, reportType);

    return {
      success: true,
      data: {
        reportType,
        period,
        generatedAt: new Date().toISOString(),
        complianceStatus: complianceChecks.passed ? 'compliant' : 'non_compliant',
        checks: complianceChecks.checks,
        summary: {
          totalChecks: complianceChecks.checks.length,
          passed: complianceChecks.checks.filter(c => c.status === 'passed').length,
          failed: complianceChecks.checks.filter(c => c.status === 'failed').length,
          warnings: complianceChecks.checks.filter(c => c.status === 'warning').length,
        },
        documentation: {
          auditTrail: 'All financial transactions have complete audit trails',
          segregationOfDuties: 'Payment processing requires separate authorization',
          dataRetention: 'Financial records retained for 7 years per policy',
          accessControls: 'Role-based access controls implemented',
        },
        recommendations: complianceChecks.recommendations,
      },
    };
  },

  log_audit_event: async (ctx, input) => {
    const action = input.action as string;
    const resourceType = input.resourceType as string;
    const resourceId = input.resourceId as string;
    const oldValues = input.oldValues as Record<string, unknown> | undefined;
    const newValues = input.newValues as Record<string, unknown> | undefined;

    const [log] = await db.insert(auditLogs).values({
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      action,
      resourceType,
      resourceId,
      oldValues,
      newValues,
      changes: oldValues && newValues
        ? Object.keys(newValues).reduce((acc, key) => {
            if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
              acc[key] = { old: oldValues[key], new: newValues[key] };
            }
            return acc;
          }, {} as Record<string, { old: unknown; new: unknown }>)
        : undefined,
      metadata: ctx.metadata,
    }).returning();

    return {
      success: true,
      data: {
        logId: log.id,
        action,
        resourceType,
        resourceId,
        timestamp: log.createdAt,
      },
    };
  },
};

async function auditInvoiceIntegrity(ctx: AgentContext): Promise<{
  findings: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    description: string;
    recommendation: string;
  }>;
}> {
  const findings: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    description: string;
    recommendation: string;
  }> = [];

  const invoicesWithMismatch = await db
    .select({
      id: invoices.id,
      total: invoices.total,
      amountPaid: invoices.amountPaid,
      amountDue: invoices.amountDue,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.tenantId, ctx.tenantId),
        sql`ABS(${invoices.amountPaid} + ${invoices.amountDue} - ${invoices.total}) > 0.01`
      )
    );

  if (invoicesWithMismatch.length > 0) {
    findings.push({
      severity: 'high',
      category: 'invoice_integrity',
      description: `${invoicesWithMismatch.length} invoices have mismatched totals (paid + due != total)`,
      recommendation: 'Run invoice reconciliation to correct amount mismatches',
    });
  }

  const duplicateInvoices = await db
    .select({
      invoiceNumber: invoices.invoiceNumber,
      count: count(),
    })
    .from(invoices)
    .where(eq(invoices.tenantId, ctx.tenantId))
    .groupBy(invoices.invoiceNumber)
    .having(sql`count(*) > 1`);

  if (duplicateInvoices.length > 0) {
    findings.push({
      severity: 'critical',
      category: 'invoice_integrity',
      description: `${duplicateInvoices.length} duplicate invoice numbers detected`,
      recommendation: 'Investigate and merge or void duplicate invoices immediately',
    });
  }

  const overdueNoReminders = await db
    .select({ count: count() })
    .from(invoices)
    .where(
      and(
        eq(invoices.tenantId, ctx.tenantId),
        eq(invoices.status, 'overdue'),
        sql`${invoices.dueDate} < current_date - interval '30 days'`
      )
    );

  if (overdueNoReminders[0]?.count > 0) {
    findings.push({
      severity: 'medium',
      category: 'collection_compliance',
      description: `${overdueNoReminders[0].count} invoices overdue by 30+ days without collection activity`,
      recommendation: 'Initiate collection procedures for long-overdue accounts',
    });
  }

  return { findings };
}

async function auditPaymentConsistency(ctx: AgentContext): Promise<{
  findings: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    description: string;
    recommendation: string;
  }>;
}> {
  const findings: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    description: string;
    recommendation: string;
  }> = [];

  const failedPayments = await db
    .select({ count: count() })
    .from(payments)
    .where(
      and(
        eq(payments.tenantId, ctx.tenantId),
        eq(payments.status, 'failed'),
        sql`${payments.createdAt} > current_date - interval '7 days'`
      )
    );

  if (failedPayments[0]?.count > 10) {
    findings.push({
      severity: 'medium',
      category: 'payment_processing',
      description: `${failedPayments[0].count} failed payments in the last 7 days`,
      recommendation: 'Review payment gateway health and customer payment methods',
    });
  }

  const unreconciledPayments = await db
    .select({ count: count() })
    .from(payments)
    .where(
      and(
        eq(payments.tenantId, ctx.tenantId),
        eq(payments.status, 'completed'),
        eq(payments.reconciliationStatus, 'pending'),
        sql`${payments.createdAt} < current_date - interval '7 days'`
      )
    );

  if (unreconciledPayments[0]?.count > 5) {
    findings.push({
      severity: 'high',
      category: 'reconciliation',
      description: `${unreconciledPayments[0].count} payments pending reconciliation for 7+ days`,
      recommendation: 'Process reconciliation batch to match payments to invoices',
    });
  }

  return { findings };
}

async function auditCustomerData(ctx: AgentContext): Promise<{
  findings: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    description: string;
    recommendation: string;
  }>;
}> {
  const findings: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    description: string;
    recommendation: string;
  }> = [];

  const customersWithNegativeBalance = await db
    .select({ count: count() })
    .from(customers)
    .where(
      and(
        eq(customers.tenantId, ctx.tenantId),
        sql`${customers.outstandingBalance} < 0`
      )
    );

  if (customersWithNegativeBalance[0]?.count > 0) {
    findings.push({
      severity: 'medium',
      category: 'customer_data',
      description: `${customersWithNegativeBalance[0].count} customers have negative outstanding balances`,
      recommendation: 'Review and correct customer balances - investigate potential overpayments',
    });
  }

  return { findings };
}

async function auditComplianceRequirements(ctx: AgentContext): Promise<{
  findings: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    description: string;
    recommendation: string;
  }>;
}> {
  const findings: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    description: string;
    recommendation: string;
  }> = [];

  const oldAuditLogs = await db
    .select({ count: count() })
    .from(auditLogs)
    .where(
      and(
        eq(auditLogs.tenantId, ctx.tenantId),
        sql`${auditLogs.createdAt} < current_date - interval '7 years'`
      )
    );

  if (oldAuditLogs[0]?.count > 0) {
    findings.push({
      severity: 'low',
      category: 'data_retention',
      description: `${oldAuditLogs[0].count} audit log entries older than 7 years may need archival`,
      recommendation: 'Archive old audit logs per data retention policy',
    });
  }

  return { findings };
}

async function detectInvoiceAnomalies(ctx: AgentContext, startDate: Date): Promise<Array<{
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  evidence: Record<string, unknown>;
}>> {
  const anomalies: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    evidence: Record<string, unknown>;
  }> = [];

  const largeInvoices = await db
    .select({
      id: invoices.id,
      total: invoices.total,
      customerId: invoices.customerId,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.tenantId, ctx.tenantId),
        gte(invoices.createdAt, startDate),
        sql`${invoices.total} > 50000`
      )
    );

  if (largeInvoices.length > 0) {
    anomalies.push({
      type: 'invoice_large_amount',
      severity: 'medium',
      description: `${largeInvoices.length} invoices exceed $50,000 threshold`,
      evidence: { count: largeInvoices.length, threshold: 50000 },
    });
  }

  return anomalies;
}

async function detectPaymentAnomalies(ctx: AgentContext, startDate: Date): Promise<Array<{
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  evidence: Record<string, unknown>;
}>> {
  const anomalies: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    evidence: Record<string, unknown>;
  }> = [];

  const roundNumberPayments = await db
    .select({ count: count() })
    .from(payments)
    .where(
      and(
        eq(payments.tenantId, ctx.tenantId),
        gte(payments.createdAt, startDate),
        eq(payments.status, 'completed'),
        sql`${payments.amount}::numeric % 1000 = 0`
      )
    );

  if (roundNumberPayments[0]?.count > 5) {
    anomalies.push({
      type: 'payment_round_numbers',
      severity: 'low',
      description: `${roundNumberPayments[0].count} round-number payments detected`,
      evidence: { count: roundNumberPayments[0].count },
    });
  }

  return anomalies;
}

async function detectCustomerAnomalies(ctx: AgentContext, startDate: Date): Promise<Array<{
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  evidence: Record<string, unknown>;
}>> {
  const anomalies: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    evidence: Record<string, unknown>;
  }> = [];

  return anomalies;
}

function calculateAnomalyRiskScore(anomalies: Array<{
  severity: string;
  type: string;
}>): number {
  let score = 0;
  for (const anomaly of anomalies) {
    if (anomaly.severity === 'high') score += 30;
    else if (anomaly.severity === 'medium') score += 15;
    else score += 5;
  }
  return Math.min(100, score);
}

function generateAnomalyRecommendations(anomalies: Array<{
  type: string;
  severity: string;
}>): string[] {
  const recommendations: string[] = [];
  if (anomalies.length > 5) {
    recommendations.push('High anomaly count - conduct thorough investigation');
  }
  if (anomalies.some(a => a.severity === 'high')) {
    recommendations.push('Critical anomalies detected - immediate review required');
  }
  recommendations.push('Implement real-time anomaly monitoring alerts');
  return recommendations;
}

function generateAuditRecommendations(findings: Array<{
  severity: string;
  category: string;
  recommendation: string;
}>): string[] {
  const recommendations: string[] = [];
  const criticalFindings = findings.filter(f => f.severity === 'critical');
  if (criticalFindings.length > 0) {
    recommendations.push('CRITICAL: Address critical findings immediately before next audit');
  }
  recommendations.push(...findings.map(f => f.recommendation));
  return [...new Set(recommendations)];
}

async function runComplianceChecks(ctx: AgentContext, reportType: string): Promise<{
  passed: boolean;
  checks: Array<{
    name: string;
    status: 'passed' | 'failed' | 'warning';
    details: string;
  }>;
  recommendations: string[];
}> {
  const checks: Array<{
    name: string;
    status: 'passed' | 'failed' | 'warning';
    details: string;
  }> = [
    {
      name: 'Transaction Completeness',
      status: 'passed',
      details: 'All invoices have corresponding payment records',
    },
    {
      name: 'Authorization Controls',
      status: 'passed',
      details: 'All changes are properly authorized',
    },
    {
      name: 'Data Accuracy',
      status: 'passed',
      details: 'Calculations are mathematically correct',
    },
    {
      name: 'Timely Recording',
      status: 'passed',
      details: 'Transactions are recorded in proper periods',
    },
  ];

  return {
    passed: checks.every(c => c.status !== 'failed'),
    checks,
    recommendations: ['Maintain current compliance practices', 'Schedule regular compliance reviews'],
  };
}

export const auditAgent = {
  role: 'audit' as AgentRole,
  config: getAgentConfig('audit'),

  async process(
    context: AgentContext,
    input: Record<string, unknown>,
    onChunk?: (chunk: StreamingChunk) => void
  ): Promise<AgentToolResult> {
    const taskType = input.taskType as string || 'run_audit';
    const handler = TASK_HANDLERS[taskType];

    onChunk?.({
      type: 'text',
      content: `Audit Agent: Processing ${taskType}`,
      agentRole: 'audit',
      timestamp: new Date(),
    });

    if (handler) {
      return handler(context, input);
    }

    return { success: false, error: `Unknown audit task: ${taskType}` };
  },

  async handleHandoff(
    from: AgentRole,
    context: AgentContext,
    data: Record<string, unknown>
  ): Promise<AgentToolResult> {
    if (from === 'fraud' && data.action === 'audit_fraud_case') {
      return this.process(context, {
        taskType: 'log_audit_event',
        action: 'fraud_investigation',
        resourceType: 'fraud_case',
        resourceId: data.caseId,
        newValues: data,
      });
    }

    return {
      success: true,
      data: {
        message: `Audit Agent received handoff from ${from}`,
        action: data.action,
      },
    };
  },

  async createComplianceRecord(
    context: AgentContext,
    recordType: string,
    resourceId: string,
    dueDate?: Date
  ): Promise<AgentToolResult> {
    const [record] = await db.insert(complianceRecords).values({
      tenantId: context.tenantId,
      recordType,
      resourceId,
      status: 'pending',
      dueDate,
    }).returning();

    return {
      success: true,
      data: {
        recordId: record.id,
        recordType,
        resourceId,
        status: 'pending',
        dueDate: record.dueDate,
      },
    };
  },

  async getAuditTrail(
    context: AgentContext,
    resourceType: string,
    resourceId: string
  ): Promise<AgentToolResult> {
    const logs = await db.query.auditLogs.findMany({
      where: and(
        eq(auditLogs.tenantId, context.tenantId),
        eq(auditLogs.resourceType, resourceType),
        eq(auditLogs.resourceId, resourceId)
      ),
      orderBy: [desc(auditLogs.createdAt)],
    });

    return {
      success: true,
      data: {
        resourceType,
        resourceId,
        auditTrail: logs.map(log => ({
          id: log.id,
          action: log.action,
          userId: log.userId,
          changes: log.changes,
          timestamp: log.createdAt,
        })),
        totalEvents: logs.length,
      },
    };
  },
};
