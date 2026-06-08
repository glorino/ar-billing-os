"use client"

const services = [
  { name: "API", status: "operational", uptime: "99.99%", responseTime: "45ms" },
  { name: "Dashboard", status: "operational", uptime: "99.98%", responseTime: "120ms" },
  { name: "Payments", status: "operational", uptime: "100%", responseTime: "89ms" },
  { name: "Webhooks", status: "operational", uptime: "99.97%", responseTime: "32ms" },
  { name: "Email Delivery", status: "operational", uptime: "99.95%", responseTime: "210ms" },
]

export default function StatusPage() {
  return (
    <div className="space-y-20 pb-20">
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="relative mx-auto max-w-4xl text-center px-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">System Status</h1>
          <p className="mt-4 text-lg text-muted-foreground">Real-time status of all AR Billing services.</p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4">
        <div className="rounded-xl border bg-card p-6 flex items-center gap-4 mb-8">
          <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h2 className="font-semibold text-lg">All Systems Operational</h2>
            <p className="text-sm text-muted-foreground">Last checked: June 8, 2026 14:30 UTC</p>
          </div>
        </div>

        <div className="space-y-3">
          {services.map((s) => (
            <div key={s.name} className="rounded-xl border bg-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="font-medium">{s.name}</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground ml-6 sm:ml-0">
                <span>Uptime: <span className="font-medium text-foreground">{s.uptime}</span></span>
                <span>Response: <span className="font-medium text-foreground">{s.responseTime}</span></span>
                <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-0.5 text-xs font-medium">Operational</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
