"use client";

import { useState } from "react";
import {
  Save,
  Building2,
  CreditCard,
  Bell,
  Shield,
  Users,
  Mail,
  Globe,
  Lock,
  Key,
  ChevronRight,
  Check,
} from "lucide-react";

type Tab = "general" | "billing" | "notifications" | "security" | "team";

const tabs: { id: Tab; label: string; icon: typeof Building2; gradient: string }[] = [
  { id: "general", label: "General", icon: Building2, gradient: "from-blue-500 to-cyan-500" },
  { id: "billing", label: "Billing", icon: CreditCard, gradient: "from-violet-500 to-purple-500" },
  { id: "notifications", label: "Notifications", icon: Bell, gradient: "from-amber-500 to-orange-500" },
  { id: "security", label: "Security", icon: Shield, gradient: "from-emerald-500 to-green-500" },
  { id: "team", label: "Team", icon: Users, gradient: "from-pink-500 to-rose-500" },
];

const notifications = [
  { label: "Invoice sent", description: "When an invoice is sent to a customer", enabled: true },
  { label: "Payment received", description: "When a payment is successfully processed", enabled: true },
  { label: "Invoice overdue", description: "When an invoice becomes overdue", enabled: true },
  { label: "Payment failed", description: "When a payment attempt fails", enabled: true },
  { label: "Subscription cancelled", description: "When a customer cancels their subscription", enabled: false },
  { label: "New customer created", description: "When a new customer account is created", enabled: true },
];

