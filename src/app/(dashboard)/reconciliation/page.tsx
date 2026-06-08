"use client"

const transactions = [
  { id: "TXN-2001", invoice: "INV-1024", amount: "$12,500.00", status: "Matched", date: "2026-06-01" },
  { id: "TXN-2002", invoice: "INV-1025", amount: "$8,750.00", status: "Matched", date: "2026-06-02" },
  { id: "TXN-2003", invoice: "INV-1026", amount: "$3,200.00", status: "Pending", date: "2026-06-03" },
  { id: "TXN-2004", invoice: "INV-1027", amount: "$15,000.00", status: "Matched", date: "2026-06-03" },
  { id: "TXN-2005", invoice: "INV-1028", amount: "$22,100.00", status: "Unmatched", date: "2026-06-04" },
  { id: "TXN-2006", invoice: "INV-1029", amount: "$5,400.00", status: "Matched", date: "2026-06-05" },
  { id: "TXN-2007", invoice: "INV-1030", amount: "$9,800.00", status: "Unmatched", date: "2026-06-05" },
  { id: "TXN-2008", invoice: "INV-1031", amount: "$18,300.00", status: "Matched", date: "2026-06-06" },
]

const statusColor: Record<string, string> = {
  Matched: "bg-emerald-100 text-emerald-700",
  Unmatched: "bg-red-100 text-red-700",
  Pending: "bg-yellow-100 text-yellow-700",
}

export default function ReconciliationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reconciliation</h1>
        <p className="text-muted-foreground">Match transactions with invoices and track discrepancies</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Matched", value: "5", change: "62.5% of total" },
          { label: "Unmatched", value: "2", change: "Requires review" },
          { label: "Discrepancies", value: "$31,900.00", change: "2 invoices affected" },
          { label: "Auto-Matched %", value: "62.5%", change: "↑ 8% from last week" },
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
          <h2 className="font-semibold">Transaction Matching</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">Transaction ID</th>
                <th className="px-4 py-3 text-left font-medium">Invoice</th>
                <th className="px-4 py-3 text-left font-medium">Amount</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{t.id}</td>
                  <td className="px-4 py-3">{t.invoice}</td>
                  <td className="px-4 py-3 font-medium">{t.amount}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[t.status]}`}>{t.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
