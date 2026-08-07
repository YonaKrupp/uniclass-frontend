import React from "react";

export default function ScheduleAlert({ alert }) {
  if (!alert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl max-w-sm w-full p-6 space-y-4">
        <h3 className="font-heading font-bold text-lg text-foreground">{alert.title}</h3>
        <p className="text-sm text-muted-foreground font-body whitespace-pre-line">{alert.message}</p>
        <div className="flex gap-2 justify-end">
          {alert.type === "confirm" && (
            <button
              onClick={() => alert.onCancel?.()}
              className="px-4 py-2 rounded-lg border border-border text-sm font-heading font-medium text-foreground hover:bg-muted transition-colors"
            >
              ביטול
            </button>
          )}
          <button
            onClick={() => alert.onConfirm?.()}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-heading font-medium hover:bg-primary/90 transition-colors"
          >
            {alert.confirmText || "אישור"}
          </button>
        </div>
      </div>
    </div>
  );
}