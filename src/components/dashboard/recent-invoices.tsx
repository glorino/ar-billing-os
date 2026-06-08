"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  status: string;
  dueDate: string;
}

interface RecentInvoicesProps {
  invoices?: Invoice[];
}

const defaultInvoices: Invoice[] = [
  { id: "1", invoiceNumber: "INV-2024-001", customerName: "Acme Corp", amount: 5200, status: "sent", dueDate: "2024-02-15" },
  { id: "2", invoiceNumber: "INV-2024-002", customerName: "TechStart Inc", amount: 12800, status: "paid", dueDate: "2024-02-10" },
  { id: "3", invoiceNumber: "INV-2024-003", customerName: "Global Solutions", amount: 3400, status: "overdue", dueDate: "2024-01-20" },
  { id: "4", invoiceNumber: "INV-2024-004", customerName: "Digital Ventures", amount: 8900, status: "pending", dueDate: "2024-02-28" },
  { id: "5", invoiceNumber: "INV-2024-005", customerName: "Innovate Labs", amount: 6750, status: "draft", dueDate: "2024-03-01" },
];

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "success" | "warning" {
  const variants: Record<string, "default" | "secondary" | "destructive" | "success" | "warning"> = {
    draft: "secondary",
    pending: "warning",
    sent: "default",
    paid: "success",
    overdue: "destructive",
  };
  return variants[status] || "secondary";
}

export function RecentInvoices({ invoices = defaultInvoices }: RecentInvoicesProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Invoices</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/invoices">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Due Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>
                  <Link href={`/invoices/${invoice.id}`} className="font-medium text-blue-600 hover:underline">
                    {invoice.invoiceNumber}
                  </Link>
                </TableCell>
                <TableCell>{invoice.customerName}</TableCell>
                <TableCell className="font-medium">{formatCurrency(invoice.amount)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(invoice.dueDate), "MMM d, yyyy")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
