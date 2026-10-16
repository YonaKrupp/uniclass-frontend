import React from "react";
import { Rocket, Megaphone, Gift } from "lucide-react";

const benefits = [
  { icon: Rocket, title: "גישה מוקדמת", text: "היו מהמורים הראשונים בפלטפורמה ויצרו לעצמכם מוניטין וקהל תלמידים נאמן." },
  { icon: Megaphone, title: "הקול שלכם נשמע", text: "המשוב שלכם מעצב את פיצ'ר ההוראה והניהול של המערכת." },
  { icon: Gift, title: "בחינם לגמרי", text: "הרשמו בחינם לגמרי לפיילוט.", accent: true },
];

export default function LandingCTA() {
  return (
    <section aria-labelledby="cta-title" className="order-5 relative overflow-hidden">
      {/* full-bleed gradient mesh */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(120deg, hsl(266 64% 26%) 0%, hsl(274 58% 36%) 50%, hsl(32 85% 50%) 100%)" }}
      />
      <div
        className="absolute top-[-10%] left-[10%] w-[480px] h-[480px] rounded-full blur-[140px] opacity-40 pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(32, 90%, 60%), transparent 70%)" }}
      />
      <div
        className="absolute bottom-[-15%] right-[8%] w-[520px] h-[520px] rounded-full blur-[150px] opacity-40 pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(266, 70%, 55%), transparent 70%)" }}
      />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10 md:py-32 text-center">
        <h2 id="cta-title" className="text-2xl md:text-5xl font-heading font-bold tracking-tight text-white mb-2 md:mb-4 drop-shadow-sm">
          למה להצטרף וללמד בפיילוט?
        </h2>
        <p className="text-sm md:text-lg text-white/85 font-body font-light mb-5 md:mb-14 drop-shadow-sm">
          הזדמנות לקחת חלק במיזם שנבנה עבור סטודנטים ומורים פרטיים כאחד
        </p>
        {/* Mobile: compact benefit list */}
        <ul className="md:hidden space-y-2.5 text-right">
          {benefits.map((b) => (
            <li key={b.title} className="flex items-center gap-3 rounded-xl border border-white/20 px-3.5 py-3" style={{ background: "hsl(0 0% 100% / 0.1)" }}>
              <span className="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center" style={{ background: b.accent ? "hsl(32 85% 55%)" : "hsl(0 0% 100% / 0.18)" }}>
                <b.icon className="w-4 h-4 text-white" />
              </span>
              <h3 className="font-heading font-semibold text-sm text-white">{b.title}</h3>
            </li>
          ))}
        </ul>

        <div className="hidden md:grid sm:grid-cols-3 gap-5">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl p-7 border border-white/20 text-center h-full"
              style={{ background: "hsl(0 0% 100% / 0.1)", backdropFilter: "blur(10px)" }}
            >
              <div
                className="w-12 h-12 mx-auto rounded-lg flex items-center justify-center mb-4"
                style={{ background: b.accent ? "hsl(32 85% 55%)" : "hsl(0 0% 100% / 0.18)" }}
              >
                <b.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-white mb-2">{b.title}</h3>
              <p className="text-sm text-white/80 font-body font-light leading-relaxed">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}