import React from "react";
import { Check, FileText } from "lucide-react";
import { HeroBadge, HeroStem } from "./HeroMarks";

const ITEMS = ["מה עברנו בשיעור", "נקודות לתרגול", "משימות להמשך"];

/**
 * Satellite 3 — the optional lesson summary. Its three items check off in
 * sequence at the end of the timeline.
 */
export default function HeroSummaryCard() {
  return (
    <div className="hs-summary wl-glass relative w-full rounded-[20px] p-3.5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <HeroBadge>3</HeroBadge>
        <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
        <span className="font-body text-[13px] font-semibold text-foreground/85">סיכום שיעור</span>
        <span className="rounded-full border border-[hsl(var(--wl-hair))] px-1.5 py-0.5 font-body text-[13px] leading-tight text-muted-foreground">
          אופציונלי
        </span>
      </div>

      <ul className="mt-2.5 space-y-1.5">
        {ITEMS.map((item, i) => (
          <li key={item} className="flex items-center gap-2 font-body text-[13px] leading-snug text-foreground/80">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border border-[hsl(var(--wl-hair))]">
              <Check className={`hs-check-${i + 1} h-3 w-3 text-mint`} aria-hidden="true" />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <p className="mt-2.5 border-t border-[hsl(var(--wl-hair))] pt-2 font-body text-[13px] text-muted-foreground">
        נשלח למשתתפי השיעור
      </p>

      <HeroStem className="hs-stem-summary hidden lg:block" />
    </div>
  );
}