"use client";

import { useEffect, useState } from "react";
import { MetricCards } from "@/components/dashboard/metric-cards";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { ARAgingChart } from "@/components/dashboard/ar-aging-chart";
import { CashflowChart } from "@/components/dashboard/cashflow-chart";
import { RecentInvoices } from "@/components/dashboard/recent-invoices";
import { CollectionActivity } from "@/components/dashboard/collection-activity";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/v1/analytics/revenue");
        if (res.ok) {
          const data = await res.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <MetricCards
        totalOutstanding={metrics?.totalOutstanding ?? 295000}
        overdue={metrics?.overdue ?? 85000}
        collectedThisMonth={metrics?.collectedThisMonth ?? 125000}
        mrr={metrics?.mrr ?? 180000}
        loading={loading}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart />
        <ARAgingChart />
      </div>

      <CashflowChart />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentInvoices />
        <CollectionActivity />
      </div>
    </div>
  );
}
