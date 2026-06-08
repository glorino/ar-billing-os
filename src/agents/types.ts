import { z } from 'zod';

export type AgentRole =
  | 'orchestrator'
  | 'invoice'
  | 'collection'
  | 'reminder'
  | 'payment'
  | 'reconciliation'
  | 'audit'
  | 'fraud'
  | 'forecasting';

export interface AgentContext {
  tenantId: string;
  userId?: string;
  requestId: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}

export interface AgentToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface StreamingChunk {
  type: 'text' | 'tool_call' | 'tool_result' | 'error' | 'done';
  content: string;
  agentRole?: AgentRole;
  toolName?: string;
  timestamp: Date;
}

export interface TaskRequest {
  id: string;
  tenantId: string;
  taskType: TaskType;
  input: Record<string, unknown>;
  userId?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, unknown>;
}

export type TaskType =
  | 'generate_invoice'
  | 'validate_invoice'
  | 'optimize_invoice_timing'
  | 'send_invoice'
  | 'collect_payment'
  | 'negotiate_payment_plan'
  | 'escalate_collection'
  | 'send_reminder'
  | 'schedule_reminders'
  | 'process_payment'
  | 'retry_payment'
  | 'process_refund'
  | 'reconcile_payments'
  | 'match_payment_to_invoice'
  | 'detect_discrepancies'
  | 'run_audit'
  | 'detect_anomalies'
  | 'generate_compliance_report'
  | 'detect_fraud'
  | 'check_velocity'
  | 'block_transaction'
  | 'forecast_revenue'
  | 'predict_late_payment'
  | 'analyze_cashflow'
  | 'predict_dso';

export interface LatePaymentPrediction {
  customerId: string;
  invoiceId: string;
  probability: number;
  predictedDaysLate: number;
  riskFactors: RiskFactor[];
  confidence: number;
  recommendedAction: string;
}

export interface RiskFactor {
  factor: string;
  weight: number;
  value: unknown;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface CollectionStrategy {
  strategyId: string;
  name: string;
  description: string;
  actions: CollectionAction[];
  estimatedRecoveryRate: number;
  estimatedCost: number;
  recommendedFor: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

export interface CollectionAction {
  type: 'email' | 'phone' | 'letter' | 'agency' | 'legal' | 'payment_plan' | 'write_off';
  timing: string;
  template?: string;
  escalationPath?: string[];
}

export interface RevenueForecast {
  period: { start: Date; end: Date };
  predicted: number;
  confidenceInterval: { lower: number; upper: number };
  confidence: number;
  factors: ForecastFactor[];
  methodology: string;
}

export interface ForecastFactor {
  factor: string;
  contribution: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface CashFlowProjection {
  date: Date;
  inflows: number;
  outflows: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
  confidence: number;
}

export interface FraudScore {
  transactionId?: string;
  customerId: string;
  score: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flags: FraudFlag[];
  recommendedAction: 'approve' | 'review' | 'block' | 'hold';
  confidence: number;
}

export interface FraudFlag {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  evidence: Record<string, unknown>;
}

export interface AuditResult {
  auditId: string;
  status: 'passed' | 'failed' | 'warning';
  findings: AuditFinding[];
  complianceScore: number;
  recommendations: string[];
  generatedAt: Date;
}

export interface AuditFinding {
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  resourceId?: string;
  recommendation: string;
}

export interface DSOPrediction {
  currentDSO: number;
  predictedDSO: number;
  trend: 'improving' | 'worsening' | 'stable';
  confidence: number;
  factors: DSOFactor[];
  recommendations: string[];
}

export interface DSOFactor {
  factor: string;
  impact: number;
  direction: 'positive' | 'negative';
}

export interface PaymentPlanProposal {
  customerId: string;
  totalAmount: number;
  numberOfInstallments: number;
  installmentAmount: number;
  frequency: 'weekly' | 'bi_weekly' | 'monthly';
  startDate: Date;
  endDate: Date;
  interestRate?: number;
  terms: string;
  acceptanceProbability: number;
}

export interface ReminderConfig {
  channels: ('email' | 'sms' | 'push')[];
  schedule: ReminderSchedule[];
  personalization: PersonalizationConfig;
  escalationRules: EscalationRule[];
}

export interface ReminderSchedule {
  daysBeforeDue: number;
  daysAfterDue: number[];
  templateId?: string;
}

export interface PersonalizationConfig {
  useCustomerName: boolean;
  useCompanyBranding: boolean;
  language?: string;
  tone: 'formal' | 'friendly' | 'firm' | 'urgent';
}

export interface EscalationRule {
  triggerCondition: string;
  action: string;
  delay?: number;
}

export const AgentContextSchema = z.object({
  tenantId: z.string().uuid(),
  userId: z.string().uuid().optional(),
  requestId: z.string().uuid(),
  sessionId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const TaskRequestSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  taskType: z.string(),
  input: z.record(z.unknown()),
  userId: z.string().uuid().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  metadata: z.record(z.unknown()).optional(),
});
