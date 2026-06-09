"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Clock,
  FileText,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  XCircle,
  CreditCard,
  Calendar,
  MoreHorizontal,
  Plus,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const metrics = [
  {
    label: "Total Outstanding",
    value: "$284,392.00",
    change: "+12.5%",
    trend: "up" as const,
    subtitle: "from last month",
    icon: DollarSign,
    iconBg: "icon-bg-purple",
    valueColor: "text-purple-600 dark:text-purple-400",
    borderColor: "border-purple-200 dark:border-purple-800",
    hoverGradient: "hover:bg-gradient-to-br hover:from-purple-50 hover:to-indigo-50 dark:hover:from-purple-950/30 dark:hover:to-indigo-950/30",
    glowColor: "group-hover:shadow-purple-100 dark:group-hover:shadow-purple-900/20",
  },
  {
    label: "Overdue",
    value: "$42,180.00",
    change: "-8.3%",
    trend: "down" as const,
    subtitle: "from last month",
    icon: AlertCircle,
    iconBg: "icon-bg-pink",
    valueColor: "text-red-600 dark:text-red-400",
    borderColor: "border-red-200 dark:border-red-800",
    hoverGradient: "hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 dark:hover:from-red-950/30 dark:hover:to-pink-950/30",
    glowColor: "group-hover:shadow-red-100 dark:group-hover:shadow-red-900/20",
  },
  {
    label: "Collected This Month",
    value: "$156,240.00",
    change: "+23.1%",
    trend: "up" as const,
    subtitle: "from last month",
    icon: CheckCircle2,
    iconBg: "icon-bg-green",
    valueColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-200 dark:border-emerald-800",
    hoverGradient: "hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-950/30 dark:hover:to-teal-950/30",
    glowColor: "group-hover:shadow-emerald-100 dark:group-hover:shadow-emerald-900/20",
  },
  {
    label: "MRR",
    value: "$48,920.00",
    change: "+5.7%",
    trend: "up" as const,
    subtitle: "monthly recurring",
    icon: TrendingUp,
    iconBg: "icon-bg-cyan",
    valueColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
    hoverGradient: "hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-950/30 dark:hover:to-cyan-950/30",
    glowColor: "group-hover:shadow-blue-100 dark:group-hover:shadow-blue-900/20",
  },
];

const recentInvoices = [
  { id: "INV-2024-001", customer: "Acme Corp", amount: "$12,500.00", status: "paid", date: "Jan 15, 2024" },
  { id: "INV-2024-002", customer: "TechStart Inc", amount: "$8,750.00", status: "pending", date: "Jan 14, 2024" },
  { id: "INV-2024-003", customer: "Global Solutions", amount: "$23,100.00", status: "overdue", date: "Jan 12, 2024" },
  { id: "INV-2024-004", customer: "Digital Agency", amount: "$5,400.00", status: "paid", date: "Jan 11, 2024" },
  { id: "INV-2024-005", customer: "CloudNine Ltd", amount: "$18,200.00", status: "draft", date: "Jan 10, 2024" },
  { id: "INV-2024-006", customer: "DataFlow Systems", amount: "$9,350.00", status: "pending", date: "Jan 9, 2024" },
];

const statusStyles: Record<string, { pill: string; dot: string }> = {
  paid: {
    pill: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/30",
    dot: "bg-emerald-500",
  },
  pending: {
    pill: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-400/30",
    dot: "bg-amber-500",
  },
  overdue: {
    pill: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-400/30",
    dot: "bg-red-500",
  },
  draft: {
    pill: "bg-slate-50 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-400 dark:ring-slate-400/30",
    dot: "bg-slate-400",
  },
};

const activities = [
  {
    id: 1,
    text: "Payment received from Acme Corp",
    amount: "+$12,500.00",
    time: "2 hours ago",
    icon: CheckCircle2,
    bgColor: "bg-emerald-100 dark:bg-emerald-500/15",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    borderColor: "border-emerald-300 dark:border-emerald-700",
  },
  {
    id: 2,
    text: "Invoice INV-2024-003 is overdue",
    amount: "$23,100.00",
    time: "5 hours ago",
    icon: AlertCircle,
    bgColor: "bg-red-100 dark:bg-red-500/15",
    iconColor: "text-red-600 dark:text-red-400",
    borderColor: "border-red-300 dark:border-red-700",
  },
  {
    id: 3,
    text: "New subscription: CloudNine Ltd",
    amount: "$2,400/mo",
    time: "1 day ago",
    icon: Calendar,
    bgColor: "bg-blue-100 dark:bg-blue-500/15",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-300 dark:border-blue-700",
  },
  {
    id: 4,
    text: "Payment failed: DataFlow Systems",
    amount: "$9,350.00",
    time: "1 day ago",
    icon: XCircle,
    bgColor: "bg-pink-100 dark:bg-pink-500/15",
    iconColor: "text-pink-600 dark:text-pink-400",
    borderColor: "border-pink-300 dark:border-pink-700",
  },
  {
    id: 5,
    text: "Invoice sent to TechStart Inc",
    amount: "$8,750.00",
    time: "2 days ago",
    icon: FileText,
    bgColor: "bg-violet-100 dark:bg-violet-500/15",
    iconColor: "text-violet-600 dark:text-violet-400",
    borderColor: "border-violet-300 dark:border-violet-700",
  },
];

