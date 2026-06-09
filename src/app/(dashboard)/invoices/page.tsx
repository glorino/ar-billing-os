"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Download,
  FileText,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Send,
  Eye,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileSpreadsheet,
} from "lucide-react";

const invoices = [
  { id: "INV-2024-001", customer: "Acme Corp", email: "billing@acme.com", amount: 12500, status: "paid", date: "2024-01-15", dueDate: "2024-02-14", items: 5 },
  { id: "INV-2024-002", customer: "TechStart Inc", email: "finance@techstart.io", amount: 8750, status: "pending", date: "2024-01-14", dueDate: "2024-02-13", items: 3 },
  { id: "INV-2024-003", customer: "Global Solutions", email: "ap@globalsolutions.com", amount: 23100, status: "overdue", date: "2024-01-12", dueDate: "2024-02-11", items: 8 },
  { id: "INV-2024-004", customer: "Digital Agency", email: "accounts@digitalagency.co", amount: 5400, status: "paid", date: "2024-01-11", dueDate: "2024-02-10", items: 2 },
  { id: "INV-2024-005", customer: "CloudNine Ltd", email: "billing@cloudnine.dev", amount: 18200, status: "draft", date: "2024-01-10", dueDate: "2024-02-09", items: 6 },
  { id: "INV-2024-006", customer: "DataFlow Systems", email: "ap@dataflow.io", amount: 9350, status: "pending", date: "2024-01-09", dueDate: "2024-02-08", items: 4 },
  { id: "INV-2024-007", customer: "Nexus Partners", email: "finance@nexus.co", amount: 34200, status: "paid", date: "2024-01-08", dueDate: "2024-02-07", items: 10 },
  { id: "INV-2024-008", customer: "Bright Minds", email: "billing@brightminds.com", amount: 6800, status: "overdue", date: "2024-01-07", dueDate: "2024-02-06", items: 3 },
  { id: "INV-2024-009", customer: "Summit Labs", email: "accounts@summitlabs.io", amount: 15900, status: "paid", date: "2024-01-06", dueDate: "2024-02-05", items: 7 },
  { id: "INV-2024-010", customer: "Velocity Inc", email: "ap@velocity.dev", amount: 11200, status: "pending", date: "2024-01-05", dueDate: "2024-02-04", items: 4 },
];

const statusStyles: Record<string, { bg: string; text: string; gradient: string }> = {
  paid: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    gradient: "bg-gradient-to-r from-emerald-500 to-green-500",
  },
  pending: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    gradient: "bg-gradient-to-r from-amber-400 to-orange-500",
  },
  overdue: {
    bg: "bg-red-100",
    text: "text-red-700",
    gradient: "bg-gradient-to-r from-red-500 to-rose-600",
  },
  draft: {
    bg: "bg-gray-100",
    text: "text-gray-500",
    gradient: "bg-gradient-to-r from-gray-400 to-gray-500",
  },
};

const filters = ["All", "Draft", "Pending", "Paid", "Overdue"];

