"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ARAgingChartProps {
  data?: Array<{ bucket: string; amount: number; count: number }>;
}

const defaultData = [
  { bucket: "Current", amount: 125000, count: 45 },
  { bucket: "1-30 Days", amount: 85000, count: 32 },
  { bucket: "31-60 Days", amount: 42000, count: 18 },
  { bucket: "61-90 Days", amount: 28000, count: 12 },
  { bucket: "90+ Days", amount: 15000, count: 8 },
];

export function ARAgingChart({ data = defaultData }: ARAgingChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AR Aging Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="bucket" stroke="#6b7280" fontSize={12} />
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
              <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} name="Amount" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
