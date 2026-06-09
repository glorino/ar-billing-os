"use client";

import { useState } from "react";
import {
  FileText,
  Download,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  ArrowUpRight,
  Plus,
  Filter,
  TrendingUp,
  AlertCircle,
  DollarSign,
} from "lucide-react";

const reportTypes = [
  {
    id: "pnl",
    name: "Profit & Loss",
    description: "Revenue, expenses, and net income breakdown",
    icon: TrendingUp,
    gradient: "from-violet-500 to-purple-600",
    shadow: "shadow-violet-500/25",
    bgLight: "from-violet-500/10 to-purple-500/10",
    lastGenerated: "Jan 20, 2024",
    status: "ready",
  },
  {
    id: "balance-sheet",
    name: "Balance Sheet",
    description: "Assets, liabilities, and equity position",
    icon: BarChart3,
    gradient: "from-emerald-500 to-green-600",
    shadow: "shadow-emerald-500/25",
    bgLight: "from-emerald-500/10 to-green-500/10",
    lastGenerated: "Jan 20, 2024",
    status: "ready",
  },
  {
    id: "ar-aging",
    name: "AR Aging",
    description: "Outstanding receivables by age bracket",
    icon: Clock,
    gradient: "from-amber-500 to-orange-500",
    shadow: "shadow-amber-500/25",
    bgLight: "from-amber-500/10 to-orange-500/10",
    lastGenerated: "Jan 19, 2024",
    status: "ready",
  },
  {
    id: "cash-flow",
    name: "Cash Flow",
    description: "Cash inflows and outflows forecast",
    icon: PieChart,
    gradient: "from-blue-500 to-cyan-500",
    shadow: "shadow-blue-500/25",
    bgLight: "from-blue-500/10 to-cyan-500/10",
    lastGenerated: null,
    status: "pending",
  },
  {
    id: "revenue",
    name: "Revenue Report",
    description: "Revenue breakdown by customer and service",
    icon: FileText,
    gradient: "from-pink-500 to-rose-500",
    shadow: "shadow-pink-500/25",
    bgLight: "from-pink-500/10 to-rose-500/10",
    lastGenerated: "Jan 20, 2024",
    status: "ready",
  },
  {
    id: "tax-summary",
    name: "Tax Summary",
    description: "Tax collected and owed by period",
    icon: DollarSign,
    gradient: "from-cyan-500 to-teal-500",
    shadow: "shadow-cyan-500/25",
    bgLight: "from-cyan-500/10 to-teal-500/10",
    lastGenerated: "Jan 18, 2024",
    status: "ready",
  },
];

const recentReports = [
  { name: "AR Aging Report", generated: "Jan 20, 2024 at 9:00 AM", by: "System", status: "ready" },
  { name: "Revenue Report", generated: "Jan 20, 2024 at 10:00 AM", by: "John Smith", status: "ready" },
  { name: "Profit & Loss", generated: "Jan 19, 2024 at 4:30 PM", by: "Sarah Johnson", status: "ready" },
  { name: "Tax Summary", generated: "Jan 18, 2024 at 11:00 AM", by: "System", status: "ready" },
  { name: "Balance Sheet", generated: "Jan 18, 2024 at 9:00 AM", by: "John Smith", status: "ready" },
];

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
              Reports
            </span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate and download financial and operational reports.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5 transition-all duration-200">
          <Plus className="h-4 w-4" />
          Custom Report
        </button>
      </div>

      <div className="rounded-2xl border bg-card p-5 shadow-lg">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold">Date Range</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-10 rounded-xl border bg-background px-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/40 transition-all"
              />
              <span className="text-sm text-muted-foreground font-medium">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-10 rounded-xl border bg-background px-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/40 transition-all"
              />
            </div>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-200">
            <Filter className="h-4 w-4" />
            Apply Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => (
          <div
            key={report.id}
            className={`group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-lg ${report.shadow} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer`}
          >
            <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gradient-to-br opacity-10 blur-3xl group-hover:opacity-20 transition-opacity" />
            <div className="flex items-start justify-between relative z-10">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${report.gradient} shadow-lg ${report.shadow}`}>
                <report.icon className="h-6 w-6 text-white" />
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  report.status === "ready"
                    ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md shadow-emerald-500/20"
                    : "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20"
                }`}
              >
                {report.status === "ready" ? "Ready" : "Pending"}
              </span>
            </div>
            <div className="mt-5 relative z-10">
              <h3 className="text-base font-bold">{report.name}</h3>
              <p className="text-xs text-muted-foreground mt-1.5">{report.description}</p>
            </div>
            <div className="mt-5 flex items-center justify-between relative z-10">
              <span className="text-[11px] text-muted-foreground font-medium">
                {report.lastGenerated ? `Generated ${report.lastGenerated}` : "Not yet generated"}
              </span>
              <button
                disabled={report.status !== "ready"}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  report.status === "ready"
                    ? `bg-gradient-to-r ${report.gradient} text-white shadow-md ${report.shadow} hover:shadow-lg hover:-translate-y-0.5`
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Download className="h-3 w-3" />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-card shadow-lg overflow-hidden">
        <div className="p-6 pb-0">
          <h3 className="text-base font-bold">Recent Reports</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Previously generated reports</p>
        </div>
        <div className="mt-4">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-900/50">
                <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Report Name
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Generated
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  By
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map((report, i) => (
                <tr key={i} className="border-t border-border hover:bg-gradient-to-r hover:from-violet-50/50 hover:via-blue-50/50 hover:to-cyan-50/50 dark:hover:from-violet-950/20 dark:hover:via-blue-950/20 dark:hover:to-cyan-950/20 transition-colors duration-200">
                  <td className="px-6 py-3.5 text-sm font-bold">{report.name}</td>
                  <td className="px-6 py-3.5 text-sm text-muted-foreground">{report.generated}</td>
                  <td className="px-6 py-3.5 text-sm text-muted-foreground font-medium">{report.by}</td>
                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                      Ready
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                      <Download className="h-3 w-3" />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
