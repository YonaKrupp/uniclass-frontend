import React, { useState, useEffect } from "react";
import { Accessibility, Plus, Minus, Contrast, Link2, Pause, X, RotateCcw } from "lucide-react";

const PREFS_KEY = "uniclass_a11y_prefs";

const DEFAULT_PREFS = {
  largerText: false,
  highContrast: false,
  grayscale: false,
  highlightLinks: false,
  stopAnimations: false,
};

function applyPrefs(prefs) {
  const root = document.documentElement;
  root.classList.toggle("a11y-large-text", !!prefs.largerText);
  root.classList.toggle("a11y-high-contrast", !!prefs.highContrast);
  root.classList.toggle("a11y-grayscale", !!prefs.grayscale);
  root.classList.toggle("a11y-highlight-links", !!prefs.highlightLinks);
  root.classList.toggle("a11y-stop-animations", !!prefs.stopAnimations);
}

const TOGGLES = [
  { key: "largerText", label: "הגדלת טקסט", icon: Plus },
  { key: "highContrast", label: "ניגודיות גבוהה", icon: Contrast },
  { key: "grayscale", label: "שחור-לבן", icon: RotateCcw },
  { key: "highlightLinks", label: "הדגשת קישורים", icon: Link2 },
  { key: "stopAnimations", label: "עצירת אנימציות", icon: Pause },
];

export default function AccessibilityToolbar() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PREFS_KEY) || "null");
      if (saved) {
        setPrefs({ ...DEFAULT_PREFS, ...saved });
        applyPrefs(saved);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = (key) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    applyPrefs(next);
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const reset = () => {
    setPrefs(DEFAULT_PREFS);
    applyPrefs(DEFAULT_PREFS);
    try {
      localStorage.removeItem(PREFS_KEY);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="fixed left-3 bottom-3 z-[70]">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="פתיחת סרגל נגישות"
          aria-expanded="false"
          className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <Accessibility className="w-5 h-5" />
        </button>
      ) : (
        <div className="bg-card border border-border rounded-2xl shadow-xl p-4 w-72 app-fade-up">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-semibold text-foreground text-base">נגישות</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="סגירת סרגל נגישות"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <ul className="space-y-2">
            {TOGGLES.map((t) => {
              const Icon = t.icon;
              const active = !!prefs[t.key];
              return (
                <li key={t.key}>
                  <button
                    type="button"
                    onClick={() => toggle(t.key)}
                    aria-pressed={active}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm font-body transition-colors ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1 text-right">{t.label}</span>
                    <span
                      className={`w-9 h-5 rounded-full relative transition-colors ${active ? "bg-primary" : "bg-muted"}`}
                      aria-hidden="true"
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${active ? "right-0.5" : "right-4"}`} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={reset}
            className="w-full mt-3 px-3 py-2 rounded-xl text-sm font-body font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            איפוס הגדרות
          </button>
        </div>
      )}
    </div>
  );
}