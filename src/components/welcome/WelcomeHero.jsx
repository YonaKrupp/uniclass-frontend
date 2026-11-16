import React from "react";
import { CalendarX, ShieldCheck } from "lucide-react";
import WelcomeGrid from "./WelcomeGrid";
import HeroScene from "./HeroScene";
import RoleToggle from "./RoleToggle";
import WelcomeHeroActions from "./WelcomeHeroActions";
import { usePointerParallax } from "./usePointerParallax";

const SUBLINE = "שיעורים אונליין עם סטודנטים שעברו את החומר ממש עכשיו";

// Taken from the page's own FAQ and description. No invented claims.
const TRUST = [
  { icon: ShieldCheck, label: "תשלום מאובטח" },
  { icon: CalendarX, label: "ביטול חינם עד 24 שעות לפני" },
];

export default function WelcomeHero() {
  const heroRef = usePointerParallax();

  return (
    <section
      ref={heroRef}
      aria-labelledby="welcome-hero-title"
      className="relative overflow-hidden pb-16 pt-7 md:pb-24 md:pt-12"
    >
      <WelcomeGrid />
      <div aria-hidden="true" className="wl-mesh" />
      <div
        aria-hidden="true"
        className="wl-aurora pointer-events-none absolute -right-28 -top-28 h-[420px] w-[420px] rounded-full blur-[90px]"
        style={{ background: "hsl(276 78% 58% / 0.18)" }}
      />
      <div
        aria-hidden="true"
        className="wl-aurora pointer-events-none absolute -left-24 top-1/3 h-[320px] w-[320px] rounded-full blur-[80px]"
        style={{ background: "hsl(160 84% 40% / 0.14)", animationDelay: "-8s" }}
      />

      <div className="relative z-10 mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.03fr)] lg:gap-6">
          <div className="max-w-xl">
            <div className="wl-rise">
              <RoleToggle />
            </div>

            <h1
              id="welcome-hero-title"
              className="wl-rise wl-rise-1 mt-6 text-[36px] font-heading font-extrabold leading-[1.03] tracking-tight text-foreground sm:text-[52px] lg:text-[62px]"
              style={{ textWrap: "balance" }}
            >
              המקום שבו <span className="wl-grad-teacher">מורים</span>{" "}
              <span className="wl-grad-student">ותלמידים</span> נפגשים
            </h1>

            <p className="wl-rise wl-rise-2 mt-5 max-w-md text-base font-body font-light leading-relaxed text-muted-foreground md:text-lg">
              {SUBLINE}
            </p>

            <p className="wl-rise wl-rise-2 mt-3 inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/10 px-3 py-1 text-xs font-body font-semibold text-foreground/80 md:text-sm">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-mint" />
              הפלטפורמה נמצאת בשלב פיילוט
            </p>

            <WelcomeHeroActions />

            <ul className="wl-rise wl-rise-3 mt-8 flex flex-wrap gap-2">
              {TRUST.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-card/70 px-3 py-1.5 text-[11px] font-body font-medium text-foreground/75 backdrop-blur wl-hairline md:text-xs"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-mint" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <HeroScene />
        </div>
      </div>
    </section>
  );
}