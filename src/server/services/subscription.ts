import { db } from '@/lib/db';
import {
  subscriptions,
  subscriptionItems,
  invoices,
  invoiceItems,
  customers,
  type Subscription,
  type NewSubscription,
  type SubscriptionItem,
  type NewSubscriptionItem,
  subscriptionStatusEnum,
  billingCycleEnum,
  currencyEnum,
} from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { addMonths, addDays } from 'date-fns';

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

export interface CreateSubscriptionInput {
  customerId: string;
  subscriptionNumber: string;
  name: string;
  currency?: string;
  recurringAmount: string;
  billingCycle?: Subscription['billingCycle'];
  billingInterval?: number;
  trialStart?: Date;
  trialEnd?: Date;
  notes?: string;
  items?: Omit<NewSubscriptionItem, 'id' | 'tenantId' | 'subscriptionId' | 'createdAt' | 'updatedAt'>[];
  metadata?: Record<string, unknown>;
}

function calculatePeriodEnd(start: Date, cycle: string, interval: number): Date {
  switch (cycle) {
    case 'monthly':
      return addMonths(start, interval);
    case 'quarterly':
      return addMonths(start, 3 * interval);
    case 'semi_annual':
      return addMonths(start, 6 * interval);
    case 'annual':
      return addMonths(start, 12 * interval);
    default:
      return addMonths(start, interval);
  }
}

