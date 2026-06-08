"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  Bell,
  Search,
  ChevronDown,
  Building2,
  Inbox,
  TrendingUp,
  RefreshCw,
  Shield,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Calendar,
  Wallet,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Billing",
    items: [
      { name: "Invoices", href: "/invoices", icon: FileText },
      { name: "Customers", href: "/customers", icon: Users },
      { name: "Subscriptions", href: "/subscriptions", icon: Calendar },
      { name: "Payments", href: "/payments", icon: CreditCard },
    ],
  },
  {
    label: "Operations",
    items: [
      { name: "Collections", href: "/collections", icon: AlertCircle },
      { name: "Reconciliation", href: "/reconciliation", icon: RefreshCw },
      { name: "Reports", href: "/reports", icon: TrendingUp },
    ],
  },
];

function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[var(--sidebar-width)]"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Wallet className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-semibold tracking-tight">AR Billing</span>
          </Link>
        )}
        <button
          onClick={onToggle}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navigation.map((group) => (
          <div key={group.label} className="mb-6">
            {!collapsed && (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "sidebar-item",
                      isActive && "sidebar-item-active",
                      collapsed && "justify-center px-2"
                    )}
                    title={collapsed ? item.name : undefined}
                  >
                    <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      {!collapsed && (
        <div className="border-t p-3">
          <Link
            href="/settings"
            className={cn(
              "sidebar-item",
              pathname === "/settings" && "sidebar-item-active"
            )}
          >
            <Settings className="h-[18px] w-[18px]" />
            <span>Settings</span>
          </Link>
          <button className="sidebar-item w-full">
            <HelpCircle className="h-[18px] w-[18px]" />
            <span>Help & Support</span>
          </button>
        </div>
      )}
    </aside>
  );
}

function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card/80 backdrop-blur-xl px-6">
      {/* Search */}
      <div className="flex-1">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search invoices, customers, payments..."
            className="h-9 w-full rounded-lg border bg-muted/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>

        {/* Tenant selector */}
        <button className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-muted transition-colors">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Acme Corp</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>

        {/* Avatar */}
        <button className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary hover:bg-primary/20 transition-colors">
          JD
        </button>
      </div>
    </header>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div
        className={cn(
          "transition-all duration-300",
          collapsed ? "ml-[68px]" : "ml-[var(--sidebar-width)]"
        )}
      >
        <TopBar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
