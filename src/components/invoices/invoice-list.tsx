"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Search, Plus, Download, Filter } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  amountPaid: number;
  status: string;
  issueDate: string;
  dueDate: string;
}

interface InvoiceListProps {
  invoices?: Invoice[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const defaultInvoices: Invoice[] = [
  { id: "1", invoiceNumber: "INV-2024-001", customerName: "Acme Corp", amount: 5200, amountPaid: 0, status: "sent", issueDate: "2024-01-15", dueDate: "2024-02-15" },
  { id: "2", invoiceNumber: "INV-2024-002", customerName: "TechStart Inc", amount: 12800, amountPaid: 12800, status: "paid", issueDate: "2024-01-10", dueDate: "2024-02-10" },
  { id: "3", invoiceNumber: "INV-2024-003", customerName: "Global Solutions", amount: 3400, amountPaid: 0, status: "overdue", issueDate: "2024-01-01", dueDate: "2024-01-20" },
  { id: "4", invoiceNumber: "INV-2024-004", customerName: "Digital Ventures", amount: 8900, amountPaid: 0, status: "pending", issueDate: "2024-01-20", dueDate: "2024-02-28" },
  { id: "5", invoiceNumber: "INV-2024-005", customerName: "Innovate Labs", amount: 6750, amountPaid: 0, status: "draft", issueDate: "2024-01-25", dueDate: "2024-03-01" },
  { id: "6", invoiceNumber: "INV-2024-006", customerName: "Cloud Systems", amount: 15200, amountPaid: 5000, status: "partial", issueDate: "2024-01-05", dueDate: "2024-02-05" },
  { id: "7", invoiceNumber: "INV-2024-007", customerName: "Data Flow Inc", amount: 4100, amountPaid: 4100, status: "paid", issueDate: "2024-01-12", dueDate: "2024-02-12" },
  { id: "8", invoiceNumber: "INV-2024-008", customerName: "Net Solutions", amount: 9800, amountPaid: 0, status: "sent", issueDate: "2024-01-18", dueDate: "2024-02-18" },
];

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "success" | "warning" {
  const variants: Record<string, "default" | "secondary" | "destructive" | "success" | "warning"> = {
    draft: "secondary",
    pending: "warning",
    sent: "default",
    viewed: "default",
    paid: "success",
    overdue: "destructive",
    partial: "warning",
    cancelled: "secondary",
  };
  return variants[status] || "secondary";
}

export function InvoiceList({
  invoices = defaultInvoices,
  currentPage = 1,
  totalPages = 5,
  onPageChange = () => {},
}: InvoiceListProps) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-[300px]"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" asChild>
            <Link href="/invoices/new">
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>
                  <Link href={`/invoices/${invoice.id}`} className="font-medium text-blue-600 hover:underline">
                    {invoice.invoiceNumber}
                  </Link>
                </TableCell>
                <TableCell>{invoice.customerName}</TableCell>
                <TableCell className="font-medium">{formatCurrency(invoice.amount)}</TableCell>
                <TableCell>{formatCurrency(invoice.amountPaid)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(invoice.issueDate), "MMM d, yyyy")}</TableCell>
                <TableCell>{format(new Date(invoice.dueDate), "MMM d, yyyy")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {filteredInvoices.length} of {invoices.length} invoices
        </p>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  );
}
