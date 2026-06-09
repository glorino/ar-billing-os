"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Download,
  CreditCard,
  XCircle,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Building2,
  Mail,
  Printer,
  Copy,
  Calendar,
  User,
  DollarSign,
  Receipt,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

const invoice = {
  id: "INV-2024-001",
  status: "pending",
  date: "January 15, 2024",
  dueDate: "February 14, 2024",
  from: {
    name: "Acme Corp",
    address: "123 Business Ave, Suite 100",
    city: "San Francisco, CA 94105",
    email: "billing@acmecorp.com",
  },
  to: {
    name: "TechStart Inc",
    address: "456 Innovation Blvd",
    city: "Austin, TX 73301",
    email: "accounts@techstart.io",
  },
  items: [
    { description: "Enterprise SaaS License (Annual)", qty: 1, rate: 12000, amount: 12000 },
    { description: "Premium Support Package", qty: 12, rate: 250, amount: 3000 },
    { description: "Onboarding & Training", qty: 1, rate: 1500, amount: 1500 },
    { description: "API Integration Setup", qty: 1, rate: 2000, amount: 2000 },
  ],
  subtotal: 18500,
  tax: 1480,
  discount: 0,
  total: 19980,
  notes: "Thank you for your business. Payment is due within 30 days.",
  terms: "Late payments are subject to a 1.5% monthly interest charge.",
};

const payments = [
  { id: 1, date: "Jan 20, 2024", amount: 5000, method: "Credit Card", status: "completed" },
  { id: 2, date: "Jan 25, 2024", amount: 5000, method: "ACH Transfer", status: "completed" },
];

const timelineEvents = [
  { id: 1, title: "Invoice Created", description: "Invoice was created by John Doe", date: "Jan 15, 2024 09:30 AM", icon: FileText, color: "from-blue-500 to-blue-600", dotColor: "bg-blue-500" },
  { id: 2, title: "Invoice Sent", description: "Invoice sent to accounts@techstart.io", date: "Jan 15, 2024 10:15 AM", icon: Send, color: "from-indigo-500 to-indigo-600", dotColor: "bg-indigo-500" },
  { id: 3, title: "Partial Payment Received", description: "Payment of $5,000 via Credit Card", date: "Jan 20, 2024 02:45 PM", icon: CheckCircle, color: "from-emerald-500 to-emerald-600", dotColor: "bg-emerald-500" },
  { id: 4, title: "Partial Payment Received", description: "Payment of $5,000 via ACH Transfer", date: "Jan 25, 2024 11:20 AM", icon: CheckCircle, color: "from-emerald-500 to-emerald-600", dotColor: "bg-emerald-500" },
  { id: 5, title: "Reminder Sent", description: "Payment reminder sent to TechStart Inc", date: "Feb 01, 2024 09:00 AM", icon: Mail, color: "from-amber-500 to-amber-600", dotColor: "bg-amber-500" },
];

