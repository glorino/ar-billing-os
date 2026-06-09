"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Users,
  DollarSign,
  FileText,
  ArrowUpRight,
} from "lucide-react";

const customers = [
  { id: "1", name: "Acme Corp", email: "billing@acmecorp.com", outstanding: 12500, invoices: 24, since: "Jan 2022", status: "active", initials: "AC" },
  { id: "2", name: "TechStart Inc", email: "accounts@techstart.io", outstanding: 8750, invoices: 18, since: "Mar 2023", status: "active", initials: "TS" },
  { id: "3", name: "Global Solutions", email: "pay@globalsolutions.com", outstanding: 23100, invoices: 32, since: "Jun 2021", status: "active", initials: "GS" },
  { id: "4", name: "Digital Ventures", email: "finance@digitalventures.co", outstanding: 5400, invoices: 12, since: "Sep 2023", status: "active", initials: "DV" },
  { id: "5", name: "CloudNine Ltd", email: "ap@cloudnine.dev", outstanding: 0, invoices: 8, since: "Nov 2023", status: "active", initials: "CN" },
  { id: "6", name: "DataFlow Systems", email: "billing@dataflow.io", outstanding: 9350, invoices: 15, since: "Feb 2022", status: "active", initials: "DF" },
  { id: "7", name: "Innovate Labs", email: "accounts@innovatelabs.ai", outstanding: 0, invoices: 6, since: "Jul 2024", status: "active", initials: "IL" },
  { id: "8", name: "Pinnacle Corp", email: "finance@pinnacle.com", outstanding: 4200, invoices: 10, since: "Apr 2023", status: "active", initials: "PC" },
];

const avatarGradients: Record<string, string> = {
  "Acme Corp": "linear-gradient(135deg, #7c3aed, #a855f7, #c084fc)",
  "TechStart Inc": "linear-gradient(135deg, #2563eb, #3b82f6, #60a5fa)",
  "Global Solutions": "linear-gradient(135deg, #16a34a, #22c55e, #4ade80)",
  "Digital Ventures": "linear-gradient(135deg, #ea580c, #f97316, #fb923c)",
  "CloudNine Ltd": "linear-gradient(135deg, #0891b2, #06b6d4, #22d3ee)",
  "DataFlow Systems": "linear-gradient(135deg, #db2777, #ec4899, #f472b6)",
  "Innovate Labs": "linear-gradient(135deg, #dc2626, #ea580c, #f59e0b)",
  "Pinnacle Corp": "linear-gradient(135deg, #0369a1, #0284c7, #38bdf8)",
};

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(amount);
}

export default function CustomersPage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstanding, 0);
  const totalInvoices = customers.reduce((sum, c) => sum + c.invoices, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1
            className="text-3xl sm:text-4xl font-extrabold tracking-tight"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #2563eb, #06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Customers
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your customer accounts and billing relationships.
          </p>
        </div>
        <Link
          href="/customers/new"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #2563eb)",
          }}
        >
          <Plus className="h-4 w-4" />
          New Customer
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="group relative rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Customers</p>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm"
              style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7)" }}
            >
              <Users className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="relative mt-3 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {customers.length}
          </p>
        </div>

        <div className="group relative rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Outstanding</p>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm"
              style={{ background: "linear-gradient(135deg, #d97706, #f59e0b)" }}
            >
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="relative mt-3 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {formatMoney(totalOutstanding)}
          </p>
        </div>

        <div className="group relative rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm transition-all duration-200 hover:shadow-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Invoices</p>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm"
              style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
            >
              <FileText className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="relative mt-3 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {totalInvoices}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-10 pr-4 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/40 shadow-sm transition-all"
        />
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((customer) => (
          <Link
            key={customer.id}
            href={`/customers/${customer.id}`}
            className="group relative rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 cursor-pointer block transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-transparent"
            style={{
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onMouseEnter={(e) => {
              const card = e.currentTarget;
              const gradient = avatarGradients[customer.name] || "linear-gradient(135deg, #7c3aed, #a855f7)";
              card.style.boxShadow = "0 8px 32px rgba(0,0,0,0.12)";
              card.style.borderColor = "transparent";
              card.style.background = "linear-gradient(white, white) padding-box, " + gradient.replace(")", ", 0.3)") + " border-box";
              card.style.border = "2px solid transparent";
            }}
            onMouseLeave={(e) => {
              const card = e.currentTarget;
              card.style.boxShadow = "";
              card.style.borderColor = "";
              card.style.background = "";
              card.style.border = "";
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white shadow-md"
                  style={{
                    background: avatarGradients[customer.name] || "linear-gradient(135deg, #7c3aed, #a855f7)",
                  }}
                >
                  {customer.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{customer.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{customer.email}</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:text-purple-500" />
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Outstanding</p>
                <p className="text-sm font-bold mt-0.5">
                  {customer.outstanding > 0 ? (
                    <span className="text-red-500 dark:text-red-400">{formatMoney(customer.outstanding)}</span>
                  ) : (
                    <span className="text-emerald-500 dark:text-emerald-400">{formatMoney(0)}</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Invoices</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{customer.invoices}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-400 dark:text-gray-500">Customer since {customer.since}</span>
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, #e9d5ff, #dbeafe)" }}
          >
            <Users className="h-8 w-8 text-purple-500" />
          </div>
          <p className="text-base font-semibold text-gray-900 dark:text-white">No customers found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  );
}
