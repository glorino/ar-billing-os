"use client";

import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

interface InvoicePDFPreviewProps {
  invoice?: {
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    status: string;
    customerName: string;
    customerEmail: string;
    billingAddress: string;
    lineItems: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      amount: number;
    }>;
    subtotal: number;
    taxAmount: number;
    discountAmount: number;
    total: number;
    notes?: string;
    terms?: string;
  };
}

const defaultInvoice = {
  invoiceNumber: "INV-2024-001",
  issueDate: "2024-01-15",
  dueDate: "2024-02-15",
  status: "sent",
  customerName: "Acme Corp",
  customerEmail: "billing@acmecorp.com",
  billingAddress: "123 Business St, Suite 100\nSan Francisco, CA 94105\nUnited States",
  lineItems: [
    { description: "Website Redesign - Phase 1", quantity: 1, unitPrice: 3000, amount: 3000 },
    { description: "SEO Optimization Package", quantity: 1, unitPrice: 1500, amount: 1500 },
    { description: "Monthly Hosting (12 months)", quantity: 12, unitPrice: 50, amount: 600 },
  ],
  subtotal: 5000,
  taxAmount: 400,
  discountAmount: 200,
  total: 5200,
  notes: "Thank you for your business.",
  terms: "Net 30. Late payments subject to 1.5% monthly interest.",
};

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

export function InvoicePDFPreview({ invoice = defaultInvoice }: InvoicePDFPreviewProps) {
  return (
    <Card className="max-w-[800px] mx-auto">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
            <p className="text-lg text-gray-600 mt-1">{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <Badge variant={getStatusVariant(invoice.status)} className="text-sm">
              {invoice.status.toUpperCase()}
            </Badge>
            <div className="mt-4 space-y-1">
              <p className="text-sm">
                <span className="text-gray-500">Issue Date:</span>{" "}
                {format(new Date(invoice.issueDate), "MMM d, yyyy")}
              </p>
              <p className="text-sm">
                <span className="text-gray-500">Due Date:</span>{" "}
                {format(new Date(invoice.dueDate), "MMM d, yyyy")}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 mb-8 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">From</h3>
            <p className="font-medium">Your Company Name</p>
            <p className="text-sm text-gray-600">123 Main Street</p>
            <p className="text-sm text-gray-600">City, State 12345</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Bill To</h3>
            <p className="font-medium">{invoice.customerName}</p>
            <p className="text-sm text-gray-600">{invoice.customerEmail}</p>
            <p className="text-sm text-gray-600 whitespace-pre-line">{invoice.billingAddress}</p>
          </div>
        </div>

        <table className="w-full mb-8">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-3 text-left text-sm font-medium text-gray-500">Description</th>
              <th className="py-3 text-right text-sm font-medium text-gray-500">Qty</th>
              <th className="py-3 text-right text-sm font-medium text-gray-500">Unit Price</th>
              <th className="py-3 text-right text-sm font-medium text-gray-500">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-3 text-sm">{item.description}</td>
                <td className="py-3 text-right text-sm">{item.quantity}</td>
                <td className="py-3 text-right text-sm">{formatCurrency(item.unitPrice)}</td>
                <td className="py-3 text-right text-sm font-medium">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2">
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
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{formatCurrency(invoice.total)}</span>
            </div>
          </div>
        </div>

        {(invoice.notes || invoice.terms) && (
          <div className="border-t border-gray-200 pt-6 space-y-4">
            {invoice.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Notes</h4>
                <p className="text-sm text-gray-600">{invoice.notes}</p>
              </div>
            )}
            {invoice.terms && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Terms & Conditions</h4>
                <p className="text-sm text-gray-600">{invoice.terms}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
