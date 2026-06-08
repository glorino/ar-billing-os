"use client";

import { useState, useMemo } from "react";
import {
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Search,
  Plus,
  Download,
  Users,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";

const subscriptions = [
  { id: "SUB-2024-001", customer: "Acme Corp", plan: "Enterprise", amount: 2500, cycle: "monthly", status: "active", nextBilling: "Feb 15, 2024", since: "Jan 2022" },
  { id: "SUB-2024-002", customer: "TechStart Inc", plan: "Pro", amount: 990, cycle: "monthly", status: "active", nextBilling: "Feb 10, 2024", since: "Mar 2023" },
  { id: "SUB-2024-003", customer: "Global Solutions", plan: "Basic", amount: 290, cycle: "monthly", status: "past_due", nextBilling: "Jan 20, 2024", since: "Jun 2021" },
  { id: "SUB-2024-004", customer: "Digital Ventures", plan: "Enterprise", amount: 5000, cycle: "annual", status: "active", nextBilling: "Jan 1, 2025", since: "Sep 2023" },
  { id: "SUB-2024-005", customer: "Innovate Labs", plan: "Pro", amount: 490, cycle: "monthly", status: "trialing", nextBilling: "Feb 1, 2024", since: "Jul 2024" },
  { id: "SUB-2024-006", customer: "CloudNine Ltd", plan: "Starter", amount: 190, cycle: "monthly", status: "cancelled", nextBilling: "N/A", since: "Nov 2023" },
  { id: "SUB-2024-007", customer: "Pinnacle Corp", plan: "Pro", amount: 990, cycle: "monthly", status: "active", nextBilling: "Feb 5, 2024", since: "Apr 2023" },
  { id: "SUB-2024-008", customer: "DataFlow Systems", plan: "Enterprise", amount: 2500, cycle: "monthly", status: "active", nextBilling: "Feb 12, 2024", since: "Feb 2022" },
];

const statusConfig: Record<string, { bg: string; text: string; dot: string; icon: typeof CheckCircle2 }> = {
  active: { bg: "bg-success/10", text: "text-success", dot: "bg-success", icon: CheckCircle2 },
  past_due: { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive", icon: AlertCircle },
  trialing: { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning", icon: RefreshCw },
  cancelled: { bg: "bg-muted", text: "text-muted-foreground", dot: "bg-muted-foreground", icon: XCircle },
};

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);
}

export default function SubscriptionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return subscriptions.filter((s) => {
      const matchesSearch =
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.customer.toLowerCase().includes(search.toLowerCase()) ||
        s.plan.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const activeCount = subscriptions.filter((s) => s.status === "active").length;
  const mrr = subscriptions
    .filter((s) => s.status === "active" && s.cycle === "monthly")
    .reduce((sum, s) => sum + s.amount, 0);
  const annualSubs = subscriptions
    .filter((s) => s.status === "active" && s.cycle === "annual")
    .reduce((sum, s) => sum + s.amount, 0);
  const arr = mrr * 12 + annualSubs;

  const churned = subscriptions.filter((s) => s.status === "cancelled").length;
  const churnRate = ((churned / subscriptions.length) * 100).toFixed(1);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage recurring subscriptions, billing cycles, and metrics.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          New Subscription
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5 card-elevated-hover cursor-default">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Active Subscriptions</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
              <CheckCircle2 className="h-4 w-4 text-success" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight font-mono-nums">{activeCount}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 card-elevated-hover cursor-default">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">MRR</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight font-mono-nums">{formatMoney(mrr)}</p>
          <div className="mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-success" />
            <span className="text-xs text-success font-medium">+5.7% from last month</span>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 card-elevated-hover cursor-default">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">ARR</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight font-mono-nums">{formatMoney(arr)}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 card-elevated-hover cursor-default">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Churn Rate</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
              <XCircle className="h-4 w-4 text-destructive" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight font-mono-nums">{churnRate}%</p>
          <p className="mt-1 text-xs text-muted-foreground">{churned} cancelled</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border bg-card pl-9 pr-4 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
            />
          </div>
          <div className="flex gap-1.5">
            {["all", "active", "past_due", "trialing", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-primary/10 text-primary"
                    : "bg-card border text-muted-foreground hover:bg-muted"
                }`}
              >
                {s === "all" ? "All" : s.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Subscriptions Table */}
      <div className="rounded-xl border bg-card card-elevated overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/30">
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Subscription</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Customer</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Plan</th>
              <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Cycle</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Next Billing</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Since</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((sub) => {
              const s = statusConfig[sub.status];
              const StatusIcon = s.icon;
              return (
                <tr key={sub.id} className="border-t border-border table-row-hover">
                  <td className="px-6 py-3.5">
                    <span className="text-sm font-medium text-primary">{sub.id}</span>
                  </td>
                  <td className="px-6 py-3.5 text-sm font-medium">{sub.customer}</td>
                  <td className="px-6 py-3.5 text-sm text-muted-foreground">{sub.plan}</td>
                  <td className="px-6 py-3.5 text-right text-sm font-semibold font-mono-nums">{formatMoney(sub.amount)}</td>
                  <td className="px-6 py-3.5 text-sm text-muted-foreground capitalize">{sub.cycle}</td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.bg} ${s.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                      {sub.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-muted-foreground">{sub.nextBilling}</td>
                  <td className="px-6 py-3.5 text-sm text-muted-foreground">{sub.since}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No subscriptions found</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
