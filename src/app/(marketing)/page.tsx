"use client"

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
  Send,
  RotateCcw,
} from "lucide-react"

import DashboardPreview from "@/components/marketing/dashboard-preview"
import PaymentFlow from "@/components/marketing/payment-flow"
import TeamIllustration from "@/components/marketing/team-illustration"

const features = [
  { icon: FileText, title: "Invoice Management", description: "Create, send, and track invoices automatically with smart templates and scheduling.", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { icon: Users, title: "Customer Accounts", description: "Maintain detailed customer profiles with complete transaction history and credit management.", gradient: "linear-gradient(135deg, #667eea 0%, #4facfe 100%)" },
  { icon: CreditCard, title: "Payment Processing", description: "Accept payments via ACH, wire, credit card, and international transfers with real-time reconciliation.", gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
  { icon: BarChart3, title: "Revenue Analytics", description: "Gain deep insights into cash flow, aging reports, and revenue forecasting with real-time dashboards.", gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
  { icon: Shield, title: "Fraud Detection", description: "AI-powered anomaly detection prevents fraudulent transactions before they happen.", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { icon: Zap, title: "AI-Powered", description: "Machine learning algorithms optimize collections, predict payment behavior, and automate workflows.", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
]

const stats = [
  { value: "$2B+", label: "Processed", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { value: "100M+", label: "Invoices", gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
  { value: "99.99%", label: "Uptime", gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
]

const testimonials = [
  {
    quote: "AR Billing OS transformed our collections process. We reduced DSO by 40% in just three months.",
    author: "Sarah Chen",
    role: "CFO, TechCorp",
    rating: 5,
    borderColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    quote: "The AI forecasting is incredibly accurate. It's like having a crystal ball for cash flow management.",
    author: "Michael Rodriguez",
    role: "VP Finance, GrowthCo",
    rating: 5,
    borderColor: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  },
  {
    quote: "Best AR platform we've used. The automation saves our team 20+ hours per week on manual tasks.",
    author: "Emily Watson",
    role: "Controller, ScaleUp Inc",
    rating: 5,
    borderColor: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  },
]

const integrations = ["Stripe", "QuickBooks", "Xero", "Sage", "NetSuite", "Salesforce"]

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        {/* Floating gradient orbs */}
        <div
          className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl opacity-30 animate-pulse"
          style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
        />
        <div
          className="absolute top-40 right-20 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)", animation: "float 6s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-10 left-1/3 w-80 h-80 rounded-full blur-3xl opacity-25"
          style={{ background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)", animation: "float 8s ease-in-out infinite reverse" }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Beta badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-1.5 text-sm font-medium text-purple-700 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500"></span>
            </span>
            Now in Public Beta
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight">
            The Modern Accounts
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #4facfe 100%)" }}
            >
              Receivable Platform
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Automate invoicing, accelerate collections, and gain real-time visibility into your revenue pipeline with AI-powered AR management.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex h-12 items-center rounded-xl px-8 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center rounded-xl border-2 border-purple-300 bg-white px-8 text-sm font-semibold text-purple-700 hover:bg-purple-50 transition-all hover:scale-105"
            >
              View Pricing
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-16">
            <p className="text-sm text-muted-foreground mb-6">Trusted by forward-thinking finance teams worldwide</p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
              {integrations.map((name) => (
                <div key={name} className="flex items-center gap-2 text-lg font-semibold text-muted-foreground/50 hover:text-muted-foreground/80 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-xs font-bold text-purple-600">
                    {name.charAt(0)}
                  </div>
                  {name}
                </div>
              ))}
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}</style>
      </section>

      {/* Product Preview */}
      <section className="py-16 relative">
        <div className="mx-auto max-w-6xl px-4">
          <div className="relative rounded-2xl border border-border shadow-2xl overflow-hidden bg-card">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5" />
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5 text-sm font-medium text-purple-700 mb-4">
              <Zap className="h-4 w-4" />
              Features
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold">Everything you need</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              A complete suite of tools to manage your entire accounts receivable lifecycle.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-border bg-card p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                style={{ borderLeft: `4px solid transparent`, borderImage: `${f.gradient} 1`, borderLeftColor: "transparent" }}
              >
                <div
                  className="absolute top-0 left-0 w-1 h-full"
                  style={{ background: f.gradient }}
                />
                <div className="ml-2">
                  <div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg"
                    style={{ background: f.gradient }}
                  >
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Infographic */}
      <section className="py-24 bg-card/50 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1.5 text-sm font-medium text-blue-700 mb-4">
              <Clock className="h-4 w-4" />
              Workflow
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold">How It Works</h2>
            <p className="mt-4 text-muted-foreground">Streamlined from invoice creation to payment reconciliation</p>
          </div>
          <div className="relative">
            {/* Dashed connector line */}
            <div className="hidden lg:block absolute top-10 left-[15%] right-[15%] h-[2px] border-t-2 border-dashed border-purple-300" />

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 relative">
              {[
                { step: "01", title: "Create Invoice", description: "Generate invoices from templates or integrate directly with your ERP.", icon: FileText, gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
                { step: "02", title: "Send & Track", description: "Automatically deliver invoices via email and track open rates in real-time.", icon: Send, gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
                { step: "03", title: "Collect Payment", description: "Offer multiple payment methods and send smart reminders for overdue invoices.", icon: CreditCard, gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
              ].map((item) => (
                <div key={item.step} className="relative text-center flex flex-col items-center">
                  <div
                    className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white shadow-xl relative z-10"
                    style={{ background: item.gradient }}
                  >
                    {item.step}
                  </div>
                  <div className="bg-card rounded-xl border border-border p-4 flex-1 w-full">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="my-12 flex justify-center">
              <PaymentFlow />
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 relative">
              <div className="relative text-center flex flex-col items-center">
                <div
                  className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white shadow-xl relative z-10"
                  style={{ background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" }}
                >
                  04
                </div>
                <div className="bg-card rounded-xl border border-border p-4 flex-1 w-full">
                  <h3 className="text-lg font-semibold">Reconcile</h3>
                  <p className="mt-2 text-sm text-muted-foreground">AI automatically matches payments to invoices and updates your books.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #4facfe 100%)" }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} className="text-center bg-card rounded-2xl border border-border p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div
                  className="text-5xl sm:text-6xl font-extrabold bg-clip-text text-transparent"
                  style={{ backgroundImage: s.gradient }}
                >
                  {s.value}
                </div>
                <div className="mt-3 text-lg text-muted-foreground font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-card/50 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1.5 text-sm font-medium text-orange-700 mb-4">
              <Star className="h-4 w-4" />
              Testimonials
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold">What our customers say</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.author} className="rounded-xl border border-border bg-card p-0 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="h-1.5 w-full" style={{ background: t.borderColor }} />
                <div className="p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5"
                        style={{ color: "#f59e0b", fill: "#f59e0b" }}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md"
                      style={{ background: t.borderColor }}
                    >
                      {t.author.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{t.author}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Teams */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-1.5 text-sm font-medium text-purple-700 mb-4">
                <Users className="h-4 w-4" />
                Teams
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold">Built for teams</h2>
              <p className="mt-4 text-muted-foreground">
                Collaborate seamlessly across finance, sales, and operations with role-based access controls, shared dashboards, and real-time notifications.
              </p>
              <ul className="mt-6 space-y-3">
                {["Role-based permissions", "Shared workflows & approvals", "Audit trail & compliance logging"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center">
              <TeamIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #4facfe 100%)" }}>
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Animated dots */}
        <div
          className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full opacity-30"
          style={{ animation: "float 3s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-20 right-20 w-3 h-3 bg-white rounded-full opacity-20"
          style={{ animation: "float 4s ease-in-out infinite reverse" }}
        />
        <div
          className="absolute top-1/2 left-1/4 w-2 h-2 bg-white rounded-full opacity-25"
          style={{ animation: "float 5s ease-in-out infinite" }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
            Ready to transform your AR?
          </h2>
          <p className="mt-4 text-lg text-white/80 max-w-xl mx-auto">
            Join hundreds of finance teams who have modernized their accounts receivable process.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex h-12 items-center rounded-xl bg-white px-8 text-sm font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              style={{ color: "#667eea" }}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center rounded-xl border-2 border-white/50 px-8 text-sm font-semibold text-white hover:bg-white/10 transition-all hover:scale-105"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
