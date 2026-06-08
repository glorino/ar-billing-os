import { z } from 'zod';
import { db } from '@/lib/db';
import {
  collectionCases, collectionEvents, collectionRules,
  customers, invoices, payments
} from '@/lib/db/schema';
import { eq, and, desc, sql, count, sum, gte, lte, asc } from 'drizzle-orm';
import { AgentContext, AgentToolResult } from '../types';

export const getOverdueAccountsInputSchema = z.object({
  minOverdueDays: z.number().int().min(0).optional().default(1),
  maxOverdueDays: z.number().int().min(1).optional().default(365),
  minAmount: z.number().min(0).optional().default(0),
  limit: z.number().int().min(1).max(100).optional().default(25),
});

export const createCollectionCaseInputSchema = z.object({
  customerId: z.string().uuid(),
  invoiceIds: z.array(z.string().uuid()).optional(),
  initialNotes: z.string().optional(),
  assignedTo: z.string().optional(),
});

export const getCollectionStrategyInputSchema = z.object({
  customerId: z.string().uuid(),
  totalOutstanding: z.number().min(0),
  overdueDays: z.number().int().min(0),
});

export const negotiatePaymentPlanInputSchema = z.object({
  customerId: z.string().uuid(),
  totalAmount: z.number().positive(),
  maxInstallments: z.number().int().min(2).max(24).optional().default(6),
  preferredFrequency: z.enum(['weekly', 'bi_weekly', 'monthly']).optional(),
  startDate: z.string().datetime().optional(),
});

