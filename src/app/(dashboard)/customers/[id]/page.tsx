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
  Receipt,
  Wallet,
  Activity,
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

const activityTimeline = [
  { id: 1, date: "Jan 25, 2024", event: "Payment of $5,000 received via ACH Transfer", color: "from-emerald-400 to-teal-500", dotColor: "bg-emerald-500" },
  { id: 2, date: "Jan 20, 2024", event: "Payment of $5,000 received via Credit Card", color: "from-blue-400 to-indigo-500", dotColor: "bg-blue-500" },
  { id: 3, date: "Jan 15, 2024", event: "Invoice INV-2024-001 sent for $19,980", color: "from-violet-400 to-purple-500", dotColor: "bg-violet-500" },
  { id: 4, date: "Jan 12, 2024", event: "Payment of $8,400 received via Wire Transfer", color: "from-amber-400 to-orange-500", dotColor: "bg-amber-500" },
  { id: 5, date: "Jan 10, 2024", event: "Invoice INV-2024-008 marked as paid", color: "from-emerald-400 to-teal-500", dotColor: "bg-emerald-500" },
  { id: 6, date: "Dec 18, 2023", event: "Payment of $15,200 received via Credit Card", color: "from-blue-400 to-indigo-500", dotColor: "bg-blue-500" },
];

const statusConfig: Record<string, { bg: string; text: string; dot: string; gradient: string }> = {
  paid: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-500", gradient: "from-emerald-400 to-teal-500" },
  pending: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-500", gradient: "from-amber-400 to-orange-500" },
  overdue: { bg: "bg-rose-500/10", text: "text-rose-400", dot: "bg-rose-500", gradient: "from-rose-400 to-pink-500" },
  draft: { bg: "bg-slate-500/10", text: "text-slate-400", dot: "bg-slate-500", gradient: "from-slate-400 to-gray-500" },
};

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);
}

function formatMoneyFull(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(amount);
}

