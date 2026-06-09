"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Target,
  Users,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const metrics = [
  { label: "Total Revenue", value: "$875,000", change: "+12.5%", trend: "up" as const, subtitle: "from last month", icon: DollarSign, gradient: "from-purple-500 to-purple-700" },
  { label: "Collection Rate", value: "94.2%", change: "+2.1%", trend: "up" as const, subtitle: "from last month", icon: Target, gradient: "from-emerald-400 to-emerald-600" },
  { label: "Avg Days to Pay", value: "28", change: "-3 days", trend: "down" as const, subtitle: "from last month", icon: Clock, gradient: "from-blue-400 to-blue-600" },
  { label: "Bad Debt Ratio", value: "1.8%", change: "-0.3%", trend: "down" as const, subtitle: "from last month", icon: TrendingDown, gradient: "from-rose-400 to-rose-600" },
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
  { method: "Credit Card", amount: 45000, percentage: 40.5, gradient: "from-purple-500 to-purple-700", icon: "💳" },
  { method: "ACH Transfer", amount: 32000, percentage: 28.8, gradient: "from-emerald-400 to-emerald-600", icon: "🏦" },
  { method: "Wire Transfer", amount: 18000, percentage: 16.2, gradient: "from-amber-400 to-amber-600", icon: "⚡" },
  { method: "Digital Wallet", amount: 16000, percentage: 14.5, gradient: "from-blue-400 to-blue-600", icon: "📱" },
];

