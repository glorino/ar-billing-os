"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PricingCardProps {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  ctaText: string;
}

export function PricingCard({
  name,
  price,
  period,
  description,
  features,
  popular = false,
  ctaText,
}: PricingCardProps) {
  return (
    <div
      className={`relative rounded-xl border bg-card p-8 flex flex-col ${
        popular
          ? "border-transparent shadow-lg shadow-primary/10 ring-1 ring-primary/50"
          : ""
      }`}
      style={
        popular
          ? {
              borderTop: "3px solid transparent",
              borderImage: "linear-gradient(135deg, #667eea, #764ba2) 1",
              backgroundImage:
                "linear-gradient(var(--card), var(--card)), linear-gradient(135deg, rgba(102,126,234,0.08), rgba(118,75,162,0.08))",
            }
          : undefined
      }
    >
      {popular && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs font-semibold px-4 py-1 rounded-full"
          style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}
        >
          Most Popular
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-1">{name}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-sm text-muted-foreground ml-1">/{period}</span>
      </div>

      <ul className="space-y-3 mb-8 flex-1">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {popular ? (
        <Button
          className="w-full bg-gradient-to-r from-purple-600 via-primary to-blue-600 hover:from-purple-700 hover:via-primary/90 hover:to-blue-700 text-white shadow-lg shadow-primary/25 transition-all duration-300"
          size="lg"
        >
          {ctaText}
        </Button>
      ) : (
        <Button variant="outline" className="w-full" size="lg">
          {ctaText}
        </Button>
      )}
    </div>
  );
}