export default function InvoicesPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredInvoices = invoices.filter((inv) => {
    const matchesFilter = activeFilter === "All" || inv.status === activeFilter.toLowerCase();
    const matchesSearch =
      inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = filteredInvoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.amount, 0);
  const overdueAmount = filteredInvoices
    .filter((i) => i.status === "overdue")
    .reduce((s, i) => s + i.amount, 0);

  const stats = [
    {
      label: "Total Invoices",
      value: filteredInvoices.length.toString(),
      icon: FileSpreadsheet,
      gradient: "bg-gradient-to-br from-violet-500 to-purple-600",
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
      trend: "+12%",
      trendUp: true,
    },
    {
      label: "Total Amount",
      value: `$${totalAmount.toLocaleString()}`,
      icon: DollarSign,
      gradient: "bg-gradient-to-br from-blue-500 to-indigo-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      trend: "+8%",
      trendUp: true,
    },
    {
      label: "Paid",
      value: `$${paidAmount.toLocaleString()}`,
      icon: CheckCircle,
      gradient: "bg-gradient-to-br from-emerald-500 to-green-600",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      trend: "+24%",
      trendUp: true,
    },
    {
      label: "Overdue",
      value: `$${overdueAmount.toLocaleString()}`,
      icon: AlertTriangle,
      gradient: "bg-gradient-to-br from-red-500 to-rose-600",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      trend: "-5%",
      trendUp: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Invoices
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Manage and track all your invoices with ease
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="group inline-flex items-center gap-2.5 rounded-xl border-2 border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200">
              <Download className="h-4 w-4 group-hover:rotate-12 transition-transform" />
              Export
            </button>
            <Link
              href="/invoices/new"
              className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02] transition-all duration-200"
            >
              <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
              New Invoice
            </Link>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-5">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trendUp ? TrendingUp : AlertTriangle;
            return (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl border border-gray-200/60 bg-white p-5 shadow-sm hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300"
              >
                <div className={`absolute -top-8 -right-8 h-24 w-24 rounded-full ${stat.gradient} opacity-[0.07] group-hover:opacity-[0.12] transition-opacity`} />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold mt-2 text-gray-900 tracking-tight">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`flex items-center justify-center w-11 h-11 rounded-xl ${stat.iconBg} shadow-sm`}>
                    <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  <TrendIcon
                    className={`h-3.5 w-3.5 ${
                      stat.trendUp ? "text-emerald-500" : "text-red-500"
                    }`}
                  />
                  <span
                    className={`text-xs font-semibold ${
                      stat.trendUp ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {stat.trend}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">vs last month</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filters and Search */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 rounded-xl bg-white p-1.5 shadow-sm border border-gray-200/60">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setActiveFilter(filter);
                  setCurrentPage(1);
                }}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  activeFilter === filter
                    ? "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 w-72 rounded-xl border-2 border-gray-200 bg-white pl-11 pr-4 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-gray-200/60 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-slate-50/50">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    <button className="inline-flex items-center gap-1.5 hover:text-purple-600 transition-colors">
                      Invoice <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                    <button className="inline-flex items-center gap-1.5 hover:text-purple-600 transition-colors">
                      Amount <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                    <button className="inline-flex items-center gap-1.5 hover:text-purple-600 transition-colors">
                      Due Date <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedInvoices.map((invoice) => {
                  const style = statusStyles[invoice.status];
                  return (
                    <tr
                      key={invoice.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-gradient-to-r hover:from-violet-50/40 hover:via-purple-50/30 hover:to-indigo-50/40 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="inline-flex items-center gap-2.5 text-sm font-bold text-purple-600 hover:text-purple-700 hover:underline decoration-purple-300 underline-offset-2 transition-colors"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 shadow-sm">
                            <FileText className="h-4 w-4 text-purple-600" />
                          </div>
                          {invoice.id}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {invoice.customer}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{invoice.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-base font-bold text-gray-900 tracking-tight">
                          ${invoice.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${style.gradient} text-white shadow-sm`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          {new Date(invoice.dueDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {invoice.status === "draft" && (
                            <button
                              className="rounded-lg p-2 text-gray-400 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 hover:text-white hover:shadow-md hover:shadow-blue-500/25 transition-all duration-200"
                              title="Send"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            className="rounded-lg p-2 text-gray-400 hover:bg-gradient-to-r hover:from-violet-500 hover:to-purple-500 hover:text-white hover:shadow-md hover:shadow-purple-500/25 transition-all duration-200"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-slate-50/30 px-6 py-4">
            <p className="text-sm font-medium text-gray-500">
              Showing{" "}
              <span className="font-bold text-gray-700">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-gray-700">
                {Math.min(currentPage * itemsPerPage, filteredInvoices.length)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-gray-700">{filteredInvoices.length}</span> invoices
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 rounded-lg border-2 border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-600 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-600 transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-sm font-bold transition-all duration-200 ${
                    currentPage === page
                      ? "bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25"
                      : "border-2 border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 rounded-lg border-2 border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-600 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 disabled:hover:text-gray-600 transition-all duration-200"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
