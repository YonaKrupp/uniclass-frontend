import React, { useEffect, useRef } from "react";
import { ChevronDown, CheckCheck, Trash2 } from "lucide-react";

export default function BoardDayHeader({ dayName, dateLabel, manage, open, onOpenChange, onMarkAll, onClearAll }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onOpenChange(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, onOpenChange]);

  return (
    <div ref={ref} className="relative text-center py-1">
      {manage ? (
        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={`אפשרויות ליום ${dayName}`}
          className="inline-flex items-center gap-0.5 rounded-lg px-1.5 py-0.5 hover:bg-muted transition-colors"
        >
          <span className="font-heading font-bold text-sm sm:text-base text-foreground">{dayName}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
      ) : (
        <div className="font-heading font-bold text-sm sm:text-base text-foreground">{dayName}</div>
      )}
      <div className="text-xs text-muted-foreground font-body">{dateLabel}</div>

      {open && (
        <div
          role="menu"
          className="absolute top-full mt-1 left-1/2 -translate-x-1/2 z-30 w-44 bg-card border border-border rounded-xl shadow-xl p-1.5 app-fade-up"
        >
          <button
            type="button"
            role="menuitem"
            onClick={onMarkAll}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-body text-foreground hover:bg-muted text-right transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-mint" aria-hidden="true" />
            סמן את כל היום
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={onClearAll}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-body text-foreground hover:bg-muted text-right transition-colors"
          >
            <Trash2 className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            נקה את כל היום
          </button>
        </div>
      )}
    </div>
  );
}