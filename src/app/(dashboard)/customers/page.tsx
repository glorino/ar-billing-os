"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Users,
  Mail,
  DollarSign,
  FileText,
  ArrowUpRight,
  Building2,
  Filter,
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your customer accounts and billing relationships.
          </p>
        </div>
        <Link
          href="/customers/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Customer
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 card-elevated">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight font-mono-nums">{customers.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 card-elevated">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Total Outstanding</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10">
              <DollarSign className="h-4 w-4 text-warning" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight font-mono-nums">{formatMoney(totalOutstanding)}</p>
        </div>
        <div className="rounded-xl border bg-card p-5 card-elevated">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
              <FileText className="h-4 w-4 text-success" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold tracking-tight font-mono-nums">{totalInvoices}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-lg border bg-card pl-9 pr-4 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 card-elevated"
        />
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((customer) => (
          <Link
            key={customer.id}
            href={`/customers/${customer.id}`}
            className="group rounded-xl border bg-card p-5 card-elevated-hover cursor-pointer block"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {customer.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{customer.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{customer.email}</p>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Outstanding</p>
                <p className="text-sm font-semibold font-mono-nums mt-0.5">
                  {customer.outstanding > 0 ? (
                    <span className="text-warning">{formatMoney(customer.outstanding)}</span>
                  ) : (
                    <span className="text-success">{formatMoney(0)}</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Invoices</p>
                <p className="text-sm font-semibold font-mono-nums mt-0.5">{customer.invoices}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Customer since {customer.since}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
                <span className="h-1 w-1 rounded-full bg-success" />
                Active
              </span>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No customers found</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  );
}
