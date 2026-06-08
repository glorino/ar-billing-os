"use client"

import { useState } from "react"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

const contactInfo = [
  {
    icon: MapPin,
    label: "Address",
    value: "123 Finance Street, Suite 400\nSan Francisco, CA 94105",
    gradient: "from-blue-500 to-cyan-500",
    iconGradient: "from-blue-400 to-cyan-500",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+1 (555) 123-4567",
    gradient: "from-emerald-500 to-teal-500",
    iconGradient: "from-emerald-400 to-teal-500",
  },
  {
    icon: Mail,
    label: "Email",
    value: "hello@arbilling.com",
    gradient: "from-purple-500 to-violet-500",
    iconGradient: "from-purple-400 to-violet-500",
  },
  {
    icon: Clock,
    label: "Office Hours",
    value: "Monday - Friday: 9am - 6pm PST",
    gradient: "from-orange-500 to-amber-500",
    iconGradient: "from-orange-400 to-amber-500",
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
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Touch
            </span>
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
            <div className="group relative rounded-xl border border-border bg-card p-8 hover:border-transparent hover:shadow-xl transition-all duration-300">
              {/* Gradient border on hover */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />
              
              <h2 className="text-xl font-bold mb-6">Send us a message</h2>
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg">
                    <Mail className="h-8 w-8 text-white" />
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
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Email</label>
                      <input
                        type="email"
                        required
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Company</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                      placeholder="Company Name"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Subject</label>
                    <select
                      required
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
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
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none"
                      placeholder="Tell us how we can help..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full h-11 rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 text-sm font-medium text-white hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
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
                    <div key={info.label} className="flex items-start gap-4 group/item">
                      {/* Gradient icon background */}
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${info.iconGradient} shadow-lg shrink-0 group-hover/item:scale-110 transition-transform duration-300`}>
                        <info.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{info.label}</div>
                        <div className="mt-1 text-sm text-muted-foreground whitespace-pre-line">{info.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-8 hover:shadow-lg transition-all duration-300">
                <h3 className="text-lg font-bold mb-2">Enterprise inquiries?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Need a custom solution for your organization? Our enterprise team can help.
                </p>
                <a
                  href="mailto:enterprise@arbilling.com"
                  className="inline-flex h-9 items-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-4 text-sm font-medium text-white hover:opacity-90 transition-all shadow-md hover:shadow-lg"
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
