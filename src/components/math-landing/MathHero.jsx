import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, ArrowLeft, ShieldCheck, CalendarX } from "lucide-react";
import { HERO, TOPICS } from "./mathLandingContent";

const TRUST = [
  { icon: ShieldCheck, label: "תשלום מאובטח" },
  { icon: CalendarX, label: "ביטול חינם עד 24 שעות לפני" },
];

/** פתיח הדף — כותרת H1 יחידה, משפט פתיחה וכפתור הרשמה. */
export default function MathHero() {
  return (
    <section aria-labelledby="math-hero-title" className="relative overflow-hidden pb-16 pt-8 md:pb-24 md:pt-14">
      <div aria-hidden="true" className="wl-mesh" />
      <div aria-hidden="true" className="wl-grid-lines absolute inset-0" />

      <div className="relative z-10 mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:gap-10">
          <div className="max-w-xl">
            <p className="wl-eyebrow wl-rise">{HERO.eyebrow}</p>

            <h1
              id="math-hero-title"
              className="wl-rise wl-rise-1 mt-4 text-[32px] font-heading font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-[44px] lg:text-[54px]"
              style={{ textWrap: "balance" }}
            >
              מורה פרטי למתמטיקה{" "}
              <span className="wl-grad-student">אונליין</span>, עם סטודנטים מצטיינים
            </h1>

            <p className="wl-rise wl-rise-2 mt-5 max-w-lg text-base font-body font-light leading-relaxed text-muted-foreground md:text-lg">
              {HERO.intro}
            </p>

            <div className="wl-rise wl-rise-2 mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Link to="/register-student" className="wl-btn wl-btn-student px-7 py-4 text-base">
                <GraduationCap className="h-5 w-5" aria-hidden="true" />
                הרשמה כתלמיד/ה
              </Link>
              <a href="#how-it-works" className="wl-btn wl-btn-outline px-6 py-3.5 text-sm">
                איך זה עובד
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>

            <ul className="wl-rise wl-rise-3 mt-8 flex flex-wrap gap-2">
              {TRUST.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="wl-hairline inline-flex items-center gap-1.5 rounded-full border bg-card/70 px-3 py-1.5 text-[11px] font-body font-medium text-foreground/75 backdrop-blur md:text-xs"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-mint" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="wl-rise wl-rise-2">
            <div className="wl-glass wl-scene-shadow rounded-[28px] p-6 sm:p-8">
              <p className="wl-eyebrow">מה לומדים בשיעור</p>
              <div className="mt-5 rounded-2xl border border-[hsl(var(--wl-hair))] bg-background/60 px-4 py-6 text-center">
                <p dir="ltr" className="font-heading text-xl font-extrabold text-foreground sm:text-2xl">
                  f(x) = ax² + bx + c
                </p>
                <p dir="ltr" className="mt-2 font-body text-base font-light text-muted-foreground">
                  ∫ f(x) dx = F(b) − F(a)
                </p>
              </div>
              <ul className="mt-5 flex flex-wrap justify-center gap-2">
                {TOPICS.map((topic) => (
                  <li
                    key={topic}
                    className="wl-hairline rounded-full border bg-card/70 px-3 py-1.5 text-xs font-body font-medium text-foreground/80"
                  >
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}