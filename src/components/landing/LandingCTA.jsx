import React from "react";
import { Rocket, Megaphone, Gift } from "lucide-react";

const benefits = [
  { icon: Rocket, title: "גישה מוקדמת", text: "היו מהמורים הראשונים בפלטפורמה ויצרו לעצמכם מוניטין וקהל תלמידים נאמן.", tint: "217 90% 52%" },
  { icon: Megaphone, title: "הקול שלכם נשמע", text: "המשוב שלכם מעצב את פיצ'ר ההוראה והניהול של המערכת.", tint: "190 95% 42%" },
  { icon: Gift, title: "בחינם לגמרי", text: "הרשמו בחינם לגמרי לפיילוט.", tint: "152 70% 42%" },
];

export default function LandingCTA() {
  return (
    <section className="py-20 sm:py-24">
      <div className="max-w-5xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-[2rem] p-10 sm:p-14 text-center bg-gradient-to-br from-primary to-accent2 shadow-2xl shadow-primary/30">
          <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl font-heading font-extrabold text-primary-foreground mb-4">למה להצטרף כמורה לפיילוט?</h2>
            <p className="text-lg text-primary-foreground/85 font-body mb-12">הזדמנות לקחת חלק במיזם שנבנה במיוחד עבור סטודנטים</p>
            <div className="grid sm:grid-cols-3 gap-6">
              {benefits.map((b) => (
                <div key={b.title} className="bg-white/15 backdrop-blur-sm rounded-3xl p-7 border border-white/20 text-center">
                  <div className="w-14 h-14 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-4">
                    <b.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-white mb-2">{b.title}</h3>
                  <p className="text-sm text-white/85 font-body">{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}