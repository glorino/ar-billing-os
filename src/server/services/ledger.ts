import { db } from '@/lib/db';
import {
  ledgerAccounts,
  ledgerEntries,
  ledgerPeriods,
  ledgerJournalEntries,
  type LedgerAccount,
  type NewLedgerAccount,
  type LedgerEntry,
  type NewLedgerEntry,
  type LedgerPeriod,
  type NewLedgerPeriod,
  type LedgerJournalEntry,
  type NewLedgerJournalEntry,
  ledgerEntryTypeEnum,
  ledgerAccountTypeEnum,
} from '@/lib/db/schema';
import { eq, and, sql, desc, asc as drizzleAsc, gte, lte } from 'drizzle-orm';

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

export interface JournalEntryLine {
  accountId: string;
  amount: string;
  description: string;
}

export interface TrialBalanceRow {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  totalDebit: string;
  totalCredit: string;
  balance: string;
}

export interface CreateJournalEntryInput {
  description: string;
  referenceType?: string;
  referenceId?: string;
  lines: JournalEntryLine[];
  metadata?: Record<string, unknown>;
}

export class LedgerService {
  static async createAccount(
    tenantId: string,
    data: Omit<NewLedgerAccount, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>,
  ): Promise<LedgerAccount> {
    const existing = await db.query.ledgerAccounts.findFirst({
      where: and(
        eq(ledgerAccounts.tenantId, tenantId),
        eq(ledgerAccounts.code, data.code),
      ),
    });
    if (existing) {
      throw new AppError('Account code already exists', 'ACCOUNT_CODE_EXISTS', 409);
    }
    const [created] = await db
      .insert(ledgerAccounts)
      .values({ ...data, tenantId })
      .returning();
    return created;
  }

  static async getAccountById(
    tenantId: string,
    accountId: string,
  ): Promise<LedgerAccount> {
    const account = await db.query.ledgerAccounts.findFirst({
      where: and(
        eq(ledgerAccounts.tenantId, tenantId),
        eq(ledgerAccounts.id, accountId),
      ),
    });
    if (!account) {
      throw new AppError('Ledger account not found', 'ACCOUNT_NOT_FOUND', 404);
    }
    return account;
  }

  static async listAccounts(
    tenantId: string,
    params: { type?: LedgerAccount['type']; activeOnly?: boolean } = {},
  ): Promise<LedgerAccount[]> {
    const conditions = [eq(ledgerAccounts.tenantId, tenantId)];
    if (params.type) conditions.push(eq(ledgerAccounts.type, params.type));
    if (params.activeOnly) conditions.push(eq(ledgerAccounts.isActive, true));
    return db.query.ledgerAccounts.findMany({
      where: and(...conditions),
      orderBy: drizzleAsc(ledgerAccounts.code),
    });
  }

