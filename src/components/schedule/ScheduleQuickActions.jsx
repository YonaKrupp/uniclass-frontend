import React from "react";
import { Copy, Repeat2, Loader2 } from "lucide-react";

export default function ScheduleQuickActions({ busy, onCopyPreviousWeek, onRepeatNextWeeks }) {
  return (
    <div data-tour="quick-actions" className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onCopyPreviousWeek}
        disabled={busy}
        className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-xl border border-border bg-card text-xs sm:text-sm font-heading font-semibold text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors disabled:opacity-50"
      >
        <Copy className="w-4 h-4 text-primary" aria-hidden="true" />
        העתק מהשבוע הקודם
      </button>
      <button
        type="button"
        onClick={onRepeatNextWeeks}
        disabled={busy}
        className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-xl border border-border bg-card text-xs sm:text-sm font-heading font-semibold text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors disabled:opacity-50"
      >
        {busy ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" aria-hidden="true" />
        ) : (
          <Repeat2 className="w-4 h-4 text-primary" aria-hidden="true" />
        )}
        חזור על שבוע זה בשבוע הבא
      </button>
      <p className="text-[11px] font-body text-muted-foreground">
        טיפ: אפשר גם לגרור על כמה משבצות או ללחוץ על שם היום לפתיחת יום שלם.
      </p>
    </div>
  );
}