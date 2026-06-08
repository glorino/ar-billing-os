"use client";

import {
  UserPlus,
  FileText,
  Bell,
  CreditCard,
  RefreshCw,
  BookOpen,
  BarChart3,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Customer Created",
    description: "Add a new customer to your AR system with billing details.",
  },
  {
    icon: FileText,
    title: "Invoice Generated",
    description: "System auto-generates invoices from contracts and subscriptions.",
  },
  {
    icon: Bell,
    title: "Payment Reminder",
    description: "Smart reminders sent via email and SMS before due dates.",
  },
  {
    icon: CreditCard,
    title: "Payment Collection",
    description: "Customers pay via multiple channels with real-time processing.",
  },
  {
    icon: RefreshCw,
    title: "Reconciliation",
    description: "Automatic matching of payments to open invoices.",
  },
  {
    icon: BookOpen,
    title: "Ledger Update",
    description: "Real-time GL entries posted to your accounting system.",
  },
  {
    icon: BarChart3,
    title: "Reporting",
    description: "Live dashboards and reports for AR aging and cash flow.",
  },
];

export function WorkflowInfographic() {
  return (
    <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex gap-4 min-w-max">
        {steps.map((step, index) => (
          <div key={step.title} className="flex items-center">
            <div className="w-56 shrink-0 rounded-xl border bg-card p-5 text-center space-y-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                <step.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-primary mb-1">
                  Step {index + 1}
                </p>
                <h4 className="text-sm font-semibold mb-1">{step.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="flex items-center justify-center w-10 shrink-0">
                <ArrowRight className="w-5 h-5 text-muted-foreground/50" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}