import React from "react";
import { Sparkles, ArrowLeft, CalendarClock, ShieldCheck, BadgeCheck } from "lucide-react";

const trustPills = [
  { icon: CalendarClock, label: "גמישות מלאה" },
  { icon: ShieldCheck, label: "תשלום מאובטח" },
  { icon: BadgeCheck, label: "ללא התחייבות" },
];

export default function LandingHero() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="relative overflow-hidden pt-16 pb-24 sm:pt-24 sm:pb-32">
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="animate-land-blob absolute -top-16 right-1/4 w-80 h-80 bg-primary/25 rounded-full blur-3xl" />
        <div className="animate-land-blob absolute top-24 -left-10 w-96 h-96 bg-accent2/20 rounded-full blur-3xl" style={{ animationDelay: "-4s" }} />
        <div className="animate-land-blob absolute -bottom-20 left-1/3 w-80 h-80 bg-[hsl(260_80%_60%)]/15 rounded-full blur-3xl" style={{ animationDelay: "-8s" }} />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 35%, black, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 35%, black, transparent 75%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <div className="animate-land-fade-up inline-flex items-center gap-2 px-4 py-2 bg-card/70 backdrop-blur-md border border-border/60 rounded-full text-primary text-sm font-heading font-semibold mb-7 shadow-sm">
          <Sparkles className="w-4 h-4" />
          להרוויח כסף מהידע שלכם — הצטרפו לפיילוט
        </div>

        <h1 className="animate-land-fade-up text-5xl sm:text-7xl font-heading font-extrabold tracking-tight mb-6 leading-[1.05]" style={{ animationDelay: "0.05s" }}>
          <span className="text-[hsl(217,44%,35%)] dark:text-[hsl(217,80%,72%)]">תלמדו מתי שנוח לכם,</span>
          <br />
          <span className="land-gradient-text">תרוויחו כמה שאתם מבקשים</span>
        </h1>

        <p className="animate-land-fade-up text-lg sm:text-xl text-muted-foreground font-body mb-10 max-w-2xl mx-auto leading-relaxed" style={{ animationDelay: "0.1s" }}>
          UniClass מאפשרת לסטודנטים מצטיינים להפוך את הידע האקדמי למקור הכנסה משתלם וגמיש. ללא התחייבות למכסת שעות, עם תשלום מאובטח וניהול יומן חכם הכל במקום אחד.
        </p>

        <div className="animate-land-fade-up flex flex-col sm:flex-row items-center justify-center gap-4 mb-10" style={{ animationDelay: "0.15s" }}>
          <button onClick={() => scrollTo("register")} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl text-lg font-heading font-bold shadow-xl shadow-primary/30 hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-[0.98]">
            הצטרפו לפיילוט <ArrowLeft className="w-5 h-5" />
          </button>
          <button onClick={() => scrollTo("about")} className="w-full sm:w-auto px-8 py-4 bg-card/70 backdrop-blur-md text-foreground border border-border/70 rounded-2xl text-lg font-heading font-semibold hover:bg-card hover:-translate-y-0.5 transition-all">
            למדו עוד
          </button>
        </div>

        <div className="animate-land-fade-up flex flex-wrap items-center justify-center gap-x-6 gap-y-3" style={{ animationDelay: "0.2s" }}>
          {trustPills.map((pill) => (
            <div key={pill.label} className="flex items-center gap-2 text-sm font-heading font-medium text-muted-foreground">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary">
                <pill.icon className="w-4 h-4" />
              </span>
              {pill.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}