const teamMembers = [
  { name: "John Smith", email: "john@arbilling.com", role: "Admin", initials: "JS", gradient: "from-violet-500 to-purple-500" },
  { name: "Sarah Johnson", email: "sarah@arbilling.com", role: "Manager", initials: "SJ", gradient: "from-blue-500 to-cyan-500" },
  { name: "Mike Williams", email: "mike@arbilling.com", role: "Agent", initials: "MW", gradient: "from-emerald-500 to-green-500" },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [companyName, setCompanyName] = useState("Acme Corp");
  const [email, setEmail] = useState("billing@acmecorp.com");
  const [phone, setPhone] = useState("+1 (555) 123-4567");
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("America/New_York");

  const activeGradient = tabs.find((t) => t.id === activeTab)?.gradient || "from-blue-500 to-cyan-500";

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-violet-600 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
            Settings
          </span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account, billing preferences, and team access.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_1fr]">
        <nav className="flex lg:flex-col gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg shadow-${tab.id === "general" ? "blue" : tab.id === "billing" ? "violet" : tab.id === "notifications" ? "amber" : tab.id === "security" ? "emerald" : "pink"}-500/25`
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          {activeTab === "general" && (
            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-lg">
                <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-2xl" />
                <div className="flex items-center gap-4 mb-6 relative z-10">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-xl font-extrabold text-white shadow-lg shadow-blue-500/25">
                    AC
                  </div>
                  <div>
                    <h3 className="text-base font-bold">{companyName}</h3>
                    <p className="text-sm text-muted-foreground">{email}</p>
                  </div>
                </div>
                <div className="h-px bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-transparent mb-6" />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 relative z-10">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="h-10 w-full rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/40 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-10 w-full rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/40 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-10 w-full rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/40 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="h-10 w-full rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/40 transition-all"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="h-10 w-full rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/40 transition-all"
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Website</label>
                    <input
                      type="url"
                      placeholder="https://example.com"
                      className="h-10 w-full rounded-xl border bg-background px-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/40 transition-all"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-6 relative z-10">
                  <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-lg">
                <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-2xl" />
                <h3 className="text-base font-bold mb-1 relative z-10">Invoice Defaults</h3>
                <p className="text-sm text-muted-foreground mb-6 relative z-10">Set default values for new invoices.</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 relative z-10">
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Payment Terms</label>
                    <select className="h-10 w-full rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/40 transition-all">
                      <option>Net 15</option>
                      <option selected>Net 30</option>
                      <option>Net 45</option>
                      <option>Net 60</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold">Tax Rate (%)</label>
                    <input
                      type="number"
                      defaultValue="8"
                      min="0"
                      max="100"
                      step="0.1"
                      className="h-10 w-full rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400/40 transition-all"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-6 relative z-10">
                  <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-lg">
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br from-violet-500/10 to-purple-500/10 blur-2xl" />
              <h3 className="text-base font-bold mb-1 relative z-10">Payment Gateways</h3>
              <p className="text-sm text-muted-foreground mb-6 relative z-10">Configure your connected payment providers.</p>
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-200 group">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-md shadow-violet-500/20 group-hover:shadow-lg group-hover:shadow-violet-500/30 transition-all">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Stripe</p>
                      <p className="text-xs text-muted-foreground">Credit cards, digital wallets</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-200 group">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-md shadow-emerald-500/20 group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-all">
                      <CreditCard className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Paystack</p>
                      <p className="text-xs text-muted-foreground">Africa-focused payments</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-200 group">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-300 to-gray-400 dark:from-slate-600 dark:to-slate-700 shadow-md transition-all">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">ACH Transfer</p>
                      <p className="text-xs text-muted-foreground">Bank transfers</p>
                    </div>
                  </div>
                  <button className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                    Enable
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-lg">
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/10 blur-2xl" />
              <h3 className="text-base font-bold mb-1 relative z-10">Email Notifications</h3>
              <p className="text-sm text-muted-foreground mb-6 relative z-10">Configure when to send email notifications.</p>
              <div className="space-y-2 relative z-10">
                {notifications.map((n, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-200">
                    <div>
                      <p className="text-sm font-bold">{n.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.description}</p>
                    </div>
                    <button
                      className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-all duration-300 ${
                        n.enabled
                          ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-md shadow-amber-500/25"
                          : "bg-muted"
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                          n.enabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-6 relative z-10">
                <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                  <Save className="h-4 w-4" />
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-lg">
                <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500/10 to-green-500/10 blur-2xl" />
                <h3 className="text-base font-bold mb-1 relative z-10">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground mb-6 relative z-10">Add an extra layer of security to your account.</p>
                <div className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-200 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-md shadow-emerald-500/20">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Authenticator App</p>
                      <p className="text-xs text-muted-foreground">Use an authenticator app for 2FA</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20">
                    <Check className="h-3 w-3" />
                    Enabled
                  </span>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-lg">
                <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-500/10 to-green-500/10 blur-2xl" />
                <h3 className="text-base font-bold mb-1 relative z-10">API Keys</h3>
                <p className="text-sm text-muted-foreground mb-6 relative z-10">Manage your API keys for integrations.</p>
                <div className="space-y-3 relative z-10">
                  <div className="p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold">Production API Key</p>
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm shadow-emerald-500/20">Active</span>
                    </div>
                    <input
                      type="password"
                      value="sk_live_xxxxxxxxxxxxxxxx"
                      readOnly
                      className="h-10 w-full rounded-xl border bg-background px-3 text-sm font-mono"
                    />
                  </div>
                  <div className="p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold">Test API Key</p>
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-slate-300 to-gray-400 dark:from-slate-600 dark:to-slate-700 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">Test</span>
                    </div>
                    <input
                      type="password"
                      value="sk_test_xxxxxxxxxxxxxxxx"
                      readOnly
                      className="h-10 w-full rounded-xl border bg-background px-3 text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "team" && (
            <div className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-lg">
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br from-pink-500/10 to-rose-500/10 blur-2xl" />
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div>
                  <h3 className="text-base font-bold">Team Members</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Manage who has access to your account.</p>
                </div>
                <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                  <Users className="h-4 w-4" />
                  Invite Member
                </button>
              </div>
              <div className="space-y-3 relative z-10">
                {teamMembers.map((member) => (
                  <div key={member.email} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-200 group">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${member.gradient} text-sm font-extrabold text-white shadow-md shadow-${member.gradient.includes("violet") ? "violet" : member.gradient.includes("blue") ? "blue" : "emerald"}-500/20 group-hover:shadow-lg transition-all`}>
                        {member.initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
                        {member.role}
                      </span>
                      <button className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
