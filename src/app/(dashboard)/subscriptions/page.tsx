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
  Pause,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";

const subscriptions = [
  { id: "SUB-001", customer: "Acme Corp", initials: "AC", plan: "Enterprise", price: 2500, status: "active", nextBilling: "Jul 15, 2026", usage: 82 },
  { id: "SUB-002", customer: "TechStart Inc", initials: "TI", plan: "Pro", price: 990, status: "active", nextBilling: "Jul 10, 2026", usage: 65 },
  { id: "SUB-003", customer: "Global Solutions", initials: "GS", plan: "Basic", price: 290, status: "paused", nextBilling: "N/A", usage: 30 },
  { id: "SUB-004", customer: "Digital Ventures", initials: "DV", plan: "Enterprise", price: 5000, status: "active", nextBilling: "Aug 1, 2026", usage: 91 },
  { id: "SUB-005", customer: "Innovate Labs", initials: "IL", plan: "Pro", price: 490, status: "active", nextBilling: "Jul 22, 2026", usage: 48 },
  { id: "SUB-006", customer: "CloudNine Ltd", initials: "CN", plan: "Starter", price: 190, status: "cancelled", nextBilling: "N/A", usage: 0 },
  { id: "SUB-007", customer: "Pinnacle Corp", initials: "PC", plan: "Pro", price: 990, status: "active", nextBilling: "Jul 28, 2026", usage: 74 },
  { id: "SUB-008", customer: "DataFlow Systems", initials: "DS", plan: "Enterprise", price: 2500, status: "active", nextBilling: "Jul 18, 2026", usage: 88 },
];

const statusStyles: Record<string, { gradient: string; text: string; icon: typeof CheckCircle2; bg: string }> = {
  active: {
    gradient: "from-emerald-400 to-green-600",
    text: "text-emerald-700",
    icon: CheckCircle2,
    bg: "bg-emerald-50 border-emerald-200",
  },
  paused: {
    gradient: "from-amber-400 to-orange-500",
    text: "text-amber-700",
    icon: Pause,
    bg: "bg-amber-50 border-amber-200",
  },
  cancelled: {
    gradient: "from-red-400 to-rose-600",
    text: "text-red-700",
    icon: XCircle,
    bg: "bg-red-50 border-red-200",
  },
};

const avatarGradients = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-rose-500 to-pink-500",
  "from-amber-500 to-orange-500",
  "from-indigo-500 to-blue-500",
  "from-fuchsia-500 to-pink-500",
  "from-cyan-500 to-blue-500",
];

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
  const mrr = subscriptions.filter((s) => s.status === "active").reduce((sum, s) => sum + s.price, 0);
  const churned = subscriptions.filter((s) => s.status === "cancelled").length;
  const churnRate = ((churned / subscriptions.length) * 100).toFixed(1);
  const avgRevenue = Math.round(mrr / activeCount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent">
            Subscriptions
          </h1>
          <p className="text-slate-500 mt-2 text-sm">Manage recurring subscriptions, billing cycles, and revenue metrics.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:scale-[1.02] transition-all duration-200">
          <Plus className="h-4 w-4" />
          New Subscription
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="group relative rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:shadow-purple-100 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Active Subscriptions</p>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-purple-200">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="relative mt-4 text-3xl font-extrabold tracking-tight text-slate-900">{activeCount}</p>
          <p className="relative mt-1 text-xs text-emerald-600 font-semibold">+2 this month</p>
        </div>

        <div className="group relative rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:shadow-green-100 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">MRR</p>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-green-200">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="relative mt-4 text-3xl font-extrabold tracking-tight text-slate-900">{formatMoney(mrr)}</p>
          <div className="relative mt-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3 text-emerald-600" />
            <span className="text-xs text-emerald-600 font-semibold">+5.7% from last month</span>
          </div>
        </div>

        <div className="group relative rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:shadow-red-100 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-rose-50 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Churn Rate</p>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-200">
              <TrendingDown className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="relative mt-4 text-3xl font-extrabold tracking-tight text-slate-900">{churnRate}%</p>
          <p className="relative mt-1 text-xs text-red-500 font-semibold">{churned} cancelled</p>
        </div>

        <div className="group relative rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:shadow-blue-100 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Average Revenue</p>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-200">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="relative mt-4 text-3xl font-extrabold tracking-tight text-slate-900">{formatMoney(avgRevenue)}</p>
          <p className="relative mt-1 text-xs text-blue-600 font-semibold">per active sub</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition-all"
            />
          </div>
          <div className="flex gap-1.5">
            {["all", "active", "paused", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 ${
                  statusFilter === s
                    ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md shadow-purple-200"
                    : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                {s === "all" ? "All" : s.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {filtered.map((sub, index) => {
          const st = statusStyles[sub.status];
          const StatusIcon = st.icon;
          const avatarGradient = avatarGradients[index % avatarGradients.length];
          return (
            <div
              key={sub.id}
              className="group relative rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:shadow-xl hover:shadow-purple-100/50 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradient} shadow-lg`}>
                    <span className="text-sm font-bold text-white">{sub.initials}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{sub.customer}</p>
                    <p className="text-xs text-slate-400 font-mono">{sub.id}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Plan</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-slate-900">{sub.plan}</span>
                  <span className="text-sm font-semibold text-slate-500">{formatMoney(sub.price)}/mo</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${st.text} ${st.bg}`}>
                  <StatusIcon className="h-3 w-3" />
                  {sub.status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Next Billing</p>
                <p className="text-sm text-slate-600 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {sub.nextBilling}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Usage</p>
                  <span className="text-xs font-bold text-slate-600">{sub.usage}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${
                      sub.usage > 80 ? "from-violet-500 to-purple-500" : sub.usage > 50 ? "from-blue-500 to-cyan-500" : "from-emerald-500 to-green-500"
                    }`}
                    style={{ width: `${sub.usage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 rounded-2xl bg-white border border-slate-200">
          <Calendar className="h-14 w-14 text-slate-200 mx-auto mb-4" />
          <p className="text-lg font-semibold text-slate-500">No subscriptions found</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
