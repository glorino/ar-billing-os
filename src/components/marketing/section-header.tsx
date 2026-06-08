"use client";

interface SectionHeaderProps {
  label?: string;
  title: string;
  subtitle?: string;
}

export function SectionHeader({ label, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-12">
      {label && (
        <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">
          {label}
        </p>
      )}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-muted-foreground leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}