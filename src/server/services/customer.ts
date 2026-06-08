import { db } from '@/lib/db';
import {
  customers,
  invoices,
  payments,
  subscriptions,
  type Customer,
  type NewCustomer,
  invoiceStatusEnum,
} from '@/lib/db/schema';
import { eq, and, desc, ilike, sql, gte, lte } from 'drizzle-orm';
import { differenceInDays } from 'date-fns';

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface CustomerMetrics {
  totalLifetimeValue: string;
  totalInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  averagePaymentDays: number;
  outstandingBalance: string;
}

export class CustomerService {
  static async create(
    tenantId: string,
    data: Omit<NewCustomer, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>,
  ): Promise<Customer> {
    if (data.email) {
      const existing = await db.query.customers.findFirst({
        where: and(
          eq(customers.tenantId, tenantId),
          eq(customers.email, data.email),
        ),
      });
      if (existing) {
        throw new AppError(
          'Customer with this email already exists',
          'CUSTOMER_EMAIL_EXISTS',
          409,
        );
      }
    }

    const [created] = await db
      .insert(customers)
      .values({ ...data, tenantId })
      .returning();
    return created;
  }

  static async getById(tenantId: string, customerId: string): Promise<Customer> {
    const customer = await db.query.customers.findFirst({
      where: and(
        eq(customers.tenantId, tenantId),
        eq(customers.id, customerId),
      ),
    });
    if (!customer) {
      throw new AppError('Customer not found', 'CUSTOMER_NOT_FOUND', 404);
    }
    return customer;
  }

  static async list(
    tenantId: string,
    params: PaginationParams & {
      search?: string;
      isActive?: boolean;
      collectionStatus?: Customer['collectionStatus'];
    } = {},
  ): Promise<PaginatedResult<Customer>> {
    const { limit = 20, offset = 0, search, isActive, collectionStatus } = params;
    const conditions = [eq(customers.tenantId, tenantId)];
    if (search) {
      conditions.push(
        sql`(${ilike(customers.name, `%${search}%`)} OR ${ilike(customers.email, `%${search}%`)} OR ${ilike(customers.company, `%${search}%`)})`,
      );
    }
    if (isActive !== undefined) conditions.push(eq(customers.isActive, isActive));
    if (collectionStatus) conditions.push(eq(customers.collectionStatus, collectionStatus));

    const where = and(...conditions);

    const [countResult, data] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(customers)
        .where(where),
      db
        .select()
        .from(customers)
        .where(where)
        .orderBy(desc(customers.createdAt))
        .limit(limit)
        .offset(offset),
    ]);

    const total = countResult[0]?.count ?? 0;
    return {
      data,
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    };
  }

  static async update(
    tenantId: string,
    customerId: string,
    data: Partial<Omit<NewCustomer, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Customer> {
    await this.getById(tenantId, customerId);
    const [updated] = await db
      .update(customers)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(eq(customers.tenantId, tenantId), eq(customers.id, customerId)),
      )
      .returning();
    return updated;
  }

  static async softDelete(tenantId: string, customerId: string): Promise<Customer> {
    return this.update(tenantId, customerId, { isActive: false });
  }

  static async getMetrics(tenantId: string, customerId: string): Promise<CustomerMetrics> {
    await this.getById(tenantId, customerId);

    const [invoiceStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        paid: sql<number>`count(*) filter (where ${invoices.status} = 'paid')::int`,
        overdue: sql<number>`count(*) filter (where ${invoices.status} = 'overdue')::int`,
      })
      .from(invoices)
      .where(
        and(eq(invoices.tenantId, tenantId), eq(invoices.customerId, customerId)),
      );

    const [lifetimeValue] = await db
      .select({
        total: sql<string>`coalesce(sum(${invoices.amountPaid}), '0')`,
      })
      .from(invoices)
      .where(
        and(eq(invoices.tenantId, tenantId), eq(invoices.customerId, customerId)),
      );

    const [outstanding] = await db
      .select({ total: customers.outstandingBalance })
      .from(customers)
      .where(
        and(eq(customers.tenantId, tenantId), eq(customers.id, customerId)),
      );

    const paidInvoices = await db
      .select({
        issueDate: invoices.issueDate,
        paidAt: invoices.paidAt,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          eq(invoices.customerId, customerId),
          eq(invoices.status, 'paid'),
        ),
      );

    let avgPaymentDays = 0;
    if (paidInvoices.length > 0) {
      const totalDays = paidInvoices.reduce((sum, inv) => {
        if (inv.paidAt) {
          return sum + differenceInDays(inv.paidAt, inv.issueDate);
        }
        return sum;
      }, 0);
      avgPaymentDays = Math.round(totalDays / paidInvoices.length);
    }

    return {
      totalLifetimeValue: lifetimeValue?.total ?? '0',
      totalInvoices: invoiceStats?.total ?? 0,
      paidInvoices: invoiceStats?.paid ?? 0,
      overdueInvoices: invoiceStats?.overdue ?? 0,
      averagePaymentDays: avgPaymentDays,
      outstandingBalance: outstanding?.total ?? '0',
    };
  }

  static async getByExternalId(
    tenantId: string,
    externalId: string,
  ): Promise<Customer | undefined> {
    return db.query.customers.findFirst({
      where: and(
        eq(customers.tenantId, tenantId),
        eq(customers.externalId, externalId),
      ),
    });
  }

  static async count(tenantId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(customers)
      .where(eq(customers.tenantId, tenantId));
    return result?.count ?? 0;
  }
}
