import Link from "next/link"
import { ArrowRight, Lightbulb, Shield, Heart, Users, Globe, Award } from "lucide-react"
import TeamIllustration from "@/components/marketing/team-illustration"

const values = [
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We push the boundaries of what's possible in AR automation, leveraging AI and machine learning to deliver cutting-edge solutions.",
    gradient: "from-amber-400 to-orange-500",
    iconGradient: "from-amber-400 to-orange-500",
  },
  {
    icon: Shield,
    title: "Trust",
    description: "Security and compliance are at the core of everything we do. Our platform is SOC 2 certified and GDPR compliant.",
    gradient: "from-blue-400 to-indigo-500",
    iconGradient: "from-blue-400 to-indigo-500",
  },
  {
    icon: Heart,
    title: "Simplicity",
    description: "Complex financial processes don't need complex tools. We make sophisticated AR management intuitive and accessible.",
    gradient: "from-pink-400 to-rose-500",
    iconGradient: "from-pink-400 to-rose-500",
  },
]

const team = [
  { name: "Alex Morgan", title: "CEO & Co-founder", initials: "AM", gradient: "from-purple-400 to-violet-500" },
  { name: "Jordan Lee", title: "CTO & Co-founder", initials: "JL", gradient: "from-blue-400 to-cyan-500" },
  { name: "Sam Rodriguez", title: "VP of Product", initials: "SR", gradient: "from-emerald-400 to-teal-500" },
  { name: "Casey Kim", title: "Head of Engineering", initials: "CK", gradient: "from-orange-400 to-amber-500" },
  { name: "Taylor Patel", title: "Head of Design", initials: "TP", gradient: "from-pink-400 to-rose-500" },
  { name: "Morgan Chen", title: "Head of Sales", initials: "MC", gradient: "from-cyan-400 to-blue-500" },
]

const stats = [
  { icon: Users, value: "150+", label: "Team Members", gradient: "from-purple-500 to-violet-600" },
  { icon: Globe, value: "40+", label: "Countries Served", gradient: "from-blue-500 to-cyan-500" },
  { icon: Award, value: "500+", label: "Customers", gradient: "from-emerald-500 to-teal-500" },
  { icon: Heart, value: "99%", label: "Customer Satisfaction", gradient: "from-pink-500 to-rose-500" },
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
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
              Mission
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground">
            We&apos;re on a mission to modernize accounts receivable for every business. By combining cutting-edge AI with
            intuitive design, we help finance teams work faster, smarter, and more accurately.
          </p>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-y border-border">
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
            <h2 className="text-3xl sm:text-4xl font-bold">
              <span className="bg-gradient-to-r from-amber-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                Our Values
              </span>
            </h2>
            <p className="mt-4 text-muted-foreground">The principles that guide everything we do</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="rounded-xl border border-border bg-card p-6 hover:shadow-lg transition-all duration-300">
                {/* Gradient icon background */}
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${v.iconGradient} shadow-lg`}>
                  <v.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Meet the Team
              </span>
            </h2>
            <p className="mt-4 text-muted-foreground">The people behind AR Billing OS</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m) => (
              <div key={m.name} className="rounded-xl border border-border bg-card p-6 text-center hover:shadow-lg transition-all duration-300">
                {/* Gradient avatar background */}
                <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${m.gradient} text-xl font-bold text-white shadow-lg`}>
                  {m.initials}
                </div>
                <h3 className="font-bold">{m.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{m.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Illustration */}
      <section className="py-16">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 flex justify-center">
          <TeamIllustration className="w-full" />
        </div>
      </section>

      {/* Stats */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card p-6 text-center hover:shadow-lg transition-all duration-300">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                  <s.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                {/* Gradient numbers */}
                <div className={`text-3xl font-bold bg-gradient-to-r ${s.gradient} bg-clip-text text-transparent`}>
                  {s.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Join our team</h2>
          <p className="mt-4 text-white/80 max-w-xl mx-auto">
            We&apos;re always looking for talented people who share our vision. Check out our open positions.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex h-11 items-center rounded-lg bg-white px-6 text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors"
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
