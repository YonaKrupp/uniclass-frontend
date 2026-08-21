import React from "react";
import { Sparkles, ArrowLeft, CalendarClock, ShieldCheck, BadgeCheck } from "lucide-react";
import MeshGradient from "./MeshGradient";
import Reveal from "./Reveal";
import HeroShowcase from "./HeroShowcase";

const trustPills = [
{ icon: CalendarClock, label: "גמישות מלאה", tone: "indigo" },
{ icon: ShieldCheck, label: "תשלום מאובטח", tone: "indigo" },
{ icon: BadgeCheck, label: "ללא התחייבות", tone: "mint" }];


const universities = [
"האוניברסיטה העברית",
"אוניברסיטת תל אביב",
"הטכניון",
"אוניברסיטת בן-גוריון",
"האוניברסיטה הפתוחה",
"אוניברסיטת חיפה"];

export default function LandingHero() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="relative overflow-hidden pt-20 pb-16 sm:pt-28 sm:pb-20">
      <MeshGradient className="inset-0" />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage:
          "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 65% 55% at 40% 40%, black, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 65% 55% at 40% 40%, black, transparent 80%)"
        }} />
      

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="max-w-xl">
            


            

            <h1 className="animate-land-fade-up text-5xl sm:text-7xl font-heading font-semibold tracking-tight mb-6 leading-[1.08] text-foreground" style={{ animationDelay: "0.05s" }}>
              תלמדו מתי שנוח לכם,
              <br />
              <span className="land-gradient-text">תרוויחו כמה שאתם מבקשים</span>
            </h1>

            <p className="animate-land-fade-up text-lg sm:text-xl text-muted-foreground font-body font-light leading-relaxed mb-9 max-w-xl" style={{ animationDelay: "0.1s" }}>
              UniClass מאפשרת לסטודנטים מצטיינים להפוך את הידע האקדמי למקור הכנסה משתלם וגמיש. ללא התחייבות למכסת שעות, עם תשלום מאובטח וניהול יומן חכם הכל במקום אחד.
            </p>

            <div className="animate-land-fade-up flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-9" style={{ animationDelay: "0.15s" }}>
              <button onClick={() => scrollTo("register")} className="stripe-gradient-button flex items-center justify-center gap-2 px-7 py-3.5 text-primary-foreground rounded-full text-base font-body font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all active:scale-[0.98]">
                הצטרפו לפיילוט <ArrowLeft className="w-5 h-5" />
              </button>
              <button onClick={() => scrollTo("about")} className="flex items-center justify-center px-7 py-3.5 text-foreground border border-border rounded-full text-base font-body font-semibold hover:bg-muted/50 hover:border-primary/30 transition-all">
                למדו עוד
              </button>
            </div>

            <div className="animate-land-fade-up flex flex-wrap items-center gap-x-6 gap-y-3" style={{ animationDelay: "0.2s" }}>
              {trustPills.map((pill) =>
              <div key={pill.label} className="flex items-center gap-2 text-sm font-body font-medium text-muted-foreground">
                  <span className={`flex items-center justify-center w-7 h-7 rounded-full ${pill.tone === "mint" ? "bg-mint/10 text-mint" : "bg-primary/10 text-primary"}`}>
                    <pill.icon className="w-4 h-4" />
                  </span>
                  {pill.label}
                </div>
              )}
            </div>
          </div>

          <div className="animate-land-fade-up relative" style={{ animationDelay: "0.25s" }}>
            <HeroShowcase />
          </div>
        </div>
      </div>

      <Reveal className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 mt-16 sm:mt-20 pt-8 border-t border-border/60">
        <p className="text-center text-xs text-muted-foreground/60 mb-6 tracking-[0.2em] uppercase font-body">
          נגישה לכל מוסדות הלימוד
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 sm:gap-x-12 gap-y-4 opacity-60">
          {universities.map((u) =>
          <span key={u} className="text-base sm:text-lg font-heading font-medium text-foreground/70">{u}</span>
          )}
        </div>
      </Reveal>
    </section>);

}