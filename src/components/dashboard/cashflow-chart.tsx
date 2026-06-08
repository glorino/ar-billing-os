"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CashflowChartProps {
  data?: Array<{ month: string; inflow: number; outflow: number }>;
}

const defaultData = [
  { month: "Jan", inflow: 65000, outflow: 42000 },
  { month: "Feb", inflow: 72000, outflow: 45000 },
  { month: "Mar", inflow: 68000, outflow: 43000 },
  { month: "Apr", inflow: 85000, outflow: 48000 },
  { month: "May", inflow: 78000, outflow: 46000 },
  { month: "Jun", inflow: 92000, outflow: 52000 },
  { month: "Jul", inflow: 98000, outflow: 55000 },
  { month: "Aug", inflow: 95000, outflow: 54000 },
  { month: "Sep", inflow: 105000, outflow: 58000 },
  { month: "Oct", inflow: 110000, outflow: 60000 },
  { month: "Nov", inflow: 118000, outflow: 63000 },
  { month: "Dec", inflow: 125000, outflow: 68000 },
];

export function CashflowChart({ data = defaultData }: CashflowChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Flow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
              />
              <Legend />
              <Area type="monotone" dataKey="inflow" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} strokeWidth={2} name="Inflow" />
              <Area type="monotone" dataKey="outflow" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} strokeWidth={2} name="Outflow" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
