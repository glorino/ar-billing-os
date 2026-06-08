"use client";

import { DollarSign, AlertTriangle, TrendingUp, RefreshCw } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";

interface MetricCardsProps {
  totalOutstanding?: number;
  overdue?: number;
  collectedThisMonth?: number;
  mrr?: number;
  loading?: boolean;
}

export function MetricCards({
  totalOutstanding = 0,
  overdue = 0,
  collectedThisMonth = 0,
  mrr = 0,
  loading = false,
}: MetricCardsProps) {
  const metrics = [
    {
      icon: <DollarSign className="h-5 w-5" />,
      label: "Total Outstanding",
      value: formatCurrency(totalOutstanding),
      trend: { value: 12.5, direction: "up" as const },
    },
    {
      icon: <AlertTriangle className="h-5 w-5" />,
      label: "Overdue",
      value: formatCurrency(overdue),
      trend: { value: 8.2, direction: "down" as const },
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: "Collected This Month",
      value: formatCurrency(collectedThisMonth),
      trend: { value: 15.3, direction: "up" as const },
    },
    {
      icon: <RefreshCw className="h-5 w-5" />,
      label: "Monthly Recurring Revenue",
      value: formatCurrency(mrr),
      trend: { value: 5.7, direction: "up" as const },
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[120px] animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <StatCard key={metric.label} {...metric} />
      ))}
    </div>
  );
}
