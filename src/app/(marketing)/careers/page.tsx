"use client"

const values = [
  { title: "Innovation First", description: "We challenge the status quo and build solutions that redefine how businesses manage receivables.", gradient: "from-violet-500 to-purple-600", icon: "💡" },
  { title: "Customer Obsession", description: "Every decision we make starts with our customers. Their success is our success.", gradient: "from-pink-500 to-rose-600", icon: "❤️" },
  { title: "Radical Transparency", description: "We believe in open communication, honest feedback, and sharing what we learn.", gradient: "from-cyan-500 to-blue-600", icon: "🔍" },
  { title: "Own Your Impact", description: "We give people the autonomy to make decisions and the responsibility to see them through.", gradient: "from-emerald-500 to-teal-600", icon: "🚀" },
]

const positions = [
  { title: "Senior Full-Stack Engineer", department: "Engineering", location: "Remote (Global)", type: "Full-time", badgeGradient: "from-blue-500 to-indigo-500" },
  { title: "Product Designer", department: "Design", location: "Remote (Global)", type: "Full-time", badgeGradient: "from-pink-500 to-rose-500" },
  { title: "Account Executive", department: "Sales", location: "Lagos, Nigeria", type: "Full-time", badgeGradient: "from-emerald-500 to-green-500" },
  { title: "DevOps Engineer", department: "Engineering", location: "Remote (Global)", type: "Full-time", badgeGradient: "from-blue-500 to-indigo-500" },
  { title: "Customer Success Manager", department: "Customer Success", location: "Remote (Global)", type: "Full-time", badgeGradient: "from-amber-500 to-orange-500" },
  { title: "Marketing Content Lead", department: "Marketing", location: "Remote (Global)", type: "Full-time", badgeGradient: "from-purple-500 to-violet-500" },
]

export default function CareersPage() {
  return (
    <div className="space-y-20 pb-20">
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-orange-500/5 to-amber-500/10" />
        <div className="relative mx-auto max-w-4xl text-center px-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-rose-600 via-orange-600 to-amber-600 bg-clip-text text-transparent">Join Our Team</h1>
          <p className="mt-4 text-lg text-muted-foreground">Help us build the future of accounts receivable. We&apos;re hiring across all teams.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <h2 className="text-2xl font-bold mb-8">Our Values</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v) => (
            <div key={v.title} className="rounded-xl border bg-card p-6 hover:shadow-lg transition-all hover:-translate-y-1 group">
              <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${v.gradient} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>{v.icon}</div>
              <h3 className="font-semibold text-lg">{v.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <h2 className="text-2xl font-bold mb-8">Open Positions</h2>
        <div className="space-y-3">
          {positions.map((p) => (
            <div key={p.title} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border bg-card p-5 hover:shadow-md transition-all hover:-translate-y-0.5 group">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-gradient-to-r ${p.badgeGradient} text-white shadow-sm`}>{p.department}</span>
                <div>
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{p.location} · {p.type}</p>
                </div>
              </div>
              <button className="mt-3 sm:mt-0 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-2 text-sm font-medium text-white hover:from-violet-700 hover:to-blue-700 transition-all shadow-md shadow-violet-500/25 group-hover:shadow-lg">Apply →</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
