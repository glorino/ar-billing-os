"use client";

import type { LucideIcon } from "lucide-react";

const gradientMap: Record<string, string> = {
  purple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  blue: 'linear-gradient(135deg, #667eea 0%, #4facfe 100%)',
  cyan: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  green: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  orange: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  pink: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  red: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
};

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color?: string;
}

export function FeatureCard({ icon: Icon, title, description, color = "purple" }: FeatureCardProps) {
  return (
    <div className="group relative rounded-xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5">
      <div
        className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full text-white transition-transform duration-300 group-hover:scale-110"
        style={{ background: gradientMap[color] || gradientMap.purple }}
      >
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
