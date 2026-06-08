"use client";

import { InvoiceList } from "@/components/invoices/invoice-list";

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Invoices</h2>
        <p className="text-gray-500">Create, manage, and track all your invoices.</p>
      </div>
      <InvoiceList />
    </div>
  );
}
