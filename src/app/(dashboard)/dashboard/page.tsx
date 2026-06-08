"use client";

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
} from "lucide-react";
import Link from "next/link";

const metrics = [
  {
    label: "Total Outstanding",
    value: "$284,392.00",
    change: "+12.5%",
    trend: "up" as const,
    subtitle: "from last month",
    icon: DollarSign,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    label: "Overdue",
    value: "$42,180.00",
    change: "-8.3%",
    trend: "down" as const,
    subtitle: "from last month",
    icon: AlertCircle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  {
    label: "Collected This Month",
    value: "$156,240.00",
    change: "+23.1%",
    trend: "up" as const,
    subtitle: "from last month",
    icon: CheckCircle2,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    label: "MRR",
    value: "$48,920.00",
    change: "+5.7%",
    trend: "up" as const,
    subtitle: "monthly recurring",
    icon: TrendingUp,
    color: "text-primary",
    bgColor: "bg-primary/10",
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

const statusStyles: Record<string, string> = {
  paid: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  overdue: "bg-destructive/10 text-destructive",
  draft: "bg-muted text-muted-foreground",
};

const activities = [
  { id: 1, text: "Payment received from Acme Corp", amount: "+$12,500.00", time: "2 hours ago", icon: CheckCircle2, color: "text-success" },
  { id: 2, text: "Invoice INV-2024-003 is overdue", amount: "$23,100.00", time: "5 hours ago", icon: AlertCircle, color: "text-destructive" },
  { id: 3, text: "New subscription: CloudNine Ltd", amount: "$2,400/mo", time: "1 day ago", icon: Calendar, color: "text-primary" },
  { id: 4, text: "Payment failed: DataFlow Systems", amount: "$9,350.00", time: "1 day ago", icon: XCircle, color: "text-destructive" },
  { id: 5, text: "Invoice sent to TechStart Inc", amount: "$8,750.00", time: "2 days ago", icon: FileText, color: "text-muted-foreground" },
];

// Simulated chart data
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
  { label: "Current", amount: 186212, color: "bg-success" },
  { label: "1-30 days", amount: 52400, color: "bg-primary" },
  { label: "31-60 days", amount: 28180, color: "bg-warning" },
  { label: "61-90 days", amount: 12000, color: "bg-orange-500" },
  { label: "90+ days", amount: 2000, color: "bg-destructive" },
];

const maxAgingAmount = Math.max(...arAgingData.map((d) => d.amount));

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back. Here&apos;s your business overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/invoices/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Invoice
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="group rounded-xl border bg-card p-5 card-elevated-hover cursor-default"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </p>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <p className="text-2xl font-bold tracking-tight font-mono-nums">
                {metric.value}
              </p>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              {metric.trend === "up" ? (
                <TrendingUp className="h-3.5 w-3.5 text-success" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-destructive" />
              )}
              <span
                className={`text-xs font-semibold ${
                  metric.trend === "up" ? "text-success" : "text-destructive"
                }`}
              >
                {metric.change}
              </span>
              <span className="text-xs text-muted-foreground">
                {metric.subtitle}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Chart - takes 2 columns */}
        <div className="col-span-1 lg:col-span-2 rounded-xl border bg-card p-6 card-elevated">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold">Revenue vs Target</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Monthly comparison</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                Revenue
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-primary/20" />
                Target
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end gap-3 h-48">
            {revenueData.map((d) => {
              const revenueHeight = (d.revenue / 60000) * 100;
              const targetHeight = (d.target / 60000) * 100;
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center gap-1 h-40">
                    <div
                      className="w-4 rounded-t-md bg-primary/20 transition-all duration-500"
                      style={{ height: `${targetHeight}%` }}
                    />
                    <div
                      className="w-4 rounded-t-md bg-primary transition-all duration-500"
                      style={{ height: `${revenueHeight}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AR Aging */}
        <div className="rounded-xl border bg-card p-6 card-elevated">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold">AR Aging</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Receivables by age</p>
            </div>
          </div>
          <div className="space-y-4">
            {arAgingData.map((d) => (
              <div key={d.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-muted-foreground">{d.label}</span>
                  <span className="text-sm font-semibold font-mono-nums">
                    ${d.amount.toLocaleString()}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${d.color} transition-all duration-700`}
                    style={{ width: `${(d.amount / maxAgingAmount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Invoices Table */}
        <div className="col-span-1 lg:col-span-2 rounded-xl border bg-card card-elevated">
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
                <tr className="border-b">
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
                {recentInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b last:border-0 table-row-hover">
                    <td className="px-6 py-3.5">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {invoice.id}
                      </Link>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-foreground">{invoice.customer}</td>
                    <td className="px-6 py-3.5 text-right text-sm font-semibold font-mono-nums">
                      {invoice.amount}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyles[invoice.status]}`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right text-sm text-muted-foreground">
                      {invoice.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="rounded-xl border bg-card card-elevated">
          <div className="flex items-center justify-between p-6 pb-0">
            <div>
              <h3 className="text-base font-semibold">Activity</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Recent events</p>
            </div>
          </div>
          <div className="mt-4 p-6 pt-0">
            <div className="space-y-0">
              {activities.map((activity, i) => (
                <div key={activity.id} className="flex gap-3 pb-4 last:pb-0 relative">
                  {i < activities.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-px bg-border" />
                  )}
                  <div className="relative mt-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-muted flex-shrink-0">
                    <activity.icon className={`h-3 w-3 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-tight">{activity.text}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs font-semibold font-mono-nums">{activity.amount}</span>
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
