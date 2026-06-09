"use client"

import { Download, DollarSign, Clock, RotateCcw, XCircle, CreditCard, Building2, Globe, Banknote, TrendingUp, ArrowUpRight } from "lucide-react"

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

const statusStyles: Record<string, { bg: string; text: string; glow: string }> = {
  Completed: {
    bg: "bg-gradient-to-r from-emerald-400 to-green-500",
    text: "text-white",
    glow: "shadow-[0_0_12px_rgba(52,211,153,0.5)]",
  },
  Pending: {
    bg: "bg-gradient-to-r from-amber-400 to-orange-500",
    text: "text-white",
    glow: "shadow-[0_0_12px_rgba(251,191,36,0.5)]",
  },
  Failed: {
    bg: "bg-gradient-to-r from-red-400 to-rose-600",
    text: "text-white",
    glow: "shadow-[0_0_12px_rgba(248,113,113,0.5)]",
  },
  Refund: {
    bg: "bg-gradient-to-r from-blue-400 to-indigo-500",
    text: "text-white",
    glow: "shadow-[0_0_12px_rgba(96,165,250,0.5)]",
  },
}

const methodIcons: Record<string, React.ReactNode> = {
  "ACH": <Building2 className="w-4 h-4" />,
  "Wire": <Globe className="w-4 h-4" />,
  "Credit Card": <CreditCard className="w-4 h-4" />,
  "Paystack": <Banknote className="w-4 h-4" />,
}

const methodColors: Record<string, string> = {
  "ACH": "bg-violet-100 text-violet-700 border-violet-200",
  "Wire": "bg-sky-100 text-sky-700 border-sky-200",
  "Credit Card": "bg-pink-100 text-pink-700 border-pink-200",
  "Paystack": "bg-teal-100 text-teal-700 border-teal-200",
}

const paymentMethods = [
  { name: "ACH", value: 34600, percent: 36.4, color: "from-violet-500 to-purple-600", ring: "ring-violet-500" },
  { name: "Paystack", value: 33300, percent: 35.0, color: "from-teal-400 to-cyan-600", ring: "ring-teal-500" },
  { name: "Wire", value: 14150, percent: 14.9, color: "from-sky-400 to-blue-600", ring: "ring-sky-500" },
  { name: "Credit Card", value: 13000, percent: 13.7, color: "from-pink-400 to-rose-600", ring: "ring-pink-500" },
]

export default function PaymentsPage() {
  const stats = [
    { label: "Total Payments", value: "$95,050", change: "+12.5% from last month", icon: DollarSign, gradient: "from-violet-500 to-purple-600", changeUp: true },
    { label: "Pending", value: "$13,000", change: "2 transactions", icon: Clock, gradient: "from-amber-400 to-orange-500", changeUp: false },
    { label: "Refunds", value: "$5,400", change: "1 transaction", icon: RotateCcw, gradient: "from-blue-400 to-indigo-500", changeUp: false },
    { label: "Failed", value: "$22,100", change: "1 transaction", icon: XCircle, gradient: "from-red-400 to-rose-600", changeUp: false },
  ]

  const donutSegments = (() => {
    const total = paymentMethods.reduce((s, m) => s + m.value, 0)
    let cumulative = 0
    return paymentMethods.map((m) => {
      const start = (cumulative / total) * 360
      cumulative += m.value
      const end = (cumulative / total) * 360
      return { ...m, startDeg: start, endDeg: end }
    })
  })()

  const totalValue = paymentMethods.reduce((s, m) => s + m.value, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-violet-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Payments
            </span>
          </h1>
          <p className="text-muted-foreground mt-1">Track and manage all payment transactions</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30 hover:scale-[1.02] active:scale-[0.98]">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/80 backdrop-blur-sm p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-extrabold mt-2 tracking-tight font-mono-nums">{stat.value}</p>
                </div>
                <div className={`rounded-xl bg-gradient-to-br ${stat.gradient} p-2.5 text-white shadow-lg`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1">
                {stat.changeUp && (
                  <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                )}
                <span className={`text-xs font-medium ${stat.changeUp ? "text-emerald-600" : "text-muted-foreground"}`}>
                  {stat.change}
                </span>
              </div>
              {/* Decorative gradient orb */}
              <div className={`absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br ${stat.gradient} opacity-5 blur-xl transition-opacity group-hover:opacity-10`} />
            </div>
          )
        })}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/20 bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10">
          <h2 className="font-semibold text-lg">Recent Payments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-gradient-to-r from-slate-50 to-slate-100/80">
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">ID</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Invoice</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Customer</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Method</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => {
                const s = statusStyles[p.status]
                return (
                  <tr
                    key={p.id}
                    className={`border-b border-white/5 last:border-0 transition-all duration-200 hover:bg-gradient-to-r hover:from-violet-50/50 hover:via-blue-50/30 hover:to-indigo-50/50 ${i % 2 === 0 ? "bg-white/40" : "bg-slate-50/30"}`}
                  >
                    <td className="px-6 py-4 font-mono text-xs font-medium text-slate-500">{p.id}</td>
                    <td className="px-6 py-4 font-medium">{p.invoice}</td>
                    <td className="px-6 py-4">
                      <span className="font-medium">{p.customer}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold font-mono-nums text-slate-900">{p.amount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${methodColors[p.method]}`}>
                        {methodIcons[p.method]}
                        {p.method}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${s.bg} ${s.text} ${s.glow}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{p.date}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Method Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart */}
        <div className="rounded-2xl border border-white/20 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-6">Payment Methods</h3>
          <div className="flex items-center justify-center">
            <div className="relative w-48 h-48">
              {/* SVG Donut */}
              <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                {(() => {
                  const radius = 70
                  const circumference = 2 * Math.PI * radius
                  let offset = 0
                  return donutSegments.map((seg) => {
                    const segmentLength = ((seg.endDeg - seg.startDeg) / 360) * circumference
                    const dashOffset = -offset
                    offset += segmentLength
                    return (
                      <circle
                        key={seg.name}
                        cx="100"
                        cy="100"
                        r={radius}
                        fill="none"
                        stroke={`url(#grad-${seg.name})`}
                        strokeWidth="28"
                        strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    )
                  })
                })()}
                <defs>
                  <linearGradient id="grad-ACH" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                  <linearGradient id="grad-Paystack" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2dd4bf" />
                    <stop offset="100%" stopColor="#0891b2" />
                  </linearGradient>
                  <linearGradient id="grad-Wire" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                  <linearGradient id="grad-Credit Card" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f472b6" />
                    <stop offset="100%" stopColor="#e11d48" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-muted-foreground">Total</span>
                <span className="text-xl font-extrabold font-mono-nums">${(totalValue / 1000).toFixed(1)}k</span>
              </div>
            </div>
          </div>
        </div>

        {/* Method Breakdown List */}
        <div className="lg:col-span-2 rounded-2xl border border-white/20 bg-white/80 backdrop-blur-sm p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Method Breakdown</h3>
          <div className="space-y-4">
            {paymentMethods.map((m) => (
              <div key={m.name} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium ${methodColors[m.name]}`}>
                      {methodIcons[m.name]}
                      {m.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold font-mono-nums">${m.value.toLocaleString()}</span>
                    <span className="text-xs font-semibold text-muted-foreground w-12 text-right">{m.percent}%</span>
                  </div>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${m.color} transition-all duration-700 ease-out`}
                    style={{ width: `${m.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
