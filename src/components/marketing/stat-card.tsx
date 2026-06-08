"use client";

import { useEffect, useRef, useState } from "react";

const gradientMap: Record<string, string> = {
  purple: 'linear-gradient(135deg, #667eea, #764ba2)',
  green: 'linear-gradient(135deg, #43e97b, #38f9d7)',
  orange: 'linear-gradient(135deg, #fa709a, #fee140)',
};

interface StatCardProps {
  value: number;
  label: string;
  prefix?: string;
  duration?: number;
  color?: string;
}

export function StatCard({ value, label, prefix = "", duration = 2000, color = "purple" }: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;

          const startTime = performance.now();
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(Math.floor(eased * value));

            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [value, duration]);

  const formatted = displayValue.toLocaleString("en-US");

  return (
    <div ref={ref} className="text-center">
      <div
        className="text-4xl sm:text-5xl font-bold font-mono-nums mb-2"
        style={{
          background: gradientMap[color] || gradientMap.purple,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {prefix}
        {formatted}
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
