"use client"

const methodBadge: Record<string, string> = {
  GET: "bg-emerald-100 text-emerald-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-yellow-100 text-yellow-700",
  DELETE: "bg-red-100 text-red-700",
}

const endpoints = [
  { group: "Customers", items: [
    { method: "GET", path: "/v1/customers", desc: "List all customers" },
    { method: "POST", path: "/v1/customers", desc: "Create a customer" },
    { method: "GET", path: "/v1/customers/:id", desc: "Retrieve a customer" },
    { method: "PUT", path: "/v1/customers/:id", desc: "Update a customer" },
    { method: "DELETE", path: "/v1/customers/:id", desc: "Delete a customer" },
  ]},
  { group: "Invoices", items: [
    { method: "GET", path: "/v1/invoices", desc: "List all invoices" },
    { method: "POST", path: "/v1/invoices", desc: "Create an invoice" },
    { method: "GET", path: "/v1/invoices/:id", desc: "Retrieve an invoice" },
    { method: "PUT", path: "/v1/invoices/:id", desc: "Update an invoice" },
    { method: "POST", path: "/v1/invoices/:id/send", desc: "Send an invoice" },
  ]},
  { group: "Payments", items: [
    { method: "GET", path: "/v1/payments", desc: "List all payments" },
    { method: "POST", path: "/v1/payments", desc: "Create a payment" },
    { method: "GET", path: "/v1/payments/:id", desc: "Retrieve a payment" },
    { method: "POST", path: "/v1/payments/:id/refund", desc: "Refund a payment" },
  ]},
  { group: "Subscriptions", items: [
    { method: "GET", path: "/v1/subscriptions", desc: "List all subscriptions" },
    { method: "POST", path: "/v1/subscriptions", desc: "Create a subscription" },
    { method: "PUT", path: "/v1/subscriptions/:id", desc: "Update a subscription" },
    { method: "DELETE", path: "/v1/subscriptions/:id", desc: "Cancel a subscription" },
  ]},
  { group: "Collections", items: [
    { method: "GET", path: "/v1/collections", desc: "List collection tasks" },
    { method: "POST", path: "/v1/collections", desc: "Create a collection task" },
    { method: "POST", path: "/v1/collections/:id/remind", desc: "Send reminder" },
  ]},
  { group: "Reports", items: [
    { method: "GET", path: "/v1/reports/aging", desc: "Get aging report" },
    { method: "GET", path: "/v1/reports/dso", desc: "Get DSO metrics" },
    { method: "GET", path: "/v1/reports/collections", desc: "Get collections report" },
  ]},
]

export default function ApiReferencePage() {
  return (
    <div className="space-y-20 pb-20">
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="relative mx-auto max-w-4xl text-center px-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">API Reference</h1>
          <p className="mt-4 text-lg text-muted-foreground">REST API endpoints for all AR Billing resources. Base URL: <code className="bg-muted px-1.5 py-0.5 rounded text-sm">https://api.arbilling.com</code></p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 space-y-10">
        {endpoints.map((group) => (
          <div key={group.group}>
            <h2 className="text-xl font-bold mb-4">{group.group}</h2>
            <div className="rounded-xl border bg-card divide-y">
              {group.items.map((ep) => (
                <div key={ep.method + ep.path} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30">
                  <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-bold font-mono ${methodBadge[ep.method]}`}>{ep.method}</span>
                  <code className="text-sm font-mono flex-1">{ep.path}</code>
                  <span className="text-sm text-muted-foreground hidden sm:block">{ep.desc}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
