"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, ArrowRight } from "lucide-react"

const plans = [
  {
    name: "Starter",
    monthlyPrice: 29,
    annualPrice: 24,
    description: "Perfect for small businesses getting started with AR automation.",
    features: [
      "Up to 100 invoices/month",
      "1 user",
      "Email support",
      "Basic templates",
      "Standard reports",
      "Payment tracking",
    ],
    popular: false,
  },
  {
    name: "Growth",
    monthlyPrice: 99,
    annualPrice: 82,
    description: "For growing teams that need advanced automation and AI insights.",
    features: [
      "Up to 1,000 invoices/month",
      "5 users",
      "Priority support",
      "AI-powered features",
      "Custom templates",
      "Advanced analytics",
      "Smart collections",
      "API access",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    monthlyPrice: 499,
    annualPrice: 416,
    description: "For large organizations with complex AR needs and custom requirements.",
    features: [
      "Unlimited invoices",
      "Unlimited users",
      "Dedicated support",
      "Custom integrations",
      "White-label options",
      "Advanced security",
      "SLA guarantee",
      "Custom training",
      "Dedicated account manager",
    ],
    popular: false,
  },
]

const faqs = [
  {
    question: "How does the free trial work?",
    answer: "Start a 14-day free trial with full access to all features in your chosen plan. No credit card required. Cancel anytime before the trial ends and you won't be charged.",
  },
  {
    question: "Can I switch plans at any time?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. When upgrading, you'll be prorated for the remainder of your billing cycle. When downgrading, the change takes effect at your next billing date.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express), ACH bank transfers, and wire transfers for annual Enterprise plans.",
  },
  {
    question: "Is there a setup fee?",
    answer: "No, there are no setup fees for any plan. You can get started immediately after signing up. Enterprise plans may include optional onboarding services.",
  },
  {
    question: "What happens when I exceed my invoice limit?",
    answer: "We'll notify you when you approach your limit. You can upgrade to a higher plan at any time to increase your invoice volume, or we can create a custom plan for your needs.",
  },
]

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <>
      {/* Hero */}
      <section className="py-24 sm:py-32 text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Simple, transparent
            <br />
            <span className="text-primary">pricing</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            No hidden fees. No surprises. Choose the plan that fits your business.
          </p>

          {/* Toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={`text-sm ${!annual ? "font-medium" : "text-muted-foreground"}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative h-6 w-11 rounded-full transition-colors ${annual ? "bg-primary" : "bg-muted"}`}
            >
              <div
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  annual ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
            <span className={`text-sm ${annual ? "font-medium" : "text-muted-foreground"}`}>
              Annual <span className="text-xs text-primary">Save 20%</span>
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-xl border p-8 flex flex-col ${
                  plan.popular
                    ? "border-primary shadow-lg scale-[1.02]"
                    : "border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <div className="mb-8">
                  <span className="text-4xl font-bold">
                    ${annual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-muted-foreground">/mo</span>
                  {annual && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      Billed ${plan.annualPrice * 12}/year
                    </div>
                  )}
                </div>
                <ul className="mb-8 space-y-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up"
                  className={`inline-flex h-11 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border hover:bg-card"
                  }`}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-card/50 border-y border-border">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between p-5 text-left text-sm font-medium"
                >
                  {faq.question}
                  <span className="ml-4 text-lg text-muted-foreground">
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-muted-foreground">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold">Still have questions?</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Our team is here to help you find the right plan for your business.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex h-11 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
