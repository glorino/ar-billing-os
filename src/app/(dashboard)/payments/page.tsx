"use client"

const payments = [
  { id: "PAY-001", invoice: "INV-1024", customer: "Acme Corp", amount: "$12,500.00", method: "ACH", status: "Completed", date: "2026-06-01" },
  { id: "PAY-002", invoice: "INV-1025", customer: "Globex Inc", amount: "$8,750.00", method: "Wire", status: "Completed", date: "2026-06-02" },
  { id: "PAY-003", invoice: "INV-1026", customer: "Initech", amount: "$3,200.00", method: "Credit Card", status: "Pending", date: "2026-06-03" },
  { id: "PAY-004", invoice: "INV-1027", customer: "Umbrella Co", amount: "$15,000.00", method: "Paystack", status: "Completed", date: "2026-06-03" },
  { id: "PAY-005", invoice: "INV-1028", customer: "Stark Industries", amount: "$22,100.00", method: "ACH", status: "Failed", date: "2026-06-04" },
  { id: "PAY-006", invoice: "INV-1029", customer: "Wayne Enterprises", amount: "$5,400.00", method: "Wire", status: "Refund", date: "2026-06-05" },
  { id: "PAY-007", invoice: "INV-1030", customer: "Cyberdyne", amount: "$9,800.00", method: "Credit Card", status: "Pending", date: "2026-06-05" },
  { id: "PAY-008", invoice: "INV-1031", customer: "Massive Dynamic", amount: "$18,300.00", method: "Paystack", status: "Completed", date: "2026-06-06" },
]

const statusColor: Record<string, string> = {
  Completed: "bg-emerald-100 text-emerald-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Failed: "bg-red-100 text-red-700",
  Refund: "bg-blue-100 text-blue-700",
}

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-muted-foreground">Track and manage all payment transactions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Payments", value: "$95,050.00", change: "+12.5% from last month" },
          { label: "Pending", value: "$13,000.00", change: "2 transactions" },
          { label: "Refunds", value: "$5,400.00", change: "1 transaction" },
          { label: "Failed", value: "$22,100.00", change: "1 transaction" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border bg-card">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Recent Payments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">ID</th>
                <th className="px-4 py-3 text-left font-medium">Invoice</th>
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Method</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                  <td className="px-4 py-3">{p.invoice}</td>
                  <td className="px-4 py-3">{p.customer}</td>
                  <td className="px-4 py-3 font-medium">{p.amount}</td>
                  <td className="px-4 py-3">{p.method}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[p.status]}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
