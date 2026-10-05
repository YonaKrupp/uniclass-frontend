import React from "react";
import { CalendarClock, ShieldCheck, BadgeCheck } from "lucide-react";
import HeroShowcase from "./HeroShowcase";
import HeroRibbon from "./HeroRibbon";

const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

const trustPills = [
  { icon: CalendarClock, label: "גמישות מלאה" },
  { icon: ShieldCheck, label: "תשלום מאובטח" },
  { icon: BadgeCheck, label: "ללא התחייבות" },
];

export default function LandingHero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
      <HeroRibbon />
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="max-w-xl">
            <h1 id="hero-title" className="app-fade-up text-5xl sm:text-6xl font-heading font-extrabold tracking-tight mb-6 leading-[1.1] text-foreground" style={{ animationDelay: "0.05s" }}>
              תלמדו מתי שנוח לכם,
              <br />
              תרוויחו כמה שאתם מבקשים
            </h1>

            <p className="app-fade-up text-lg sm:text-xl text-muted-foreground font-body font-light leading-relaxed mb-9 max-w-xl" style={{ animationDelay: "0.12s" }}>
              UniClass מזמינה סטודנטים ומורים פרטיים להפוך את הידע שלהם למקור הכנסה משתלם וגמיש. ללא התחייבות למכסת שעות, עם תשלום מאובטח וניהול יומן חכם — הכל במקום אחד.
            </p>

            <div className="app-fade-up flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-10" style={{ animationDelay: "0.18s" }}>
              <a href="#register" onClick={(e) => { e.preventDefault(); scrollTo("register"); }} className="flex items-center justify-center px-7 py-3.5 bg-primary text-primary-foreground rounded-full text-base font-body font-semibold shadow-sm hover:shadow-md hover:shadow-primary/20 hover:-translate-y-0.5 transition-all active:scale-[0.98]">
                הצטרפו לפיילוט
              </a>
              <a href="#about" onClick={(e) => { e.preventDefault(); scrollTo("about"); }} className="flex items-center justify-center px-7 py-3.5 text-foreground border border-border rounded-full text-base font-body font-semibold hover:bg-muted/50 hover:border-primary/30 transition-all">
                למדו עוד
              </a>
            </div>

            <ul className="app-fade-up flex flex-wrap items-center gap-x-6 gap-y-3" style={{ animationDelay: "0.24s" }}>
              {trustPills.map((pill) => {
                const Icon = pill.icon;
                return (
                  <li key={pill.label} className="flex items-center gap-2 text-sm font-body font-medium text-muted-foreground">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary" aria-hidden="true">
                      <Icon className="w-4 h-4" />
                    </span>
                    {pill.label}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="app-fade-up relative" style={{ animationDelay: "0.3s" }}>
            <HeroShowcase />
          </div>
        </div>
      </div>
    </section>
  );
}