import Link from "next/link"
import {
  Cloud,
  Briefcase,
  Heart,
  Factory,
  ShoppingBag,
  Landmark,
  ArrowRight,
  CheckCircle,
} from "lucide-react"

const solutions = [
  {
    icon: Cloud,
    title: "SaaS & Subscriptions",
    description: "Automate recurring billing, manage subscription lifecycles, handle upgrades and downgrades, and reduce churn with smart dunning.",
    features: ["Usage-based billing", "Subscription management", "Churn reduction", "Revenue recognition"],
    gradient: "from-purple-500 to-violet-600",
    iconGradient: "from-purple-400 to-violet-500",
  },
  {
    icon: Briefcase,
    title: "Professional Services",
    description: "Streamline time-based billing, milestone tracking, and client invoicing. Perfect for agencies, consultancies, and law firms.",
    features: ["Time tracking integration", "Milestone billing", "Client portals", "Retainer management"],
    gradient: "from-blue-500 to-indigo-600",
    iconGradient: "from-blue-400 to-indigo-500",
  },
  {
    icon: Heart,
    title: "Healthcare",
    description: "HIPAA-compliant AR management for healthcare providers. Handle insurance claims, patient billing, and provider reimbursements.",
    features: ["HIPAA compliant", "Insurance claims", "Patient billing", "Provider portals"],
    gradient: "from-emerald-500 to-teal-600",
    iconGradient: "from-emerald-400 to-teal-500",
  },
  {
    icon: Factory,
    title: "Manufacturing",
    description: "Manage complex B2B invoicing, handle purchase orders, and streamline collections across supply chain partners.",
    features: ["PO management", "B2B invoicing", "Supply chain billing", "Volume discounts"],
    gradient: "from-orange-500 to-amber-600",
    iconGradient: "from-orange-400 to-amber-500",
  },
  {
    icon: ShoppingBag,
    title: "E-Commerce",
    description: "Automate customer billing, handle refunds and chargebacks, and integrate seamlessly with your e-commerce platform.",
    features: ["Platform integrations", "Refund automation", "Chargeback management", "Multi-seller billing"],
    gradient: "from-pink-500 to-rose-600",
    iconGradient: "from-pink-400 to-rose-500",
  },
  {
    icon: Landmark,
    title: "Financial Services",
    description: "Enterprise-grade AR for banks, insurance companies, and fintech. SOC 2 compliant with advanced fraud detection.",
    features: ["SOC 2 compliant", "Fraud detection", "Regulatory reporting", "API-first architecture"],
    gradient: "from-cyan-500 to-sky-600",
    iconGradient: "from-cyan-400 to-sky-500",
  },
]

const integrations = ["Stripe", "QuickBooks", "Xero", "Sage", "NetSuite", "Salesforce", "HubSpot", "Zapier"]

export default function SolutionsPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-24 sm:py-32 text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Built for
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Every Industry
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Tailored solutions that understand your unique industry requirements and compliance needs.
          </p>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {solutions.map((sol) => (
              <div
                key={sol.title}
                className={`group relative rounded-xl border border-border bg-card p-6 hover:shadow-lg transition-all duration-300 overflow-hidden`}
              >
                {/* Gradient left border */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${sol.gradient}`} />
                
                {/* Gradient icon background */}
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${sol.iconGradient} shadow-lg`}>
                  <sol.icon className="h-6 w-6 text-white" />
                </div>
                
                <h3 className="text-lg font-bold">{sol.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{sol.description}</p>
                
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {sol.features.map((f) => (
                    <div key={f} className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CheckCircle className="h-3 w-3 text-primary shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
                
                <Link
                  href="/contact"
                  className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Learn more <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Seamless Integrations
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Connect with the tools you already use. Our platform integrates with leading accounting, CRM, and payment systems.
          </p>
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {integrations.map((name) => (
              <div
                key={name}
                className="flex items-center justify-center rounded-xl border border-border bg-white/80 dark:bg-gray-800/80 backdrop-blur p-6 hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <span className="text-sm font-semibold text-muted-foreground">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Need a custom solution?</h2>
          <p className="mt-4 text-white/80 max-w-xl mx-auto">
            Our enterprise team can build a tailored solution for your specific industry requirements.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex h-11 items-center rounded-lg bg-white px-6 text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-11 items-center rounded-lg border border-white/30 px-6 text-sm font-medium text-white hover:bg-white/10 transition-colors"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
