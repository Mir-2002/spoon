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
      <div className="inline-flex gap-2 rounded-xl border border-gray-500/50 bg-special-black/10 p-1">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChangeAction(option.value)}
              className={`px-3 py-2 lg:px-4 text-sm lg:text-base transition duration-200 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-special-blue/70 ${
                selected
                  ? "font-semibold bg-foreground text-special-blue"
                  : "text-foreground/80 hover:bg-foreground/10"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
