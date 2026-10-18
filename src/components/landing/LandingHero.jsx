import React from "react";
import { CalendarClock, ShieldCheck, BadgeCheck } from "lucide-react";
import HeroShowcase from "./HeroShowcase";
import HeroRibbon from "./HeroRibbon";
import PilotApiLink from "./PilotApiLink";

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

const trustPills = [
  { icon: CalendarClock, label: "ללא מכסת שעות" },
  { icon: ShieldCheck, label: "תשלום מאובטח" },
  { icon: BadgeCheck, label: "גמישות בשעות" },
];

export default function LandingHero() {
  return (
    <section aria-labelledby="hero-title" className="order-1 relative overflow-hidden pt-8 pb-10 md:pt-24 md:pb-28">
      <HeroRibbon />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="max-w-xl">
            <h1 id="hero-title" className="app-fade-up text-3xl md:text-6xl font-heading font-extrabold tracking-tight mb-3 md:mb-6 leading-[1.15] md:leading-[1.1] text-foreground" style={{ animationDelay: "0.05s" }}>
              הידע שלכם שווה כסף!!!
              <br />
              אתם קובעים מתי וכמה.
            </h1>

            <p className="app-fade-up text-sm md:text-xl text-muted-foreground font-body font-light leading-relaxed mb-5 md:mb-9 max-w-xl" style={{ animationDelay: "0.12s" }}>
              UniClass היא הפלטפורמה שמחברת בין סטודנטים לתלמידים הזקוקים לעזרה בלימודים. מלמדים בשעות שנוחות לכם, בלי מכסת שעות מינימלית, ומקבלים תשלום מאובטח על כל שיעור. ההזמנות, היומן והתשלומים מנוהלים עבורכם במקום אחד.
            </p>

            <div className="app-fade-up flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6 md:mb-10" style={{ animationDelay: "0.18s" }}>
              <a href="#register" onClick={(e) => { e.preventDefault(); scrollTo("register"); }} className="flex items-center justify-center px-7 py-3.5 bg-primary text-primary-foreground rounded-full text-base font-body font-semibold shadow-sm hover:shadow-md hover:shadow-primary/20 hover:-translate-y-0.5 transition-all active:scale-[0.98]">
                הצטרפו כמורים מייסדים
              </a>
              <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollTo("how-it-works"); }} className="hidden md:flex items-center justify-center px-7 py-3.5 text-foreground border border-border rounded-full text-base font-body font-semibold hover:bg-muted/50 hover:border-primary/30 transition-all">
                איך זה עובד
              </a>
            </div>

            <PilotApiLink />

            <ul className="app-fade-up flex flex-wrap items-center gap-x-3 gap-y-2 md:gap-x-6 md:gap-y-3" style={{ animationDelay: "0.24s" }}>
              {trustPills.map((pill) => {
                const Icon = pill.icon;
                return (
                  <li key={pill.label} className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-body font-medium text-muted-foreground">
                    <span className="flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-lg bg-primary/10 text-primary" aria-hidden="true">
                      <Icon className="w-4 h-4" />
                    </span>
                    {pill.label}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="app-fade-up relative hidden md:block" style={{ animationDelay: "0.3s" }}>
            <HeroShowcase />
          </div>
        </div>
      </div>
    </section>
  );
}