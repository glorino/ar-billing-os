"use client";

import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Users,
  Settings,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Search,
} from "lucide-react";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: FileText, label: "Invoices" },
  { icon: CreditCard, label: "Payments" },
  { icon: Users, label: "Customers" },
  { icon: Settings, label: "Settings" },
];

const metrics = [
  { label: "Total Outstanding", value: "$284,500", change: "+12%", up: true },
  { label: "Collected (MTD)", value: "$156,200", change: "+8%", up: true },
  { label: "Overdue", value: "$23,400", change: "+3%", up: false },
];

const chartBars = [65, 45, 80, 55, 90, 70, 95, 60, 85, 75, 88, 92];

const invoices = [
  { id: "INV-2847", customer: "Acme Corp", amount: "$12,500", status: "Paid", statusColor: "bg-emerald-500/10 text-emerald-600" },
  { id: "INV-2846", customer: "TechStart Inc", amount: "$8,200", status: "Pending", statusColor: "bg-amber-500/10 text-amber-600" },
  { id: "INV-2845", customer: "Global Solutions", amount: "$24,000", status: "Overdue", statusColor: "bg-red-500/10 text-red-600" },
  { id: "INV-2844", customer: "Nexus Labs", amount: "$6,800", status: "Paid", statusColor: "bg-emerald-500/10 text-emerald-600" },
  { id: "INV-2843", customer: "DataFlow LLC", amount: "$15,300", status: "Processing", statusColor: "bg-blue-500/10 text-blue-600" },
];

export function ProductMockup() {
  return (
    <div className="relative rounded-xl border bg-card shadow-2xl shadow-primary/10 overflow-hidden">
      {/* Browser top bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-background/80 rounded-md px-32 py-1 text-xs text-muted-foreground border">
            app.arbilling.io/dashboard
          </div>
        </div>
        <div className="w-16" />
      </div>

      {/* Dashboard content */}
      <div className="flex min-h-[480px]">
        {/* Sidebar */}
        <div className="w-56 border-r bg-muted/20 p-3 space-y-1 hidden sm:block">
          <div className="flex items-center gap-2 px-3 py-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
              AR
            </div>
            <span className="font-semibold text-sm">AR Billing</span>
          </div>
          {sidebarItems.map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                item.active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 space-y-4 overflow-hidden">
          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg border bg-background p-4 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                  {metric.label === "Total Outstanding" ? (
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                  ) : metric.label === "Collected (MTD)" ? (
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <p className="text-2xl font-bold font-mono-nums">{metric.value}</p>
                <p className={`text-xs ${metric.up ? "text-emerald-600" : "text-red-600"}`}>
                  {metric.change} vs last month
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Bar chart */}
            <div className="lg:col-span-2 rounded-lg border bg-background p-4">
              <p className="text-sm font-medium mb-3">Collections Trend</p>
              <div className="flex items-end gap-1.5 h-32">
                {chartBars.map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-primary/20 hover:bg-primary/40 transition-colors"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-muted-foreground">Jan</span>
                <span className="text-[10px] text-muted-foreground">Jun</span>
                <span className="text-[10px] text-muted-foreground">Dec</span>
              </div>
            </div>

            {/* Invoice table */}
            <div className="lg:col-span-3 rounded-lg border bg-background overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <p className="text-sm font-medium">Recent Invoices</p>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    placeholder="Search..."
                    className="pl-7 pr-3 py-1 text-xs rounded-md border bg-background w-32"
                    readOnly
                  />
                </div>
              </div>
              <div className="divide-y">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between px-4 py-2.5 text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono-nums text-xs text-muted-foreground">
                        {invoice.id}
                      </span>
                      <span className="font-medium">{invoice.customer}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono-nums text-xs">{invoice.amount}</span>
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${invoice.statusColor}`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}