const revenueData = [
  { month: "Jul", revenue: 32000, target: 30000 },
  { month: "Aug", revenue: 28000, target: 32000 },
  { month: "Sep", revenue: 45000, target: 35000 },
  { month: "Oct", revenue: 38000, target: 38000 },
  { month: "Nov", revenue: 52000, target: 40000 },
  { month: "Dec", revenue: 48000, target: 42000 },
  { month: "Jan", revenue: 56000, target: 45000 },
];

const arAgingData = [
  { label: "Current", amount: 186212, color: "from-emerald-400 to-emerald-500", bgColor: "bg-emerald-500", textColor: "text-emerald-600 dark:text-emerald-400" },
  { label: "1-30 days", amount: 52400, color: "from-blue-400 to-blue-500", bgColor: "bg-blue-500", textColor: "text-blue-600 dark:text-blue-400" },
  { label: "31-60 days", amount: 28180, color: "from-amber-400 to-amber-500", bgColor: "bg-amber-500", textColor: "text-amber-600 dark:text-amber-400" },
  { label: "61-90 days", amount: 12000, color: "from-orange-400 to-orange-500", bgColor: "bg-orange-500", textColor: "text-orange-600 dark:text-orange-400" },
  { label: "90+ days", amount: 2000, color: "from-red-400 to-red-500", bgColor: "bg-red-500", textColor: "text-red-600 dark:text-red-400" },
];

const totalAgingAmount = arAgingData.reduce((sum, d) => sum + d.amount, 0);
const maxAgingAmount = Math.max(...arAgingData.map((d) => d.amount));

