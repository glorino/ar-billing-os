"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Send, Download, Printer, MoreVertical, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface InvoiceDetailProps {
  invoice?: {
    id: string;
    invoiceNumber: string;
    status: string;
    issueDate: string;
    dueDate: string;
    customerName: string;
    customerEmail: string;
    billingAddress: string;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
    amountPaid: number;
    amountDue: number;
    notes?: string;
    terms?: string;
  };
  lineItems?: LineItem[];
}

const defaultInvoice = {
  id: "1",
  invoiceNumber: "INV-2024-001",
  status: "sent",
  issueDate: "2024-01-15",
  dueDate: "2024-02-15",
  customerName: "Acme Corp",
  customerEmail: "billing@acmecorp.com",
  billingAddress: "123 Business St, Suite 100\nSan Francisco, CA 94105\nUnited States",
  subtotal: 5000,
  taxAmount: 400,
  discountAmount: 200,
  total: 5200,
  amountPaid: 0,
  amountDue: 5200,
  notes: "Thank you for your business.",
  terms: "Net 30. Late payments subject to 1.5% monthly interest.",
};

const defaultLineItems: LineItem[] = [
  { id: "1", description: "Website Redesign - Phase 1", quantity: 1, unitPrice: 3000, amount: 3000 },
  { id: "2", description: "SEO Optimization Package", quantity: 1, unitPrice: 1500, amount: 1500 },
  { id: "3", description: "Monthly Hosting (12 months)", quantity: 12, unitPrice: 50, amount: 600 },
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

export function InvoiceDetail({
  invoice = defaultInvoice,
  lineItems = defaultLineItems,
}: InvoiceDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/invoices">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{invoice.invoiceNumber}</h2>
            <p className="text-sm text-gray-500">
              Created {format(new Date(invoice.issueDate), "MMMM d, yyyy")}
            </p>
          </div>
          <Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button size="sm">
            <Send className="mr-2 h-4 w-4" />
            Send
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.amount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator className="my-4" />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Discount</span>
                    <span className="text-red-600">-{formatCurrency(invoice.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span>{formatCurrency(invoice.taxAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount Paid</span>
                  <span>{formatCurrency(invoice.amountPaid)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Amount Due</span>
                  <span>{formatCurrency(invoice.amountDue)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {(invoice.notes || invoice.terms) && (
            <Card>
              <CardContent className="pt-6">
                {invoice.notes && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Notes</h4>
                    <p className="text-sm text-gray-600">{invoice.notes}</p>
                  </div>
                )}
                {invoice.terms && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium">Terms & Conditions</h4>
                    <p className="text-sm text-gray-600">{invoice.terms}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/customers/1" className="font-medium text-blue-600 hover:underline">
                {invoice.customerName}
              </Link>
              <p className="text-sm text-gray-600">{invoice.customerEmail}</p>
              <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.billingAddress}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Due Date</span>
                <span>{format(new Date(invoice.dueDate), "MMM d, yyyy")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount Due</span>
                <span className="font-bold">{formatCurrency(invoice.amountDue)}</span>
              </div>
              <Button className="w-full">
                <CreditCard className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
