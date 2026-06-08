"use client"

const sections = [
  {
    title: "Quick Start",
    content: `Get started with AR Billing in minutes. Our API uses RESTful endpoints with JSON responses. All requests require an API key in the Authorization header.`,
    code: `curl -X GET https://api.arbilling.com/v1/customers \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`,
  },
  {
    title: "Authentication",
    content: `Authenticate using API keys. Generate keys from the Dashboard → Settings → API Keys page. Include the key in the Authorization header.`,
    code: `const headers = {
  "Authorization": "Bearer sk_live_abc123...",
  "Content-Type": "application/json"
}`,
  },
  {
    title: "Customers",
    content: `The customers resource lets you create, retrieve, update, and delete customer records.`,
    code: `// Create a customer
const customer = await fetch("https://api.arbilling.com/v1/customers", {
  method: "POST",
  headers,
  body: JSON.stringify({
    name: "Acme Corp",
    email: "billing@acme.com",
    phone: "+1-555-0100"
  })
})`,
  },
  {
    title: "Invoices",
    content: `Create and manage invoices. Each invoice is linked to a customer and contains line items.`,
    code: `// Create an invoice
const invoice = await fetch("https://api.arbilling.com/v1/invoices", {
  method: "POST",
  headers,
  body: JSON.stringify({
    customer: "cus_acme123",
    items: [
      { description: "Consulting Services", amount: 500000, quantity: 1 }
    ],
    due_date: "2026-07-01"
  })
})`,
  },
]

export default function DocumentationPage() {
  return (
    <div className="space-y-20 pb-20">
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="relative mx-auto max-w-4xl text-center px-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Documentation</h1>
          <p className="mt-4 text-lg text-muted-foreground">Everything you need to integrate and build with AR Billing.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 grid grid-cols-1 lg:grid-cols-4 gap-8">
        <nav className="lg:col-span-1 space-y-1">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Navigation</h3>
          {["Quick Start", "Authentication", "Customers", "Invoices", "Payments", "Subscriptions", "Webhooks", "SDKs"].map((item) => (
            <a key={item} href="#" className="block px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors">{item}</a>
          ))}
        </nav>

        <div className="lg:col-span-3 space-y-10">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-xl font-bold">{s.title}</h2>
              <p className="text-muted-foreground mt-2">{s.content}</p>
              <pre className="mt-4 rounded-xl bg-muted/50 border p-4 overflow-x-auto text-sm"><code>{s.code}</code></pre>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
