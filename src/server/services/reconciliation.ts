import { db } from '@/lib/db';
import {
  reconciliationBatches,
  reconciliationItems,
  payments,
  type ReconciliationBatch,
  type NewReconciliationBatch,
  type ReconciliationItem,
  type NewReconciliationItem,
  reconciliationStatusEnum,
  currencyEnum,
} from '@/lib/db/schema';
import { eq, and, sql, gte, lte, desc } from 'drizzle-orm';

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

export interface BatchReconciliationInput {
  source: string;
  currency?: string;
  statementDate?: Date;
  notes?: string;
  items: {
    paymentId?: string;
    transactionDate: Date;
    transactionReference?: string;
    transactionDescription?: string;
    transactionAmount: string;
  }[];
}

export interface DiscrepancyItem {
  itemId: string;
  transactionReference: string | null;
  transactionAmount: string;
  paymentAmount: string | null;
  difference: string;
}

export class ReconciliationService {
  static async createBatch(
    tenantId: string,
    data: Omit<NewReconciliationBatch, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'batchNumber'>,
  ): Promise<ReconciliationBatch> {
    const batchNumber = await this.generateBatchNumber(tenantId);
    const [created] = await db
      .insert(reconciliationBatches)
      .values({
        ...data,
        tenantId,
        batchNumber,
      })
      .returning();
    return created;
  }

  static async getBatchById(
    tenantId: string,
    batchId: string,
  ): Promise<ReconciliationBatch> {
    const batch = await db.query.reconciliationBatches.findFirst({
      where: and(
        eq(reconciliationBatches.tenantId, tenantId),
        eq(reconciliationBatches.id, batchId),
      ),
    });
    if (!batch) {
      throw new AppError('Reconciliation batch not found', 'BATCH_NOT_FOUND', 404);
    }
    return batch;
  }

