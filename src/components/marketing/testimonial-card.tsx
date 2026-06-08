"use client";

import { Star, Quote } from "lucide-react";

const borderColors = [
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #43e97b, #38f9d7)",
  "linear-gradient(135deg, #fa709a, #fee140)",
  "linear-gradient(135deg, #f093fb, #f5576c)",
  "linear-gradient(135deg, #4facfe, #00f2fe)",
];

const avatarGradients = [
  "linear-gradient(135deg, #667eea, #764ba2)",
  "linear-gradient(135deg, #43e97b, #38f9d7)",
  "linear-gradient(135deg, #fa709a, #fee140)",
  "linear-gradient(135deg, #f093fb, #f5576c)",
  "linear-gradient(135deg, #4facfe, #00f2fe)",
];

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  rating: number;
  index?: number;
}

export function TestimonialCard({
  quote,
  author,
  role,
  company,
  rating,
  index = 0,
}: TestimonialCardProps) {
  const borderColor = borderColors[index % borderColors.length];
  const avatarGradient = avatarGradients[index % avatarGradients.length];

  return (
    <div
      className="relative rounded-xl border bg-card p-6 flex flex-col"
      style={{
        borderTop: "3px solid transparent",
        borderImage: `${borderColor} 1`,
      }}
    >
      <Quote className="w-8 h-8 text-primary/20 mb-4 -scale-x-100" />

      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? "text-yellow-400" : "fill-muted text-muted"
            }`}
            style={
              i < rating
                ? {
                    background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }
                : undefined
            }
            fill={i < rating ? "currentColor" : undefined}
          />
        ))}
      </div>

      <p className="text-sm leading-relaxed flex-1 mb-6">{quote}</p>

      <div className="flex items-center gap-3 pt-4 border-t">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
          style={{ background: avatarGradient }}
        >
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