export const recordCollectionActionInputSchema = z.object({
  caseId: z.string().uuid(),
  action: z.enum([
    'email_reminder', 'phone_call', 'letter_sent', 'final_demand',
    'agency_referral', 'legal_action', 'payment_plan', 'write_off'
  ]),
  description: z.string().min(1),
  outcome: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function getOverdueAccounts(
  context: AgentContext,
  input: z.infer<typeof getOverdueAccountsInputSchema>
): Promise<AgentToolResult> {
  try {
    const overdueInvoices = await db
      .select({
        customerId: invoices.customerId,
        customerName: customers.name,
        customerEmail: customers.email,
        invoiceId: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        amountDue: invoices.amountDue,
        dueDate: invoices.dueDate,
        overdueDays: sql<number>`extract(day from current_date - ${invoices.dueDate})`,
        totalOutstanding: sql<string>`sum(${invoices.amountDue}) over (partition by ${invoices.customerId})`,
        invoiceCount: sql<number>`count(*) over (partition by ${invoices.customerId})`,
      })
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .where(
        and(
          eq(invoices.tenantId, context.tenantId),
          sql`${invoices.status} IN ('sent', 'viewed', 'partial', 'overdue')`,
          sql`extract(day from current_date - ${invoices.dueDate}) >= ${input.minOverdueDays}`,
          sql`extract(day from current_date - ${invoices.dueDate}) <= ${input.maxOverdueDays}`,
          sql`${invoices.amountDue} >= ${input.minAmount}`
        )
      )
      .orderBy(sql`extract(day from current_date - ${invoices.dueDate}) desc`)
      .limit(input.limit);

    const groupedByCustomer = overdueInvoices.reduce((acc, inv) => {
      if (!acc[inv.customerId]) {
        acc[inv.customerId] = {
          customerId: inv.customerId,
          customerName: inv.customerName,
          customerEmail: inv.customerEmail,
          totalOutstanding: parseFloat(inv.totalOutstanding),
          maxOverdueDays: 0,
          invoiceCount: inv.invoiceCount,
          invoices: [],
        };
      }
      acc[inv.customerId].invoices.push({
        invoiceId: inv.invoiceId,
        invoiceNumber: inv.invoiceNumber,
        amountDue: parseFloat(inv.amountDue),
        dueDate: inv.dueDate,
        overdueDays: inv.overdueDays,
      });
      acc[inv.customerId].maxOverdueDays = Math.max(
        acc[inv.customerId].maxOverdueDays,
        inv.overdueDays
      );
      return acc;
    }, {} as Record<string, {
      customerId: string;
      customerName: string | null;
      customerEmail: string | null;
      totalOutstanding: number;
      maxOverdueDays: number;
      invoiceCount: number;
      invoices: Array<{
        invoiceId: string;
        invoiceNumber: string;
        amountDue: number;
        dueDate: Date;
        overdueDays: number;
      }>;
    }>);

    return {
      success: true,
      data: {
        overdueAccounts: Object.values(groupedByCustomer).sort(
          (a, b) => b.maxOverdueDays - a.maxOverdueDays
        ),
        summary: {
          totalCustomers: Object.keys(groupedByCustomer).length,
          totalOutstanding: Object.values(groupedByCustomer)
            .reduce((sum, a) => sum + a.totalOutstanding, 0),
          totalInvoices: overdueInvoices.length,
          averageOverdueDays: overdueInvoices.length > 0
            ? overdueInvoices.reduce((sum, i) => sum + i.overdueDays, 0) / overdueInvoices.length
            : 0,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get overdue accounts',
    };
  }
}

export async function createCollectionCase(
  context: AgentContext,
  input: z.infer<typeof createCollectionCaseInputSchema>
): Promise<AgentToolResult> {
  try {
    const customer = await db.query.customers.findFirst({
      where: and(
        eq(customers.id, input.customerId),
        eq(customers.tenantId, context.tenantId)
      ),
    });

    if (!customer) {
      return { success: false, error: 'Customer not found' };
    }

    const lastCase = await db.query.collectionCases.findFirst({
      where: eq(collectionCases.tenantId, context.tenantId),
      orderBy: [desc(collectionCases.createdAt)],
    });

    const nextNumber = lastCase
      ? parseInt(lastCase.caseNumber.replace('COL-', '')) + 1
      : 1;
    const caseNumber = `COL-${String(nextNumber).padStart(6, '0')}`;

    const overdueInvoices = await db.query.invoices.findMany({
      where: and(
        eq(invoices.customerId, input.customerId),
        eq(invoices.tenantId, context.tenantId),
        sql`${invoices.status} IN ('sent', 'viewed', 'partial', 'overdue')`,
        sql`${invoices.dueDate} < current_date`
      ),
    });

    const totalOutstanding = overdueInvoices.reduce(
      (sum, inv) => sum + parseFloat(inv.amountDue), 0
    );

    const maxOverdueDays = overdueInvoices.length > 0
      ? Math.max(...overdueInvoices.map(inv => {
          const dueDate = new Date(inv.dueDate);
          const today = new Date();
          return Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        }))
      : 0;

    const [collectionCase] = await db.insert(collectionCases).values({
      tenantId: context.tenantId,
      customerId: input.customerId,
      caseNumber,
      status: maxOverdueDays > 90 ? 'legal' : maxOverdueDays > 30 ? 'collection_agency' : maxOverdueDays > 15 ? 'final_notice' : 'reminder',
      totalOutstanding: String(totalOutstanding),
      overdueDays: maxOverdueDays,
      assignedTo: input.assignedTo,
      notes: input.initialNotes,
    }).returning();

    await db.insert(collectionEvents).values({
      tenantId: context.tenantId,
      caseId: collectionCase.id,
      action: 'email_reminder',
      description: `Collection case opened for customer ${customer.name}. Total outstanding: $${totalOutstanding.toFixed(2)}`,
      performedBy: context.userId || 'system',
    });

    await db.update(customers)
      .set({
        collectionStatus: collectionCase.status,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, input.customerId));

    return {
      success: true,
      data: {
        caseId: collectionCase.id,
        caseNumber: collectionCase.caseNumber,
        status: collectionCase.status,
        totalOutstanding,
        overdueDays: maxOverdueDays,
        customerId: input.customerId,
        customerName: customer.name,
        overdueInvoiceCount: overdueInvoices.length,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create collection case',
    };
  }
}

export async function getCollectionStrategy(
  context: AgentContext,
  input: z.infer<typeof getCollectionStrategyInputSchema>
): Promise<AgentToolResult> {
  try {
    const customer = await db.query.customers.findFirst({
      where: and(
        eq(customers.id, input.customerId),
        eq(customers.tenantId, context.tenantId)
      ),
    });

    if (!customer) {
      return { success: false, error: 'Customer not found' };
    }

    const paymentHistory = await db.query.payments.findMany({
      where: and(
        eq(payments.customerId, input.customerId),
        eq(payments.tenantId, context.tenantId)
      ),
      orderBy: [desc(payments.createdAt)],
      limit: 50,
    });

    const completedPayments = paymentHistory.filter(p => p.status === 'completed');
    const onTimePayments = completedPayments.filter(p => {
      if (!p.receivedAt) return false;
      const received = new Date(p.receivedAt);
      const created = new Date(p.createdAt);
      const daysDiff = (received.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= (customer.paymentTermsDays || 30);
    });

    const paymentReliability = completedPayments.length > 0
      ? onTimePayments.length / completedPayments.length
      : 0;

    const customerLifetimeValue = completedPayments.reduce(
      (sum, p) => sum + parseFloat(p.amount), 0
    );

    let recommendedStrategy: string;
    let actions: string[];
    let estimatedRecoveryRate: number;

    if (input.overdueDays <= 15 && input.totalOutstanding < 1000) {
      recommendedStrategy = 'friendly_reminder';
      actions = ['email_reminder'];
      estimatedRecoveryRate = 0.9;
    } else if (input.overdueDays <= 30 && paymentReliability > 0.7) {
      recommendedStrategy = 'firm_notice';
      actions = ['email_reminder', 'phone_call'];
      estimatedRecoveryRate = 0.8;
    } else if (input.overdueDays <= 60 || customerLifetimeValue > 10000) {
      recommendedStrategy = 'escalated_follow_up';
      actions = ['phone_call', 'letter_sent', 'payment_plan'];
      estimatedRecoveryRate = 0.65;
    } else if (input.overdueDays <= 90) {
      recommendedStrategy = 'agency_referral';
      actions = ['final_demand', 'agency_referral'];
      estimatedRecoveryRate = 0.5;
    } else {
      recommendedStrategy = 'legal_consideration';
      actions = ['final_demand', 'legal_action', 'write_off'];
      estimatedRecoveryRate = 0.3;
    }

    return {
      success: true,
      data: {
        customerId: input.customerId,
        customerName: customer.name,
        totalOutstanding: input.totalOutstanding,
        overdueDays: input.overdueDays,
        paymentReliability: Math.round(paymentReliability * 100) / 100,
        customerLifetimeValue,
        recommendedStrategy,
        actions,
        estimatedRecoveryRate,
        riskAssessment: {
          paymentReliability,
          overdueDays: input.overdueDays,
          outstandingRatio: input.totalOutstanding / (customerLifetimeValue || 1),
          riskLevel: paymentReliability < 0.5 || input.overdueDays > 60 ? 'high' :
            paymentReliability < 0.8 || input.overdueDays > 30 ? 'medium' : 'low',
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get collection strategy',
    };
  }
}

export async function negotiatePaymentPlan(
  context: AgentContext,
  input: z.infer<typeof negotiatePaymentPlanInputSchema>
): Promise<AgentToolResult> {
  try {
    const customer = await db.query.customers.findFirst({
      where: and(
        eq(customers.id, input.customerId),
        eq(customers.tenantId, context.tenantId)
      ),
    });

    if (!customer) {
      return { success: false, error: 'Customer not found' };
    }

    const installmentAmount = input.totalAmount / input.maxInstallments;
    const frequency = input.preferredFrequency || 'monthly';
    const startDate = input.startDate ? new Date(input.startDate) : new Date();

    let endDate = new Date(startDate);
    const intervalDays = frequency === 'weekly' ? 7 : frequency === 'bi_weekly' ? 14 : 30;
    endDate.setDate(endDate.getDate() + (input.maxInstallments * intervalDays));

    const paymentHistory = await db.query.payments.findMany({
      where: and(
        eq(payments.customerId, input.customerId),
        eq(payments.tenantId, context.tenantId),
        eq(payments.status, 'completed')
      ),
      orderBy: [desc(payments.amount)],
      limit: 10,
    });

    const avgPayment = paymentHistory.length > 0
      ? paymentHistory.reduce((sum, p) => sum + parseFloat(p.amount), 0) / paymentHistory.length
      : installmentAmount;

    const acceptanceProbability = Math.min(0.95, Math.max(0.1,
      0.5
      + (installmentAmount <= avgPayment ? 0.2 : -0.1)
      + (frequency === 'monthly' ? 0.1 : 0)
      + (customer.paymentTermsDays >= 30 ? 0.1 : 0)
    ));

    return {
      success: true,
      data: {
        customerId: input.customerId,
        customerName: customer.name,
        totalAmount: input.totalAmount,
        numberOfInstallments: input.maxInstallments,
        installmentAmount: Math.round(installmentAmount * 100) / 100,
        frequency,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        acceptanceProbability: Math.round(acceptanceProbability * 100) / 100,
        terms: `Pay $${installmentAmount.toFixed(2)} ${frequency} starting ${startDate.toLocaleDateString()} until total of $${input.totalAmount.toFixed(2)} is paid.`,
        customerContext: {
          averagePayment: avgPayment,
          paymentReliability: paymentHistory.length > 0 ? 'established' : 'new',
          creditLimit: customer.creditLimit,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to negotiate payment plan',
    };
  }
}

export async function recordCollectionAction(
  context: AgentContext,
  input: z.infer<typeof recordCollectionActionInputSchema>
): Promise<AgentToolResult> {
  try {
    const collectionCase = await db.query.collectionCases.findFirst({
      where: and(
        eq(collectionCases.id, input.caseId),
        eq(collectionCases.tenantId, context.tenantId)
      ),
    });

    if (!collectionCase) {
      return { success: false, error: 'Collection case not found' };
    }

    const [event] = await db.insert(collectionEvents).values({
      tenantId: context.tenantId,
      caseId: input.caseId,
      action: input.action,
      description: input.description,
      outcome: input.outcome,
      performedBy: context.userId || 'system',
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      metadata: input.metadata,
    }).returning();

    const actionStatusMap: Record<string, typeof collectionCases.status.enumValues[number]> = {
      email_reminder: 'reminder',
      phone_call: 'reminder',
      letter_sent: 'final_notice',
      final_demand: 'final_notice',
      agency_referral: 'collection_agency',
      legal_action: 'legal',
      payment_plan: 'reminder',
      write_off: 'resolved',
    };

    const newStatus = actionStatusMap[input.action] || collectionCase.status;
    if (newStatus !== collectionCase.status) {
      await db.update(collectionCases)
        .set({
          status: newStatus,
          resolvedAt: input.action === 'write_off' ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(collectionCases.id, input.caseId));

      await db.update(customers)
        .set({
          collectionStatus: newStatus,
          updatedAt: new Date(),
        })
        .where(eq(customers.id, collectionCase.customerId));
    }

    return {
      success: true,
      data: {
        eventId: event.id,
        caseId: input.caseId,
        action: input.action,
        description: input.description,
        status: newStatus,
        recordedAt: event.createdAt,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to record collection action',
    };
  }
}

export const collectionTools = {
  getOverdueAccounts: {
    name: 'get_overdue_accounts',
    description: 'Get list of overdue accounts with outstanding amounts and aging',
    inputSchema: getOverdueAccountsInputSchema,
    handler: getOverdueAccounts,
  },
  createCollectionCase: {
    name: 'create_collection_case',
    description: 'Create a new collection case for an overdue customer',
    inputSchema: createCollectionCaseInputSchema,
    handler: createCollectionCase,
  },
  getCollectionStrategy: {
    name: 'get_collection_strategy',
    description: 'Recommend collection strategy based on customer history and debt characteristics',
    inputSchema: getCollectionStrategyInputSchema,
    handler: getCollectionStrategy,
  },
  negotiatePaymentPlan: {
    name: 'negotiate_payment_plan',
    description: 'Generate payment plan proposal with acceptance probability',
    inputSchema: negotiatePaymentPlanInputSchema,
    handler: negotiatePaymentPlan,
  },
  recordCollectionAction: {
    name: 'record_collection_action',
    description: 'Record a collection activity and update case status',
    inputSchema: recordCollectionActionInputSchema,
    handler: recordCollectionAction,
  },
};
