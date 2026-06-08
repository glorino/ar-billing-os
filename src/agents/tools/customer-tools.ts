import { z } from 'zod';
import { db } from '@/lib/db';
import { customers, invoices, payments, subscriptions } from '@/lib/db/schema';
import { eq, and, desc, sql, count, sum } from 'drizzle-orm';
import { AgentContext, AgentToolResult } from '../types';

export const getCustomerInputSchema = z.object({
  customerId: z.string().uuid(),
  includeHistory: z.boolean().optional().default(false),
});

export const getCustomerMetricsInputSchema = z.object({
  customerId: z.string().uuid(),
});

export const listCustomersInputSchema = z.object({
  status: z.enum(['active', 'inactive', 'all']).optional().default('all'),
  collectionStatus: z.enum([
    'none', 'reminder', 'final_notice', 'collection_agency', 'legal', 'resolved', 'all'
  ]).optional().default('all'),
  limit: z.number().int().min(1).max(100).optional().default(25),
  offset: z.number().int().min(0).optional().default(0),
  sortBy: z.enum(['name', 'outstanding_balance', 'created_at', 'collection_status']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

export async function getCustomer(
  context: AgentContext,
  input: z.infer<typeof getCustomerInputSchema>
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

    let history: {
      totalInvoices: number;
      paidInvoices: number;
      overdueInvoices: number;
      totalPayments: number;
      totalPaid: number;
      activeSubscriptions: number;
    } | null = null;

    if (input.includeHistory) {
      const [invoiceStats] = await db
        .select({
          total: count(),
          paid: sql<number>`count(*) filter (where ${invoices.status} = 'paid')`,
          overdue: sql<number>`count(*) filter (where ${invoices.status} = 'overdue')`,
        })
        .from(invoices)
        .where(
          and(
            eq(invoices.customerId, input.customerId),
            eq(invoices.tenantId, context.tenantId)
          )
        );

      const [paymentStats] = await db
        .select({
          total: count(),
          totalAmount: sum(payments.amount),
        })
        .from(payments)
        .where(
          and(
            eq(payments.customerId, input.customerId),
            eq(payments.tenantId, context.tenantId),
            eq(payments.status, 'completed')
          )
        );

      const [subStats] = await db
        .select({ count: count() })
        .from(subscriptions)
        .where(
          and(
            eq(subscriptions.customerId, input.customerId),
            eq(subscriptions.tenantId, context.tenantId),
            eq(subscriptions.status, 'active')
          )
        );

      history = {
        totalInvoices: invoiceStats?.total || 0,
        paidInvoices: invoiceStats?.paid || 0,
        overdueInvoices: invoiceStats?.overdue || 0,
        totalPayments: paymentStats?.total || 0,
        totalPaid: parseFloat(paymentStats?.totalAmount || '0'),
        activeSubscriptions: subStats?.count || 0,
      };
    }

    return {
      success: true,
      data: {
        ...customer,
        history,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get customer',
    };
  }
}

export async function getCustomerMetrics(
  context: AgentContext,
  input: z.infer<typeof getCustomerMetricsInputSchema>
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

    const [invoiceStats] = await db
      .select({
        totalInvoices: count(),
        totalBilled: sum(invoices.total),
        totalPaid: sum(invoices.amountPaid),
        overdueCount: sql<number>`count(*) filter (where ${invoices.status} = 'overdue')`,
        overdueAmount: sql<string>`coalesce(sum(case when ${invoices.status} = 'overdue' then ${invoices.amountDue} else 0 end), '0')`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.customerId, input.customerId),
          eq(invoices.tenantId, context.tenantId)
        )
      );

    const [paymentStats] = await db
      .select({
        totalPayments: count(),
        averagePaymentAmount: sql<string>`coalesce(avg(${payments.amount}), '0')`,
        averageDaysToPay: sql<number>`coalesce(avg(extract(day from ${payments.receivedAt} - ${payments.createdAt})), 0)`,
        lastPaymentDate: sql<Date>`max(${payments.receivedAt})`,
      })
      .from(payments)
      .where(
        and(
          eq(payments.customerId, input.customerId),
          eq(payments.tenantId, context.tenantId),
          eq(payments.status, 'completed')
        )
      );

    const outstandingBalance = parseFloat(customer.outstandingBalance);
    const totalBilled = parseFloat(invoiceStats?.totalBilled || '0');
    const collectionRate = totalBilled > 0
      ? (parseFloat(invoiceStats?.totalPaid || '0') / totalBilled) * 100
      : 0;

    return {
      success: true,
      data: {
        customerId: customer.id,
        customerName: customer.name,
        outstandingBalance,
        totalBilled,
        totalPaid: parseFloat(invoiceStats?.totalPaid || '0'),
        collectionRate: Math.round(collectionRate * 100) / 100,
        invoiceStats: {
          total: invoiceStats?.totalInvoices || 0,
          overdue: invoiceStats?.overdueCount || 0,
          overdueAmount: parseFloat(invoiceStats?.overdueAmount || '0'),
        },
        paymentStats: {
          total: paymentStats?.totalPayments || 0,
          averageAmount: parseFloat(paymentStats?.averagePaymentAmount || '0'),
          averageDaysToPay: Math.round(paymentStats?.averageDaysToPay || 0),
          lastPaymentDate: paymentStats?.lastPaymentDate || null,
        },
        creditUtilization: customer.creditLimit
          ? (outstandingBalance / parseFloat(customer.creditLimit)) * 100
          : null,
        riskLevel: parseFloat(customer.outstandingBalance) > parseFloat(customer.creditLimit || '0')
          ? 'high'
          : parseFloat(customer.outstandingBalance) > 0
            ? 'medium'
            : 'low',
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get customer metrics',
    };
  }
}

export async function listCustomers(
  context: AgentContext,
  input: z.infer<typeof listCustomersInputSchema>
): Promise<AgentToolResult> {
  try {
    const conditions = [eq(customers.tenantId, context.tenantId)];

    if (input.status === 'active') {
      conditions.push(eq(customers.isActive, true));
    } else if (input.status === 'inactive') {
      conditions.push(eq(customers.isActive, false));
    }

    if (input.collectionStatus !== 'all') {
      conditions.push(eq(customers.collectionStatus, input.collectionStatus));
    }

    const orderByClause = input.sortOrder === 'desc'
      ? desc(sql.raw(input.sortBy.replace('_', '_')))
      : sql.raw(input.sortBy.replace('_', '_'));

    const results = await db.query.customers.findMany({
      where: and(...conditions),
      orderBy: [orderByClause],
      limit: input.limit,
      offset: input.offset,
    });

    const [{ total }] = await db
      .select({ total: count() })
      .from(customers)
      .where(and(...conditions));

    return {
      success: true,
      data: {
        customers: results,
        pagination: {
          total,
          limit: input.limit,
          offset: input.offset,
          hasMore: input.offset + input.limit < total,
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to list customers',
    };
  }
}

export const customerTools = {
  getCustomer: {
    name: 'get_customer',
    description: 'Get customer details with optional payment history',
    inputSchema: getCustomerInputSchema,
    handler: getCustomer,
  },
  getCustomerMetrics: {
    name: 'get_customer_metrics',
    description: 'Get comprehensive customer metrics including collection rates',
    inputSchema: getCustomerMetricsInputSchema,
    handler: getCustomerMetrics,
  },
  listCustomers: {
    name: 'list_customers',
    description: 'List customers with filtering, sorting, and pagination',
    inputSchema: listCustomersInputSchema,
    handler: listCustomers,
  },
};
