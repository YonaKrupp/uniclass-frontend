import React, { useEffect, useState } from "react";
import { Receipt, X } from "lucide-react";

const PAYSLIP_URL = "https://tpz.link/njfrk";

export default function EasyPayslipPanel() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <div className="pt-4 border-t border-border text-center space-y-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-heading font-semibold hover:bg-primary/90 transition-colors min-h-[44px] shadow-sm"
        >
          <Receipt className="w-4 h-4" aria-hidden="true" />
          איזי תלוש
        </button>
        <p className="text-xs font-body text-muted-foreground leading-relaxed">
          הפקת תלוש שכר דיגיטלי. לוחצים על הכפתור, ממלאים את הפרטים בטופס שנפתח ושולחים.
        </p>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="איזי תלוש"
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-0 sm:p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-card w-full h-full sm:h-[94vh] sm:max-w-[1400px] rounded-none sm:rounded-2xl sm:border border-border overflow-hidden flex flex-col shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border shrink-0">
              <div className="min-w-0">
                <h3 className="text-base font-heading font-semibold text-foreground">איזי תלוש</h3>
                <p className="text-xs font-body text-muted-foreground truncate">
                  מלאו את הפרטים בטופס ושלחו — אין צורך לצאת מהמערכת.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="סגירת איזי תלוש"
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
      )}
    </>
  );
}