export default function DashboardPage() {
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-purple-800 to-indigo-700 dark:from-gray-100 dark:via-purple-300 dark:to-indigo-300 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Welcome back. Here&apos;s your business overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/invoices/new"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-200"
          >
            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
            New Invoice
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={cn(
              "group relative rounded-2xl border bg-card p-5 cursor-default overflow-hidden",
              "transition-all duration-300 ease-out",
              "hover:-translate-y-1 hover:shadow-xl",
              metric.hoverGradient,
              metric.glowColor,
              "shadow-sm"
            )}
          >
            {/* Subtle decorative circle */}
            <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-[0.07] group-hover:opacity-[0.12] transition-opacity duration-300"
              style={{
                background: metric.iconBg === "icon-bg-purple"
                  ? "linear-gradient(135deg, #667eea, #764ba2)"
                  : metric.iconBg === "icon-bg-pink"
                  ? "linear-gradient(135deg, #f093fb, #f5576c)"
                  : metric.iconBg === "icon-bg-green"
                  ? "linear-gradient(135deg, #43e97b, #38f9d7)"
                  : "linear-gradient(135deg, #4facfe, #00f2fe)"
              }}
            />

            <div className="flex items-center justify-between relative z-10">
              <p className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </p>
              <div className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-lg",
                metric.iconBg
              )}>
                <metric.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2 relative z-10">
              <p className={cn("text-3xl font-bold tracking-tight font-mono-nums", metric.valueColor)}>
                {metric.value}
              </p>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 relative z-10">
              <div className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold",
                metric.trend === "up"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                  : "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400"
              )}>
                {metric.trend === "up" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {metric.change}
              </div>
              <span className="text-xs text-muted-foreground">
                {metric.subtitle}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Chart */}
        <div className="col-span-1 lg:col-span-2 rounded-2xl border bg-card p-6 shadow-sm relative overflow-hidden">
          {/* Decorative gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-transparent to-blue-50/50 dark:from-purple-950/20 dark:via-transparent dark:to-blue-950/20 pointer-events-none" />

          <div className="flex items-center justify-between mb-6 relative z-10">
            <div>
              <h3 className="text-base font-semibold">Revenue vs Target</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Monthly comparison</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500" />
                Revenue
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-purple-200 dark:bg-purple-800" />
                Target
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end gap-3 h-52 relative z-10">
            {revenueData.map((d, idx) => {
              const revenueHeight = (d.revenue / 60000) * 100;
              const targetHeight = (d.target / 60000) * 100;
              const isHovered = hoveredBar === idx;
              return (
                <div
                  key={d.month}
                  className="flex-1 flex flex-col items-center gap-2"
                  onMouseEnter={() => setHoveredBar(idx)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  <div className="w-full flex items-end justify-center gap-1 h-44">
                    <div
                      className={cn(
                        "w-5 rounded-t-lg transition-all duration-300",
                        "bg-purple-200 dark:bg-purple-800/60",
                        isHovered && "bg-purple-300 dark:bg-purple-700/70"
                      )}
                      style={{ height: `${targetHeight}%` }}
                    />
                    <div
                      className={cn(
                        "w-5 rounded-t-lg transition-all duration-500 shadow-lg",
                        "bg-gradient-to-t from-purple-600 to-indigo-400",
                        isHovered && "from-purple-500 to-indigo-300 shadow-purple-400/30 scale-x-110"
                      )}
                      style={{ height: `${revenueHeight}%` }}
                    />
                  </div>
                  <span className={cn(
                    "text-[11px] font-medium transition-colors duration-200",
                    isHovered ? "text-foreground font-semibold" : "text-muted-foreground"
                  )}>
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AR Aging */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 via-transparent to-red-50/30 dark:from-amber-950/10 dark:via-transparent dark:to-red-950/10 pointer-events-none" />

          <div className="flex items-center justify-between mb-6 relative z-10">
            <div>
              <h3 className="text-base font-semibold">AR Aging</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Receivables by age</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-sm font-bold font-mono-nums">${totalAgingAmount.toLocaleString()}</p>
            </div>
          </div>
          <div className="space-y-4 relative z-10">
            {arAgingData.map((d) => {
              const percentage = ((d.amount / totalAgingAmount) * 100).toFixed(1);
              return (
                <div key={d.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full", d.bgColor)} />
                      {d.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs font-semibold", d.textColor)}>
                        {percentage}%
                      </span>
                      <span className="text-sm font-semibold font-mono-nums">
                        ${d.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-muted/50 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full bg-gradient-to-r transition-all duration-700",
                        d.color
                      )}
                      style={{ width: `${(d.amount / maxAgingAmount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Invoices Table */}
        <div className="col-span-1 lg:col-span-2 rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-0">
            <div>
              <h3 className="text-base font-semibold">Recent Invoices</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Latest transactions</p>
            </div>
            <Link
              href="/invoices"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentInvoices.map((invoice) => {
                  const styles = statusStyles[invoice.status];
                  return (
                    <tr
                      key={invoice.id}
                      className="border-b last:border-0 transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-50/50 hover:via-indigo-50/30 hover:to-blue-50/50 dark:hover:from-purple-950/20 dark:hover:via-indigo-950/10 dark:hover:to-blue-950/20"
                    >
                      <td className="px-6 py-3.5">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {invoice.id}
                        </Link>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-foreground font-medium">{invoice.customer}</td>
                      <td className="px-6 py-3.5 text-right text-sm font-semibold font-mono-nums">
                        {invoice.amount}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset",
                            styles.pill
                          )}
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right text-sm text-muted-foreground">
                        {invoice.date}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-0">
            <div>
              <h3 className="text-base font-semibold">Activity</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Recent events</p>
            </div>
          </div>
          <div className="mt-4 p-6 pt-0">
            <div className="space-y-0">
              {activities.map((activity, i) => (
                <div key={activity.id} className="flex gap-3 pb-4 last:pb-0 relative group">
                  {/* Gradient timeline line */}
                  {i < activities.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gradient-to-b from-border via-border to-transparent" />
                  )}
                  <div className={cn(
                    "relative mt-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-full flex-shrink-0 ring-2 ring-card",
                    activity.bgColor
                  )}>
                    <activity.icon className={cn("h-3 w-3", activity.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0 rounded-xl p-2 -m-2 transition-colors duration-200 group-hover:bg-muted/30">
                    <p className="text-sm leading-tight font-medium">{activity.text}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={cn(
                        "text-xs font-bold font-mono-nums",
                        activity.iconColor
                      )}>
                        {activity.amount}
                      </span>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
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
