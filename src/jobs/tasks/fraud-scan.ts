import { task } from "@trigger.dev/sdk";
import { eq, and, sql, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  payments,
  customers,
  auditLogs,
} from "@/lib/db/schema";

interface ScanTransactionsPayload {
  tenantId: string;
  lookbackHours?: number;
}

interface ScanCustomerPayload {
  tenantId: string;
  customerId: string;
}

interface FraudAlert {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  paymentId?: string;
  metadata: Record<string, unknown>;
}

function detectVelocityAnomaly(
  recentPayments: Array<{ amount: string; createdAt: Date }>,
  windowMs: number,
): FraudAlert[] {
  const alerts: FraudAlert[] = [];
  const now = Date.now();

  // Check for rapid-fire transactions (more than 5 in 10 minutes)
  const tenMinWindow = recentPayments.filter(
    (p) => now - new Date(p.createdAt).getTime() < 10 * 60 * 1000,
  );
  if (tenMinWindow.length > 5) {
    alerts.push({
      type: "velocity_rapid_fire",
      severity: "high",
      description: `${tenMinWindow.length} transactions in the last 10 minutes`,
      metadata: { count: tenMinWindow.length, window: "10m" },
    });
  }

  // Check for unusual amounts (more than 3x average)
  if (recentPayments.length >= 3) {
    const avg =
      recentPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0) /
      recentPayments.length;

    for (const payment of recentPayments) {
      const amount = parseFloat(payment.amount);
      if (amount > avg * 3 && amount > 100) {
        alerts.push({
          type: "velocity_high_amount",
          severity: "medium",
          description: `Transaction amount ${amount} is ${Math.round(amount / avg)}x above average`,
          metadata: { amount, average: avg, multiplier: amount / avg },
        });
      }
    }
  }

  return alerts;
}

function detectAnomalyPatterns(
  payments: Array<{
    id: string;
    amount: string;
    paymentMethod: string;
    referenceNumber: string | null;
    createdAt: Date;
  }>,
): FraudAlert[] {
  const alerts: FraudAlert[] = [];

  // Check for same amount repeated multiple times
  const amountCounts: Record<string, number> = {};
  for (const p of payments) {
    amountCounts[p.amount] = (amountCounts[p.amount] ?? 0) + 1;
  }
  for (const [amount, count] of Object.entries(amountCounts)) {
    if (count >= 4) {
      alerts.push({
        type: "anomaly_repeated_amount",
        severity: "medium",
        description: `Amount ${amount} appears ${count} times in recent transactions`,
        metadata: { amount, count },
      });
    }
  }

  // Check for duplicate reference numbers
  const refCounts: Record<string, number> = {};
  for (const p of payments) {
    if (p.referenceNumber) {
      refCounts[p.referenceNumber] = (refCounts[p.referenceNumber] ?? 0) + 1;
    }
  }
  for (const [ref, count] of Object.entries(refCounts)) {
    if (count > 1) {
      alerts.push({
        type: "anomaly_duplicate_reference",
        severity: "high",
        description: `Reference number ${ref} used ${count} times`,
        metadata: { referenceNumber: ref, count },
      });
    }
  }

  // Check for transactions outside business hours (weekends, midnight-5am)
  for (const p of payments) {
    const date = new Date(p.createdAt);
    const day = date.getDay();
    const hour = date.getHours();

    if (day === 0 || day === 6) {
      alerts.push({
        type: "anomaly_weekend_transaction",
        severity: "low",
        description: `Transaction on weekend: ${date.toISOString()}`,
        metadata: { transactionId: p.id, dayOfWeek: day },
      });
    }

    if (hour >= 0 && hour < 5) {
      alerts.push({
        type: "anomaly_off_hours",
        severity: "low",
        description: `Transaction during off-hours: ${date.toISOString()}`,
        metadata: { transactionId: p.id, hour },
      });
    }
  }

  return alerts;
}