const statusConfig: Record<string, { bg: string; text: string; dot: string; icon: typeof Clock; gradient: string; border: string }> = {
  paid: { bg: "bg-emerald-500/10", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500", icon: CheckCircle2, gradient: "from-emerald-500 to-emerald-600", border: "border-emerald-500/20" },
  pending: { bg: "bg-amber-500/10", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500", icon: Clock, gradient: "from-amber-500 to-amber-600", border: "border-amber-500/20" },
  overdue: { bg: "bg-red-500/10", text: "text-red-700 dark:text-red-400", dot: "bg-red-500", icon: AlertCircle, gradient: "from-red-500 to-red-600", border: "border-red-500/20" },
  draft: { bg: "bg-slate-500/10", text: "text-slate-700 dark:text-slate-400", dot: "bg-slate-500", icon: FileText, gradient: "from-slate-500 to-slate-600", border: "border-slate-500/20" },
};

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(amount);
}

export default function InvoiceDetailPage() {
  const [showActions, setShowActions] = useState(false);
  const status = statusConfig[invoice.status];
  const StatusIcon = status.icon;
  const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const amountDue = invoice.total - amountPaid;
  const paymentProgress = Math.round((amountPaid / invoice.total) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Back link */}
        <Link
          href="/invoices"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-all duration-200 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Invoices
        </Link>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                {invoice.id}
              </h1>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold ${status.bg} ${status.text} border ${status.border} shadow-sm`}
              >
                <span className={`h-2 w-2 rounded-full ${status.dot} animate-pulse`} />
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Created {invoice.date}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Due {invoice.dueDate}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-200">
              <Send className="h-4 w-4" />
              Send Invoice
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-slate-500 to-slate-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-500/25 hover:shadow-slate-500/40 hover:scale-105 transition-all duration-200">
              <Download className="h-4 w-4" />
              Download
            </button>
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all duration-200"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              {showActions && (
                <div className="absolute right-0 top-14 z-20 w-56 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50">
                  <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-200">
                    <CreditCard className="h-4 w-4 text-blue-500" />
                    Record Payment
                  </button>
                  <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-200">
                    <Copy className="h-4 w-4 text-purple-500" />
                    Duplicate
                  </button>
                  <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 transition-all duration-200">
                    <Printer className="h-4 w-4 text-emerald-500" />
                    Print
                  </button>
                  <div className="my-1 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
                  <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/20 dark:hover:to-rose-900/20 transition-all duration-200">
                    <XCircle className="h-4 w-4" />
                    Void Invoice
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* From / To Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-lg shadow-slate-100/50 dark:shadow-slate-900/50 overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500" />
                <div className="pl-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/25">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">From</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{invoice.from.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{invoice.from.address}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{invoice.from.city}</p>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{invoice.from.email}</p>
                  </div>
                </div>
              </div>
              <div className="relative rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-lg shadow-slate-100/50 dark:shadow-slate-900/50 overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500" />
                <div className="pl-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Bill To</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{invoice.to.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{invoice.to.address}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{invoice.to.city}</p>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">{invoice.to.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-100/50 dark:shadow-slate-900/50 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-750 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
                    <Receipt className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Line Items</h3>
                </div>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10">
                    <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Description
                    </th>
                    <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 w-20">
                      Qty
                    </th>
                    <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 w-28">
                      Rate
                    </th>
                    <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 w-28">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, i) => (
                    <tr
                      key={i}
                      className={`border-t border-slate-100 dark:border-slate-700/50 transition-all duration-200 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:via-purple-50/30 hover:to-pink-50/50 dark:hover:from-indigo-900/20 dark:hover:via-purple-900/10 dark:hover:to-pink-900/20 ${i % 2 === 0 ? "bg-white dark:bg-slate-800" : "bg-slate-50/50 dark:bg-slate-800/50"}`}
                    >
                      <td className="px-6 py-5 text-sm font-semibold text-slate-900 dark:text-white">{item.description}</td>
                      <td className="px-6 py-5 text-sm text-center text-slate-500 dark:text-slate-400 font-medium">{item.qty}</td>
                      <td className="px-6 py-5 text-sm text-right font-mono text-slate-500 dark:text-slate-400">{formatMoney(item.rate)}</td>
                      <td className="px-6 py-5 text-sm text-right font-bold font-mono text-slate-900 dark:text-white">{formatMoney(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-slate-800 dark:via-indigo-900/10 dark:to-purple-900/10 px-6 py-5">
                <div className="ml-auto w-72 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Subtotal</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">{formatMoney(invoice.subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Tax (8%)</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">{formatMoney(invoice.tax)}</span>
                  </div>
                  {invoice.discount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Discount</span>
                      <span className="font-mono font-semibold text-red-500">-{formatMoney(invoice.discount)}</span>
                    </div>
                  )}
                  <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Total Due</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                      {formatMoney(invoice.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes & Terms */}
            {(invoice.notes || invoice.terms) && (
              <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 shadow-lg shadow-slate-100/50 dark:shadow-slate-900/50 space-y-4">
                {invoice.notes && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 mt-0.5">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Notes</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{invoice.notes}</p>
                    </div>
                  </div>
                )}
                {invoice.terms && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-400 to-rose-500 mt-0.5">
                      <AlertTriangle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Terms</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{invoice.terms}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Payment Status Card */}
            <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-100/50 dark:shadow-slate-900/50 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                    <DollarSign className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Payment Summary</h3>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Amount</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{formatMoney(invoice.total)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Amount Paid</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatMoney(amountPaid)}</span>
                  </div>
                  <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">Amount Due</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                      {formatMoney(amountDue)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500 dark:text-slate-400">Payment Progress</span>
                    <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent font-bold">{paymentProgress}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 transition-all duration-1000 ease-out shadow-lg shadow-emerald-500/30"
                      style={{ width: `${paymentProgress}%` }}
                    />
                  </div>
                </div>

                <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all duration-200">
                  <CreditCard className="h-4 w-4" />
                  Record Payment
                </button>
              </div>
            </div>

            {/* Payment History */}
            <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-100/50 dark:shadow-slate-900/50 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-500">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Payment History</h3>
                </div>
              </div>
              <div className="p-6">
                {payments.length > 0 ? (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/10 border border-emerald-100 dark:border-emerald-900/30 transition-all duration-200 hover:shadow-md"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25">
                          <CheckCircle2 className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{formatMoney(payment.amount)}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{payment.method} · {payment.date}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                          {payment.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">No payments recorded yet</p>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-100/50 dark:shadow-slate-900/50 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Invoice Timeline</h3>
                </div>
              </div>
              <div className="p-6">
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-purple-200 to-pink-200 dark:from-indigo-800 dark:via-purple-800 dark:to-pink-800" />

                  <div className="space-y-6">
                    {timelineEvents.map((event, index) => {
                      const EventIcon = event.icon;
                      return (
                        <div key={event.id} className="relative flex items-start gap-4">
                          {/* Dot */}
                          <div className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${event.color} shadow-lg`}>
                            <EventIcon className="h-5 w-5 text-white" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 pb-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{event.title}</h4>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{event.description}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-medium">{event.date}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-100/50 dark:shadow-slate-900/50 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-slate-700 to-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    <MoreHorizontal className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Quick Actions</h3>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <button className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-200 group">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-200">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-semibold">Send Reminder</span>
                </button>
                <button className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/20 dark:hover:to-pink-900/20 transition-all duration-200 group">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 shadow-md shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-200">
                    <Download className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-semibold">Download PDF</span>
                </button>
                <button className="flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 dark:hover:from-emerald-900/20 dark:hover:to-teal-900/20 transition-all duration-200 group">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-200">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-semibold">View Customer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
