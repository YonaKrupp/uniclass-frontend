import React from "react";
import { Rocket, Megaphone, Gift } from "lucide-react";
import Reveal from "./Reveal";

const benefits = [
  { icon: Rocket, title: "גישה מוקדמת", text: "היו מהמורים הראשונים בפלטפורמה ויצרו לעצמכם מוניטין וקהל תלמידים נאמן." },
  { icon: Megaphone, title: "הקול שלכם נשמע", text: "המשוב שלכם מעצב את פיצ'ר ההוראה והניהול של המערכת." },
  { icon: Gift, title: "בחינם לגמרי", text: "הרשמו בחינם לגמרי לפיילוט.", accent: true },
];

export default function LandingCTA() {
  return (
    <section className="relative bg-background overflow-hidden">
      {/* Full-width indigo band that fades softly into the adjacent sections
          at the top and bottom — no hard rectangle edges. */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, transparent 0%, hsl(262 67% 32%) 16%, hsl(263 75% 42%) 50%, hsl(262 67% 32%) 84%, transparent 100%)" }}
      />
      {/* Dot texture, masked to the solid indigo zone only */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.08]"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 50%, white 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "linear-gradient(180deg, transparent 16%, black 26%, black 74%, transparent 84%)",
          WebkitMaskImage: "linear-gradient(180deg, transparent 16%, black 26%, black 74%, transparent 84%)",
        }}
      />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-28 sm:py-36 text-center">
        <Reveal>
          <h2 className="text-4xl sm:text-5xl font-heading font-semibold tracking-tight text-white mb-4">
            למה להצטרף כמורה לפיילוט?
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <p className="text-lg text-white/85 font-body font-light mb-14">
            הזדמנות לקחת חלק במיזם שנבנה במיוחד עבור סטודנטים
          </p>
        </Reveal>
        <div className="grid sm:grid-cols-3 gap-5">
          {benefits.map((b, i) => (
            <Reveal key={b.title} delay={i * 120}>
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-7 border border-white/20 text-center hover:bg-white/25 hover:-translate-y-1 transition-all duration-300 h-full">
                <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-110 ${b.accent ? "bg-mint/30" : "bg-white/20"}`}>
                  <b.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-white mb-2">{b.title}</h3>
                <p className="text-sm text-white/80 font-body font-light leading-relaxed">{b.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}