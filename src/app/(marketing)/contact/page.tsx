"use client"

import { useState } from "react"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

const contactInfo = [
  {
    icon: MapPin,
    label: "Address",
    value: "123 Finance Street, Suite 400\nSan Francisco, CA 94105",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+1 (555) 123-4567",
  },
  {
    icon: Mail,
    label: "Email",
    value: "hello@arbilling.com",
  },
  {
    icon: Clock,
    label: "Office Hours",
    value: "Monday - Friday: 9am - 6pm PST",
  },
]

const subjects = [
  "General Inquiry",
  "Sales",
  "Support",
  "Partnership",
  "Press",
  "Other",
]

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <>
      {/* Hero */}
      <section className="py-24 sm:py-32 text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Get in
            <br />
            <span className="text-primary">Touch</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Have a question or want to learn more? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Form */}
            <div className="rounded-xl border border-border bg-card p-8">
              <h2 className="text-xl font-bold mb-6">Send us a message</h2>
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                    <Mail className="h-8 w-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold">Message sent!</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We&apos;ll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Name</label>
                      <input
                        type="text"
                        required
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Email</label>
                      <input
                        type="email"
                        required
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Company</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Company Name"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Subject</label>
                    <select
                      required
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="">Select a subject</option>
                      {subjects.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Message</label>
                    <textarea
                      required
                      rows={5}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                      placeholder="Tell us how we can help..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full h-11 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-8">
                <h2 className="text-xl font-bold mb-6">Contact Information</h2>
                <div className="space-y-6">
                  {contactInfo.map((info) => (
                    <div key={info.label} className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                        <info.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{info.label}</div>
                        <div className="mt-1 text-sm text-muted-foreground whitespace-pre-line">{info.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-8">
                <h3 className="text-lg font-bold mb-2">Enterprise inquiries?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Need a custom solution for your organization? Our enterprise team can help.
                </p>
                <a
                  href="mailto:enterprise@arbilling.com"
                  className="inline-flex h-9 items-center rounded-lg border border-border px-4 text-sm font-medium hover:bg-card transition-colors"
                >
                  Contact Enterprise Sales
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
