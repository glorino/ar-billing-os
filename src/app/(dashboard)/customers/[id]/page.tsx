"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Globe,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  TrendingUp,
  CreditCard,
  Download,
  Send,
  MoreHorizontal,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const customer = {
  id: "1",
  name: "Acme Corp",
  email: "billing@acmecorp.com",
  phone: "+1 (555) 123-4567",
  website: "acmecorp.com",
  since: "January 2022",
  address: "123 Business Ave, Suite 100, San Francisco, CA 94105",
  contact: "James Wilson",
  totalSpent: 124500,
  outstanding: 12500,
  invoiceCount: 24,
  avgDaysToPay: 22,
};

const invoices = [
  { id: "INV-2024-001", amount: 19980, status: "pending", date: "Jan 15, 2024", dueDate: "Feb 14, 2024" },
  { id: "INV-2024-008", amount: 8400, status: "paid", date: "Jan 10, 2024", dueDate: "Feb 9, 2024" },
  { id: "INV-2023-047", amount: 15200, status: "paid", date: "Dec 15, 2023", dueDate: "Jan 14, 2024" },
  { id: "INV-2023-042", amount: 9800, status: "paid", date: "Nov 20, 2023", dueDate: "Dec 20, 2023" },
  { id: "INV-2023-038", amount: 22100, status: "paid", date: "Oct 15, 2023", dueDate: "Nov 14, 2023" },
  { id: "INV-2023-033", amount: 6500, status: "paid", date: "Sep 10, 2023", dueDate: "Oct 10, 2023" },
];

const payments = [
  { id: 1, date: "Jan 20, 2024", amount: 5000, method: "Credit Card", invoice: "INV-2024-001" },
  { id: 2, date: "Jan 25, 2024", amount: 5000, method: "ACH Transfer", invoice: "INV-2024-001" },
  { id: 3, date: "Jan 12, 2024", amount: 8400, method: "Wire Transfer", invoice: "INV-2024-008" },
  { id: 4, date: "Dec 18, 2023", amount: 15200, method: "Credit Card", invoice: "INV-2023-047" },
  { id: 5, date: "Nov 22, 2023", amount: 9800, method: "ACH Transfer", invoice: "INV-2023-042" },
];

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  paid: { bg: "bg-success/10", text: "text-success", dot: "bg-success" },
  pending: { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning" },
  overdue: { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive" },
  draft: { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground" },
};

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(amount);
}

export default function CustomerDetailPage() {
  const [activeTab, setActiveTab] = useState<"invoices" | "payments" | "details">("invoices");

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Back link */}
      <Link
        href="/customers"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Customers
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
            AC
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{customer.name}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="h-3.5 w-3.5" />
                {customer.email}
              </span>
              <span className="text-border">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Since {customer.since}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
            <Mail className="h-4 w-4" />
            Email
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
            <Send className="h-4 w-4" />
            New Invoice
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5 card-elevated">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
              <DollarSign className="h-4 w-4 text-success" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight font-mono-nums">{formatMoney(customer.totalSpent)}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 card-elevated">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Outstanding</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10">
              <Clock className="h-4 w-4 text-warning" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight font-mono-nums text-warning">{formatMoney(customer.outstanding)}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 card-elevated">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Invoices</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight font-mono-nums">{customer.invoiceCount}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 card-elevated">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Avg Days to Pay</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight font-mono-nums">{customer.avgDaysToPay} days</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-xl border bg-card card-elevated">
        <div className="border-b border-border px-6">
          <nav className="flex gap-0 -mb-px">
            {(["invoices", "payments", "details"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3.5 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Invoices Tab */}
        {activeTab === "invoices" && (
          <div>
            <table className="w-full">
              <thead>
                <tr className="bg-muted/30">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Invoice</th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const s = statusConfig[inv.status];
                  return (
                    <tr key={inv.id} className="border-t border-border table-row-hover">
                      <td className="px-6 py-3.5">
                        <Link href={`/invoices/${inv.id}`} className="text-sm font-medium text-primary hover:underline">
                          {inv.id}
                        </Link>
                      </td>
                      <td className="px-6 py-3.5 text-right text-sm font-semibold font-mono-nums">{formatMoney(inv.amount)}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.bg} ${s.text}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-muted-foreground">{inv.date}</td>
                      <td className="px-6 py-3.5 text-right text-sm text-muted-foreground">{inv.dueDate}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === "payments" && (
          <div>
            <table className="w-full">
              <thead>
                <tr className="bg-muted/30">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Invoice</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Method</th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-t border-border table-row-hover">
                    <td className="px-6 py-3.5 text-sm text-muted-foreground">{p.date}</td>
                    <td className="px-6 py-3.5 text-sm">
                      <Link href={`/invoices/${p.invoice}`} className="text-primary hover:underline">
                        {p.invoice}
                      </Link>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-muted-foreground">{p.method}</td>
                    <td className="px-6 py-3.5 text-right text-sm font-semibold font-mono-nums text-success">{formatMoney(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Details Tab */}
        {activeTab === "details" && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.website}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Billing Address</h3>
                <p className="text-sm">{customer.address}</p>
              </div>
            </div>
            <div className="h-px bg-border" />
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Primary Contact</h3>
                <p className="text-sm">{customer.contact}</p>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Customer Since</h3>
                <p className="text-sm">{customer.since}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
