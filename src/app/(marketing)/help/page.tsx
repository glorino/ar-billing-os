"use client"
import { useState } from "react"

const categories = [
  { title: "Getting Started", description: "Set up your account and configure your first invoice.", count: 12 },
  { title: "Billing", description: "Learn about invoicing, payment methods, and subscriptions.", count: 18 },
  { title: "Integrations", description: "Connect with Stripe, QuickBooks, Xero, and more.", count: 8 },
  { title: "API", description: "REST API docs, authentication, and webhooks.", count: 15 },
  { title: "Troubleshooting", description: "Common issues and their solutions.", count: 10 },
]

const faqs = [
  { q: "How do I set up my first invoice?", a: "Navigate to Invoices → Create Invoice. Fill in customer details, line items, and payment terms. You can save as draft or send immediately." },
  { q: "What payment methods are supported?", a: "We support ACH, wire transfers, credit/debit cards, Paystack, and manual payments. Available methods depend on your plan." },
  { q: "How does automated collections work?", a: "Our system sends customizable email reminders at intervals you define — 7 days before due, on due date, and at configurable intervals after." },
  { q: "Can I connect my existing accounting software?", a: "Yes! We offer native integrations with QuickBooks, Xero, and Sage. Data syncs automatically in real-time." },
  { q: "Is there a free trial?", a: "Yes, all plans include a 14-day free trial with full access. No credit card required." },
  { q: "How do I contact support?", a: "You can reach us via the in-app chat, email support@arbilling.com, or check the status page for known issues." },
]

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="space-y-20 pb-20">
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="relative mx-auto max-w-4xl text-center px-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Help Center</h1>
          <p className="mt-4 text-lg text-muted-foreground">Find answers to your questions and get the most out of AR Billing.</p>
          <div className="mt-8 max-w-lg mx-auto">
            <input type="text" placeholder="Search for help..." className="w-full rounded-xl border bg-background px-5 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c) => (
            <div key={c.title} className="rounded-xl border bg-card p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="font-semibold text-lg">{c.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{c.description}</p>
              <p className="text-xs text-muted-foreground mt-3">{c.count} articles</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border bg-card overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                <span className="font-medium">{faq.q}</span>
                <span className="ml-4 text-muted-foreground">{openFaq === i ? "−" : "+"}</span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-sm text-muted-foreground">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
