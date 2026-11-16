import React from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

/** תוכן הבועה/המודאל — כותרת, הסבר, מונה שלבים, נקודות התקדמות וכפתורים (RTL). */
export default function TutorialCardContent({ step, index, total, onPrev, onNext, onSkip }) {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const primaryLabel = step.primaryLabel || (isLast ? "סיימתי, בואו נתחיל" : "הבא");

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base sm:text-lg font-heading font-bold text-foreground leading-snug">
          {step.title}
        </h3>
        <button
          type="button"
          onClick={onSkip}
          aria-label="דלג על ההדרכה"
          className="shrink-0 -mt-1 -ml-1 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <p className="text-sm font-body leading-relaxed text-muted-foreground">{step.body}</p>

      {!step.modal && (
        <p className="text-xs font-heading font-semibold text-primary">
          שלב {index + 1} מתוך {total}
        </p>
      )}

      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          {!isFirst && (
            <button
              type="button"
              onClick={onPrev}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-border text-sm font-heading font-medium text-foreground hover:bg-muted transition-colors min-h-[40px]"
            >
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
              הקודם
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-heading font-semibold shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all min-h-[40px]"
          >
            {primaryLabel}
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          onClick={onSkip}
          className="text-xs font-body text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors whitespace-nowrap"
        >
          דלג על ההדרכה
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5" aria-hidden="true">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "w-5 bg-primary" : "w-1.5 bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}