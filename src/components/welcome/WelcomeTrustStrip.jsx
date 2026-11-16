import React from "react";
import { CalendarX, GraduationCap, ShieldCheck } from "lucide-react";

const ITEMS = [
  { icon: ShieldCheck, label: "תשלום מאובטח", note: "בכרטיס אשראי דרך הפלטפורמה" },
  { icon: CalendarX, label: "ביטול חינם", note: "עד 24 שעות לפני השיעור" },
  { icon: GraduationCap, label: "סטודנטים מהאוניברסיטאות", note: "שעברו את הקורסים עצמם" },
];

/** Slim trust strip under the hero — real value props only, no logos or counts. */
export default function WelcomeTrustStrip() {
  return (
    <section aria-label="מה מקבלים ב-UniClass" className="relative border-y border-[hsl(var(--wl-hair))] bg-card/50 backdrop-blur">
      <div className="mx-auto grid max-w-[1200px] grid-cols-2 gap-px px-5 sm:px-8 md:grid-cols-3">
        {ITEMS.map(({ icon: Icon, label, note }) => (
          <div key={label} className="flex items-start gap-2.5 py-4 md:py-5">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs font-heading font-semibold text-foreground md:text-sm">{label}</p>
              <p className="mt-0.5 text-[11px] font-body text-muted-foreground md:text-xs">{note}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}