"use client";

import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Target,
  CreditCard,
  Users,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const metrics = [
  { label: "Total Revenue", value: "$875,000", change: "+12.5%", trend: "up" as const, subtitle: "from last month", icon: DollarSign, color: "text-primary", bgColor: "bg-primary/10" },
  { label: "Collection Rate", value: "94.2%", change: "+2.1%", trend: "up" as const, subtitle: "from last month", icon: Target, color: "text-success", bgColor: "bg-success/10" },
  { label: "Avg Days to Pay", value: "28", change: "-3 days", trend: "down" as const, subtitle: "from last month", icon: Clock, color: "text-primary", bgColor: "bg-primary/10" },
  { label: "Bad Debt Ratio", value: "1.8%", change: "-0.3%", trend: "down" as const, subtitle: "from last month", icon: TrendingDown, color: "text-success", bgColor: "bg-success/10" },
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

const cashflowData = [
  { month: "Jul", inflow: 42000, outflow: 28000 },
  { month: "Aug", inflow: 38000, outflow: 31000 },
  { month: "Sep", inflow: 55000, outflow: 32000 },
  { month: "Oct", inflow: 48000, outflow: 35000 },
  { month: "Nov", inflow: 62000, outflow: 38000 },
  { month: "Dec", inflow: 58000, outflow: 40000 },
  { month: "Jan", inflow: 68000, outflow: 42000 },
];

const paymentMethods = [
  { method: "Credit Card", amount: 45000, percentage: 40.5, color: "bg-primary" },
  { method: "ACH Transfer", amount: 32000, percentage: 28.8, color: "bg-success" },
  { method: "Wire Transfer", amount: 18000, percentage: 16.2, color: "bg-warning" },
  { method: "Digital Wallet", amount: 16000, percentage: 14.5, color: "bg-destructive" },
];

const topCustomers = [
  { name: "Acme Corp", revenue: 52000, invoices: 24, color: "text-primary" },
  { name: "TechStart Inc", revenue: 45000, invoices: 18, color: "text-success" },
  { name: "Global Solutions", revenue: 38000, invoices: 32, color: "text-warning" },
  { name: "Digital Ventures", revenue: 32000, invoices: 12, color: "text-primary" },
  { name: "Innovate Labs", revenue: 28000, invoices: 8, color: "text-success" },
];

const maxRevenue = Math.max(...revenueData.map((d) => d.revenue));
const maxCashflow = Math.max(...cashflowData.map((d) => d.inflow));

const dsoData = [
  { month: "Jul", dso: 32 },
  { month: "Aug", dso: 35 },
  { month: "Sep", dso: 28 },
  { month: "Oct", dso: 30 },
  { month: "Nov", dso: 26 },
  { month: "Dec", dso: 29 },
  { month: "Jan", dso: 28 },
];

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Detailed insights into your billing operations and revenue performance.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border bg-card p-5 card-elevated-hover cursor-default">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <p className="text-2xl font-bold tracking-tight font-mono-nums">{metric.value}</p>
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              {metric.trend === "up" ? (
                <TrendingUp className="h-3.5 w-3.5 text-success" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-success" />
              )}
              <span className="text-xs font-semibold text-success">{metric.change}</span>
              <span className="text-xs text-muted-foreground">{metric.subtitle}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Trend - 2 cols */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-6 card-elevated">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold">Revenue Trend</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Monthly revenue vs target</p>
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
          <div className="flex items-end gap-3 h-52">
            {revenueData.map((d) => {
              const revenueHeight = (d.revenue / maxRevenue) * 100;
              const targetHeight = (d.target / maxRevenue) * 100;
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center gap-1 h-44">
                    <div className="w-4 rounded-t-md bg-primary/20 transition-all duration-500" style={{ height: `${targetHeight}%` }} />
                    <div className="w-4 rounded-t-md bg-primary transition-all duration-500" style={{ height: `${revenueHeight}%` }} />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Collection Effectiveness Index */}
        <div className="rounded-xl border bg-card p-6 card-elevated">
          <div className="mb-6">
            <h3 className="text-base font-semibold">Collection Effectiveness</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Index over time</p>
          </div>
          <div className="flex items-center justify-center py-6">
            <div className="relative">
              <svg className="h-32 w-32" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="hsl(var(--success))"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${0.942 * 2 * Math.PI * 50} ${2 * Math.PI * 50}`}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold font-mono-nums">94.2%</span>
                <span className="text-[11px] text-muted-foreground">CEI</span>
              </div>
            </div>
          </div>
          <div className="space-y-3 mt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Current</span>
              <span className="font-semibold font-mono-nums">94.2%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Last Month</span>
              <span className="font-mono-nums text-muted-foreground">92.1%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Target</span>
              <span className="font-mono-nums text-muted-foreground">95.0%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Cashflow - 2 cols */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-6 card-elevated">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold">Cash Flow</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Inflows vs outflows</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-success" />
                Inflow
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                Outflow
              </div>
            </div>
          </div>
          <div className="flex items-end gap-3 h-48">
            {cashflowData.map((d) => {
              const inflowH = (d.inflow / maxCashflow) * 100;
              const outflowH = (d.outflow / maxCashflow) * 100;
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center gap-1 h-40">
                    <div className="w-4 rounded-t-md bg-success transition-all duration-500" style={{ height: `${inflowH}%` }} />
                    <div className="w-4 rounded-t-md bg-destructive/40 transition-all duration-500" style={{ height: `${outflowH}%` }} />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* DSO Trend */}
        <div className="rounded-xl border bg-card p-6 card-elevated">
          <div className="mb-6">
            <h3 className="text-base font-semibold">DSO Trend</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Days sales outstanding</p>
          </div>
          <div className="space-y-3">
            {dsoData.map((d) => (
              <div key={d.month}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-muted-foreground">{d.month}</span>
                  <span className="text-sm font-semibold font-mono-nums">{d.dso} days</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${(d.dso / 40) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Payment Methods */}
        <div className="rounded-xl border bg-card p-6 card-elevated">
          <div className="mb-6">
            <h3 className="text-base font-semibold">Payment Methods</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Breakdown by method</p>
          </div>
          <div className="space-y-4">
            {paymentMethods.map((pm) => (
              <div key={pm.method}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-muted-foreground">{pm.method}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold font-mono-nums">{formatMoney(pm.amount)}</span>
                    <span className="text-xs text-muted-foreground">{pm.percentage}%</span>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pm.color} transition-all duration-700`}
                    style={{ width: `${pm.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="rounded-xl border bg-card card-elevated">
          <div className="flex items-center justify-between p-6 pb-0">
            <div>
              <h3 className="text-base font-semibold">Top Customers</h3>
              <p className="text-sm text-muted-foreground mt-0.5">By revenue</p>
            </div>
            <Link href="/customers" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/30">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Customer</th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Revenue</th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Invoices</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((c, i) => (
                  <tr key={c.name} className="border-t border-border table-row-hover">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-muted-foreground w-4">{i + 1}</span>
                        <span className="text-sm font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-right text-sm font-semibold font-mono-nums">{formatMoney(c.revenue)}</td>
                    <td className="px-6 py-3.5 text-right text-sm text-muted-foreground font-mono-nums">{c.invoices}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
