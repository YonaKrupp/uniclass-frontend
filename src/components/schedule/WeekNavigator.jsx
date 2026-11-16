import React from "react";
import { ChevronRight, ChevronLeft, RefreshCw, CalendarDays } from "lucide-react";

export default function WeekNavigator({ rangeLabel, isCurrentWeek, loading, onPrev, onNext, onToday, onRefresh }) {
  return (
    <div
      data-tour="week-nav"
      className="flex items-center gap-1.5 sm:gap-2 bg-card rounded-2xl border border-border/70 shadow-sm p-2"
    >
      <button
        type="button"
        onClick={onPrev}
        className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
        aria-label="שבוע קודם"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div className="flex-1 min-w-0 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        <span className="font-heading font-semibold text-foreground text-sm sm:text-base whitespace-nowrap">
          {rangeLabel}
        </span>
        <button
          type="button"
          onClick={onToday}
          disabled={isCurrentWeek}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border text-[11px] sm:text-xs font-heading font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <CalendarDays className="w-3.5 h-3.5" aria-hidden="true" />
          השבוע
        </button>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
        aria-label="שבוע הבא"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={onRefresh}
        title="רענון הלוח"
        aria-label="רענון הלוח"
        className="p-2 rounded-xl text-primary hover:bg-primary/5 transition-colors"
      >
        <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
      </button>
    </div>
  );
}