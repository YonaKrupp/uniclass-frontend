import React from "react";
import { MessageSquare } from "lucide-react";
import { HeroBadge, HeroStem } from "./HeroMarks";

/**
 * Satellite 1 — the student asks for a slot, the teacher answers.
 * Both bubbles are part of the timeline (typing indicator between them).
 */
export default function HeroChatCard() {
  return (
    <div className="wl-glass relative w-full rounded-[20px] p-3.5">
      <div className="flex items-center gap-2">
        <HeroBadge>1</HeroBadge>
        <MessageSquare className="h-4 w-4 text-primary" aria-hidden="true" />
        <span className="font-body text-[13px] font-semibold text-foreground/85">צ׳אט עם המורה</span>
      </div>

      <div className="mt-2.5 flex flex-col gap-1.5">
        <p className="hs-bub-student max-w-[88%] self-start rounded-2xl rounded-tr-[6px] bg-muted px-3 py-2 font-body text-[13px] leading-snug text-foreground">
          יש מקום ביום ג׳?
        </p>

        <span
          className="hs-typing flex w-fit items-center gap-1 self-end rounded-2xl rounded-tl-[6px] bg-muted/70 px-3 py-2.5"
          aria-hidden="true"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
        </span>

        <div className="hs-bub-teacher max-w-[92%] self-end rounded-2xl rounded-tl-[6px] bg-primary/10 px-3 py-2">
          <span className="font-body text-[13px] font-semibold text-primary">מורה</span>
          <p className="mt-0.5 font-body text-[13px] leading-snug text-foreground">
            כן, נשארו מועדים פנויים
          </p>
        </div>
      </div>

      <HeroStem className="hs-stem-chat" />
    </div>
  );
}