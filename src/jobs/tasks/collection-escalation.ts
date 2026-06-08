import { task } from "@trigger.dev/sdk";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  invoices,
  customers,
  collectionCases,
  collectionEvents,
} from "@/lib/db/schema";

interface EscalateOverduePayload {
  tenantId: string;
}

interface EscalateAccountPayload {
  tenantId: string;
  customerId: string;
}

const ESCALATION_THRESHOLDS = [
  { daysOverdue: 7, status: "reminder" as const, action: "email_reminder" as const },
  { daysOverdue: 30, status: "reminder" as const, action: "phone_call" as const },
  { daysOverdue: 60, status: "final_notice" as const, action: "final_demand" as const },
  { daysOverdue: 90, status: "collection_agency" as const, action: "agency_referral" as const },
  { daysOverdue: 120, status: "legal" as const, action: "legal_action" as const },
];

export default task({
  id: "escalate-overdue-accounts",
  maxDuration: 300,
  retry: { maxAttempts: 3 },
  run: async (payload: EscalateOverduePayload, { ctx }) => {
    const { tenantId } = payload;
    const now = new Date();

    const overdueInvoices = await db.query.invoices.findMany({
      where: and(
        eq(invoices.tenantId, tenantId),
        sql`${invoices.status} IN ('overdue', 'pending', 'sent', 'viewed')`,
        sql`${invoices.dueDate} < NOW()`,
      ),
    });

    const customerMap = new Map<string, typeof overdueInvoices>();
    for (const invoice of overdueInvoices) {
      const existing = customerMap.get(invoice.customerId) ?? [];
      existing.push(invoice);
      customerMap.set(invoice.customerId, existing);
    }

    const results = {
      totalCustomers: customerMap.size,
      escalated: 0,
      alreadyEscalated: 0,
      newCases: 0,
      updatedCases: 0,
    };

    for (const [customerId, customerInvoices] of customerMap) {
      const maxDaysOverdue = Math.max(
        ...customerInvoices.map((inv) => {
          const diff = now.getTime() - new Date(inv.dueDate).getTime();
          return Math.floor(diff / (1000 * 60 * 60 * 24));
        }),
      );

      const totalOutstanding = customerInvoices.reduce(
        (sum, inv) => sum + parseFloat(inv.amountDue),
        0,
      );

      const escalationLevel =
        ESCALATION_THRESHOLDS.filter((t) => maxDaysOverdue >= t.daysOverdue).pop() ??
        ESCALATION_THRESHOLDS[0];

      const existingCase = await db.query.collectionCases.findFirst({
        where: and(
          eq(collectionCases.tenantId, tenantId),
          eq(collectionCases.customerId, customerId),
          sql`${collectionCases.status} NOT IN ('resolved')`,
        ),
      });

      if (existingCase) {
        const needsUpdate =
          existingCase.overdueDays < maxDaysOverdue ||
          existingCase.status !== escalationLevel.status;

        if (needsUpdate) {
          await db
            .update(collectionCases)
            .set({
              overdueDays: maxDaysOverdue,
              totalOutstanding: String(totalOutstanding),
              status: escalationLevel.status,
              updatedAt: new Date(),
            })
            .where(eq(collectionCases.id, existingCase.id));

          await db.insert(collectionEvents).values({
            tenantId,
            caseId: existingCase.id,
            action: escalationLevel.action,
            description: `Auto-escalated: ${maxDaysOverdue} days overdue. Total outstanding: ${totalOutstanding}`,
            metadata: {
              previousStatus: existingCase.status,
              newStatus: escalationLevel.status,
              daysOverdue: maxDaysOverdue,
            },
          });

          results.updatedCases++;
        } else {
          results.alreadyEscalated++;
        }
      } else {
        const caseNumber = `COL-${Date.now().toString(36).toUpperCase()}`;
        const [newCase] = await db
          .insert(collectionCases)
          .values({
            tenantId,
            customerId,
            caseNumber,
            status: escalationLevel.status,
            totalOutstanding: String(totalOutstanding),
            overdueDays: maxDaysOverdue,
          })
          .returning();

        await db.insert(collectionEvents).values({
          tenantId,
          caseId: newCase.id,
          action: escalationLevel.action,
          description: `New collection case opened: ${maxDaysOverdue} days overdue. Total outstanding: ${totalOutstanding}`,
          metadata: {
            initialEscalationLevel: escalationLevel.status,
            invoiceCount: customerInvoices.length,
          },
        });

        results.newCases++;
      }

      // Update customer collection status
      await db
        .update(customers)
        .set({
          collectionStatus: escalationLevel.status,
          outstandingBalance: String(totalOutstanding),
          updatedAt: new Date(),
        })
        .where(eq(customers.id, customerId));

      results.escalated++;
    }

    return results;
  },
});

export const escalateSingleAccount = task({
  id: "escalate-single-account",
  maxDuration: 60,
  retry: { maxAttempts: 3 },
  run: async (payload: EscalateAccountPayload, { ctx }) => {
    const { tenantId, customerId } = payload;
    const now = new Date();

    const customerInvoices = await db.query.invoices.findMany({
      where: and(
        eq(invoices.tenantId, tenantId),
        eq(invoices.customerId, customerId),
        sql`${invoices.status} IN ('overdue', 'pending', 'sent', 'viewed')`,
        sql`${invoices.dueDate} < NOW()`,
      ),
    });

    if (customerInvoices.length === 0) {
      return { escalated: false, reason: "No overdue invoices found" };
    }

    const maxDaysOverdue = Math.max(
      ...customerInvoices.map((inv) => {
        const diff = now.getTime() - new Date(inv.dueDate).getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
      }),
    );

    const totalOutstanding = customerInvoices.reduce(
      (sum, inv) => sum + parseFloat(inv.amountDue),
      0,
    );

    const escalationLevel =
      ESCALATION_THRESHOLDS.filter((t) => maxDaysOverdue >= t.daysOverdue).pop() ??
      ESCALATION_THRESHOLDS[0];

    const caseNumber = `COL-${Date.now().toString(36).toUpperCase()}`;
    const [newCase] = await db
      .insert(collectionCases)
      .values({
        tenantId,
        customerId,
        caseNumber,
        status: escalationLevel.status,
        totalOutstanding: String(totalOutstanding),
        overdueDays: maxDaysOverdue,
      })
      .returning();

    await db.insert(collectionEvents).values({
      tenantId,
      caseId: newCase.id,
      action: escalationLevel.action,
      description: `Manual escalation: ${maxDaysOverdue} days overdue. Total outstanding: ${totalOutstanding}`,
    });

    await db
      .update(customers)
      .set({
        collectionStatus: escalationLevel.status,
        outstandingBalance: String(totalOutstanding),
        updatedAt: new Date(),
      })
      .where(eq(customers.id, customerId));

    return {
      escalated: true,
      caseId: newCase.id,
      caseNumber,
      escalationLevel: escalationLevel.status,
      overdueDays: maxDaysOverdue,
      totalOutstanding: String(totalOutstanding),
    };
  },
});
