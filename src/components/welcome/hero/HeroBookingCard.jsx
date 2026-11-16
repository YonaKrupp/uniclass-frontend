import React from "react";
import { CalendarCheck, Check, MousePointer } from "lucide-react";
import { HeroBadge, HeroStem } from "./HeroMarks";

const DAYS = ["ב׳", "ג׳", "ד׳", "ה׳"];
const TIMES = ["16:00", "18:00"];
const SELECTED_DAY = 1;
const SELECTED_TIME = 1;

function SlotChip({ label, selected }) {
  if (!selected) {
    return (
      <span className="flex h-7 items-center justify-center rounded-[10px] bg-muted font-body text-[13px] font-medium text-foreground/70">
        {label}
      </span>
    );
  }
  return (
    <span className="relative block h-7">
      <span className="hs-slot-off absolute inset-0 flex items-center justify-center rounded-[10px] bg-muted font-body text-[13px] font-medium text-foreground/70">
        {label}
      </span>
      <span className="hs-slot-on absolute inset-0 flex items-center justify-center rounded-[10px] bg-primary font-body text-[13px] font-semibold text-primary-foreground">
        {label}
      </span>
    </span>
  );
}

/**
 * Satellite 2 — the booking card. The timeline moves a cursor onto 18:00,
 * clicks it, and the day + time become the selected slot.
 */
export default function HeroBookingCard() {
  return (
    <div className="wl-glass relative w-full rounded-[20px] p-3.5">
      <div className="flex items-center gap-2">
        <HeroBadge>2</HeroBadge>
        <CalendarCheck className="h-4 w-4 text-primary" aria-hidden="true" />
        <span className="font-body text-[13px] font-semibold text-foreground/85">בחירת מועד</span>
      </div>

      <div className="mt-2.5 grid grid-cols-4 gap-1.5">
        {DAYS.map((day, i) => (
          <SlotChip key={day} label={day} selected={i === SELECTED_DAY} />
        ))}
      </div>

      <div className="mt-1.5 grid grid-cols-2 gap-1.5">
        {TIMES.map((time, i) => (
          <div key={time} className="relative">
            <SlotChip label={time} selected={i === SELECTED_TIME} />
            {i === SELECTED_TIME && (
              <>
                <span
                  aria-hidden="true"
                  className="hs-ripple pointer-events-none absolute inset-0 rounded-[10px] border-2 border-primary/70"
                />
                <MousePointer
                  aria-hidden="true"
                  className="hs-cursor pointer-events-none absolute left-1/2 top-1/2 h-4 w-4 fill-card text-foreground drop-shadow"
                />
              </>
            )}
          </div>
        ))}
      </div>

      <div className="hs-confirm mt-2 flex items-center gap-1.5 rounded-[10px] bg-mint/10 px-2 py-1.5 font-body text-[13px] font-semibold text-mint">
        <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        השיעור נקבע
      </div>

      <HeroStem className="hs-stem-booking" />
    </div>
  );
}