  static async updateAccount(
    tenantId: string,
    accountId: string,
    data: Partial<Omit<NewLedgerAccount, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>>,
  ): Promise<LedgerAccount> {
    await this.getAccountById(tenantId, accountId);
    const [updated] = await db
      .update(ledgerAccounts)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(eq(ledgerAccounts.tenantId, tenantId), eq(ledgerAccounts.id, accountId)),
      )
      .returning();
    return updated;
  }

  static async postEntry(
    tenantId: string,
    data: Omit<NewLedgerEntry, 'id' | 'tenantId' | 'createdAt'>,
  ): Promise<LedgerEntry> {
    await this.getAccountById(tenantId, data.accountId);
    const [created] = await db
      .insert(ledgerEntries)
      .values({ ...data, tenantId })
      .returning();
    return created;
  }

  static async getEntries(
    tenantId: string,
    params: PaginationParams & {
      accountId?: string;
      entryType?: LedgerEntry['entryType'];
      referenceType?: string;
      referenceId?: string;
      from?: Date;
      to?: Date;
    } = {},
  ): Promise<PaginatedResult<LedgerEntry>> {
    const { limit = 50, offset = 0, accountId, entryType, referenceType, referenceId, from, to } = params;
    const conditions = [eq(ledgerEntries.tenantId, tenantId)];
    if (accountId) conditions.push(eq(ledgerEntries.accountId, accountId));
    if (entryType) conditions.push(eq(ledgerEntries.entryType, entryType));
    if (referenceType) conditions.push(eq(ledgerEntries.referenceType, referenceType));
    if (referenceId) conditions.push(eq(ledgerEntries.referenceId, referenceId));
    if (from) conditions.push(gte(ledgerEntries.createdAt, from));
    if (to) conditions.push(lte(ledgerEntries.createdAt, to));

    const where = and(...conditions);
    const [countResult, data] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(ledgerEntries).where(where),
      db.select().from(ledgerEntries).where(where).orderBy(desc(ledgerEntries.createdAt)).limit(limit).offset(offset),
    ]);

    const total = countResult[0]?.count ?? 0;
    return { data, total, limit, offset, hasMore: offset + limit < total };
  }

  static async postJournalEntry(
    tenantId: string,
    input: CreateJournalEntryInput,
  ): Promise<LedgerJournalEntry> {
    if (input.lines.length < 2) {
      throw new AppError('Journal entry requires at least 2 lines', 'INVALID_JOURNAL_ENTRY', 400);
    }

    let totalDebit = 0;
    let totalCredit = 0;
    for (const line of input.lines) {
      const amount = Number(line.amount);
      if (amount <= 0) {
        throw new AppError('Line amounts must be positive', 'INVALID_LINE_AMOUNT', 400);
      }
      const account = await this.getAccountById(tenantId, line.accountId);
      if (account.type === 'asset' || account.type === 'expense') {
        totalDebit += amount;
      } else {
        totalCredit += amount;
      }
    }

    if (Math.abs(totalDebit - totalCredit) > 0.0001) {
      throw new AppError(
        `Debits (${totalDebit}) must equal credits (${totalCredit})`,
        'JOURNAL_ENTRY_UNBALANCED',
        400,
      );
    }

    const entryNumber = await this.generateJournalEntryNumber(tenantId);

    const [journalEntry] = await db
      .insert(ledgerJournalEntries)
      .values({
        tenantId,
        entryNumber,
        description: input.description,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        metadata: input.metadata,
      })
      .returning();

    const entriesToInsert: NewLedgerEntry[] = [];
    for (const line of input.lines) {
      const account = await this.getAccountById(tenantId, line.accountId);
      const amount = Number(line.amount);
      const isDebit = account.type === 'asset' || account.type === 'expense';

      entriesToInsert.push({
        tenantId,
        accountId: line.accountId,
        entryType: isDebit ? 'debit' : 'credit',
        amount: line.amount,
        currency: 'USD',
        debitAmount: isDebit ? line.amount : '0',
        creditAmount: isDebit ? '0' : line.amount,
        description: line.description,
        referenceType: 'journal_entry',
        referenceId: journalEntry.id,
      });
    }

    await db.insert(ledgerEntries).values(entriesToInsert);
    return journalEntry;
  }

  static async reverseJournalEntry(
    tenantId: string,
    journalEntryId: string,
    reason: string,
  ): Promise<LedgerJournalEntry> {
    const original = await db.query.ledgerJournalEntries.findFirst({
      where: and(
        eq(ledgerJournalEntries.tenantId, tenantId),
        eq(ledgerJournalEntries.id, journalEntryId),
      ),
    });
    if (!original) {
      throw new AppError('Journal entry not found', 'JOURNAL_ENTRY_NOT_FOUND', 404);
    }
    if (original.isReversed) {
      throw new AppError('Journal entry is already reversed', 'ALREADY_REVERSED', 400);
    }

    const originalEntries = await db.query.ledgerEntries.findMany({
      where: and(
        eq(ledgerEntries.tenantId, tenantId),
        eq(ledgerEntries.referenceType, 'journal_entry'),
        eq(ledgerEntries.referenceId, journalEntryId),
      ),
    });

    const reversalLines: JournalEntryLine[] = originalEntries.map((entry) => ({
      accountId: entry.accountId,
      amount: entry.amount,
      description: `Reversal: ${entry.description}`,
    }));

    const reversal = await this.postJournalEntry(tenantId, {
      description: `Reversal of ${original.entryNumber}: ${reason}`,
      referenceType: 'reversal',
      referenceId: journalEntryId,
      lines: reversalLines,
    });

    await db
      .update(ledgerJournalEntries)
      .set({ isReversed: true, updatedAt: new Date() })
      .where(eq(ledgerJournalEntries.id, journalEntryId));

    for (const entry of originalEntries) {
      await db
        .update(ledgerEntries)
        .set({ isReversed: true, reversedByEntryId: reversal.id })
        .where(eq(ledgerEntries.id, entry.id));
    }

    return reversal;
  }

  static async getAccountBalance(
    tenantId: string,
    accountId: string,
    asOfDate?: Date,
  ): Promise<string> {
    await this.getAccountById(tenantId, accountId);
    const conditions = [
      eq(ledgerEntries.tenantId, tenantId),
      eq(ledgerEntries.accountId, accountId),
    ];
    if (asOfDate) conditions.push(lte(ledgerEntries.createdAt, asOfDate));

    const [result] = await db
      .select({
        totalDebit: sql<string>`coalesce(sum(${ledgerEntries.debitAmount}), '0')`,
        totalCredit: sql<string>`coalesce(sum(${ledgerEntries.creditAmount}), '0')`,
      })
      .from(ledgerEntries)
      .where(and(...conditions));

    const balance = Number(result?.totalDebit ?? '0') - Number(result?.totalCredit ?? '0');
    return balance.toFixed(4);
  }

  static async getTrialBalance(
    tenantId: string,
    asOfDate?: Date,
  ): Promise<TrialBalanceRow[]> {
    const accounts = await this.listAccounts(tenantId, { activeOnly: true });
    const rows: TrialBalanceRow[] = [];

    for (const account of accounts) {
      const balance = await this.getAccountBalance(tenantId, account.id, asOfDate);
      const balanceNum = Number(balance);

      rows.push({
        accountId: account.id,
        accountCode: account.code,
        accountName: account.name,
        accountType: account.type,
        totalDebit: balanceNum > 0 ? balance : '0',
        totalCredit: balanceNum < 0 ? Math.abs(balanceNum).toFixed(4) : '0',
        balance,
      });
    }

    return rows;
  }

  static async createPeriod(
    tenantId: string,
    data: Omit<NewLedgerPeriod, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>,
  ): Promise<LedgerPeriod> {
    const existing = await db.query.ledgerPeriods.findFirst({
      where: and(
        eq(ledgerPeriods.tenantId, tenantId),
        eq(ledgerPeriods.name, data.name),
      ),
    });
    if (existing) {
      throw new AppError('Period name already exists', 'PERIOD_EXISTS', 409);
    }
    const [created] = await db
      .insert(ledgerPeriods)
      .values({ ...data, tenantId })
      .returning();
    return created;
  }

  static async closePeriod(
    tenantId: string,
    periodId: string,
    closedBy: string,
  ): Promise<LedgerPeriod> {
    const period = await db.query.ledgerPeriods.findFirst({
      where: and(
        eq(ledgerPeriods.tenantId, tenantId),
        eq(ledgerPeriods.id, periodId),
      ),
    });
    if (!period) {
      throw new AppError('Period not found', 'PERIOD_NOT_FOUND', 404);
    }
    if (period.status === 'closed' || period.status === 'reconciled') {
      throw new AppError('Period is already closed', 'PERIOD_ALREADY_CLOSED', 400);
    }

    const [updated] = await db
      .update(ledgerPeriods)
      .set({
        status: 'closed',
        closedAt: new Date(),
        closedBy,
        updatedAt: new Date(),
      })
      .where(
        and(eq(ledgerPeriods.tenantId, tenantId), eq(ledgerPeriods.id, periodId)),
      )
      .returning();
    return updated;
  }

  static async getCurrentPeriod(
    tenantId: string,
  ): Promise<LedgerPeriod | undefined> {
    return db.query.ledgerPeriods.findFirst({
      where: and(
        eq(ledgerPeriods.tenantId, tenantId),
        eq(ledgerPeriods.status, 'current'),
      ),
    });
  }

  static async getGeneralLedger(
    tenantId: string,
    params: PaginationParams & {
      accountId?: string;
      from?: Date;
      to?: Date;
    } = {},
  ): Promise<PaginatedResult<LedgerEntry>> {
    return this.getEntries(tenantId, params);
  }

  private static async generateJournalEntryNumber(
    tenantId: string,
  ): Promise<string> {
    const [count] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(ledgerJournalEntries)
      .where(eq(ledgerJournalEntries.tenantId, tenantId));
    const next = (count?.count ?? 0) + 1;
    return `JE-${String(next).padStart(8, '0')}`;
  }
}


