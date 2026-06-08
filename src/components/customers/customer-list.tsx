"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Search, Plus, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  outstandingBalance: number;
  collectionStatus: string;
  isActive: boolean;
}

interface CustomerListProps {
  customers?: Customer[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const defaultCustomers: Customer[] = [
  { id: "1", name: "Acme Corp", email: "billing@acmecorp.com", company: "Acme Corporation", outstandingBalance: 5200, collectionStatus: "none", isActive: true },
  { id: "2", name: "TechStart Inc", email: "finance@techstart.io", company: "TechStart Inc", outstandingBalance: 0, collectionStatus: "none", isActive: true },
  { id: "3", name: "Global Solutions", email: "ap@globalsolutions.com", company: "Global Solutions Ltd", outstandingBalance: 3400, collectionStatus: "reminder", isActive: true },
  { id: "4", name: "Digital Ventures", email: "payments@digitalventures.co", company: "Digital Ventures LLC", outstandingBalance: 8900, collectionStatus: "final_notice", isActive: true },
  { id: "5", name: "Innovate Labs", email: "billing@innovatelabs.io", company: "Innovate Labs Inc", outstandingBalance: 6750, collectionStatus: "none", isActive: true },
  { id: "6", name: "Cloud Systems", email: "ap@cloudsystems.com", company: "Cloud Systems Corp", outstandingBalance: 10200, collectionStatus: "reminder", isActive: true },
  { id: "7", name: "Data Flow Inc", email: "finance@dataflow.com", company: "Data Flow Inc", outstandingBalance: 0, collectionStatus: "none", isActive: true },
  { id: "8", name: "Net Solutions", email: "billing@netsolutions.com", company: "Net Solutions LLC", outstandingBalance: 9800, collectionStatus: "none", isActive: true },
];

function getCollectionStatusVariant(status: string): "default" | "secondary" | "destructive" | "success" | "warning" {
  const variants: Record<string, "default" | "secondary" | "destructive" | "success" | "warning"> = {
    none: "secondary",
    reminder: "warning",
    final_notice: "destructive",
    collection_agency: "destructive",
  };
  return variants[status] || "secondary";
}

export function CustomerList({
  customers = defaultCustomers,
  currentPage = 1,
  totalPages = 3,
  onPageChange = () => {},
}: CustomerListProps) {
  const [search, setSearch] = React.useState("");

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 w-[300px]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" asChild>
            <Link href="/customers/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Outstanding</TableHead>
              <TableHead>Collection Status</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <Link href={`/customers/${customer.id}`} className="font-medium text-blue-600 hover:underline">
                    {customer.name}
                  </Link>
                  <p className="text-xs text-gray-500">{customer.company}</p>
                </TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell className="font-medium">
                  {customer.outstandingBalance > 0 ? (
                    <span className={customer.outstandingBalance > 5000 ? "text-red-600" : ""}>
                      {formatCurrency(customer.outstandingBalance)}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {customer.collectionStatus !== "none" ? (
                    <Badge variant={getCollectionStatusVariant(customer.collectionStatus)}>
                      {customer.collectionStatus.replace("_", " ")}
                    </Badge>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={customer.isActive ? "success" : "secondary"}>
                    {customer.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {filteredCustomers.length} of {customers.length} customers
        </p>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  );
}
