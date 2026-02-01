"use client";

import type { TimeRange } from "@/lib/spotify";

const options: Array<{ value: TimeRange; label: string }> = [
  { value: "short_term", label: "Last 4 weeks" },
  { value: "medium_term", label: "Last 6 months" },
  { value: "long_term", label: "All Time" },
];

export default function TimeRangePicker({
  value,
  onChangeAction,
  className = "",
}: {
  value: TimeRange;
  onChangeAction: (value: TimeRange) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChangeAction(option.value)}
            className={`px-4 py-2 transition-all duration-300 ${
              value === option.value
                ? "font-semibold bg-foreground text-special-blue rounded-lg"
                : ""
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
