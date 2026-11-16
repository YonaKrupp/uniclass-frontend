import React from "react";
import { CalendarPlus, CalendarX, CalendarClock } from "lucide-react";

export const SCHEDULE_TABS = [
  { value: "markAvailable", label: "פתח/סגור זמינות", icon: CalendarPlus },
  { value: "cancelLesson", label: "ביטול שיעור", icon: CalendarX },
  { value: "rescheduleLesson", label: "שינוי מועד שיעור", icon: CalendarClock },
];

export default function ScheduleTabs({ mode, onChange }) {
  return (
    <div
      role="tablist"
      aria-label="פעולות בלוח השיעורים"
      data-tour="tabs"
      className="grid grid-cols-3 gap-1 p-1.5 bg-muted rounded-2xl border border-border/70"
    >
      {SCHEDULE_TABS.map((tab) => {
        const Icon = tab.icon;
        const active = mode === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={`flex flex-col items-center justify-center gap-1.5 min-h-[64px] px-1.5 py-2.5 rounded-xl transition-all ${
              active
                ? "bg-card text-primary shadow-sm border border-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-card/60 border border-transparent"
            }`}
          >
            <Icon className={`w-5 h-5 ${active ? "text-primary" : "text-muted-foreground"}`} aria-hidden="true" />
            <span className="text-[11px] sm:text-[13px] font-heading font-semibold leading-tight text-center">
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}