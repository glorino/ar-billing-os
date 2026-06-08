import Link from "next/link"
import {
  FileText,
  Users,
  CreditCard,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Clock,
  Star,
} from "lucide-react"

const features = [
  { icon: FileText, title: "Invoice Management", description: "Create, send, and track invoices automatically with smart templates and scheduling." },
  { icon: Users, title: "Customer Accounts", description: "Maintain detailed customer profiles with complete transaction history and credit management." },
  { icon: CreditCard, title: "Payment Processing", description: "Accept payments via ACH, wire, credit card, and international transfers with real-time reconciliation." },
  { icon: BarChart3, title: "Revenue Analytics", description: "Gain deep insights into cash flow, aging reports, and revenue forecasting with real-time dashboards." },
  { icon: Shield, title: "Fraud Detection", description: "AI-powered anomaly detection prevents fraudulent transactions before they happen." },
  { icon: Zap, title: "AI-Powered", description: "Machine learning algorithms optimize collections, predict payment behavior, and automate workflows." },
]

const stats = [
  { value: "$2B+", label: "Processed" },
  { value: "100M+", label: "Invoices" },
  { value: "99.99%", label: "Uptime" },
]

const testimonials = [
  {
    quote: "AR Billing OS transformed our collections process. We reduced DSO by 40% in just three months.",
    author: "Sarah Chen",
    role: "CFO, TechCorp",
    rating: 5,
  },
  {
    quote: "The AI forecasting is incredibly accurate. It's like having a crystal ball for cash flow management.",
    author: "Michael Rodriguez",
    role: "VP Finance, GrowthCo",
    rating: 5,
  },
  {
    quote: "Best AR platform we've used. The automation saves our team 20+ hours per week on manual tasks.",
    author: "Emily Watson",
    role: "Controller, ScaleUp Inc",
    rating: 5,
  },
]

const integrations = ["Stripe", "QuickBooks", "Xero", "Sage", "NetSuite", "Salesforce"]

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            The Modern Accounts
            <br />
            <span className="text-primary">Receivable Platform</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Automate invoicing, accelerate collections, and gain real-time visibility into your revenue pipeline with AI-powered AR management.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex h-11 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-11 items-center rounded-lg border border-border px-6 text-sm font-medium hover:bg-card transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-12 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground mb-8">
            Trusted by forward-thinking finance teams
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            {integrations.map((name) => (
              <div key={name} className="text-lg font-semibold text-muted-foreground/60">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Everything you need</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              A complete suite of tools to manage your entire accounts receivable lifecycle.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-border bg-card p-6 hover:shadow-md transition-all"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Infographic */}
      <section className="py-24 bg-card/50 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">How It Works</h2>
            <p className="mt-4 text-muted-foreground">Streamlined from invoice creation to payment reconciliation</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "01", title: "Create Invoice", description: "Generate invoices from templates or integrate directly with your ERP." },
              { step: "02", title: "Send & Track", description: "Automatically deliver invoices via email and track open rates in real-time." },
              { step: "03", title: "Collect Payment", description: "Offer multiple payment methods and send smart reminders for overdue invoices." },
              { step: "04", title: "Reconcile", description: "AI automatically matches payments to invoices and updates your books." },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-primary">{s.value}</div>
                <div className="mt-2 text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-card/50 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">What our customers say</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.author} className="rounded-xl border border-border bg-card p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <div className="font-semibold text-sm">{t.author}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">Ready to transform your AR?</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Join hundreds of finance teams who have modernized their accounts receivable process.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex h-11 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-11 items-center rounded-lg border border-border px-6 text-sm font-medium hover:bg-card transition-colors"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