export default function CustomerDetailPage() {
  const [activeTab, setActiveTab] = useState<"invoices" | "payments" | "details">("invoices");

  const totalPaid = customer.totalSpent - customer.outstanding;

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

      {/* Header with gradient title */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-5">
          {/* Large avatar with gradient background */}
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 text-2xl font-bold text-white shadow-lg shadow-purple-500/25">
              AC
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 shadow-lg">
              <CheckCircle2 className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
              {customer.name}
            </h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-violet-400" />
                {customer.email}
              </span>
              <span className="text-border">·</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-purple-400" />
                Since {customer.since}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl border bg-card/80 backdrop-blur px-5 py-2.5 text-sm font-medium hover:bg-muted/80 transition-all duration-200 shadow-sm">
            <Download className="h-4 w-4 text-violet-400" />
            Export
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-200">
            <Send className="h-4 w-4" />
            Send Invoice
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all duration-200">
            <Wallet className="h-4 w-4" />
            Record Payment
          </button>
        </div>
      </div>

      {/* Customer Info Card with gradient accents */}
      <div className="rounded-2xl border bg-card/80 backdrop-blur p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20">
              <Mail className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</p>
              <p className="text-sm font-medium mt-0.5">{customer.email}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20">
              <Phone className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</p>
              <p className="text-sm font-medium mt-0.5">{customer.phone}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20">
              <Globe className="h-5 w-5 text-fuchsia-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Website</p>
              <p className="text-sm font-medium mt-0.5">{customer.website}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20">
              <FileText className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact</p>
              <p className="text-sm font-medium mt-0.5">{customer.contact}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Invoices */}
        <div className="group rounded-2xl border bg-card/80 backdrop-blur p-5 shadow-md hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-500/10 to-transparent rounded-bl-full" />
          <div className="flex items-center justify-between relative z-10">
            <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform duration-300">
              <FileText className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight font-mono-nums relative z-10">{customer.invoiceCount}</p>
          <p className="text-xs text-muted-foreground mt-1 relative z-10">Lifetime invoices</p>
        </div>

        {/* Total Paid */}
        <div className="group rounded-2xl border bg-card/80 backdrop-blur p-5 shadow-md hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full" />
          <div className="flex items-center justify-between relative z-10">
            <p className="text-sm font-medium text-muted-foreground">Total Paid</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight font-mono-nums text-emerald-400 relative z-10">{formatMoney(totalPaid)}</p>
          <p className="text-xs text-muted-foreground mt-1 relative z-10">Collected revenue</p>
        </div>

        {/* Outstanding */}
        <div className="group rounded-2xl border bg-card/80 backdrop-blur p-5 shadow-md hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full" />
          <div className="flex items-center justify-between relative z-10">
            <p className="text-sm font-medium text-muted-foreground">Outstanding</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform duration-300">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight font-mono-nums text-amber-400 relative z-10">{formatMoney(customer.outstanding)}</p>
          <p className="text-xs text-muted-foreground mt-1 relative z-10">Pending collection</p>
        </div>

        {/* Balance / Avg Days */}
        <div className="group rounded-2xl border bg-card/80 backdrop-blur p-5 shadow-md hover:shadow-lg hover:shadow-rose-500/10 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-rose-500/10 to-transparent rounded-bl-full" />
          <div className="flex items-center justify-between relative z-10">
            <p className="text-sm font-medium text-muted-foreground">Avg Days to Pay</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg shadow-rose-500/25 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight font-mono-nums text-rose-400 relative z-10">{customer.avgDaysToPay} days</p>
          <p className="text-xs text-muted-foreground mt-1 relative z-10">Average payment time</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabs Section */}
        <div className="lg:col-span-2 rounded-2xl border bg-card/80 backdrop-blur shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
          <div className="border-b border-border px-6 pt-2">
            <nav className="flex gap-0 -mb-px">
              {(["invoices", "payments", "details"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3.5 text-sm font-medium border-b-2 transition-all duration-200 capitalize ${
                    activeTab === tab
                      ? "border-violet-500 text-violet-400 bg-violet-500/5"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
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
                  <tr className="bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5">
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-violet-400">Invoice</th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-violet-400">Amount</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-violet-400">Status</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-violet-400">Date</th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-violet-400">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const s = statusConfig[inv.status];
                    return (
                      <tr key={inv.id} className="border-t border-border hover:bg-violet-500/5 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <Link href={`/invoices/${inv.id}`} className="text-sm font-semibold text-violet-400 hover:text-violet-300 hover:underline transition-colors">
                            {inv.id}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-bold font-mono-nums">{formatMoneyFull(inv.amount)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-gradient-to-r ${s.gradient} text-white shadow-md`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                            {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{inv.date}</td>
                        <td className="px-6 py-4 text-right text-sm text-muted-foreground">{inv.dueDate}</td>
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
                  <tr className="bg-gradient-to-r from-emerald-500/5 to-teal-500/5">
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Date</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Invoice</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Method</th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-t border-border hover:bg-emerald-500/5 transition-colors duration-200">
                      <td className="px-6 py-4 text-sm text-muted-foreground">{p.date}</td>
                      <td className="px-6 py-4 text-sm">
                        <Link href={`/invoices/${p.invoice}`} className="text-emerald-400 font-semibold hover:text-emerald-300 hover:underline transition-colors">
                          {p.invoice}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold bg-gradient-to-r from-slate-500/20 to-gray-500/20 text-slate-300">
                          {p.method}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-bold font-mono-nums">
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          +{formatMoneyFull(p.amount)}
                        </span>
                      </td>
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
                  <h3 className="text-sm font-semibold text-violet-400 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500" />
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm p-3 rounded-xl bg-violet-500/5 border border-violet-500/10">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                        <Mail className="h-4 w-4 text-violet-400" />
                      </div>
                      <span>{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20">
                        <Phone className="h-4 w-4 text-purple-400" />
                      </div>
                      <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm p-3 rounded-xl bg-fuchsia-500/5 border border-fuchsia-500/10">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20">
                        <Globe className="h-4 w-4 text-fuchsia-400" />
                      </div>
                      <span>{customer.website}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" />
                    Billing Address
                  </h3>
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-sm">
                    <p>{customer.address}</p>
                  </div>
                </div>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
                    Primary Contact
                  </h3>
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-sm">
                    <p className="font-semibold">{customer.contact}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-rose-400 to-pink-500" />
                    Customer Since
                  </h3>
                  <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 text-sm">
                    <p className="font-semibold">{customer.since}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Activity Timeline */}
        <div className="rounded-2xl border bg-card/80 backdrop-blur p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500" />
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Activity</h3>
              <p className="text-xs text-muted-foreground">Recent events</p>
            </div>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-emerald-400 via-violet-500 to-fuchsia-500 opacity-30" />

            <div className="space-y-5 relative z-10">
              {activityTimeline.map((item, index) => (
                <div key={item.id} className="flex gap-4 group">
                  {/* Colored dot */}
                  <div className="relative flex-shrink-0">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${item.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <div className="h-2.5 w-2.5 rounded-full bg-white" />
                    </div>
                  </div>
                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <p className="text-sm leading-relaxed">{item.event}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      {item.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
