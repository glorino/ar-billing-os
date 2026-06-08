import { db } from '@/lib/db';
import {
  collectionCases,
  collectionEvents,
  collectionRules,
  customers,
  invoices,
  type CollectionCase,
  type NewCollectionCase,
  type CollectionEvent,
  type NewCollectionEvent,
  type CollectionRule,
  type NewCollectionRule,
  collectionStatusEnum,
  collectionActionEnum,
} from '@/lib/db/schema';
import { eq, and, desc, sql, gte } from 'drizzle-orm';
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

const ESCALATION_SEQUENCE: CollectionCase['status'][] = [
  'reminder',
  'final_notice',
  'collection_agency',
  'legal',
];

export class CollectionService {
  static async createCase(
    tenantId: string,
    data: Omit<NewCollectionCase, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'openedAt'>,
  ): Promise<CollectionCase> {
    const customer = await db.query.customers.findFirst({
      where: and(
        eq(customers.tenantId, tenantId),
        eq(customers.id, data.customerId),
      ),
    });
    if (!customer) {
      throw new AppError('Customer not found', 'CUSTOMER_NOT_FOUND', 404);
    }

    const existing = await db.query.collectionCases.findFirst({
      where: and(
        eq(collectionCases.tenantId, tenantId),
        eq(collectionCases.customerId, data.customerId),
        sql`${collectionCases.status} != 'resolved'`,
      ),
    });
    if (existing) {
      throw new AppError(
        'Open collection case already exists for this customer',
        'CASE_ALREADY_EXISTS',
        409,
      );
    }

    const overdueInvoices = await db
      .select({
        total: sql<string>`coalesce(sum(${invoices.amountDue}), '0')`,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          eq(invoices.customerId, data.customerId),
          eq(invoices.status, 'overdue'),
        ),
      );

    const totalOutstanding = overdueInvoices[0]?.total ?? '0';
    const oldestOverdue = await db
      .select({ dueDate: invoices.dueDate })
      .from(invoices)
      .where(
        and(
          eq(invoices.tenantId, tenantId),
          eq(invoices.customerId, data.customerId),
          eq(invoices.status, 'overdue'),
        ),
      )
      .orderBy(sql`${invoices.dueDate} asc`)
      .limit(1);

    const overdueDays =
      oldestOverdue.length > 0
        ? differenceInDays(new Date(), oldestOverdue[0].dueDate)
        : 0;

    const [created] = await db
      .insert(collectionCases)
      .values({
        ...data,
        tenantId,
        totalOutstanding,
        overdueDays,
        status: data.status ?? 'reminder',
      })
      .returning();

    await this.addEvent(tenantId, created.id, {
      action: 'email_reminder',
      description: `Collection case opened for customer. Outstanding: ${totalOutstanding}`,
    });

    await db
      .update(customers)
      .set({ collectionStatus: created.status, updatedAt: new Date() })
      .where(
        and(
          eq(customers.tenantId, tenantId),
          eq(customers.id, data.customerId),
        ),
      );

    return created;
  }

  static async getCaseById(
    tenantId: string,
    caseId: string,
  ): Promise<CollectionCase> {
    const caseRecord = await db.query.collectionCases.findFirst({
      where: and(
        eq(collectionCases.tenantId, tenantId),
        eq(collectionCases.id, caseId),
      ),
    });
    if (!caseRecord) {
      throw new AppError('Collection case not found', 'CASE_NOT_FOUND', 404);
    }
    return caseRecord;
  }

