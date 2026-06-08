import { task } from "@trigger.dev/sdk";
import { eq, and, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  invoices,
  customers,
  tenants,
} from "@/lib/db/schema";

interface SendReminderPayload {
  tenantId: string;
  invoiceId: string;
  reminderType: "T-7" | "T-3" | "T+0" | "T+3" | "T+7" | "T+14" | "T+30";
}

interface BatchReminderPayload {
  tenantId: string;
  reminderType: "T-7" | "T-3" | "T+0" | "T+3" | "T+7" | "T+14" | "T+30";
}

const REMINDER_MESSAGE_TEMPLATES: Record<string, { subject: string; body: string }> = {
  "T-7": {
    subject: "Upcoming Payment Reminder",
    body: "This is a friendly reminder that your invoice {invoiceNumber} for {amount} is due in 7 days.",
  },
  "T-3": {
    subject: "Payment Due Soon",
    body: "Your invoice {invoiceNumber} for {amount} is due in 3 days. Please ensure timely payment.",
  },
  "T+0": {
    subject: "Invoice Due Today",
    body: "Your invoice {invoiceNumber} for {amount} is due today. Please process payment to avoid late fees.",
  },
  "T+3": {
    subject: "Payment Overdue - Action Required",
    body: "Your invoice {invoiceNumber} for {amount} is now 3 days overdue. Please arrange payment immediately.",
  },
  "T+7": {
    subject: "Overdue Payment Notice",
    body: "Your invoice {invoiceNumber} for {amount} is 7 days overdue. Late fees may apply. Please contact us if you need assistance.",
  },
  "T+14": {
    subject: "Final Payment Notice",
    body: "Your invoice {invoiceNumber} for {amount} is 14 days overdue. This is a final notice before escalation to our collections department.",
  },
  "T+30": {
    subject: "Account in Collections",
    body: "Your account with invoice {invoiceNumber} for {amount} is 30 days overdue. Your account has been escalated to our collections team.",
  },
};

function personalizeMessage(
  template: string,
  customerName: string,
  companyName: string,
  invoiceNumber: string,
  amount: string,
): string {
  return template
    .replace("{customerName}", customerName)
    .replace("{companyName}", companyName)
    .replace("{invoiceNumber}", invoiceNumber)
    .replace("{amount}", amount);
}

export default task({
  id: "send-payment-reminder",
  maxDuration: 60,
  retry: { maxAttempts: 3 },
  run: async (payload: SendReminderPayload, { ctx }) => {
    const { tenantId, invoiceId, reminderType } = payload;

    const invoice = await db.query.invoices.findFirst({
      where: and(
        eq(invoices.tenantId, tenantId),
        eq(invoices.id, invoiceId),
      ),
    });

    if (!invoice) {
      throw new Error(`Invoice ${invoiceId} not found`);
    }

    if (invoice.status === "paid" || invoice.status === "cancelled") {
      return { sent: false, reason: "Invoice is not eligible for reminders" };
    }

    const customer = await db.query.customers.findFirst({
      where: eq(customers.id, invoice.customerId),
    });

    if (!customer) {
      throw new Error(`Customer ${invoice.customerId} not found`);
    }

    if (!customer.email) {
      return { sent: false, reason: "Customer has no email address" };
    }

    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
    });

    const template = REMINDER_MESSAGE_TEMPLATES[reminderType];
    if (!template) {
      throw new Error(`Invalid reminder type: ${reminderType}`);
    }

    const subject = personalizeMessage(
      template.subject,
      customer.name,
      tenant?.name ?? "",
      invoice.invoiceNumber,
      invoice.total,
    );

    const body = personalizeMessage(
      template.body,
      customer.name,
      tenant?.name ?? "",
      invoice.invoiceNumber,
      invoice.total,
    );

    // In production, integrate with email service (SendGrid, SES, etc.)
    // await emailService.send({ to: customer.email, subject, body });

    await db
      .update(invoices)
      .set({ updatedAt: new Date() })
      .where(eq(invoices.id, invoiceId));

    return {
      sent: true,
      reminderType,
      recipientEmail: customer.email,
      subject,
    };
  },
});

export const batchSendReminders = task({
  id: "batch-send-reminders",
  maxDuration: 300,
  retry: { maxAttempts: 2 },
  run: async (payload: BatchReminderPayload, { ctx }) => {
    const { tenantId, reminderType } = payload;
    const now = new Date();

    const daysMap: Record<string, number> = {
      "T-7": -7,
      "T-3": -3,
      "T+0": 0,
      "T+3": 3,
      "T+7": 7,
      "T+14": 14,
      "T+30": 30,
    };

    const daysOffset = daysMap[reminderType];
    if (daysOffset === undefined) {
      throw new Error(`Invalid reminder type: ${reminderType}`);
    }

    const targetDate = new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const eligibleInvoices = await db.query.invoices.findMany({
      where: and(
        eq(invoices.tenantId, tenantId),
        lte(invoices.dueDate, endOfDay),
        sql`${invoices.status} IN ('pending', 'sent', 'viewed', 'overdue')`,
      ),
    });

    const results = {
      total: eligibleInvoices.length,
      sent: 0,
      skipped: 0,
      failed: 0,
    };

    for (const invoice of eligibleInvoices) {
      try {
        const customer = await db.query.customers.findFirst({
          where: eq(customers.id, invoice.customerId),
        });

        if (!customer?.email) {
          results.skipped++;
          continue;
        }

        const template = REMINDER_MESSAGE_TEMPLATES[reminderType];
        const subject = personalizeMessage(
          template.subject,
          customer.name,
          "",
          invoice.invoiceNumber,
          invoice.total,
        );

        // In production, send email here
        results.sent++;
      } catch {
        results.failed++;
      }
    }

    return results;
  },
});
