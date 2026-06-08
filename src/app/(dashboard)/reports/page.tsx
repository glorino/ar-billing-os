"use client";

import * as React from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatePicker } from "@/components/ui/date-picker";
import { Download, FileText, BarChart3, PieChart, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const reports = [
  { id: "1", name: "Revenue Report", description: "Monthly revenue breakdown by customer and service", lastGenerated: "2024-01-20T10:00:00Z", status: "ready" },
  { id: "2", name: "AR Aging Report", description: "Accounts receivable aging analysis", lastGenerated: "2024-01-20T09:00:00Z", status: "ready" },
  { id: "3", name: "Collections Report", description: "Collection activities and success rates", lastGenerated: "2024-01-19T16:00:00Z", status: "ready" },
  { id: "4", name: "Customer Statement", description: "Customer account statements with payment history", lastGenerated: "2024-01-19T14:00:00Z", status: "ready" },
  { id: "5", name: "Tax Summary", description: "Tax collected and owed by period", lastGenerated: "2024-01-18T11:00:00Z", status: "ready" },
  { id: "6", name: "Cash Flow Forecast", description: "Projected cash inflows and outflows", lastGenerated: null, status: "pending" },
];

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = React.useState<Date>();
  const [dateTo, setDateTo] = React.useState<Date>();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
          <p className="text-gray-500">Generate and download financial reports.</p>
        </div>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Generate Custom Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Parameters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="flex items-center gap-2">
                <DatePicker value={dateFrom} onChange={setDateFrom} placeholder="From" />
                <span className="text-gray-500">to</span>
                <DatePicker value={dateTo} onChange={setDateTo} placeholder="To" />
              </div>
            </div>
            <Button>Apply Filter</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <Badge variant={report.status === "ready" ? "success" : "warning"}>
                    {report.status}
                  </Badge>
                </div>
                <div>
                  <h3 className="font-medium">{report.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">
                    {report.lastGenerated
                      ? `Generated ${formatDistanceToNow(new Date(report.lastGenerated))}`
                      : "Not yet generated"}
                  </p>
                  <Button variant="outline" size="sm" disabled={report.status !== "ready"}>
                    <Download className="mr-2 h-3 w-3" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="financial">
        <TabsList>
          <TabsTrigger value="financial">Financial Reports</TabsTrigger>
          <TabsTrigger value="operational">Operational Reports</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Last Generated</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.filter(r => r.name.includes("Revenue") || r.name.includes("Tax") || r.name.includes("Cash Flow")).map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell>{report.description}</TableCell>
                      <TableCell>
                        {report.lastGenerated
                          ? format(new Date(report.lastGenerated), "MMM d, yyyy h:mm a")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Generate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operational" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Last Generated</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.filter(r => r.name.includes("AR") || r.name.includes("Collection")).map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell>{report.description}</TableCell>
                      <TableCell>
                        {report.lastGenerated
                          ? format(new Date(report.lastGenerated), "MMM d, yyyy h:mm a")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Generate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="mt-4">
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-gray-500">Compliance reports will be available soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}
