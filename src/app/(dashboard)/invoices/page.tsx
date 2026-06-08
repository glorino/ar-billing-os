"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  FileText,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  Send,
  Eye,
  Trash2,
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

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  paid: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  overdue: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  draft: { bg: "bg-gray-50", text: "text-gray-500", dot: "bg-gray-400" },
};

const filters = ["All", "Draft", "Pending", "Paid", "Overdue"];

export default function InvoicesPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredInvoices = invoices.filter((inv) => {
    const matchesFilter = activeFilter === "All" || inv.status === activeFilter.toLowerCase();
    const matchesSearch =
      inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track all your invoices
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
          <Link
            href="/invoices/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Invoice
          </Link>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Invoices", value: invoices.length.toString(), icon: FileText },
          { label: "Total Amount", value: `$${totalAmount.toLocaleString()}`, icon: DollarSign },
          { label: "Paid", value: `$${invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.amount, 0).toLocaleString()}`, icon: DollarSign },
          { label: "Overdue", value: `$${invoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.amount, 0).toLocaleString()}`, icon: DollarSign },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold mt-1 font-mono-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeFilter === filter
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-64 rounded-lg border bg-card pl-9 pr-4 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card card-elevated overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <button className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                  Invoice <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Customer
              </th>
              <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <button className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                  Amount <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <button className="inline-flex items-center gap-1 hover:text-foreground transition-colors">
                  Due Date <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => {
              const style = statusStyles[invoice.status];
              return (
                <tr key={invoice.id} className="border-b last:border-0 table-row-hover">
                  <td className="px-6 py-4">
                    <Link
                      href={`/invoices/${invoice.id}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                    >
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {invoice.id}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium">{invoice.customer}</p>
                      <p className="text-xs text-muted-foreground">{invoice.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold font-mono-nums">
                      ${invoice.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${style.bg} ${style.text}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(invoice.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {invoice.status === "draft" && (
                        <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors" title="Send">
                          <Send className="h-4 w-4" />
                        </button>
                      )}
                      <button className="rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-6 py-3">
          <p className="text-sm text-muted-foreground">
            Showing {filteredInvoices.length} of {invoices.length} invoices
          </p>
          <div className="flex items-center gap-1">
            <button className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
              Previous
            </button>
            <button className="rounded-md bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
              1
            </button>
            <button className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
              2
            </button>
            <button className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
