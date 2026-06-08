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
          ? "border-primary shadow-lg shadow-primary/10 ring-1 ring-primary"
          : ""
      }`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1 rounded-full">
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

      <Button
        variant={popular ? "default" : "outline"}
        className="w-full"
        size="lg"
      >
        {ctaText}
      </Button>
    </div>
  );
}