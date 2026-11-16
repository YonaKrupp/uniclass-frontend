import React from "react";

export default function SkipConfirmDialog({ onCancel, onConfirm }) {
  return (
    <div
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-skip-title"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-5 space-y-4 app-fade-up">
        <h3 id="onboarding-skip-title" className="text-base font-heading font-bold text-foreground">
          בטוח שרוצה לדלג?
        </h3>
        <p className="text-sm font-body text-muted-foreground leading-relaxed">
          תמיד אפשר להפעיל מחדש מהפרופיל.
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 min-h-[44px] px-4 rounded-xl bg-destructive text-destructive-foreground text-sm font-heading font-semibold hover:bg-destructive/90 transition-colors"
          >
            כן, דלג
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 min-h-[44px] px-4 rounded-xl bg-muted text-foreground text-sm font-heading font-semibold hover:bg-accent transition-colors"
          >
            המשך במדריך
          </button>
        </div>
      </div>
    </div>
  );
}