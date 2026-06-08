import { task } from "@trigger.dev/sdk";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  ledgerAccounts,
  ledgerEntries,
  ledgerJournalEntries,
  ledgerPeriods,
  invoices,
  payments,
} from "@/lib/db/schema";

interface SyncLedgerPayload {
  tenantId: string;
  periodId?: string;
}

interface BalanceLedgerPayload {
  tenantId: string;
}

export default task({
  id: "sync-ledger",
  maxDuration: 600,
  retry: { maxAttempts: 3 },
  run: async (payload: SyncLedgerPayload, { ctx }) => {
    const { tenantId, periodId } = payload;
    const now = new Date();

    // Ensure ledger accounts exist
    const existingAccounts = await db.query.ledgerAccounts.findMany({
      where: eq(ledgerAccounts.tenantId, tenantId),
    });

    if (existingAccounts.length === 0) {
      const defaultAccounts = [
        { code: "1000", name: "Accounts Receivable", type: "asset" as const },
        { code: "1100", name: "Cash", type: "asset" as const },
        { code: "2000", name: "Revenue", type: "revenue" as const },
        { code: "3000", name: "Deferred Revenue", type: "liability" as const },
        { code: "4000", name: "Tax Payable", type: "liability" as const },
        { code: "5000", name: "Bad Debt Expense", type: "expense" as const },
      ];

      for (const account of defaultAccounts) {
        await db.insert(ledgerAccounts).values({
          tenantId,
          code: account.code,
          name: account.name,
          type: account.type,
        });
      }
    }

    const accounts = await db.query.ledgerAccounts.findMany({
      where: eq(ledgerAccounts.tenantId, tenantId),
    });

    const accountMap = new Map(accounts.map((a) => [a.code, a]));

    const arAccount = accountMap.get("1000");
    const cashAccount = accountMap.get("1100");
    const revenueAccount = accountMap.get("2000");
    const taxAccount = accountMap.get("4000");

    if (!arAccount || !cashAccount || !revenueAccount || !taxAccount) {
      throw new Error("Required ledger accounts not found");
    }

    // Sync unpaid invoices (AR entries)
    const unpaidInvoices = await db.query.invoices.findMany({
      where: and(
        eq(invoices.tenantId, tenantId),
        sql`${invoices.status} IN ('pending', 'sent', 'viewed', 'partial', 'overdue')`,
      ),
    });

    let entriesCreated = 0;

    for (const invoice of unpaidInvoices) {
      const existingEntry = await db.query.ledgerEntries.findFirst({
        where: and(
          eq(ledgerEntries.tenantId, tenantId),
          eq(ledgerEntries.referenceType, "invoice"),
          eq(ledgerEntries.referenceId, invoice.id),
        ),
      });

      if (!existingEntry) {
        const totalAmount = parseFloat(invoice.total);
        const taxAmount = parseFloat(invoice.taxAmount);

        // Debit AR
        await db.insert(ledgerEntries).values({
          tenantId,
          accountId: arAccount.id,
          entryType: "debit",
          amount: String(totalAmount),
          currency: invoice.currency,
          debitAmount: String(totalAmount),
          creditAmount: "0",
          description: `Invoice ${invoice.invoiceNumber}`,
          referenceType: "invoice",
          referenceId: invoice.id,
          periodId,
        });

        // Credit Revenue
        await db.insert(ledgerEntries).values({
          tenantId,
          accountId: revenueAccount.id,
          entryType: "credit",
          amount: String(totalAmount - taxAmount),
          currency: invoice.currency,
          debitAmount: "0",
          creditAmount: String(totalAmount - taxAmount),
          description: `Revenue from Invoice ${invoice.invoiceNumber}`,
          referenceType: "invoice",
          referenceId: invoice.id,
          periodId,
        });

        // Credit Tax if applicable
        if (taxAmount > 0) {
          await db.insert(ledgerEntries).values({
            tenantId,
            accountId: taxAccount.id,
            entryType: "credit",
            amount: String(taxAmount),
            currency: invoice.currency,
            debitAmount: "0",
            creditAmount: String(taxAmount),
            description: `Tax from Invoice ${invoice.invoiceNumber}`,
            referenceType: "invoice",
            referenceId: invoice.id,
            periodId,
          });
        }

        entriesCreated++;
      }
    }

    // Sync completed payments (Cash entries)
    const completedPayments = await db.query.payments.findMany({
      where: and(
        eq(payments.tenantId, tenantId),
        eq(payments.status, "completed"),
      ),
    });

    for (const payment of completedPayments) {
      const existingEntry = await db.query.ledgerEntries.findFirst({
        where: and(
          eq(ledgerEntries.tenantId, tenantId),
          eq(ledgerEntries.referenceType, "payment"),
          eq(ledgerEntries.referenceId, payment.id),
        ),
      });

      if (!existingEntry) {
        const amount = parseFloat(payment.amount);

        // Debit Cash
        await db.insert(ledgerEntries).values({
          tenantId,
          accountId: cashAccount.id,
          entryType: "debit",
          amount: String(amount),
          currency: payment.currency,
          debitAmount: String(amount),
          creditAmount: "0",
          description: `Payment ${payment.paymentNumber}`,
          referenceType: "payment",
          referenceId: payment.id,
          periodId,
        });

        // Credit AR
        await db.insert(ledgerEntries).values({
          tenantId,
          accountId: arAccount.id,
          entryType: "credit",
          amount: String(amount),
          currency: payment.currency,
          debitAmount: "0",
          creditAmount: String(amount),
          description: `Payment applied from ${payment.paymentNumber}`,
          referenceType: "payment",
          referenceId: payment.id,
          periodId,
        });

        entriesCreated++;
      }
    }

    return { entriesCreated, accountsProcessed: accounts.length };
  },
});

