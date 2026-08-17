import React from "react";
import { Video, CalendarClock, Users, ClipboardList, ShieldCheck, MessageCircle } from "lucide-react";

const features = [
  { icon: Video, title: "שיעורי וידאו חיים", text: "כניסה לכיתה וירטואלית בלחיצת כפתור — ללא הורדות, ללא התקנות.", tint: "217 90% 52%" },
  { icon: CalendarClock, title: "ניהול שיעורים חכם", text: "תזמון גמיש לפי היומן שלכם, מעקב אחר שיעורים ותזכורות אוטומטיות לסטודנטים.", tint: "190 95% 42%" },
  { icon: Users, title: "התאמה אישית", text: "תלמידים מוצאים אתכם לפי מקצוע, רמה ואזור נוחות — מקסימום פניות רלוונטיות.", tint: "260 80% 60%" },
  { icon: ClipboardList, title: "סיכום תקציר מנהלים אוטומטי", text: "תקציר מנהלים מהקלטת השיעור באמצעות בינה מלאכותית AI.", tint: "32 90% 55%" },
  { icon: ShieldCheck, title: "תשלום מאובטח", text: "בלי לרדוף אחרי תשלומים — גבייה בטוחה ואוטומטית עבור כל שיעור.", tint: "152 70% 42%" },
  { icon: MessageCircle, title: "צ'אט ישיר", text: "תקשורת ישירה ובטוחה עם התלמידים שלכם לפני ואחרי השיעור.", tint: "280 70% 58%" },
];

export default function LandingFeatures() {
  return (
    <section id="features" className="py-20 sm:py-24">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 rounded-full text-primary text-xs font-heading font-bold tracking-wide mb-4">הכלים שלנו</span>
          <h2 className="text-4xl sm:text-5xl font-heading font-extrabold text-foreground mb-4">כל הכלים להצלחה <span className="land-gradient-text">במקום אחד</span></h2>
          <p className="text-lg text-muted-foreground font-body">כל מה שצריך כדי ללמוד וללמד — בפלטפורמה אחת</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="group bg-card rounded-3xl p-7 border border-border/70 hover:border-transparent hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110" style={{ backgroundColor: `hsl(${f.tint} / 0.14)` }}>
                <f.icon className="w-7 h-7" style={{ color: `hsl(${f.tint})` }} />
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}