"use client";

import { CustomerList } from "@/components/customers/customer-list";

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
        <p className="text-gray-500">Manage your customer accounts and billing information.</p>
      </div>
      <CustomerList />
    </div>
  );
}
