import React from "react";
import { Sparkles, PlayCircle } from "lucide-react";

export default function AvailabilityEmptyBanner({ onStartTour }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-mint/30 bg-mint/10 px-4 py-3.5">
      <Sparkles className="w-5 h-5 shrink-0 text-mint" aria-hidden="true" />
      <p className="flex-1 text-sm sm:text-base font-body text-foreground leading-relaxed">
        עדיין לא פתחת שעות ללימוד 👋 לחץ על משבצות בלוח כדי שתלמידים יוכלו להזמין ממך שיעורים
      </p>
      <button
        type="button"
        onClick={onStartTour}
        className="inline-flex items-center justify-center gap-1.5 shrink-0 min-h-[40px] px-4 rounded-full border border-mint/40 bg-card text-sm font-heading font-semibold text-foreground hover:bg-mint/10 transition-colors"
      >
        <PlayCircle className="w-4 h-4 text-mint" aria-hidden="true" />
        איך זה עובד?
      </button>
    </div>
  );
}