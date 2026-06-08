"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { ProductMockup } from "./product-mockup";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/30 pt-24 pb-16 lg:pt-32 lg:pb-24">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black,transparent)]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Now in Public Beta
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              The Modern
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-primary to-blue-600 bg-clip-text text-transparent">
              Accounts Receivable Platform
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Automate your billing, accelerate collections, and get paid faster.
            Built for modern finance teams who demand real-time visibility and
            zero manual work.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="gap-2 text-base px-8 h-12">
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="gap-2 text-base px-8 h-12">
              <Play className="h-4 w-4" />
              Watch Demo
            </Button>
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" />
          <ProductMockup />
        </div>
      </div>
    </section>
  );
}