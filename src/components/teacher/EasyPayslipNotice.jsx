import React, { useEffect, useState } from "react";
import { Receipt, X } from "lucide-react";

const PAYSLIP_URL = "https://tpz.link/njfrk";

// הודעה חד-פעמית לכל מורה: חובה לפתוח חשבון באיזי תלוש כדי לקבל את התשלום.
export default function EasyPayslipNotice({ email, enabled = true }) {
  const storageKey = email ? `_easyPayslipNoticeSeen_${email}` : "";
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!enabled || !storageKey) return;
    let seen = false;
    try {
      seen = localStorage.getItem(storageKey) === "1";
    } catch {
      seen = false;
    }
    if (!seen) setOpen(true);
  }, [enabled, storageKey]);

  const dismiss = () => {
    try {
      if (storageKey) localStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
    setShowForm(false);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (showForm) setShowForm(false);
      else dismiss();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, showForm]);

  if (!open) return null;

  // הטופס נפתח בתוך המערכת (iframe) ולא בעמוד חדש
  if (showForm) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="איזי תלוש"
        dir="rtl"
        className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-0 sm:p-4"
        onClick={() => setShowForm(false)}
      >
        <div
          className="bg-card w-full h-full sm:h-[94vh] sm:max-w-[1400px] rounded-none sm:rounded-2xl sm:border border-border overflow-hidden flex flex-col shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border shrink-0">
            <div className="min-w-0">
              <h2 className="text-base font-heading font-semibold text-foreground">איזי תלוש</h2>
              <p className="text-xs font-body text-muted-foreground truncate">
                מלאו את הפרטים בטופס ושלחו, אין צורך לצאת מהמערכת.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              aria-label="סגירת הטופס"
              className="shrink-0 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 min-h-0 bg-white">
            <iframe
              src={PAYSLIP_URL}
              title="איזי תלוש"
              className="w-full h-full border-0"
              allow="clipboard-write"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="easy-payslip-notice-title"
      dir="rtl"
      className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4"
      onClick={dismiss}
    >
      <div
        className="bg-card rounded-2xl border border-border shadow-2xl max-w-md w-full p-6 space-y-4"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Receipt className="w-5 h-5 text-primary" aria-hidden="true" />
            </span>
            <h2 id="easy-payslip-notice-title" className="text-lg font-heading font-bold text-foreground">
              פתיחת חשבון באיזי תלוש
            </h2>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="סגירת ההודעה"
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm font-body text-foreground leading-relaxed">
          כדי שנעביר לך את התשלום עבור השיעורים, עליך לפתוח חשבון באיזי תלוש.
        </p>

        <div className="rounded-xl bg-muted/60 border border-border p-3.5 space-y-1.5">
          <p className="text-sm font-heading font-semibold text-foreground">עמלת איזי תלוש</p>
          <p className="text-sm font-body text-muted-foreground leading-relaxed">
            התשלום יגיע אליך פחות העמלה של איזי תלוש: 3.5% מסכום התשלום או 50 ₪, לפי הגבוה מביניהם.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-heading font-semibold hover:bg-primary/90 transition-colors min-h-[48px]"
        >
          <Receipt className="w-4 h-4" aria-hidden="true" />
          לפתיחת חשבון באיזי תלוש
        </button>

        <button
          type="button"
          onClick={dismiss}
          className="w-full px-5 py-2.5 bg-muted text-foreground rounded-xl text-sm font-heading font-medium hover:bg-accent transition-colors min-h-[44px]"
        >
          כן, כבר פתחתי
        </button>
      </div>
    </div>
  );
}