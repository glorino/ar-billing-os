"use client"

import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
  Search,
  Filter,
  RefreshCw,
  Link2,
  ArrowUpRight,
} from "lucide-react"

const transactions = [
  { id: "TXN-2001", invoice: "INV-1024", amount: 12500, status: "Matched", date: "2026-06-01", vendor: "Acme Corp" },
  { id: "TXN-2002", invoice: "INV-1025", amount: 8750, status: "Matched", date: "2026-06-02", vendor: "TechStart Inc" },
  { id: "TXN-2003", invoice: "INV-1026", amount: 3200, status: "Pending", date: "2026-06-03", vendor: "Global Solutions" },
  { id: "TXN-2004", invoice: "INV-1027", amount: 15000, status: "Matched", date: "2026-06-03", vendor: "Digital Ventures" },
  { id: "TXN-2005", invoice: "INV-1028", amount: 22100, status: "Unmatched", date: "2026-06-04", vendor: "Innovate Labs" },
  { id: "TXN-2006", invoice: "INV-1029", amount: 5400, status: "Matched", date: "2026-06-05", vendor: "CloudNine Ltd" },
  { id: "TXN-2007", invoice: "INV-1030", amount: 9800, status: "Unmatched", date: "2026-06-05", vendor: "Pinnacle Corp" },
  { id: "TXN-2008", invoice: "INV-1031", amount: 18300, status: "Matched", date: "2026-06-06", vendor: "DataFlow Systems" },
]

const statusStyles: Record<string, { gradient: string; text: string; icon: typeof CheckCircle2; bg: string }> = {
  Matched: {
    gradient: "from-emerald-400 to-green-600",
    text: "text-emerald-700",
    icon: CheckCircle2,
    bg: "bg-emerald-50 border-emerald-200",
  },
  Unmatched: {
    gradient: "from-amber-400 to-orange-500",
    text: "text-amber-700",
    icon: AlertTriangle,
    bg: "bg-amber-50 border-amber-200",
  },
  Pending: {
    gradient: "from-blue-400 to-cyan-500",
    text: "text-blue-700",
    icon: RefreshCw,
    bg: "bg-blue-50 border-blue-200",
  },
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount)
}

export default function ReconciliationPage() {
  const matched = transactions.filter((t) => t.status === "Matched").length
  const unmatched = transactions.filter((t) => t.status === "Unmatched").length
  const discrepancies = transactions.filter((t) => t.status === "Unmatched").reduce((sum, t) => sum + t.amount, 0)
  const autoMatched = ((matched / transactions.length) * 100).toFixed(1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 bg-clip-text text-transparent">
            Reconciliation
          </h1>
          <p className="text-slate-500 mt-2 text-sm">Match transactions with invoices and track discrepancies.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-green-200 hover:shadow-green-300 hover:scale-[1.02] transition-all duration-200">
          <Link2 className="h-4 w-4" />
          Auto-Match All
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="group relative rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:shadow-green-100 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Matched</p>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-green-200">
              <CheckCircle2 className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="relative mt-4 text-3xl font-extrabold tracking-tight text-slate-900">{matched}</p>
          <p className="relative mt-1 text-xs text-emerald-600 font-semibold">{autoMatched}% of total</p>
        </div>

        <div className="group relative rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:shadow-amber-100 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Unmatched</p>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-200">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="relative mt-4 text-3xl font-extrabold tracking-tight text-slate-900">{unmatched}</p>
          <p className="relative mt-1 text-xs text-amber-600 font-semibold">Requires review</p>
        </div>

        <div className="group relative rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:shadow-red-100 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-rose-50 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Discrepancies</p>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-200">
              <XCircle className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="relative mt-4 text-3xl font-extrabold tracking-tight text-slate-900">{formatMoney(discrepancies)}</p>
          <p className="relative mt-1 text-xs text-red-500 font-semibold">{unmatched} invoices affected</p>
        </div>

        <div className="group relative rounded-2xl bg-white border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:shadow-blue-100 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Auto-Matched %</p>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-200">
              <Zap className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="relative mt-4 text-3xl font-extrabold tracking-tight text-slate-900">{autoMatched}%</p>
          <p className="relative mt-1 flex items-center gap-1 text-xs text-blue-600 font-semibold">
            <ArrowUpRight className="h-3 w-3" />
            +8% from last week
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Transaction Matching</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="h-10 w-64 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-300 transition-all"
                />
              </div>
              <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all">
                <Filter className="h-4 w-4" />
                Filter
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100/50">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Transaction ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Vendor</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Invoice</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => {
                const st = statusStyles[t.status]
                const StatusIcon = st.icon
                return (
                  <tr key={t.id} className="border-b border-slate-100 last:border-0 hover:bg-gradient-to-r hover:from-slate-50 hover:to-white transition-colors duration-200 group">
                    <td className="px-6 py-4">
                      <a href="#" className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors">
                        {t.id}
                        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{t.vendor}</td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{t.invoice}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-block font-bold text-slate-900 group-hover:bg-gradient-to-r group-hover:from-emerald-500 group-hover:to-green-500 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-200">
                        {formatMoney(t.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${st.text} ${st.bg}`}>
                        <StatusIcon className="h-3 w-3" />
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{t.date}</td>
                    <td className="px-6 py-4 text-center">
                      {t.status !== "Matched" ? (
                        <button className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm shadow-green-200 hover:shadow-md hover:shadow-green-300 hover:scale-[1.03] transition-all duration-200">
                          <Link2 className="h-3 w-3" />
                          Match
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 bg-gradient-to-r from-slate-50/50 to-white">
          <p className="text-xs text-slate-400 text-right">
            Showing {transactions.length} of {transactions.length} transactions
          </p>
        </div>
      </div>
    </div>
  )
}
