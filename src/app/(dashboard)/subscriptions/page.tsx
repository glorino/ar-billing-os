"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { Search, Plus, Download, RefreshCw } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const subscriptions = [
  { id: "1", number: "SUB-2024-001", customer: "Acme Corp", name: "Enterprise Plan", amount: 2500, billingCycle: "monthly", status: "active", nextBilling: "2024-02-15" },
  { id: "2", number: "SUB-2024-002", customer: "TechStart Inc", name: "Pro Plan", amount: 990, billingCycle: "monthly", status: "active", nextBilling: "2024-02-10" },
  { id: "3", number: "SUB-2024-003", customer: "Global Solutions", name: "Basic Plan", amount: 290, billingCycle: "monthly", status: "past_due", nextBilling: "2024-01-20" },
  { id: "4", number: "SUB-2024-004", customer: "Digital Ventures", name: "Enterprise Plan", amount: 5000, billingCycle: "annual", status: "active", nextBilling: "2025-01-01" },
  { id: "5", number: "SUB-2024-005", customer: "Innovate Labs", name: "Pro Plan", amount: 490, billingCycle: "monthly", status: "trialing", nextBilling: "2024-02-01" },
  { id: "6", number: "SUB-2024-006", customer: "Cloud Systems", name: "Starter Plan", amount: 190, billingCycle: "monthly", status: "cancelled", nextBilling: "N/A" },
];

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "success" | "warning" {
  const variants: Record<string, "default" | "secondary" | "destructive" | "success" | "warning"> = {
    active: "success",
    past_due: "destructive",
    trialing: "warning",
    cancelled: "secondary",
    paused: "secondary",
  };
  return variants[status] || "secondary";
}

export default function SubscriptionsPage() {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");

  const filtered = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.number.toLowerCase().includes(search.toLowerCase()) ||
      sub.customer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Subscriptions</h2>
          <p className="text-gray-500">Manage recurring subscriptions and billing cycles.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Subscription
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">Active Subscriptions</p>
              <p className="text-3xl font-bold text-green-600">4</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">Monthly Recurring Revenue</p>
              <p className="text-3xl font-bold">{formatCurrency(9380)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">Annual Recurring Revenue</p>
              <p className="text-3xl font-bold">{formatCurrency(9380 * 12)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              placeholder="Search subscriptions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-[300px]"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="past_due">Past Due</SelectItem>
              <SelectItem value="trialing">Trialing</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subscription</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Billing Cycle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Next Billing</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">{sub.number}</TableCell>
                <TableCell>{sub.customer}</TableCell>
                <TableCell>{sub.name}</TableCell>
                <TableCell>{formatCurrency(sub.amount)}</TableCell>
                <TableCell className="capitalize">{sub.billingCycle}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(sub.status)}>{sub.status.replace("_", " ")}</Badge>
                </TableCell>
                <TableCell>{sub.nextBilling === "N/A" ? "N/A" : format(new Date(sub.nextBilling), "MMM d, yyyy")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
