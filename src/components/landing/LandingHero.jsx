import React from "react";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function LandingHero() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-heading font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          להרוויח כסף מהידע שלכם — הצטרפו לפיילוט
        </div>
        <h1 className="text-4xl sm:text-6xl font-heading font-bold text-foreground leading-tight mb-6">
          תלמדו מתי שנוח לכם,<br />
          <span className="text-primary">תרוויחו כמה שאתם מבקשים</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground font-body mb-10 max-w-2xl mx-auto leading-relaxed">UniClass מאפשרת לסטודנטים מצטיינים להפוך את הידע האקדמי למקור הכנסה משתלם וגמיש. ללא התחייבות למכסת שעות, עם תשלום מאובטח וניהול יומן חכם הכל במקום אחד.

        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => scrollTo("register")} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl text-lg font-heading font-semibold shadow-lg shadow-primary/25 hover:shadow-xl transition-all active:scale-[0.98]">
            הצטרפו לפיילוט <ArrowLeft className="w-5 h-5" />
          </button>
          <button onClick={() => scrollTo("about")} className="w-full sm:w-auto px-8 py-4 bg-card text-foreground border border-border rounded-xl text-lg font-heading font-semibold hover:bg-muted transition-colors">
            למדו עוד
          </button>
        </div>
      </div>
    </section>);

}