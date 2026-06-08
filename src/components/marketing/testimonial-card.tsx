"use client";

import { Star, Quote } from "lucide-react";

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  rating: number;
}

export function TestimonialCard({
  quote,
  author,
  role,
  company,
  rating,
}: TestimonialCardProps) {
  return (
    <div className="relative rounded-xl border bg-card p-6 flex flex-col">
      <Quote className="w-8 h-8 text-primary/20 mb-4 -scale-x-100" />

      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating
                ? "fill-primary text-primary"
                : "fill-muted text-muted"
            }`}
          />
        ))}
      </div>

      <p className="text-sm leading-relaxed flex-1 mb-6">{quote}</p>

      <div className="flex items-center gap-3 pt-4 border-t">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
          {author
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
        <div>
          <p className="text-sm font-medium">{author}</p>
          <p className="text-xs text-muted-foreground">
            {role} at {company}
          </p>
        </div>
      </div>
    </div>
  );
}