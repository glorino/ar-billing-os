import Link from "next/link"
import {
  FileText,
  CreditCard,
  BarChart3,
  Shield,
  Zap,
  Brain,
  Globe,
  ArrowRight,
  CheckCircle,
  Clock,
  TrendingUp,
  Lock,
  RefreshCw,
  Layers,
} from "lucide-react"

const detailedFeatures = [
  {
    icon: FileText,
    title: "Invoice Automation",
    description: "Create, customize, and send invoices in seconds. Automate recurring billing, apply smart templates, and eliminate manual data entry with AI-powered invoice generation.",
    highlights: ["Smart templates", "Recurring billing", "Bulk send", "Auto-capture data"],
    mockup: (
      <div className="relative rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-3 w-24 rounded bg-primary/20" />
            <div className="h-3 w-16 rounded bg-muted" />
          </div>
          <div className="h-px bg-border" />
          {["INV-2024-001", "INV-2024-002", "INV-2024-003"].map((inv) => (
            <div key={inv} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-xs font-medium text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-medium">{inv}</div>
                  <div className="text-[10px] text-muted-foreground">Acme Corp</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium">$2,450.00</div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-500">
                  <CheckCircle className="h-3 w-3" /> Paid
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: TrendingUp,
    title: "Smart Collections",
    description: "Automate your collections workflow with AI-driven dunning strategies. Prioritize accounts by risk score, send personalized reminders, and accelerate cash flow.",
    highlights: ["AI risk scoring", "Smart reminders", "Escalation rules", "Payment plans"],
    mockup: (
      <div className="relative rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-20 rounded bg-primary/20" />
            <div className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-500">
              On Track
            </div>
          </div>
          <div className="space-y-2">
            {[
              { name: "Overdue", count: 12, color: "bg-red-500" },
              { name: "Due Soon", count: 8, color: "bg-amber-500" },
              { name: "Current", count: 45, color: "bg-emerald-500" },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${item.color}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span>{item.name}</span>
                    <span className="text-muted-foreground">{item.count}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${(item.count / 65) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: CreditCard,
    title: "Payment Processing",
    description: "Accept payments through ACH, wire transfer, credit cards, and international methods. Real-time reconciliation automatically matches payments to invoices.",
    highlights: ["ACH & Wire", "Credit cards", "Auto-reconciliation", "Multi-bank"],
    mockup: (
      <div className="relative rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {["ACH", "Wire", "Card"].map((method) => (
              <div key={method} className="rounded-lg border border-border p-3 text-center">
                <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded bg-primary/10">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <div className="text-[10px] font-medium">{method}</div>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-border p-3">
            <div className="text-[10px] text-muted-foreground mb-1">Latest Transaction</div>
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium">$5,200.00 - Wire</div>
              <div className="text-[10px] text-emerald-500">Confirmed</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: BarChart3,
    title: "Revenue Analytics",
    description: "Real-time dashboards and reports give you complete visibility into your AR performance. Track DSO, aging buckets, collection rates, and cash flow forecasts.",
    highlights: ["Real-time dashboards", "DSO tracking", "Custom reports", "Cash flow forecast"],
    mockup: (
      <div className="relative rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-border p-2">
              <div className="text-[10px] text-muted-foreground">DSO</div>
              <div className="text-sm font-bold text-primary">32 days</div>
            </div>
            <div className="rounded-lg border border-border p-2">
              <div className="text-[10px] text-muted-foreground">Collected</div>
              <div className="text-sm font-bold text-emerald-500">$1.2M</div>
            </div>
          </div>
          <div className="rounded-lg border border-border p-3">
            <div className="text-[10px] text-muted-foreground mb-2">Revenue Trend</div>
            <div className="flex items-end gap-1 h-16">
              {[40, 55, 45, 65, 70, 80, 75, 90].map((h, i) => (
                <div key={i} className="flex-1 rounded-t bg-primary/30" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Brain,
    title: "AI Forecasting",
    description: "Predict payment behavior, forecast cash flow, and optimize collection strategies using machine learning models trained on millions of transactions.",
    highlights: ["Payment prediction", "Cash flow forecasting", "Risk assessment", "Strategy optimization"],
    mockup: (
      <div className="relative rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <div className="text-xs font-medium">AI Insights</div>
          </div>
          <div className="rounded-lg border border-border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px]">Prediction Accuracy</span>
              <span className="text-[10px] font-medium text-primary">94.2%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted">
              <div className="h-full w-[94%] rounded-full bg-primary" />
            </div>
          </div>
          <div className="rounded-lg border border-border p-3">
            <div className="text-[10px] text-muted-foreground mb-1">Next 30 Days Forecast</div>
            <div className="text-sm font-bold">$847,200</div>
            <div className="text-[10px] text-emerald-500">+12% vs last month</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Shield,
    title: "Fraud Detection",
    description: "Real-time anomaly detection and pattern recognition identify suspicious transactions before they cause harm. Protect your business with intelligent monitoring.",
    highlights: ["Real-time monitoring", "Pattern detection", "Alert system", "Audit trails"],
    mockup: (
      <div className="relative rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-medium">System Status</span>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-500">
              All Clear
            </span>
          </div>
          <div className="space-y-2">
            {["Duplicate invoice detected", "Unusual payment pattern", "High-risk vendor"].map((alert, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-border p-2">
                <div className={`h-2 w-2 rounded-full ${i === 0 ? "bg-amber-500" : i === 1 ? "bg-blue-500" : "bg-emerald-500"}`} />
                <span className="text-[10px]">{alert}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Globe,
    title: "Tax Engine",
    description: "Automatically calculate, apply, and remit taxes across jurisdictions. Stay compliant with ever-changing tax regulations with built-in tax management.",
    highlights: ["Auto-calculation", "Multi-jurisdiction", "Compliance updates", "Tax reporting"],
    mockup: (
      <div className="relative rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="space-y-3">
          {[
            { region: "United States", rate: "8.25%", type: "Sales Tax" },
            { region: "European Union", rate: "21%", type: "VAT" },
            { region: "United Kingdom", rate: "20%", type: "VAT" },
          ].map((tax) => (
            <div key={tax.region} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <div className="text-xs font-medium">{tax.region}</div>
                <div className="text-[10px] text-muted-foreground">{tax.type}</div>
              </div>
              <div className="text-xs font-bold text-primary">{tax.rate}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: Layers,
    title: "Multi-Currency",
    description: "Handle international transactions with real-time exchange rates, automatic currency conversion, and multi-currency reporting across your global operations.",
    highlights: ["Real-time rates", "Auto-conversion", "Multi-currency reports", "FX hedging"],
    mockup: (
      <div className="relative rounded-xl border border-border bg-card p-6 shadow-lg">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {[
              { code: "USD", flag: "🇺🇸", amount: "$125,000" },
              { code: "EUR", flag: "🇪🇺", amount: "€98,500" },
              { code: "GBP", flag: "🇬🇧", amount: "£82,300" },
              { code: "JPY", flag: "🇯🇵", amount: "¥14.2M" },
            ].map((c) => (
              <div key={c.code} className="rounded-lg border border-border p-2 text-center">
                <div className="text-lg">{c.flag}</div>
                <div className="text-[10px] font-medium">{c.code}</div>
                <div className="text-[10px] text-muted-foreground">{c.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
]

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-24 sm:py-32 text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Powerful Features for
            <br />
            <span className="text-primary">Modern Finance</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Every tool you need to streamline accounts receivable, accelerate collections, and maximize cash flow.
          </p>
        </div>
      </section>

      {/* Feature Sections */}
      {detailedFeatures.map((feature, i) => (
        <section key={feature.title} className={`py-24 ${i % 2 === 1 ? "bg-card/50 border-y border-border" : ""}`}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className={`grid gap-12 lg:grid-cols-2 items-center ${i % 2 === 1 ? "lg:[direction:rtl]" : ""}`}>
              <div className="lg:[direction:ltr]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold">{feature.title}</h2>
                <p className="mt-4 text-muted-foreground">{feature.description}</p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {feature.highlights.map((h) => (
                    <div key={h} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                      {h}
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:[direction:ltr]">{feature.mockup}</div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">Experience the full power of AR Billing OS</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Start your free trial today and see how these features can transform your finance operations.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex h-11 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-11 items-center rounded-lg border border-border px-6 text-sm font-medium hover:bg-card transition-colors"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
