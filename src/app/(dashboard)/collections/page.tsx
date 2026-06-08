"use client";

import * as React from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Mail, Phone, FileText, AlertCircle, Filter } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const overdueInvoices = [
  { id: "1", invoiceNumber: "INV-2024-003", customer: "Global Solutions", amount: 3400, daysOverdue: 28, lastAction: "Email reminder sent", lastActionDate: "2024-01-20T10:30:00Z", collectionStatus: "reminder" },
  { id: "2", invoiceNumber: "INV-2024-006", customer: "Cloud Systems", amount: 10200, daysOverdue: 14, lastAction: "Phone call completed", lastActionDate: "2024-01-18T14:20:00Z", collectionStatus: "reminder" },
  { id: "3", invoiceNumber: "INV-2024-008", customer: "Net Solutions", amount: 9800, daysOverdue: 45, lastAction: "Final demand letter sent", lastActionDate: "2024-01-15T09:00:00Z", collectionStatus: "final_notice" },
];

const collectionActions = [
  { id: "1", type: "email", customer: "Global Solutions", description: "Second payment reminder", timestamp: "2024-01-20T10:30:00Z", user: "John Smith" },
  { id: "2", type: "phone", customer: "Cloud Systems", description: "Follow-up call completed", timestamp: "2024-01-18T14:20:00Z", user: "Sarah Johnson" },
  { id: "3", type: "letter", customer: "Net Solutions", description: "Final demand letter sent", timestamp: "2024-01-15T09:00:00Z", user: "John Smith" },
  { id: "4", type: "email", customer: "Acme Corp", description: "Payment plan proposal", timestamp: "2024-01-12T11:00:00Z", user: "Mike Williams" },
];

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "success" | "warning" {
  const variants: Record<string, "default" | "secondary" | "destructive" | "success" | "warning"> = {
    reminder: "warning",
    final_notice: "destructive",
    collection_agency: "destructive",
    resolved: "success",
  };
  return variants[status] || "secondary";
}

function getActivityIcon(type: string) {
  switch (type) {
    case "email": return <Mail className="h-4 w-4" />;
    case "phone": return <Phone className="h-4 w-4" />;
    case "letter": return <FileText className="h-4 w-4" />;
    case "demand": return <AlertCircle className="h-4 w-4" />;
    default: return <Mail className="h-4 w-4" />;
  }
}

function getActivityColor(type: string) {
  switch (type) {
    case "email": return "bg-blue-100 text-blue-600";
    case "phone": return "bg-green-100 text-green-600";
    case "letter": return "bg-purple-100 text-purple-600";
    case "demand": return "bg-red-100 text-red-600";
    default: return "bg-gray-100 text-gray-600";
  }
}

export default function CollectionsPage() {
  const [search, setSearch] = React.useState("");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Collections</h2>
        <p className="text-gray-500">Manage overdue invoices and collection activities.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">Overdue Invoices</p>
              <p className="text-3xl font-bold text-red-600">3</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">Amount at Risk</p>
              <p className="text-3xl font-bold text-red-600">{formatCurrency(23400)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">Avg Days Overdue</p>
              <p className="text-3xl font-bold">29</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overdue">
        <TabsList>
          <TabsTrigger value="overdue">Overdue Invoices</TabsTrigger>
          <TabsTrigger value="activity">Collection Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overdue" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Overdue Invoices Requiring Action</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Days Overdue</TableHead>
                      <TableHead>Collection Status</TableHead>
                      <TableHead>Last Action</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overdueInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <Link href={`/invoices/${invoice.id}`} className="font-medium text-blue-600 hover:underline">
                            {invoice.invoiceNumber}
                          </Link>
                        </TableCell>
                        <TableCell>{invoice.customer}</TableCell>
                        <TableCell className="font-medium text-red-600">{formatCurrency(invoice.amount)}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">{invoice.daysOverdue} days</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(invoice.collectionStatus)}>
                            {invoice.collectionStatus.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {invoice.lastAction}
                          <br />
                          <span className="text-xs">
                            {formatDistanceToNow(new Date(invoice.lastActionDate), { addSuffix: true })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm">
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Phone className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Collection Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {collectionActions.map((action) => (
                  <div key={action.id} className="flex items-start gap-4 p-4 rounded-lg border border-gray-100">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${getActivityColor(action.type)}`}>
                      {getActivityIcon(action.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{action.customer}</p>
                        <p className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(action.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">{action.description}</p>
                      <p className="text-xs text-gray-500 mt-1">by {action.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
