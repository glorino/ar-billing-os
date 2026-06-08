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
  },
  {
    icon: Briefcase,
    title: "Professional Services",
    description: "Streamline time-based billing, milestone tracking, and client invoicing. Perfect for agencies, consultancies, and law firms.",
    features: ["Time tracking integration", "Milestone billing", "Client portals", "Retainer management"],
  },
  {
    icon: Heart,
    title: "Healthcare",
    description: "HIPAA-compliant AR management for healthcare providers. Handle insurance claims, patient billing, and provider reimbursements.",
    features: ["HIPAA compliant", "Insurance claims", "Patient billing", "Provider portals"],
  },
  {
    icon: Factory,
    title: "Manufacturing",
    description: "Manage complex B2B invoicing, handle purchase orders, and streamline collections across supply chain partners.",
    features: ["PO management", "B2B invoicing", "Supply chain billing", "Volume discounts"],
  },
  {
    icon: ShoppingBag,
    title: "E-Commerce",
    description: "Automate customer billing, handle refunds and chargebacks, and integrate seamlessly with your e-commerce platform.",
    features: ["Platform integrations", "Refund automation", "Chargeback management", "Multi-seller billing"],
  },
  {
    icon: Landmark,
    title: "Financial Services",
    description: "Enterprise-grade AR for banks, insurance companies, and fintech. SOC 2 compliant with advanced fraud detection.",
    features: ["SOC 2 compliant", "Fraud detection", "Regulatory reporting", "API-first architecture"],
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
            <span className="text-primary">Every Industry</span>
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
                className="group rounded-xl border border-border bg-card p-6 hover:shadow-md transition-all"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <sol.icon className="h-6 w-6 text-primary" />
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
      <section className="py-24 bg-card/50 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">Seamless Integrations</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Connect with the tools you already use. Our platform integrates with leading accounting, CRM, and payment systems.
          </p>
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6">
            {integrations.map((name) => (
              <div
                key={name}
                className="flex items-center justify-center rounded-xl border border-border bg-card p-6 hover:shadow-md transition-all"
              >
                <span className="text-sm font-semibold text-muted-foreground">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">Need a custom solution?</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Our enterprise team can build a tailored solution for your specific industry requirements.
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
