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
    color: "text-primary",
    bgColor: "bg-primary/10",
    lastGenerated: "Jan 20, 2024",
    status: "ready",
  },
  {
    id: "balance-sheet",
    name: "Balance Sheet",
    description: "Assets, liabilities, and equity position",
    icon: BarChart3,
    color: "text-success",
    bgColor: "bg-success/10",
    lastGenerated: "Jan 20, 2024",
    status: "ready",
  },
  {
    id: "ar-aging",
    name: "AR Aging",
    description: "Outstanding receivables by age bracket",
    icon: Clock,
    color: "text-warning",
    bgColor: "bg-warning/10",
    lastGenerated: "Jan 19, 2024",
    status: "ready",
  },
  {
    id: "tax-summary",
    name: "Tax Summary",
    description: "Tax collected and owed by period",
    icon: DollarSign,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    lastGenerated: "Jan 18, 2024",
    status: "ready",
  },
  {
    id: "cash-flow",
    name: "Cash Flow",
    description: "Cash inflows and outflows forecast",
    icon: PieChart,
    color: "text-primary",
    bgColor: "bg-primary/10",
    lastGenerated: null,
    status: "pending",
  },
  {
    id: "revenue",
    name: "Revenue Report",
    description: "Revenue breakdown by customer and service",
    icon: FileText,
    color: "text-success",
    bgColor: "bg-success/10",
    lastGenerated: "Jan 20, 2024",
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

function formatDistanceToNow(dateStr: string): string {
  return dateStr;
}

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate and download financial and operational reports.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" />
          Custom Report
        </button>
      </div>

      {/* Date Range */}
      <div className="rounded-xl border bg-card p-5 card-elevated">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-10 rounded-lg border bg-card px-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
              />
              <span className="text-sm text-muted-foreground">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-10 rounded-lg border bg-card px-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
              />
            </div>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
            <Filter className="h-4 w-4" />
            Apply Filter
          </button>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reportTypes.map((report) => (
          <div key={report.id} className="group rounded-xl border bg-card p-5 card-elevated-hover cursor-pointer">
            <div className="flex items-start justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${report.bgColor}`}>
                <report.icon className={`h-5 w-5 ${report.color}`} />
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  report.status === "ready"
                    ? "bg-success/10 text-success"
                    : "bg-warning/10 text-warning"
                }`}
              >
                {report.status === "ready" ? "Ready" : "Pending"}
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-semibold">{report.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{report.description}</p>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                {report.lastGenerated ? `Generated ${report.lastGenerated}` : "Not yet generated"}
              </span>
              <button
                disabled={report.status !== "ready"}
                className="inline-flex items-center gap-1 rounded-md border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-3 w-3" />
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Reports Table */}
      <div className="rounded-xl border bg-card card-elevated">
        <div className="flex items-center justify-between p-6 pb-0">
          <div>
            <h3 className="text-base font-semibold">Recent Reports</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Previously generated reports</p>
          </div>
        </div>
        <div className="mt-4">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30">
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Report Name
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Generated
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  By
                </th>
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map((report, i) => (
                <tr key={i} className="border-t border-border table-row-hover">
                  <td className="px-6 py-3.5 text-sm font-medium">{report.name}</td>
                  <td className="px-6 py-3.5 text-sm text-muted-foreground">{report.generated}</td>
                  <td className="px-6 py-3.5 text-sm text-muted-foreground">{report.by}</td>
                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" />
                      Ready
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    <button className="inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors">
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