export const balanceLedger = task({
  id: "balance-ledger",
  maxDuration: 120,
  retry: { maxAttempts: 3 },
  run: async (payload: BalanceLedgerPayload, { ctx }) => {
    const { tenantId } = payload;

    const accounts = await db.query.ledgerAccounts.findMany({
      where: eq(ledgerAccounts.tenantId, tenantId),
    });

    const balances: Array<{
      accountId: string;
      code: string;
      name: string;
      type: string;
      totalDebits: number;
      totalCredits: number;
      balance: number;
      isBalanced: boolean;
    }> = [];

    let allBalanced = true;

    for (const account of accounts) {
      const entries = await db.query.ledgerEntries.findMany({
        where: and(
          eq(ledgerEntries.tenantId, tenantId),
          eq(ledgerEntries.accountId, account.id),
          eq(ledgerEntries.isReversed, false),
        ),
      });

      const totalDebits = entries.reduce(
        (sum, e) => sum + parseFloat(e.debitAmount),
        0,
      );
      const totalCredits = entries.reduce(
        (sum, e) => sum + parseFloat(e.creditAmount),
        0,
      );

      // For asset/expenses: debits - credits; for liabilities/equity/revenue: credits - debits
      let balance: number;
      if (account.type === "asset" || account.type === "expense") {
        balance = totalDebits - totalCredits;
      } else {
        balance = totalCredits - totalDebits;
      }

      const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;
      if (!isBalanced) allBalanced = false;

      balances.push({
        accountId: account.id,
        code: account.code,
        name: account.name,
        type: account.type,
        totalDebits,
        totalCredits,
        balance,
        isBalanced,
      });
    }

    // Generate journal entry number
    const existingJournals = await db.query.ledgerJournalEntries.findMany({
      where: eq(ledgerJournalEntries.tenantId, tenantId),
    });
    const journalNumber = `JE-${String(existingJournals.length + 1).padStart(6, "0")}`;

    await db.insert(ledgerJournalEntries).values({
      tenantId,
      entryNumber: journalNumber,
      description: `Ledger balance check - ${new Date().toISOString()}`,
      postedAt: new Date(),
      metadata: {
        allBalanced,
        accountCount: accounts.length,
        unbalancedAccounts: balances.filter((b) => !b.isBalanced).map((b) => b.code),
      },
    });

    return {
      allBalanced,
      accountCount: accounts.length,
      balances,
      journalNumber,
    };
  },
});
