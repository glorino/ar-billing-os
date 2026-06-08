"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Download,
  CreditCard,
  XCircle,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Building2,
  Mail,
  Printer,
  Copy,
} from "lucide-react";

const invoice = {
  id: "INV-2024-001",
  status: "pending",
  date: "January 15, 2024",
  dueDate: "February 14, 2024",
  from: {
    name: "Acme Corp",
    address: "123 Business Ave, Suite 100",
    city: "San Francisco, CA 94105",
    email: "billing@acmecorp.com",
  },
  to: {
    name: "TechStart Inc",
    address: "456 Innovation Blvd",
    city: "Austin, TX 73301",
    email: "accounts@techstart.io",
  },
  items: [
    { description: "Enterprise SaaS License (Annual)", qty: 1, rate: 12000, amount: 12000 },
    { description: "Premium Support Package", qty: 12, rate: 250, amount: 3000 },
    { description: "Onboarding & Training", qty: 1, rate: 1500, amount: 1500 },
    { description: "API Integration Setup", qty: 1, rate: 2000, amount: 2000 },
  ],
  subtotal: 18500,
  tax: 1480,
  discount: 0,
  total: 19980,
  notes: "Thank you for your business. Payment is due within 30 days.",
  terms: "Late payments are subject to a 1.5% monthly interest charge.",
};

const payments = [
  { id: 1, date: "Jan 20, 2024", amount: 5000, method: "Credit Card", status: "completed" },
  { id: 2, date: "Jan 25, 2024", amount: 5000, method: "ACH Transfer", status: "completed" },
];

const statusConfig: Record<string, { bg: string; text: string; dot: string; icon: typeof Clock }> = {
  paid: { bg: "bg-success/10", text: "text-success", dot: "bg-success", icon: CheckCircle2 },
  pending: { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning", icon: Clock },
  overdue: { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive", icon: AlertCircle },
  draft: { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground", icon: FileText },
};

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(amount);
}

export default function InvoiceDetailPage() {
  const [showActions, setShowActions] = useState(false);
  const status = statusConfig[invoice.status];
  const StatusIcon = status.icon;
  const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const amountDue = invoice.total - amountPaid;

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Back link */}
      <Link
        href="/invoices"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Invoices
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{invoice.id}</h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.bg} ${status.text}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
              {invoice.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Created on {invoice.date} · Due {invoice.dueDate}
          </p>
        </div>
        <div className="flex items-center gap-2 relative">
          <button className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
            <Download className="h-4 w-4" />
            Download
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
            <Send className="h-4 w-4" />
            Send Invoice
          </button>
          <button
            onClick={() => setShowActions(!showActions)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border bg-card text-muted-foreground hover:bg-muted transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {showActions && (
            <div className="absolute right-0 top-12 z-10 w-48 rounded-xl border bg-card p-1.5 shadow-lg card-elevated">
              <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                Record Payment
              </button>
              <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                <Copy className="h-4 w-4 text-muted-foreground" />
                Duplicate
              </button>
              <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                <Printer className="h-4 w-4 text-muted-foreground" />
                Print
              </button>
              <div className="my-1 h-px bg-border" />
              <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors">
                <XCircle className="h-4 w-4" />
                Void Invoice
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Invoice Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* From / To */}
          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-xl border bg-card p-5 card-elevated">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">From</p>
              <div className="space-y-1">
                <p className="text-sm font-semibold">{invoice.from.name}</p>
                <p className="text-sm text-muted-foreground">{invoice.from.address}</p>
                <p className="text-sm text-muted-foreground">{invoice.from.city}</p>
                <p className="text-sm text-muted-foreground">{invoice.from.email}</p>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-5 card-elevated">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Bill To</p>
              <div className="space-y-1">
                <p className="text-sm font-semibold">{invoice.to.name}</p>
                <p className="text-sm text-muted-foreground">{invoice.to.address}</p>
                <p className="text-sm text-muted-foreground">{invoice.to.city}</p>
                <p className="text-sm text-muted-foreground">{invoice.to.email}</p>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="rounded-xl border bg-card card-elevated overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/30">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Description
                  </th>
                  <th className="px-6 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-20">
                    Qty
                  </th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-28">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-28">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, i) => (
                  <tr key={i} className="border-t border-border table-row-hover">
                    <td className="px-6 py-4 text-sm font-medium">{item.description}</td>
                    <td className="px-6 py-4 text-sm text-center text-muted-foreground">{item.qty}</td>
                    <td className="px-6 py-4 text-sm text-right font-mono-nums text-muted-foreground">{formatMoney(item.rate)}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold font-mono-nums">{formatMoney(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="border-t border-border bg-muted/20 px-6 py-4">
              <div className="ml-auto w-64 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono-nums">{formatMoney(invoice.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span className="font-mono-nums">{formatMoney(invoice.tax)}</span>
                </div>
                {invoice.discount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-mono-nums text-destructive">-{formatMoney(invoice.discount)}</span>
                  </div>
                )}
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Total Due</span>
                  <span className="text-xl font-bold font-mono-nums">{formatMoney(invoice.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {(invoice.notes || invoice.terms) && (
            <div className="rounded-xl border bg-card p-5 card-elevated space-y-3">
              {invoice.notes && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Terms</p>
                  <p className="text-sm text-muted-foreground">{invoice.terms}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Status */}
          <div className="rounded-xl border bg-card p-5 card-elevated space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Payment Status</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold font-mono-nums">{formatMoney(invoice.total)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Paid</span>
                <span className="font-semibold font-mono-nums text-success">{formatMoney(amountPaid)}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Due</span>
                <span className="text-lg font-bold font-mono-nums">{formatMoney(amountDue)}</span>
              </div>
            </div>
            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>Payment progress</span>
                <span>{Math.round((amountPaid / invoice.total) * 100)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-success transition-all duration-500"
                  style={{ width: `${(amountPaid / invoice.total) * 100}%` }}
                />
              </div>
            </div>
            <button className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
              <CreditCard className="h-4 w-4" />
              Record Payment
            </button>
          </div>

          {/* Payment History */}
          <div className="rounded-xl border bg-card p-5 card-elevated space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Payment History</p>
            {payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{formatMoney(payment.amount)}</p>
                      <p className="text-xs text-muted-foreground">{payment.method} · {payment.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No payments recorded yet</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border bg-card p-5 card-elevated space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Quick Actions</p>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Send Reminder
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
              <Download className="h-4 w-4 text-muted-foreground" />
              Download PDF
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              View Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
