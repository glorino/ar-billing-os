"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  Mail,
  Phone,
  FileText,
  DollarSign,
  Users,
  ArrowUpRight,
  Send,
  MoreHorizontal,
  Filter,
  Search,
} from "lucide-react";

const stats = [
  {
    label: "Active Cases",
    value: "7",
    change: "+2 this week",
    icon: AlertCircle,
    gradient: "from-amber-500 to-orange-500",
    shadowColor: "shadow-amber-500/20",
  },
  {
    label: "Total At Risk",
    value: "$42,180",
    change: "15% of outstanding",
    icon: DollarSign,
    gradient: "from-red-500 to-rose-500",
    shadowColor: "shadow-red-500/20",
  },
  {
    label: "Resolved",
    value: "12",
    change: "+3 from last month",
    icon: CheckCircle2,
    gradient: "from-emerald-500 to-green-500",
    shadowColor: "shadow-emerald-500/20",
  },
];

const cases = [
  { id: "COL-001", customer: "Global Solutions", email: "pay@globalsolutions.com", amount: 23100, daysOverdue: 45, status: "escalated", assignedTo: "Sarah Johnson", lastAction: "Final demand letter sent", lastActionDate: "Jan 15, 2024" },
  { id: "COL-002", customer: "DataFlow Systems", email: "billing@dataflow.io", amount: 9350, daysOverdue: 32, status: "in_progress", assignedTo: "John Smith", lastAction: "Phone call completed", lastActionDate: "Jan 18, 2024" },
  { id: "COL-003", customer: "CloudNine Ltd", email: "ap@cloudnine.dev", amount: 4200, daysOverdue: 21, status: "in_progress", assignedTo: "Mike Williams", lastAction: "Email reminder sent", lastActionDate: "Jan 20, 2024" },
  { id: "COL-004", customer: "Pinnacle Corp", email: "finance@pinnacle.com", amount: 3530, daysOverdue: 18, status: "new", assignedTo: "Unassigned", lastAction: "Case created", lastActionDate: "Jan 22, 2024" },
  { id: "COL-005", customer: "TechStart Inc", email: "accounts@techstart.io", amount: 1800, daysOverdue: 14, status: "in_progress", assignedTo: "Sarah Johnson", lastAction: "Payment plan proposed", lastActionDate: "Jan 19, 2024" },
  { id: "COL-006", customer: "Digital Ventures", email: "finance@digitalventures.co", amount: 1200, daysOverdue: 10, status: "new", assignedTo: "Unassigned", lastAction: "Case created", lastActionDate: "Jan 22, 2024" },
];

const statusConfig: Record<string, { gradient: string; shadow: string; label: string }> = {
  new: { gradient: "from-blue-500 to-indigo-500", shadow: "shadow-blue-500/20", label: "New" },
  in_progress: { gradient: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/20", label: "In Progress" },
  escalated: { gradient: "from-red-500 to-rose-500", shadow: "shadow-red-500/20", label: "Escalated" },
  resolved: { gradient: "from-emerald-500 to-green-500", shadow: "shadow-emerald-500/20", label: "Resolved" },
};

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);
}

function getDaysSeverity(days: number) {
  if (days > 30) return { gradient: "from-red-500 to-rose-500", shadow: "shadow-red-500/20" };
  if (days > 14) return { gradient: "from-amber-500 to-orange-500", shadow: "shadow-amber-500/20" };
  return { gradient: "from-slate-400 to-gray-500", shadow: "shadow-slate-400/20" };
}

export default function CollectionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = cases.filter((c) => {
    const matchesSearch =
      c.customer.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
            Collections
          </span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage overdue invoices and track collection activities.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`relative overflow-hidden rounded-2xl border bg-card p-6 shadow-lg ${stat.shadowColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-default group`}
          >
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-10 blur-2xl group-hover:opacity-20 transition-opacity" />
            <div className="flex items-center justify-between relative z-10">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.shadowColor}`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </div>
            <p className="mt-4 text-3xl font-extrabold tracking-tight font-mono-nums relative z-10">{stat.value}</p>
            <p className="mt-1.5 text-xs text-muted-foreground font-medium relative z-10">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search cases..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-xl border bg-card pl-9 pr-4 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/40 transition-all"
            />
          </div>
          <div className="flex gap-1.5">
            {["all", "new", "in_progress", "escalated"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
                  statusFilter === s
                    ? "bg-gradient-to-r from-violet-600 to-blue-500 text-white shadow-lg shadow-violet-500/25"
                    : "bg-card border text-muted-foreground hover:bg-muted"
                }`}
              >
                {s === "all" ? "All" : s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-card shadow-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50">
              <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Case</th>
              <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Customer</th>
              <th className="px-6 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Amount</th>
              <th className="px-6 py-3.5 text-center text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Days Overdue</th>
              <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Assigned To</th>
              <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Last Action</th>
              <th className="px-6 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const s = statusConfig[c.status];
              const days = getDaysSeverity(c.daysOverdue);
              return (
                <tr key={c.id} className="border-t border-border hover:bg-gradient-to-r hover:from-violet-50/50 hover:via-blue-50/50 hover:to-cyan-50/50 dark:hover:from-violet-950/20 dark:hover:via-blue-950/20 dark:hover:to-cyan-950/20 transition-colors duration-200">
                  <td className="px-6 py-3.5">
                    <span className="text-sm font-bold text-primary">{c.id}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <div>
                      <p className="text-sm font-semibold">{c.customer}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-right text-sm font-bold font-mono-nums">
                    <span className="bg-gradient-to-r from-red-600 to-rose-500 bg-clip-text text-transparent">
                      {formatMoney(c.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-gradient-to-r ${days.gradient} text-white shadow-md ${days.shadow}`}>
                      {c.daysOverdue}d
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white bg-gradient-to-r ${s.gradient} shadow-md ${s.shadow}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                      {s.label}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-muted-foreground font-medium">{c.assignedTo}</td>
                  <td className="px-6 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.lastAction}</p>
                      <p className="text-xs text-muted-foreground">{c.lastActionDate}</p>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-gradient-to-br hover:from-blue-500 hover:to-indigo-500 hover:text-white hover:shadow-md hover:shadow-blue-500/20 transition-all duration-200" title="Send Email">
                        <Mail className="h-4 w-4" />
                      </button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-gradient-to-br hover:from-emerald-500 hover:to-green-500 hover:text-white hover:shadow-md hover:shadow-emerald-500/20 transition-all duration-200" title="Call">
                        <Phone className="h-4 w-4" />
                      </button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-gradient-to-br hover:from-violet-500 hover:to-purple-500 hover:text-white hover:shadow-md hover:shadow-violet-500/20 transition-all duration-200" title="More">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 mb-4">
              <CheckCircle2 className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground">No collection cases found</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
