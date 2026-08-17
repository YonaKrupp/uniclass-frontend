import React from "react";
import { GraduationCap, Heart, Target } from "lucide-react";

const values = [
  { icon: Target, title: "המטרה שלנו", text: "להעניק לסטודנטים מלמדים עצמאות פיננסית מלאה בזמן התואר.", tint: "217 90% 52%" },
  { icon: Heart, title: "הדרך שלנו", text: "מערכת טכנולוגית שמנהלת עבורכם את הלו\"ז, התשלומים והשיעורים.", tint: "340 75% 58%" },
  { icon: GraduationCap, title: "החזון שלנו", text: "עבודה גמישה, מתגמלת ונגישה לכל סטודנט מצטיין.", tint: "190 95% 42%" },
];

export default function LandingAbout() {
  return (
    <section id="about" className="py-20 sm:py-24 bg-card/40">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-accent2/15 rounded-full text-[hsl(var(--accent2))] text-xs font-heading font-bold tracking-wide mb-4">אודות</span>
        <h2 className="text-4xl sm:text-5xl font-heading font-extrabold text-foreground mb-6">מה זה <span className="land-gradient-text">UniClass?</span></h2>
        <p className="text-lg text-muted-foreground font-body leading-relaxed mb-12 max-w-3xl mx-auto">
          UniClass היא פלטפורמה חכמה המחברת בין סטודנטים מלמדים לסטודנטים שזקוקים לחיזוק. אנחנו מאמינים שסטודנטים מבריקים צריכים להרוויח בכבוד על הידע שלהם, תוך שמירה מלאה על לוח הזמנים של הלימודים שלהם. בלי בוס, בלי משמרות חובה — אתם הקובעים.
        </p>
        <div className="grid sm:grid-cols-3 gap-5">
          {values.map((item) => (
            <div key={item.title} className="bg-card rounded-3xl p-7 border border-border/70 text-center hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `hsl(${item.tint} / 0.14)` }}>
                <item.icon className="w-7 h-7" style={{ color: `hsl(${item.tint})` }} />
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground font-body">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}