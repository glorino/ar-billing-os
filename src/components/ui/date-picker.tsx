"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./input";

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

function DatePicker({ value, onChange, placeholder = "Pick a date", className }: DatePickerProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : undefined;
    onChange?.(date);
  };

  return (
    <div className={cn("relative", className)}>
      <Input
        ref={inputRef}
        type="date"
        value={value ? format(value, "yyyy-MM-dd") : ""}
        onChange={handleChange}
        className="pr-10"
      />
      <CalendarIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none" />
    </div>
  );
}

export { DatePicker };