const topCustomers = [
  { name: "Acme Corp", revenue: 52000, invoices: 24, gradient: "from-purple-500 to-indigo-600" },
  { name: "TechStart Inc", revenue: 45000, invoices: 18, gradient: "from-emerald-400 to-teal-600" },
  { name: "Global Solutions", revenue: 38000, invoices: 32, gradient: "from-amber-400 to-orange-600" },
  { name: "Digital Ventures", revenue: 32000, invoices: 12, gradient: "from-blue-400 to-cyan-600" },
  { name: "Innovate Labs", revenue: 28000, invoices: 8, gradient: "from-rose-400 to-pink-600" },
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

function AnimatedCircle() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const cei = 0.942;
  const circumference = 2 * Math.PI * 50;
  return (
    <div className="relative">
      <svg className="h-40 w-40" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="url(#grad1)" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="10"
        />
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke="url(#grad1)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${mounted ? cei * circumference : 0} ${circumference}`}
          transform="rotate(-90 60 60)"
          style={{ transition: "stroke-dasharray 1.5s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">94.2%</span>
        <span className="text-[11px] text-gray-400 mt-1">CEI</span>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-10 right-0 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
          Analytics
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Detailed insights into your billing operations and revenue performance.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="relative group rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-5 backdrop-blur-sm hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center justify-between">
              <p className="text-sm font-medium text-gray-400">{metric.label}</p>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${metric.gradient} shadow-lg`}>
                <metric.icon className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="relative mt-4 flex items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{metric.value}</p>
            </div>
            <div className="relative mt-2 flex items-center gap-1.5">
              {metric.trend === "up" ? (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-emerald-400" />
              )}
              <span className="text-xs font-semibold text-emerald-400">{metric.change}</span>
              <span className="text-xs text-gray-500">{metric.subtitle}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">Revenue Trend</h3>
              <p className="text-sm text-gray-400 mt-1">Monthly revenue vs target</p>
            </div>
            <div className="flex items-center gap-5 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 shadow-lg shadow-purple-500/50" />
                Revenue
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-purple-400/20 border border-purple-400/40" />
                Target
              </div>
            </div>
          </div>
          <div className="flex items-end gap-3 h-56">
            {revenueData.map((d) => {
              const revenueHeight = (d.revenue / maxRevenue) * 100;
              const targetHeight = (d.target / maxRevenue) * 100;
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center gap-1.5 h-48">
                    <div
                      className="w-5 rounded-t-lg bg-purple-400/10 border border-purple-400/20 transition-all duration-700"
                      style={{ height: `${targetHeight}%` }}
                    />
                    <div
                      className="w-5 rounded-t-lg bg-gradient-to-t from-purple-600 to-purple-400 shadow-lg shadow-purple-500/30 transition-all duration-700 hover:shadow-purple-500/50"
                      style={{ height: `${revenueHeight}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-500">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Collection Effectiveness */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
          <div className="mb-6">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">Collection Effectiveness</h3>
            <p className="text-sm text-gray-400 mt-1">Index over time</p>
          </div>
          <div className="flex items-center justify-center py-4">
            <AnimatedCircle />
          </div>
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-sm text-gray-400">Current</span>
              <span className="font-semibold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">94.2%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-sm text-gray-400">Last Month</span>
              <span className="text-gray-500">92.1%</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-sm text-gray-400">Target</span>
              <span className="text-gray-500">95.0%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Cashflow */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">Cash Flow</h3>
              <p className="text-sm text-gray-400 mt-1">Inflows vs outflows</p>
            </div>
            <div className="flex items-center gap-5 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-lg shadow-emerald-500/50" />
                Inflow
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-400 shadow-lg shadow-rose-500/50" />
                Outflow
              </div>
            </div>
          </div>
          <div className="flex items-end gap-3 h-52">
            {cashflowData.map((d) => {
              const inflowH = (d.inflow / maxCashflow) * 100;
              const outflowH = (d.outflow / maxCashflow) * 100;
              return (
                <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center gap-1.5 h-44">
                    <div
                      className="w-5 rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-lg shadow-emerald-500/30 transition-all duration-700 hover:shadow-emerald-500/50"
                      style={{ height: `${inflowH}%` }}
                    />
                    <div
                      className="w-5 rounded-t-lg bg-gradient-to-t from-rose-600 to-pink-400 shadow-lg shadow-rose-500/30 transition-all duration-700 hover:shadow-rose-500/50"
                      style={{ height: `${outflowH}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-500">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* DSO Trend */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
          <div className="mb-6">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">DSO Trend</h3>
            <p className="text-sm text-gray-400 mt-1">Days sales outstanding</p>
          </div>
          <div className="space-y-4">
            {dsoData.map((d, i) => {
              const gradients = [
                "from-purple-500 to-indigo-500",
                "from-blue-500 to-cyan-500",
                "from-emerald-500 to-teal-500",
                "from-amber-500 to-orange-500",
                "from-rose-500 to-pink-500",
                "from-purple-400 to-blue-500",
                "from-cyan-500 to-emerald-500",
              ];
              return (
                <div key={d.month}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">{d.month}</span>
                    <span className="text-sm font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{d.dso} days</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${gradients[i]} transition-all duration-700 shadow-lg`}
                      style={{ width: `${(d.dso / 40) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Payment Methods */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 backdrop-blur-sm">
          <div className="mb-6">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">Payment Methods</h3>
            <p className="text-sm text-gray-400 mt-1">Breakdown by method</p>
          </div>
          <div className="space-y-5">
            {paymentMethods.map((pm) => (
              <div key={pm.method} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{pm.icon}</span>
                    <span className="text-sm font-medium text-gray-300">{pm.method}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{formatMoney(pm.amount)}</span>
                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{pm.percentage}%</span>
                  </div>
                </div>
                <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${pm.gradient} transition-all duration-700 shadow-lg group-hover:shadow-xl`}
                    style={{ width: `${pm.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm overflow-hidden">
          <div className="flex items-center justify-between p-6 pb-0">
            <div>
              <h3 className="text-lg font-semibold bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">Top Customers</h3>
              <p className="text-sm text-gray-400 mt-1">By revenue</p>
            </div>
            <Link
              href="/customers"
              className="inline-flex items-center gap-1 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Customer</th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">Revenue</th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">Invoices</th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((c, i) => (
                  <tr
                    key={c.name}
                    className="border-t border-white/5 hover:bg-gradient-to-r hover:from-purple-500/5 hover:to-cyan-500/5 transition-all duration-300"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${c.gradient} text-xs font-bold text-white shadow-md`}>
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium text-gray-200">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{formatMoney(c.revenue)}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-400">{c.invoices}</td>
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