export class SubscriptionService {
  static async create(
    tenantId: string,
    input: CreateSubscriptionInput,
  ): Promise<Subscription> {
    const customer = await db.query.customers.findFirst({
      where: and(
        eq(customers.tenantId, tenantId),
        eq(customers.id, input.customerId),
      ),
    });
    if (!customer) {
      throw new AppError('Customer not found', 'CUSTOMER_NOT_FOUND', 404);
    }

    const existing = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.tenantId, tenantId),
        eq(subscriptions.subscriptionNumber, input.subscriptionNumber),
      ),
    });
    if (existing) {
      throw new AppError(
        'Subscription number already exists',
        'SUBSCRIPTION_NUMBER_EXISTS',
        409,
      );
    }

    const now = new Date();
    const cycle = input.billingCycle ?? 'monthly';
    const interval = input.billingInterval ?? 1;
    const periodStart = now;
    const periodEnd = calculatePeriodEnd(now, cycle, interval);

    const isInTrial = input.trialStart && input.trialEnd && input.trialEnd > now;

    const [created] = await db
      .insert(subscriptions)
      .values({
        tenantId,
        customerId: input.customerId,
        subscriptionNumber: input.subscriptionNumber,
        name: input.name,
        status: isInTrial ? 'trialing' : 'active',
        currency: (input.currency ?? 'USD') as typeof currencyEnum.enumValues[number],
        recurringAmount: input.recurringAmount,
        billingCycle: cycle,
        billingInterval: interval,
        trialStart: input.trialStart,
        trialEnd: input.trialEnd,
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        nextBillingDate: periodEnd,
        notes: input.notes,
        metadata: input.metadata,
      })
      .returning();

    if (input.items && input.items.length > 0) {
      await db.insert(subscriptionItems).values(
        input.items.map((item, index) => ({
          ...item,
          tenantId,
          subscriptionId: created.id,
          sortOrder: index,
        })),
      );
    }

    return created;
  }

  static async getById(
    tenantId: string,
    subscriptionId: string,
  ): Promise<Subscription> {
    const sub = await db.query.subscriptions.findFirst({
      where: and(
        eq(subscriptions.tenantId, tenantId),
        eq(subscriptions.id, subscriptionId),
      ),
    });
    if (!sub) {
      throw new AppError('Subscription not found', 'SUBSCRIPTION_NOT_FOUND', 404);
    }
    return sub;
  }

  static async getWithItems(
    tenantId: string,
    subscriptionId: string,
  ): Promise<{ subscription: Subscription; items: SubscriptionItem[] }> {
    const subscription = await this.getById(tenantId, subscriptionId);
    const items = await db.query.subscriptionItems.findMany({
      where: and(
        eq(subscriptionItems.tenantId, tenantId),
        eq(subscriptionItems.subscriptionId, subscriptionId),
      ),
    });
    return { subscription, items };
  }

  static async list(
    tenantId: string,
    params: PaginationParams & {
      customerId?: string;
      status?: Subscription['status'];
    } = {},
  ): Promise<PaginatedResult<Subscription>> {
    const { limit = 20, offset = 0, customerId, status } = params;
    const conditions = [eq(subscriptions.tenantId, tenantId)];
    if (customerId) conditions.push(eq(subscriptions.customerId, customerId));
    if (status) conditions.push(eq(subscriptions.status, status));

    const where = and(...conditions);

    const [countResult, data] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(subscriptions)
        .where(where),
      db
        .select()
        .from(subscriptions)
        .where(where)
        .orderBy(desc(subscriptions.createdAt))
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
    subscriptionId: string,
    data: Partial<Omit<NewSubscription, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Subscription> {
    await this.getById(tenantId, subscriptionId);
    const [updated] = await db
      .update(subscriptions)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(subscriptions.tenantId, tenantId),
          eq(subscriptions.id, subscriptionId),
        ),
      )
      .returning();
    return updated;
  }

  static async cancel(
    tenantId: string,
    subscriptionId: string,
    reason?: string,
    immediate = false,
  ): Promise<Subscription> {
    const sub = await this.getById(tenantId, subscriptionId);
    if (sub.status === 'cancelled') {
      throw new AppError('Subscription already cancelled', 'ALREADY_CANCELLED', 400);
    }

    if (immediate) {
      return this.update(tenantId, subscriptionId, {
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelReason: reason,
        nextBillingDate: null,
      });
    }

    return this.update(tenantId, subscriptionId, {
      status: 'cancelled',
      cancelledAt: new Date(),
      cancelReason: reason,
    });
  }

  static async upgrade(
    tenantId: string,
    subscriptionId: string,
    newAmount: string,
    newItems?: Omit<NewSubscriptionItem, 'id' | 'tenantId' | 'subscriptionId' | 'createdAt' | 'updatedAt'>[],
  ): Promise<Subscription> {
    const sub = await this.getById(tenantId, subscriptionId);
    if (sub.status === 'cancelled') {
      throw new AppError('Cannot upgrade cancelled subscription', 'SUBSCRIPTION_CANCELLED', 400);
    }

    const proration = this.calculateProration(sub);

    const [updated] = await db
      .update(subscriptions)
      .set({
        recurringAmount: newAmount,
        updatedAt: new Date(),
        metadata: {
          ...(sub.metadata as Record<string, unknown>),
          lastUpgradeAt: new Date().toISOString(),
          prorationCredit: proration,
        },
      })
      .where(
        and(
          eq(subscriptions.tenantId, tenantId),
          eq(subscriptions.id, subscriptionId),
        ),
      )
      .returning();

    if (newItems) {
      await db
        .update(subscriptionItems)
        .set({ isActive: false, updatedAt: new Date() })
        .where(
          and(
            eq(subscriptionItems.tenantId, tenantId),
            eq(subscriptionItems.subscriptionId, subscriptionId),
          ),
        );

      await db.insert(subscriptionItems).values(
        newItems.map((item, index) => ({
          ...item,
          tenantId,
          subscriptionId,
          sortOrder: index,
        })),
      );
    }

    return updated;
  }

  static async downgrade(
    tenantId: string,
    subscriptionId: string,
    newAmount: string,
    effectiveAt: 'immediate' | 'next_billing' = 'next_billing',
  ): Promise<Subscription> {
    const sub = await this.getById(tenantId, subscriptionId);
    if (sub.status === 'cancelled') {
      throw new AppError('Cannot downgrade cancelled subscription', 'SUBSCRIPTION_CANCELLED', 400);
    }

    if (effectiveAt === 'immediate') {
      return this.update(tenantId, subscriptionId, { recurringAmount: newAmount });
    }

    return this.update(tenantId, subscriptionId, {
      metadata: {
        ...(sub.metadata as Record<string, unknown>),
        pendingDowngrade: {
          amount: newAmount,
          effectiveAt: sub.nextBillingDate?.toISOString(),
        },
      },
    });
  }

  static async renewPeriod(
    tenantId: string,
    subscriptionId: string,
  ): Promise<{ subscription: Subscription; invoice: unknown }> {
    const sub = await this.getById(tenantId, subscriptionId);
    if (sub.status !== 'active' && sub.status !== 'past_due') {
      throw new AppError(
        'Only active or past_due subscriptions can be renewed',
        'INVALID_RENEWAL',
        400,
      );
    }

    const now = new Date();
    const newPeriodStart = sub.currentPeriodEnd;
    const newPeriodEnd = calculatePeriodEnd(
      newPeriodStart,
      sub.billingCycle,
      sub.billingInterval,
    );

    const [updated] = await db
      .update(subscriptions)
      .set({
        currentPeriodStart: newPeriodStart,
        currentPeriodEnd: newPeriodEnd,
        nextBillingDate: newPeriodEnd,
        status: 'active',
        updatedAt: now,
      })
      .where(
        and(
          eq(subscriptions.tenantId, tenantId),
          eq(subscriptions.id, subscriptionId),
        ),
      )
      .returning();

    return { subscription: updated, invoice: null };
  }

  static async getDueForBilling(tenantId: string): Promise<Subscription[]> {
    const now = new Date();
    return db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.tenantId, tenantId),
          eq(subscriptions.status, 'active'),
          sql`${subscriptions.nextBillingDate} <= ${now}`,
        ),
      );
  }

  private static calculateProration(sub: Subscription): string {
    const now = new Date();
    const periodStart = sub.currentPeriodStart.getTime();
    const periodEnd = sub.currentPeriodEnd.getTime();
    const totalMs = periodEnd - periodStart;
    const remainingMs = periodEnd - now.getTime();
    const ratio = Math.max(0, Math.min(1, remainingMs / totalMs));
    const credit = Number(sub.recurringAmount) * ratio;
    return credit.toFixed(4);
  }
}
