import React from "react";
import { Check, CreditCard, Play, Search } from "lucide-react";

function Frame({ children }) {
  return (
    <div aria-hidden="true" className="w-full rounded-2xl border border-[hsl(var(--wl-hair))] bg-background/70 p-2.5">
      {children}
    </div>
  );
}

function StudentMock({ index }) {
  if (index === 0) {
    return (
      <Frame>
        <div className="flex items-center gap-1.5 rounded-lg bg-muted/70 px-2 py-1.5 text-[10px] font-body text-muted-foreground">
          <Search className="h-3 w-3" />
          מתמטיקה · 45 דק׳
        </div>
        <div className="mt-1.5 space-y-1">
          {["מ׳", "נ׳"].map((initial) => (
            <div key={initial} className="flex items-center gap-2 rounded-lg border border-[hsl(var(--wl-hair))] px-2 py-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-mint/15 text-[9px] font-bold text-mint">
                {initial}
              </span>
              <span className="text-[10px] font-body text-foreground/80">מועד פנוי</span>
              <span className="mr-auto text-[9px] font-body text-muted-foreground">₪</span>
            </div>
          ))}
        </div>
      </Frame>
    );
  }

  if (index === 1) {
    return (
      <Frame>
        <div className="grid grid-cols-4 gap-1">
          {[0, 1, 2, 3].map((col) => (
            <div key={col} className="space-y-1">
              {[0, 1].map((row) => {
                const active = col === 2 && row === 0;
                return (
                  <span
                    key={row}
                    className={`block rounded-md py-1.5 text-center text-[9px] font-body ${
                      active ? "bg-mint font-semibold text-white" : "bg-muted/70 text-muted-foreground"
                    }`}
                  >
                    {active ? "18:00" : "—"}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
        <p className="mt-1.5 text-center text-[9px] font-body text-muted-foreground">מועד פנוי מהיומן של המורה</p>
      </Frame>
    );
  }

  return (
    <Frame>
      <div
        className="relative flex h-16 items-center justify-center overflow-hidden rounded-xl"
        style={{ background: "linear-gradient(150deg, hsl(266 64% 32%), hsl(276 72% 48%))" }}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 backdrop-blur">
          <Play className="h-3.5 w-3.5 text-white" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-mint/10 px-2 py-1 text-[9px] font-body font-semibold text-mint">
        <Check className="h-3 w-3" />
        סיכום אוטומטי בסיום השיעור
      </div>
    </Frame>
  );
}

function TeacherMock({ index }) {
  if (index === 0) {
    return (
      <Frame>
        <p className="text-[9px] font-body text-muted-foreground">פרופיל מורה</p>
        <div className="mt-1 space-y-1">
          <span className="block h-1.5 w-4/5 rounded-full bg-foreground/15" />
          <span className="block h-1.5 w-3/5 rounded-full bg-foreground/10" />
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <span className="block h-full w-2/3 rounded-full bg-primary" />
        </div>
        <p className="mt-1 text-[9px] font-body text-muted-foreground">מקצועות · ניסיון · תעודה</p>
      </Frame>
    );
  }

  if (index === 1) {
    return (
      <Frame>
        <div className="flex items-center justify-between rounded-lg border border-[hsl(var(--wl-hair))] px-2 py-1.5">
          <span className="text-[9px] font-body text-muted-foreground">מחיר לשיעור</span>
          <span className="text-[10px] font-heading font-bold text-foreground">₪ —</span>
        </div>
        <div className="mt-1.5 flex gap-1">
          {["א׳", "ב׳", "ג׳", "ד׳", "ה׳"].map((day, i) => (
            <span
              key={day}
              className={`flex-1 rounded-md py-1 text-center text-[9px] font-body ${
                i === 1 || i === 3 ? "bg-primary text-primary-foreground" : "bg-muted/70 text-muted-foreground"
              }`}
            >
              {day}
            </span>
          ))}
        </div>
        <p className="mt-1.5 text-[9px] font-body text-muted-foreground">אתם קובעים מתי וכמה</p>
      </Frame>
    );
  }

  return (
    <Frame>
      <div className="flex items-center gap-2 rounded-lg border border-[hsl(var(--wl-hair))] px-2 py-1.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-[9px] font-bold text-primary">
          ת׳
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-body font-semibold text-foreground">בקשת שיעור חדשה</p>
          <p className="text-[9px] font-body text-muted-foreground">מתמטיקה · 45 דק׳</p>
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-primary/10 px-2 py-1 text-[9px] font-body font-semibold text-primary">
        <CreditCard className="h-3 w-3" />
        התשלום מתבצע דרך הפלטפורמה
      </div>
    </Frame>
  );
}

/** A small app-screen illustration for one step of the flow. Decorative only. */
export default function WelcomeStepMock({ tab, index }) {
  return tab === "teachers" ? <TeacherMock index={index} /> : <StudentMock index={index} />;
}