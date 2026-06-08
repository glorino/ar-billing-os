"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, Phone, Building2, MapPin, Edit } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CustomerDetailProps {
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    taxId: string;
    currency: string;
    creditLimit: number;
    outstandingBalance: number;
    collectionStatus: string;
    paymentTermsDays: number;
    billingAddress: string;
    shippingAddress: string;
    isActive: boolean;
    createdAt: string;
  };
}

const defaultCustomer = {
  id: "1",
  name: "Acme Corp",
  email: "billing@acmecorp.com",
  phone: "+1 (555) 123-4567",
  company: "Acme Corporation",
  taxId: "US-123456789",
  currency: "USD",
  creditLimit: 50000,
  outstandingBalance: 5200,
  collectionStatus: "none",
  paymentTermsDays: 30,
  billingAddress: "123 Business St, Suite 100\nSan Francisco, CA 94105\nUnited States",
  shippingAddress: "123 Business St, Suite 100\nSan Francisco, CA 94105\nUnited States",
  isActive: true,
  createdAt: "2023-06-15T00:00:00Z",
};

const recentInvoices = [
  { id: "1", invoiceNumber: "INV-2024-001", amount: 5200, status: "sent", dueDate: "2024-02-15" },
  { id: "2", invoiceNumber: "INV-2024-002", amount: 12800, status: "paid", dueDate: "2024-02-10" },
  { id: "3", invoiceNumber: "INV-2024-003", amount: 3400, status: "overdue", dueDate: "2024-01-20" },
];

const recentPayments = [
  { id: "1", paymentNumber: "PAY-2024-001", amount: 12800, method: "credit_card", date: "2024-01-28" },
  { id: "2", paymentNumber: "PAY-2024-002", amount: 5000, method: "ach_transfer", date: "2024-01-15" },
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

export function CustomerDetail({ customer = defaultCustomer }: CustomerDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/customers">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{customer.name}</h2>
            <p className="text-sm text-gray-500">{customer.company}</p>
          </div>
          <Badge variant={customer.isActive ? "success" : "secondary"}>
            {customer.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <Button asChild>
          <Link href={`/customers/${customer.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Customer
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Outstanding</p>
                <p className="text-lg font-bold">{formatCurrency(customer.outstandingBalance)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Credit Limit</p>
                <p className="text-lg font-bold">{formatCurrency(customer.creditLimit)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Terms</p>
                <p className="text-lg font-bold">Net {customer.paymentTermsDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 text-yellow-600">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Collection Status</p>
                <p className="text-lg font-bold capitalize">{customer.collectionStatus.replace("_", " ")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Invoices</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/invoices?customer=${customer.id}`}>View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <Link href={`/invoices/${invoice.id}`} className="font-medium text-blue-600 hover:underline">
                          {invoice.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(invoice.status)}>{invoice.status}</Badge>
                      </TableCell>
                      <TableCell>{format(new Date(invoice.dueDate), "MMM d, yyyy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.paymentNumber}</TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell className="capitalize">{payment.method.replace("_", " ")}</TableCell>
                      <TableCell>{format(new Date(payment.date), "MMM d, yyyy")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{customer.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{customer.phone}</span>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Tax ID</p>
                  <p className="text-sm text-gray-600">{customer.taxId}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Currency</p>
                  <p className="text-sm text-gray-600">{customer.currency}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Addresses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Billing Address</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <p className="text-sm text-gray-600 whitespace-pre-line">{customer.billingAddress}</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Shipping Address</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <p className="text-sm text-gray-600 whitespace-pre-line">{customer.shippingAddress}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
