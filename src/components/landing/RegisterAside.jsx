import React from "react";
import { Clock, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import Reveal from "./Reveal";

const points = [
  { icon: Clock, text: "ניצור איתכם קשר תוך 24 שעות מרגע ההרשמה" },
  { icon: ShieldCheck, text: "ההרשמה ללא עלות וללא שום התחייבות" },
  { icon: Sparkles, text: "תהיו מהמורים הראשונים בפלטפורמה" },
];

export default function RegisterAside() {
  return (
    <Reveal>
      <div className="bg-card rounded-2xl border border-border p-8 shadow-sm h-full">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
          <Sparkles className="w-7 h-7 text-primary" />
        </div>
        <h3 className="text-xl font-heading font-semibold text-foreground mb-2">מה קורה אחרי ההרשמה?</h3>
        <p className="text-sm text-muted-foreground font-body font-light leading-relaxed mb-6">
          מילאתם את הטופס — אנחנו כבר עובדים על זה. הנה מה שתקבלו:
        </p>
        <ul className="space-y-4">
          {points.map((p) => (
            <li key={p.text} className="flex items-start gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-mint/10 text-mint shrink-0">
                <p.icon className="w-4 h-4" />
              </span>
              <span className="text-sm font-body text-foreground/90 leading-relaxed pt-1.5">{p.text}</span>
            </li>
          ))}
        </ul>
        <div className="mt-7 pt-6 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
            <CheckCircle2 className="w-4 h-4 text-mint" />
            <span>מקומות הפיילוט מוגבלים — הצטרפו כבר עכשיו</span>
          </div>
        </div>
      </div>
    </Reveal>
  );
}