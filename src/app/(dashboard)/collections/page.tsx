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
  { label: "Active Cases", value: "7", change: "+2 this week", icon: AlertCircle, color: "text-warning", bgColor: "bg-warning/10" },
  { label: "Total At Risk", value: "$42,180", change: "15% of outstanding", icon: DollarSign, color: "text-destructive", bgColor: "bg-destructive/10" },
  { label: "Resolved This Month", value: "12", change: "+3 from last month", icon: CheckCircle2, color: "text-success", bgColor: "bg-success/10" },
];

const cases = [
  { id: "COL-001", customer: "Global Solutions", email: "pay@globalsolutions.com", amount: 23100, daysOverdue: 45, status: "escalated", assignedTo: "Sarah Johnson", lastAction: "Final demand letter sent", lastActionDate: "Jan 15, 2024" },
  { id: "COL-002", customer: "DataFlow Systems", email: "billing@dataflow.io", amount: 9350, daysOverdue: 32, status: "in_progress", assignedTo: "John Smith", lastAction: "Phone call completed", lastActionDate: "Jan 18, 2024" },
  { id: "COL-003", customer: "CloudNine Ltd", email: "ap@cloudnine.dev", amount: 4200, daysOverdue: 21, status: "in_progress", assignedTo: "Mike Williams", lastAction: "Email reminder sent", lastActionDate: "Jan 20, 2024" },
  { id: "COL-004", customer: "Pinnacle Corp", email: "finance@pinnacle.com", amount: 3530, daysOverdue: 18, status: "new", assignedTo: "Unassigned", lastAction: "Case created", lastActionDate: "Jan 22, 2024" },
  { id: "COL-005", customer: "TechStart Inc", email: "accounts@techstart.io", amount: 1800, daysOverdue: 14, status: "in_progress", assignedTo: "Sarah Johnson", lastAction: "Payment plan proposed", lastActionDate: "Jan 19, 2024" },
  { id: "COL-006", customer: "Digital Ventures", email: "finance@digitalventures.co", amount: 1200, daysOverdue: 10, status: "new", assignedTo: "Unassigned", lastAction: "Case created", lastActionDate: "Jan 22, 2024" },
];

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  new: { bg: "bg-primary/10", text: "text-primary", dot: "bg-primary", label: "New" },
  in_progress: { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning", label: "In Progress" },
  escalated: { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive", label: "Escalated" },
  resolved: { bg: "bg-success/10", text: "text-success", dot: "bg-success", label: "Resolved" },
};

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Collections</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage overdue invoices and track collection activities.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-5 card-elevated-hover cursor-default">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight font-mono-nums">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search cases..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border bg-card pl-9 pr-4 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
            />
          </div>
          <div className="flex gap-1.5">
            {["all", "new", "in_progress", "escalated"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-primary/10 text-primary"
                    : "bg-card border text-muted-foreground hover:bg-muted"
                }`}
              >
                {s === "all" ? "All" : s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="rounded-xl border bg-card card-elevated overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/30">
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Case</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Customer</th>
              <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
              <th className="px-6 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Days Overdue</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Assigned To</th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Last Action</th>
              <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const s = statusConfig[c.status];
              return (
                <tr key={c.id} className="border-t border-border table-row-hover">
                  <td className="px-6 py-3.5">
                    <span className="text-sm font-medium text-primary">{c.id}</span>
                  </td>
                  <td className="px-6 py-3.5">
                    <div>
                      <p className="text-sm font-medium">{c.customer}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-right text-sm font-semibold font-mono-nums text-destructive">
                    {formatMoney(c.amount)}
                  </td>
                  <td className="px-6 py-3.5 text-center">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      c.daysOverdue > 30 ? "bg-destructive/10 text-destructive" : c.daysOverdue > 14 ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"
                    }`}>
                      {c.daysOverdue}d
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.bg} ${s.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-muted-foreground">{c.assignedTo}</td>
                  <td className="px-6 py-3.5">
                    <div>
                      <p className="text-sm text-foreground">{c.lastAction}</p>
                      <p className="text-xs text-muted-foreground">{c.lastActionDate}</p>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors" title="Send Email">
                        <Mail className="h-4 w-4" />
                      </button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors" title="Call">
                        <Phone className="h-4 w-4" />
                      </button>
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors" title="More">
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
          <div className="text-center py-12">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No collection cases found</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
