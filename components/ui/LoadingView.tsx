import React from "react";

export default function LoadingView({
  title = "Loading…",
  subtitle,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div
      className={`w-full py-10 flex flex-col items-center justify-center gap-3 ${className}`}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="w-10 h-10 rounded-full border-2 border-special-blue/30 border-t-special-blue animate-spin" />
      <div className="text-foreground/90 font-medium">{title}</div>
      {subtitle ? (
        <div className="text-foreground/60 text-sm">{subtitle}</div>
      ) : null}
    </div>
  );
}
