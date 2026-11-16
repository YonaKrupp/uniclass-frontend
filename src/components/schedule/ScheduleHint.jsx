import React from "react";
import { MousePointerClick, CalendarX, CalendarClock } from "lucide-react";

const HINTS = {
  markAvailable: {
    icon: MousePointerClick,
    text: "לחץ על משבצת ריקה כדי לסמן שאתה פנוי ללמד. לחיצה נוספת מבטלת.",
    box: "bg-mint/10 border-mint/30",
    iconColor: "text-mint",
  },
  cancelLesson: {
    icon: CalendarX,
    text: "לחץ על שיעור מתוזמן (כחול) כדי לבטל אותו ולעדכן את התלמיד.",
    box: "bg-destructive/10 border-destructive/25",
    iconColor: "text-destructive",
  },
  rescheduleLesson: {
    icon: CalendarClock,
    text: "לחץ על שיעור, ואז בחר משבצת פנויה להעברה.",
    box: "bg-primary/10 border-primary/25",
    iconColor: "text-primary",
  },
};

export default function ScheduleHint({ mode }) {
  const hint = HINTS[mode] || HINTS.markAvailable;
  const Icon = hint.icon;

  return (
    <div className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 ${hint.box}`} role="status">
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${hint.iconColor}`} aria-hidden="true" />
      <p className="text-sm sm:text-base font-body text-foreground leading-relaxed">{hint.text}</p>
    </div>
  );
}