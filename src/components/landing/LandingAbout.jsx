import React from "react";
import { GraduationCap, Heart, Target } from "lucide-react";
import Reveal from "./Reveal";
import CountUp from "./CountUp";

const values = [
  { icon: Target, title: "המטרה שלנו", text: "להעניק לסטודנטים מלמדים עצמאות פיננסית מלאה בזמן התואר.", tone: "indigo" },
  { icon: Heart, title: "הדרך שלנו", text: "מערכת טכנולוגית שמנהלת עבורכם את הלו\"ז, התשלומים והשיעורים.", tone: "indigo" },
  { icon: GraduationCap, title: "החזון שלנו", text: "עבודה גמישה, מתגמלת ונגישה לכל סטודנט מצטיין.", tone: "mint" },
];

const stats = [
  { value: "100%", label: "גמישות בזמנים — אתם קובעים" },
  { value: "0₪", label: "עלות הרשמה לפיילוט", accent: true },
  { value: "24/7", label: "זמינות מערכתית מלאה" },
  { value: "AI", label: "סיכום שיעור אוטומטי" },
];

const ABOUT_IMG = "https://media.base44.com/images/public/6a37f1517bf59551c5f4b6f9/aa21c278c_generated_image.png";

export default function LandingAbout() {
  return (
    <section id="about" className="relative bg-background py-20 sm:py-28 overflow-hidden">
      {/* decorative indigo blur */}
      <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full blur-[130px] opacity-[0.05] pointer-events-none" style={{ background: "radial-gradient(circle, hsl(262 67% 35%), transparent 70%)" }} />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        {/* Text + illustration */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 rounded-full text-primary text-xs font-body font-medium tracking-wide mb-5">
                אודות
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="text-4xl sm:text-5xl font-heading font-semibold tracking-tight text-foreground mb-6">
                מה זה <span className="land-gradient-text">UniClass?</span>
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-lg text-muted-foreground font-body font-light leading-relaxed">
                UniClass היא פלטפורמה חכמה המחברת בין סטודנטים מלמדים לסטודנטים שזקוקים לחיזוק. אנחנו מאמינים שסטודנטים מבריקים צריכים להרוויח בכבוד על הידע שלהם, תוך שמירה מלאה על לוח הזמנים של הלימודים שלהם. בלי בוס, בלי משמרות חובה — אתם הקובעים.
              </p>
            </Reveal>
          </div>

          <Reveal delay={120} className="relative">
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-xl shadow-primary/5 group">
              <img src={ABOUT_IMG} alt="שיעור אונליין ב-UniClass" className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-card/40 to-transparent" />
              <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-card/85 backdrop-blur-md border border-border rounded-xl px-3 py-2 shadow-lg">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-heading font-bold">AI</span>
                <span className="text-xs font-body font-medium text-foreground">סיכום שיעור אוטומטי</span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Stats bar — count-up on scroll */}
        <Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden border border-border mb-16">
            {stats.map((s) => (
              <div key={s.label} className="bg-card px-6 py-8 text-center hover:bg-muted/40 transition-colors">
                <p className={`text-3xl sm:text-4xl font-heading font-semibold mb-2 ${s.accent ? "text-mint" : "land-gradient-text"}`}>
                  <CountUp value={s.value} />
                </p>
                <p className="text-sm text-muted-foreground font-body font-light leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Value cards */}
        <div className="grid sm:grid-cols-3 gap-5">
          {values.map((item, i) => (
            <Reveal key={item.title} delay={i * 100}>
              <div className="group bg-card rounded-2xl p-8 border border-border hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1.5 transition-all duration-300 h-full text-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 mx-auto transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 ${item.tone === "mint" ? "bg-mint/10" : "bg-primary/10"}`}>
                  <item.icon className={`w-6 h-6 transition-transform duration-300 group-hover:scale-110 ${item.tone === "mint" ? "text-mint" : "text-primary"}`} />
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground font-body font-light leading-relaxed">{item.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}