  static async listCases(
    tenantId: string,
    params: PaginationParams & {
      customerId?: string;
      status?: CollectionCase['status'];
      minOverdueDays?: number;
    } = {},
  ): Promise<PaginatedResult<CollectionCase>> {
    const { limit = 20, offset = 0, customerId, status, minOverdueDays } = params;
    const conditions = [eq(collectionCases.tenantId, tenantId)];
    if (customerId) conditions.push(eq(collectionCases.customerId, customerId));
    if (status) conditions.push(eq(collectionCases.status, status));
    if (minOverdueDays !== undefined) {
      conditions.push(gte(collectionCases.overdueDays, minOverdueDays));
    }

    const where = and(...conditions);

    const [countResult, data] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(collectionCases)
        .where(where),
      db
        .select()
        .from(collectionCases)
        .where(where)
        .orderBy(desc(collectionCases.overdueDays))
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

  static async addEvent(
    tenantId: string,
    caseId: string,
    data: Omit<NewCollectionEvent, 'id' | 'tenantId' | 'caseId' | 'createdAt'>,
  ): Promise<CollectionEvent> {
    await this.getCaseById(tenantId, caseId);
    const [created] = await db
      .insert(collectionEvents)
      .values({ ...data, tenantId, caseId })
      .returning();
    return created;
  }

  static async getEvents(
    tenantId: string,
    caseId: string,
  ): Promise<CollectionEvent[]> {
    await this.getCaseById(tenantId, caseId);
    return db.query.collectionEvents.findMany({
      where: and(
        eq(collectionEvents.tenantId, tenantId),
        eq(collectionEvents.caseId, caseId),
      ),
      orderBy: desc(collectionEvents.createdAt),
    });
  }

  static async escalate(
    tenantId: string,
    caseId: string,
  ): Promise<CollectionCase> {
    const caseRecord = await this.getCaseById(tenantId, caseId);
    const currentIndex = ESCALATION_SEQUENCE.indexOf(caseRecord.status);
    if (currentIndex < 0 || currentIndex >= ESCALATION_SEQUENCE.length - 1) {
      throw new AppError(
        'Case is already at maximum escalation level',
        'MAX_ESCALATION',
        400,
      );
    }

    const newStatus = ESCALATION_SEQUENCE[currentIndex + 1];
    const [updated] = await db
      .update(collectionCases)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(
        and(
          eq(collectionCases.tenantId, tenantId),
          eq(collectionCases.id, caseId),
        ),
      )
      .returning();

    await this.addEvent(tenantId, caseId, {
      action: newStatus === 'collection_agency' ? 'agency_referral' : 'legal_action',
      description: `Case escalated from ${caseRecord.status} to ${newStatus}`,
    });

    await db
      .update(customers)
      .set({ collectionStatus: newStatus, updatedAt: new Date() })
      .where(
        and(
          eq(customers.tenantId, tenantId),
          eq(customers.id, caseRecord.customerId),
        ),
      );

    return updated;
  }

  static async resolve(
    tenantId: string,
    caseId: string,
    outcome: string,
  ): Promise<CollectionCase> {
    const caseRecord = await this.getCaseById(tenantId, caseId);
    const [updated] = await db
      .update(collectionCases)
      .set({
        status: 'resolved',
        resolvedAt: new Date(),
        updatedAt: new Date(),
        notes: outcome,
      })
      .where(
        and(
          eq(collectionCases.tenantId, tenantId),
          eq(collectionCases.id, caseId),
        ),
      )
      .returning();

    await this.addEvent(tenantId, caseId, {
      action: 'payment_plan',
      description: `Case resolved: ${outcome}`,
    });

    await db
      .update(customers)
      .set({ collectionStatus: 'resolved', updatedAt: new Date() })
      .where(
        and(
          eq(customers.tenantId, tenantId),
          eq(customers.id, caseRecord.customerId),
        ),
      );

    return updated;
  }

  static async createPaymentPlan(
    tenantId: string,
    caseId: string,
    totalAmount: string,
    installments: number,
    intervalDays: number,
  ): Promise<CollectionCase> {
    const caseRecord = await this.getCaseById(tenantId, caseId);
    const installmentAmount = (Number(totalAmount) / installments).toFixed(4);

    const [updated] = await db
      .update(collectionCases)
      .set({
        metadata: {
          ...(caseRecord.metadata as Record<string, unknown>),
          paymentPlan: {
            totalAmount,
            installments,
            installmentAmount,
            intervalDays,
            startDate: new Date().toISOString(),
            paidInstallments: 0,
          },
        },
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(collectionCases.tenantId, tenantId),
          eq(collectionCases.id, caseId),
        ),
      )
      .returning();

    await this.addEvent(tenantId, caseId, {
      action: 'payment_plan',
      description: `Payment plan created: ${installments} installments of ${installmentAmount}`,
    });

    return updated;
  }

  static async applyRules(tenantId: string): Promise<CollectionCase[]> {
    const rules = await db.query.collectionRules.findMany({
      where: and(
        eq(collectionRules.tenantId, tenantId),
        eq(collectionRules.isActive, true),
      ),
      orderBy: sql`${collectionRules.overdueDaysThreshold} asc`,
    });

    const updatedCases: CollectionCase[] = [];
    for (const rule of rules) {
      const cases = await db
        .select()
        .from(collectionCases)
        .where(
          and(
            eq(collectionCases.tenantId, tenantId),
            sql`${collectionCases.status} != 'resolved'`,
            sql`${collectionCases.overdueDays} >= ${rule.overdueDaysThreshold}`,
          ),
        );

      for (const caseRecord of cases) {
        if (caseRecord.status === 'reminder' && rule.action !== 'email_reminder') {
          await this.addEvent(tenantId, caseRecord.id, {
            action: rule.action,
            description: `Auto-triggered by rule "${rule.name}": ${rule.action}`,
          });
          updatedCases.push(caseRecord);
        }
      }
    }

    return updatedCases;
  }

  static async createRule(
    tenantId: string,
    data: Omit<NewCollectionRule, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>,
  ): Promise<CollectionRule> {
    const [created] = await db
      .insert(collectionRules)
      .values({ ...data, tenantId })
      .returning();
    return created;
  }

  static async listRules(tenantId: string): Promise<CollectionRule[]> {
    return db.query.collectionRules.findMany({
      where: eq(collectionRules.tenantId, tenantId),
      orderBy: sql`${collectionRules.overdueDaysThreshold} asc`,
    });
  }

  static async getActiveCasesCount(tenantId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(collectionCases)
      .where(
        and(
          eq(collectionCases.tenantId, tenantId),
          sql`${collectionCases.status} != 'resolved'`,
        ),
      );
    return result?.count ?? 0;
  }
}
