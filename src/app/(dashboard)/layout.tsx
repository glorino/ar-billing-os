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
  Inbox,
  TrendingUp,
  RefreshCw,
  HelpCircle,
  Menu,
  Wallet,
  AlertCircle,
  Sun,
  Moon,
  Calendar,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Role = "admin" | "manager" | "viewer";

const allNavigation = [
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
  {
    label: "Admin",
    items: [
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

function getNavigationForRole(role: Role) {
  if (role === "admin") {
    return allNavigation;
  }

  if (role === "manager") {
    return allNavigation.filter((group) => group.label !== "Admin");
  }

  // viewer: Dashboard, Analytics, Invoices, Customers, Reports
  const viewerAllowed = ["Dashboard", "Analytics", "Invoices", "Customers", "Reports"];
  return allNavigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => viewerAllowed.includes(item.name)),
    }))
    .filter((group) => group.items.length > 0);
}

function Sidebar({
  collapsed,
  onToggle,
  role,
}: {
  collapsed: boolean;
  onToggle: () => void;
  role: Role;
}) {
  const pathname = usePathname();
  const navigation = getNavigationForRole(role);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      {/* Logo Section */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-border transition-all duration-300",
          collapsed ? "justify-center px-2" : "justify-between px-5"
        )}
      >
        {!collapsed ? (
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 shadow-lg shadow-purple-500/20">
              <Wallet className="h-[18px] w-[18px] text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold tracking-tight text-foreground">
                AR Billing
              </span>
              <span className="rounded-md bg-gradient-to-r from-purple-500 to-indigo-500 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm">
                Enterprise
              </span>
            </div>
          </Link>
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-600 shadow-lg shadow-purple-500/20">
            <Wallet className="h-[18px] w-[18px] text-white" />
          </div>
        )}
        <button
          onClick={onToggle}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
            collapsed && "hidden"
          )}
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {/* Expand button when collapsed */}
        {collapsed && (
          <div className="mb-3 flex justify-center">
            <button
              onClick={onToggle}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {navigation.map((group) => (
          <div key={group.label} className="mb-5">
            {!collapsed && (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50">
                {group.label}
              </p>
            )}
            {collapsed && <div className="mb-2 h-px bg-border mx-2" />}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <div key={item.name} className="relative group">
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200 ease-in-out",
                        collapsed && "justify-center px-2",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-gradient-to-b from-purple-600 to-indigo-600" />
                      )}
                      <item.icon
                        className={cn(
                          "h-[18px] w-[18px] flex-shrink-0 transition-colors duration-200",
                          isActive
                            ? "text-primary"
                            : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      {!collapsed && <span>{item.name}</span>}
                    </Link>
                    {/* Tooltip for collapsed state */}
                    {collapsed && (
                      <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 rounded-lg border border-border bg-popover px-3 py-1.5 text-sm font-medium text-popover-foreground shadow-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        {item.name}
                        <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 h-2 w-2 rotate-45 border-l border-b border-border bg-popover" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-border px-3 py-3">
        {!collapsed ? (
          <>
            <Link
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-muted-foreground transition-all duration-200 hover:bg-muted/50 hover:text-foreground"
            >
              <HelpCircle className="h-[18px] w-[18px]" />
              <span>Help & Support</span>
            </Link>

            {/* User Profile */}
            <div className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50 cursor-pointer">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-xs font-bold text-white shadow-md shadow-purple-500/20">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">
                  John Doe
                </p>
                <p className="text-[11px] text-muted-foreground capitalize">{role}</p>
              </div>
              <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="group relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-xs font-bold text-white shadow-md shadow-purple-500/20">
                JD
              </div>
              <div className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 rounded-lg border border-border bg-popover px-3 py-1.5 text-sm font-medium text-popover-foreground shadow-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100 whitespace-nowrap">
                John Doe - <span className="capitalize">{role}</span>
                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 h-2 w-2 rotate-45 border-l border-b border-border bg-popover" />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function TopBar({ role, onRoleChange }: { role: Role; onRoleChange: (r: Role) => void }) {
  const [searchFocused, setSearchFocused] = useState(false);

  const roles: Role[] = ["admin", "manager", "viewer"];

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-card/80 backdrop-blur-xl px-6">
      {/* Left: Page title area */}
      <div className="flex items-center gap-3">
        <h1 className="text-[15px] font-semibold text-foreground">Dashboard</h1>
      </div>

      {/* Center: Search */}
      <div className="flex flex-1 justify-center">
        <div
          className={cn(
            "relative w-full max-w-md transition-all duration-200",
            searchFocused && "max-w-lg"
          )}
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search invoices, customers, payments..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={cn(
              "h-9 w-full rounded-lg border bg-muted/40 pl-9 pr-12 text-sm transition-all duration-200 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30",
              searchFocused
                ? "border-primary/30 bg-muted/60"
                : "border-border"
            )}
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-sm">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        {/* Role Switcher */}
        <div className="flex items-center rounded-full border border-border bg-muted/30 p-0.5">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => onRoleChange(r)}
              className={cn(
                "rounded-full px-3 py-1 text-[11px] font-semibold capitalize transition-all duration-200",
                role === r
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="mx-1.5 h-6 w-px bg-border" />

        {/* Notification bell */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-card" />
        </button>

        {/* Theme toggle */}
        <button className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>

        {/* Divider */}
        <div className="mx-1.5 h-6 w-px bg-border" />

        {/* User avatar */}
        <button className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-xs font-bold text-white shadow-sm">
            JD
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
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
  const [role, setRole] = useState<Role>("admin");

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        role={role}
      />

      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          collapsed ? "ml-[68px]" : "ml-[260px]"
        )}
      >
        <TopBar role={role} onRoleChange={setRole} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