export default task({
  id: "scan-transactions-for-fraud",
  maxDuration: 300,
  retry: { maxAttempts: 3 },
  run: async (payload: ScanTransactionsPayload, { ctx }) => {
    const { tenantId, lookbackHours = 24 } = payload;

    const lookbackDate = new Date(
      Date.now() - lookbackHours * 60 * 60 * 1000,
    );

    const recentPayments = await db.query.payments.findMany({
      where: and(
        eq(payments.tenantId, tenantId),
        eq(payments.status, "completed"),
        gte(payments.createdAt, lookbackDate),
      ),
      orderBy: (payments, { desc }) => [desc(payments.createdAt)],
    });

    const allAlerts: FraudAlert[] = [];

    // Velocity checks
    const velocityAlerts = detectVelocityAnomaly(
      recentPayments.map((p) => ({
        amount: p.amount,
        createdAt: p.createdAt,
      })),
      lookbackHours * 60 * 60 * 1000,
    );
    allAlerts.push(...velocityAlerts);

    // Anomaly detection
    const anomalyAlerts = detectAnomalyPatterns(
      recentPayments.map((p) => ({
        id: p.id,
        amount: p.amount,
        paymentMethod: p.paymentMethod,
        referenceNumber: p.referenceNumber,
        createdAt: p.createdAt,
      })),
    );
    allAlerts.push(...anomalyAlerts);

    // Log alerts to audit table
    for (const alert of allAlerts) {
      if (alert.severity === "high" || alert.severity === "critical") {
        await db.insert(auditLogs).values({
          tenantId,
          action: "fraud_alert",
          resourceType: "payment",
          resourceId: alert.paymentId ?? "batch_scan",
          metadata: {
            alertType: alert.type,
            severity: alert.severity,
            description: alert.description,
            alertMetadata: alert.metadata,
          },
        });
      }
    }

    return {
      scannedCount: recentPayments.length,
      lookbackHours,
      alertCount: allAlerts.length,
      alerts: allAlerts,
      summary: {
        critical: allAlerts.filter((a) => a.severity === "critical").length,
        high: allAlerts.filter((a) => a.severity === "high").length,
        medium: allAlerts.filter((a) => a.severity === "medium").length,
        low: allAlerts.filter((a) => a.severity === "low").length,
      },
    };
  },
});

export const scanCustomerTransactions = task({
  id: "scan-customer-transactions",
  maxDuration: 120,
  retry: { maxAttempts: 3 },
  run: async (payload: ScanCustomerPayload, { ctx }) => {
    const { tenantId, customerId } = payload;

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const customerPayments = await db.query.payments.findMany({
      where: and(
        eq(payments.tenantId, tenantId),
        eq(payments.customerId, customerId),
        gte(payments.createdAt, thirtyDaysAgo),
      ),
      orderBy: (payments, { desc }) => [desc(payments.createdAt)],
    });

    const customer = await db.query.customers.findFirst({
      where: eq(customers.id, customerId),
    });

    const alerts: FraudAlert[] = [];

    // Check for high failure rate
    const failedCount = customerPayments.filter(
      (p) => p.status === "failed",
    ).length;
    const failureRate =
      customerPayments.length > 0 ? failedCount / customerPayments.length : 0;

    if (failureRate > 0.4 && customerPayments.length >= 3) {
      alerts.push({
        type: "customer_high_failure_rate",
        severity: "high",
        description: `Customer has ${Math.round(failureRate * 100)}% payment failure rate`,
        metadata: { failureRate, totalPayments: customerPayments.length, failedCount },
      });
    }

    // Check for rapid spending increase
    if (customerPayments.length >= 5) {
      const recentTotal = customerPayments
        .slice(0, Math.floor(customerPayments.length / 2))
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const olderTotal = customerPayments
        .slice(Math.floor(customerPayments.length / 2))
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

      if (olderTotal > 0 && recentTotal > olderTotal * 2.5) {
        alerts.push({
          type: "customer_spending_spike",
          severity: "medium",
          description: `Customer spending increased by ${Math.round((recentTotal / olderTotal - 1) * 100)}%`,
          metadata: {
            recentTotal,
            olderTotal,
            multiplier: recentTotal / olderTotal,
          },
        });
      }
    }

    return {
      customerId,
      customerName: customer?.name,
      totalPayments30d: customerPayments.length,
      alertCount: alerts.length,
      alerts,
    };
  },
});