  static async listBatches(
    tenantId: string,
    params: PaginationParams & { status?: ReconciliationBatch['status'] } = {},
  ): Promise<PaginatedResult<ReconciliationBatch>> {
    const { limit = 20, offset = 0, status } = params;
    const conditions = [eq(reconciliationBatches.tenantId, tenantId)];
    if (status) conditions.push(eq(reconciliationBatches.status, status));
    const where = and(...conditions);

    const [countResult, data] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(reconciliationBatches).where(where),
      db.select().from(reconciliationBatches).where(where).orderBy(desc(reconciliationBatches.createdAt)).limit(limit).offset(offset),
    ]);

    const total = countResult[0]?.count ?? 0;
    return { data, total, limit, offset, hasMore: offset + limit < total };
  }

  static async addItem(
    tenantId: string,
    batchId: string,
    data: Omit<NewReconciliationItem, 'id' | 'tenantId' | 'batchId' | 'createdAt' | 'updatedAt'>,
  ): Promise<ReconciliationItem> {
    await this.getBatchById(tenantId, batchId);
    let difference: string | null = null;
    let paymentAmount: string | null = null;

    if (data.paymentId) {
      const payment = await db.query.payments.findFirst({
        where: and(eq(payments.tenantId, tenantId), eq(payments.id, data.paymentId)),
      });
      if (payment) {
        paymentAmount = payment.amount;
        difference = (Number(data.transactionAmount) - Number(payment.amount)).toFixed(4);
      }
    }

    const status = difference !== null && Number(difference) === 0 ? 'matched' : 'pending';
    const [created] = await db
      .insert(reconciliationItems)
      .values({ ...data, tenantId, batchId, paymentAmount, difference, status })
      .returning();
    return created;
  }

  static async getBatchItems(
    tenantId: string,
    batchId: string,
  ): Promise<ReconciliationItem[]> {
    await this.getBatchById(tenantId, batchId);
    return db.query.reconciliationItems.findMany({
      where: and(
        eq(reconciliationItems.tenantId, tenantId),
        eq(reconciliationItems.batchId, batchId),
      ),
      orderBy: desc(reconciliationItems.createdAt),
    });
  }

  static async processBatchReconciliation(
    tenantId: string,
    input: BatchReconciliationInput,
  ): Promise<ReconciliationBatch> {
    const batch = await this.createBatch(tenantId, {
      source: input.source,
      currency: (input.currency ?? 'USD') as typeof currencyEnum.enumValues[number],
      statementDate: input.statementDate,
      notes: input.notes,
      status: 'pending',
    });

    let matchedCount = 0;
    let unmatchedCount = 0;
    let totalAmount = 0;
    let matchedAmount = 0;
    let unmatchedAmount = 0;

    for (const item of input.items) {
      let paymentId = item.paymentId;
      let paymentAmount: string | null = null;
      let difference: string | null = null;

      if (!paymentId && item.transactionReference) {
        const payment = await db.query.payments.findFirst({
          where: and(
            eq(payments.tenantId, tenantId),
            eq(payments.referenceNumber, item.transactionReference),
            eq(payments.status, 'completed'),
          ),
        });
        if (payment) {
          paymentId = payment.id;
        }
      }

      if (paymentId) {
        const payment = await db.query.payments.findFirst({
          where: and(eq(payments.tenantId, tenantId), eq(payments.id, paymentId)),
        });
        if (payment) {
          paymentAmount = payment.amount;
          difference = (Number(item.transactionAmount) - Number(payment.amount)).toFixed(4);
        }
      }

      const isMatched = difference !== null && Number(difference) === 0;
      const status = isMatched ? 'matched' : paymentId ? 'partial' : 'unmatched';

      if (isMatched) {
        matchedCount++;
        matchedAmount += Number(item.transactionAmount);
        if (paymentId) {
          await db
            .update(payments)
            .set({ reconciliationStatus: 'matched', reconciledAt: new Date(), updatedAt: new Date() })
            .where(eq(payments.id, paymentId));
        }
      } else {
        unmatchedCount++;
        unmatchedAmount += Number(item.transactionAmount);
      }
      totalAmount += Number(item.transactionAmount);

      await db.insert(reconciliationItems).values({
        tenantId,
        batchId: batch.id,
        paymentId: paymentId ?? null,
        status,
        transactionDate: item.transactionDate,
        transactionReference: item.transactionReference ?? null,
        transactionDescription: item.transactionDescription ?? null,
        transactionAmount: item.transactionAmount,
        paymentAmount,
        difference,
      });
    }

    const batchStatus = unmatchedCount === 0 ? 'matched' : matchedCount > 0 ? 'partial' : 'unmatched';

    const [updated] = await db
      .update(reconciliationBatches)
      .set({
        status: batchStatus,
        totalTransactions: input.items.length,
        matchedCount,
        unmatchedCount,
        totalAmount: totalAmount.toFixed(4),
        matchedAmount: matchedAmount.toFixed(4),
        unmatchedAmount: unmatchedAmount.toFixed(4),
        updatedAt: new Date(),
      })
      .where(eq(reconciliationBatches.id, batch.id))
      .returning();

    return updated;
  }

  static async matchItem(
    tenantId: string,
    itemId: string,
    paymentId: string,
  ): Promise<ReconciliationItem> {
    const item = await db.query.reconciliationItems.findFirst({
      where: and(
        eq(reconciliationItems.tenantId, tenantId),
        eq(reconciliationItems.id, itemId),
      ),
    });
    if (!item) {
      throw new AppError('Reconciliation item not found', 'ITEM_NOT_FOUND', 404);
    }

    const payment = await db.query.payments.findFirst({
      where: and(eq(payments.tenantId, tenantId), eq(payments.id, paymentId)),
    });
    if (!payment) {
      throw new AppError('Payment not found', 'PAYMENT_NOT_FOUND', 404);
    }

    const difference = (Number(item.transactionAmount) - Number(payment.amount)).toFixed(4);
    const status = Number(difference) === 0 ? 'matched' : 'partial';

    const [updated] = await db
      .update(reconciliationItems)
      .set({
        paymentId,
        paymentAmount: payment.amount,
        difference,
        status,
        updatedAt: new Date(),
      })
      .where(
        and(eq(reconciliationItems.tenantId, tenantId), eq(reconciliationItems.id, itemId)),
      )
      .returning();

    await this.recalculateBatch(tenantId, item.batchId);
    return updated;
  }

  static async getDiscrepancies(
    tenantId: string,
    batchId: string,
  ): Promise<DiscrepancyItem[]> {
    await this.getBatchById(tenantId, batchId);
    const items = await db.query.reconciliationItems.findMany({
      where: and(
        eq(reconciliationItems.tenantId, tenantId),
        eq(reconciliationItems.batchId, batchId),
        sql`${reconciliationItems.status} != 'matched'`,
      ),
    });

    return items
      .filter((item) => item.difference && Number(item.difference) !== 0)
      .map((item) => ({
        itemId: item.id,
        transactionReference: item.transactionReference,
        transactionAmount: item.transactionAmount,
        paymentAmount: item.paymentAmount,
        difference: item.difference ?? '0',
      }));
  }

  static async resolveDiscrepancy(
    tenantId: string,
    itemId: string,
    resolution: 'write_off' | 'adjust' | 'void',
    notes?: string,
  ): Promise<ReconciliationItem> {
    const item = await db.query.reconciliationItems.findFirst({
      where: and(
        eq(reconciliationItems.tenantId, tenantId),
        eq(reconciliationItems.id, itemId),
      ),
    });
    if (!item) {
      throw new AppError('Reconciliation item not found', 'ITEM_NOT_FOUND', 404);
    }

    const [updated] = await db
      .update(reconciliationItems)
      .set({
        status: 'matched',
        notes: notes ?? `Resolved via ${resolution}`,
        metadata: {
          ...(item.metadata as Record<string, unknown>),
          resolution,
          resolvedAt: new Date().toISOString(),
        },
        updatedAt: new Date(),
      })
      .where(
        and(eq(reconciliationItems.tenantId, tenantId), eq(reconciliationItems.id, itemId)),
      )
      .returning();

    await this.recalculateBatch(tenantId, item.batchId);
    return updated;
  }

  static async closeBatch(
    tenantId: string,
    batchId: string,
  ): Promise<ReconciliationBatch> {
    const batch = await this.getBatchById(tenantId, batchId);
    if (batch.unmatchedCount > 0) {
      throw new AppError(
        'Cannot close batch with unmatched items',
        'BATCH_HAS_UNMATCHED',
        400,
      );
    }
    const [updated] = await db
      .update(reconciliationBatches)
      .set({ status: 'matched', updatedAt: new Date() })
      .where(
        and(eq(reconciliationBatches.tenantId, tenantId), eq(reconciliationBatches.id, batchId)),
      )
      .returning();
    return updated;
  }

  private static async recalculateBatch(
    tenantId: string,
    batchId: string,
  ): Promise<void> {
    const items = await db.query.reconciliationItems.findMany({
      where: and(
        eq(reconciliationItems.tenantId, tenantId),
        eq(reconciliationItems.batchId, batchId),
      ),
    });

    const matchedCount = items.filter((i) => i.status === 'matched').length;
    const unmatchedCount = items.length - matchedCount;
    const totalAmount = items.reduce((sum, i) => sum + Number(i.transactionAmount), 0);
    const matchedAmount = items
      .filter((i) => i.status === 'matched')
      .reduce((sum, i) => sum + Number(i.transactionAmount), 0);
    const unmatchedAmount = totalAmount - matchedAmount;

    const status = unmatchedCount === 0 ? 'matched' : matchedCount > 0 ? 'partial' : 'unmatched';

    await db
      .update(reconciliationBatches)
      .set({
        status,
        totalTransactions: items.length,
        matchedCount,
        unmatchedCount,
        totalAmount: totalAmount.toFixed(4),
        matchedAmount: matchedAmount.toFixed(4),
        unmatchedAmount: unmatchedAmount.toFixed(4),
        updatedAt: new Date(),
      })
      .where(eq(reconciliationBatches.id, batchId));
  }

  private static async generateBatchNumber(tenantId: string): Promise<string> {
    const [count] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(reconciliationBatches)
      .where(eq(reconciliationBatches.tenantId, tenantId));
    const next = (count?.count ?? 0) + 1;
    return `REC-${String(next).padStart(6, '0')}`;
  }
}
