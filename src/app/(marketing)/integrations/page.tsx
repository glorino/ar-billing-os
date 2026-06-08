"use client"

const integrations = [
  { name: "Stripe", description: "Accept payments and manage subscriptions with Stripe's global payment infrastructure.", icon: "S", gradient: "from-violet-500 to-purple-600" },
  { name: "QuickBooks", description: "Sync invoices, payments, and accounting data with QuickBooks automatically.", icon: "Q", gradient: "from-emerald-500 to-teal-600" },
  { name: "Xero", description: "Connect your Xero account for real-time financial data synchronization.", icon: "X", gradient: "from-cyan-500 to-blue-600" },
  { name: "Sage", description: "Integrate with Sage for comprehensive accounting and payroll management.", icon: "Sa", gradient: "from-orange-500 to-red-600" },
  { name: "NetSuite", description: "Enterprise-grade ERP integration for large-scale financial operations.", icon: "N", gradient: "from-blue-500 to-indigo-600" },
  { name: "Salesforce", description: "Sync customer data and billing information with your Salesforce CRM.", icon: "SF", gradient: "from-sky-500 to-blue-600" },
  { name: "HubSpot", description: "Connect billing data with HubSpot for unified customer insights.", icon: "H", gradient: "from-rose-500 to-pink-600" },
  { name: "Zapier", description: "Automate workflows by connecting AR Billing with 5,000+ apps.", icon: "Z", gradient: "from-amber-500 to-orange-600" },
]

export default function IntegrationsPage() {
  return (
    <div className="space-y-20 pb-20">
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-blue-500/5 to-emerald-500/10" />
        <div className="relative mx-auto max-w-4xl text-center px-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-r from-violet-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">Seamless Integrations</h1>
          <p className="mt-4 text-lg text-muted-foreground">Connect AR Billing with the tools you already use. No complex setup required.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {integrations.map((int) => (
            <div key={int.name} className="rounded-xl border bg-card p-6 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${int.gradient} flex items-center justify-center text-white font-bold text-lg mb-4 shadow-lg`}>{int.icon}</div>
              <h3 className="font-semibold text-lg">{int.name}</h3>
              <p className="text-sm text-muted-foreground mt-2">{int.description}</p>
              <button className="mt-4 text-sm font-medium text-primary hover:underline">Learn more →</button>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 text-center py-16 rounded-2xl bg-gradient-to-r from-violet-500/10 via-blue-500/10 to-emerald-500/10 border border-violet-200 dark:border-violet-800">
        <h2 className="text-2xl font-bold">Need a custom integration?</h2>
        <p className="mt-2 text-muted-foreground">Our API and webhooks make it easy to build custom integrations for your workflow.</p>
        <button className="mt-6 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:from-violet-700 hover:to-blue-700 transition-all shadow-lg shadow-violet-500/25">View API Docs</button>
      </section>
    </div>
  )
}
