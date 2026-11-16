import React from "react";

const ITEMS = [
  { label: "פנויים ללמד", background: "#d8f5e6", border: "1px solid #34a86b" },
  { label: "שיעור עם תלמיד/ה", background: "#e3e7ff", border: "1px solid #6366f1" },
  { label: "עבר / לא זמין", background: "#f1f2f4", border: "1px solid #d7dade" },
];

export default function ScheduleLegend() {
  return (
    <div
      data-tour="legend"
      className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 bg-card border border-border/70 rounded-2xl px-4 py-3 shadow-sm"
      role="region"
      aria-label="מקרא צבעים"
    >
      {ITEMS.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5 text-xs font-body text-foreground">
          <span
            className="w-3.5 h-3.5 rounded-md shrink-0"
            style={{ background: item.background, border: item.border }}
            aria-hidden="true"
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}