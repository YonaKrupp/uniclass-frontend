import React from "react";
import { Mic, Video } from "lucide-react";

/**
 * FeatureMockups — real product-UI mockups that replace generic icon cards,
 * giving the page a "there's a real product here" feel.
 */

export function VideoCallMockup() {
  const participants = [
    { initials: "י.כ", name: "יואב", bg: "hsl(266 45% 32%)" },
    { initials: "ד.ל", name: "דנה", bg: "hsl(280 42% 30%)" },
    { initials: "מ.ב", name: "מיכל", bg: "hsl(32 45% 30%)" },
    { initials: "א.ש", name: "אורי", bg: "hsl(240 40% 28%)" },
  ];
  return (
    <div className="rounded-xl p-3" aria-hidden="true" style={{ background: "hsl(240 10% 9%)" }}>
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] font-body font-medium text-white/70">שיעור חי · מתמטיקה</span>
        <span className="flex items-center gap-1 text-[9px] font-body font-semibold text-white bg-red-500/90 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> שידור חי
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {participants.map((p) => (
          <div
            key={p.name}
            className="aspect-video rounded-md flex flex-col items-center justify-center gap-1.5"
            style={{ background: p.bg }}
          >
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
              <span className="text-[9px] font-heading font-semibold text-white/90">{p.initials}</span>
            </div>
            <span className="text-[9px] font-body text-white/80">{p.name}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-2.5">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center"><Mic className="w-3 h-3 text-white/80" /></div>
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center"><Video className="w-3 h-3 text-white/80" /></div>
        </div>
        <span className="text-[10px] text-white/60 font-body">42:18</span>
      </div>
    </div>
  );
}

export function ScheduleMockup() {
  const days = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳"];
  const slots = [
    { t: "16:00", s: "מתמטיקה" },
    { t: "18:30", s: "פיזיקה" },
    { t: "10:00", s: "אנגלית" },
    { t: "14:00", s: "כימיה" },
    { t: "12:00", s: "היסטוריה" },
  ];
  return (
    <div className="rounded-xl bg-card border border-border p-3" aria-hidden="true">
      <div className="flex items-center mb-2.5">
        <span className="text-[10px] font-heading font-semibold text-foreground">השבוע · 5 שיעורים</span>
      </div>
      <div className="grid grid-cols-5 gap-1">
        {days.map((d, i) => (
          <div key={i} className="text-center">
            <div className="text-[9px] text-muted-foreground font-body py-1">{d}</div>
            <div className="rounded-md py-1.5 px-0.5 bg-primary/15">
              <div className="text-[9px] font-body font-semibold text-primary leading-tight">{slots[i].t}</div>
              <div className="text-[8px] font-body text-primary/80 leading-tight mt-0.5">{slots[i].s}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}