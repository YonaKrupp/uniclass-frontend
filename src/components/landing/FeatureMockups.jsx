import React from "react";
import { Mic, Video } from "lucide-react";

/**
 * FeatureMockups — real product-UI mockups that replace generic icon cards,
 * giving the page a "there's a real product here" feel.
 */

export function VideoCallMockup() {
  const tiles = [
    { h: 266, s: 50, l: 22 },
    { h: 280, s: 48, l: 26 },
    { h: 296, s: 46, l: 24 },
    { h: 32, s: 60, l: 28 },
  ];
  return (
    <div className="rounded-xl p-3" aria-hidden="true" style={{ background: "hsl(240 10% 9%)" }}>
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] font-body font-medium text-white/70">שיעור חי · מתמטיקה</span>
        <span className="flex items-center gap-1 text-[9px] font-body font-semibold text-white bg-red-500/90 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {tiles.map((t, i) => (
          <div
            key={i}
            className="aspect-video rounded-md flex items-center justify-center"
            style={{ background: `hsl(${t.h} ${t.s}% ${t.l}%)` }}
          >
            <div className="w-7 h-7 rounded-full bg-white/12 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-white/15" />
            </div>
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
  const days = ["א", "ב", "ג", "ד", "ה"];
  const slots = [
    { t: "16:00", on: true },
    { t: "18:30", on: true },
    { t: "—", on: false },
    { t: "10:00", on: true },
    { t: "14:00", on: true },
  ];
  return (
    <div className="rounded-xl bg-card border border-border p-3" aria-hidden="true">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] font-heading font-semibold text-foreground">השבוע</span>
        <span className="text-[9px] text-muted-foreground font-body">5 שיעורים</span>
      </div>
      <div className="grid grid-cols-5 gap-1">
        {days.map((d, i) => (
          <div key={i} className="text-center">
            <div className="text-[9px] text-muted-foreground font-body py-1">{d}</div>
            <div
              className={`rounded-md py-2.5 text-[9px] font-body font-medium ${
                slots[i].on ? "bg-primary/15 text-primary" : "bg-muted/50 text-muted-foreground/40"
              }`}
            >
              {slots[i].t}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}