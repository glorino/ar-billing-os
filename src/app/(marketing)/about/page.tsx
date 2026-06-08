import Link from "next/link"
import { ArrowRight, Lightbulb, Shield, Heart, Users, Globe, Award } from "lucide-react"

const values = [
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We push the boundaries of what's possible in AR automation, leveraging AI and machine learning to deliver cutting-edge solutions.",
  },
  {
    icon: Shield,
    title: "Trust",
    description: "Security and compliance are at the core of everything we do. Our platform is SOC 2 certified and GDPR compliant.",
  },
  {
    icon: Heart,
    title: "Simplicity",
    description: "Complex financial processes don't need complex tools. We make sophisticated AR management intuitive and accessible.",
  },
]

const team = [
  { name: "Alex Morgan", title: "CEO & Co-founder", initials: "AM" },
  { name: "Jordan Lee", title: "CTO & Co-founder", initials: "JL" },
  { name: "Sam Rodriguez", title: "VP of Product", initials: "SR" },
  { name: "Casey Kim", title: "Head of Engineering", initials: "CK" },
  { name: "Taylor Patel", title: "Head of Design", initials: "TP" },
  { name: "Morgan Chen", title: "Head of Sales", initials: "MC" },
]

const stats = [
  { icon: Users, value: "150+", label: "Team Members" },
  { icon: Globe, value: "40+", label: "Countries Served" },
  { icon: Award, value: "500+", label: "Customers" },
  { icon: Heart, value: "99%", label: "Customer Satisfaction" },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-24 sm:py-32 text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Our
            <br />
            <span className="text-primary">Mission</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground">
            We&apos;re on a mission to modernize accounts receivable for every business. By combining cutting-edge AI with
            intuitive design, we help finance teams work faster, smarter, and more accurately.
          </p>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-24 bg-card/50 border-y border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <blockquote className="text-2xl sm:text-3xl font-semibold leading-relaxed">
            &ldquo;Every business deserves a world-class accounts receivable experience.
            We&apos;re building the platform that makes that possible.&rdquo;
          </blockquote>
          <div className="mt-6 text-muted-foreground">— Alex Morgan, CEO</div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Our Values</h2>
            <p className="mt-4 text-muted-foreground">The principles that guide everything we do</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="rounded-xl border border-border bg-card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <v.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-card/50 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Meet the Team</h2>
            <p className="mt-4 text-muted-foreground">The people behind AR Billing OS</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m) => (
              <div key={m.name} className="rounded-xl border border-border bg-card p-6 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  {m.initials}
                </div>
                <h3 className="font-bold">{m.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{m.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-6 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary">{s.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-card/50 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">Join our team</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            We&apos;re always looking for talented people who share our vision. Check out our open positions.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex h-11 items-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              View Open Roles
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
