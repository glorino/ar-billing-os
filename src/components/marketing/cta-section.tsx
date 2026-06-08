"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface CtaSectionProps {
  title: string;
  subtitle: string;
  primaryCta: {
    text: string;
    href: string;
  };
  secondaryCta: {
    text: string;
    href: string;
  };
}

export function CtaSection({
  title,
  subtitle,
  primaryCta,
  secondaryCta,
}: CtaSectionProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-primary to-cyan-500" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div
        className="absolute top-10 left-[15%] w-3 h-3 rounded-full bg-white/20 animate-pulse"
        style={{ animationDelay: "0s" }}
      />
      <div
        className="absolute top-20 right-[20%] w-2 h-2 rounded-full bg-white/15 animate-pulse"
        style={{ animationDelay: "0.5s" }}
      />
      <div
        className="absolute bottom-16 left-[25%] w-4 h-4 rounded-full bg-white/10 animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/2 right-[10%] w-3 h-3 rounded-full bg-white/20 animate-pulse"
        style={{ animationDelay: "1.5s" }}
      />
      <div
        className="absolute bottom-10 right-[35%] w-2 h-2 rounded-full bg-white/15 animate-pulse"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute top-8 left-[60%] w-2 h-2 rounded-full bg-white/15 animate-pulse"
        style={{ animationDelay: "2.5s" }}
      />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
            {title}
          </h2>
          <p className="text-lg text-white/80 mb-10 leading-relaxed">
            {subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 text-base px-8 h-12 bg-white text-primary hover:bg-white/90 shadow-lg shadow-black/10"
            >
              {primaryCta.text}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 text-base px-8 h-12 border-white/30 text-white hover:bg-white/10"
            >
              {secondaryCta.text}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
