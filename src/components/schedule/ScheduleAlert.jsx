import React from "react";

export default function ScheduleAlert({ alert }) {
  if (!alert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 app-fade-up">
      <div className="bg-card rounded-3xl border border-border/70 shadow-2xl max-w-sm w-full p-6 space-y-4">
        <h3 className="font-heading font-bold text-lg text-foreground">{alert.title}</h3>
        <p className="text-sm text-muted-foreground font-body whitespace-pre-line leading-relaxed">{alert.message}</p>
        <div className="flex gap-2 justify-end">
          {alert.type === "confirm" && (
            <button
              onClick={() => alert.onCancel?.()}
              className="px-5 py-2.5 rounded-full border border-border text-sm font-heading font-medium text-foreground hover:bg-muted transition-colors"
            >
              ביטול
            </button>
          )}
          <button
            onClick={() => alert.onConfirm?.()}
            className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-heading font-semibold shadow-md shadow-primary/25 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            {alert.confirmText || "אישור"}
          </button>
        </div>
      </div>
    </div>
  );
}