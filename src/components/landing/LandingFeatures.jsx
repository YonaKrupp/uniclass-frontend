import React from "react";
import { Video, CalendarClock, Users, ClipboardList, ShieldCheck, MessageCircle } from "lucide-react";
import Reveal from "./Reveal";

const features = [
{ icon: Video, title: "שיעורי וידאו חיים", text: "\u05DB\u05E0\u05D9\u05E1\u05D4 \u05DC\u05DB\u05D9\u05EA\u05D4 \u05D5\u05D9\u05E8\u05D8\u05D5\u05D0\u05DC\u05D9\u05EA \u05D1\u05DC\u05D7\u05D9\u05E6\u05EA \u05DB\u05E4\u05EA\u05D5\u05E8\xA0 \u05DC\u05DC\u05D0 \u05D4\u05D5\u05E8\u05D3\u05D5\u05EA, \u05DC\u05DC\u05D0 \u05D4\u05EA\u05E7\u05E0\u05D5\u05EA.", tone: "indigo" },
{ icon: CalendarClock, title: "ניהול שיעורים חכם", text: "תזמון גמיש לפי היומן שלכם, מעקב אחר שיעורים ותזכורות אוטומטיות לסטודנטים.", tone: "indigo" },
{ icon: Users, title: "התאמה אישית", text: "\u05EA\u05DC\u05DE\u05D9\u05D3\u05D9\u05DD \u05DE\u05D5\u05E6\u05D0\u05D9\u05DD \u05D0\u05EA\u05DB\u05DD \u05DC\u05E4\u05D9 \u05DE\u05E7\u05E6\u05D5\u05E2 \u05D5\u05E8\u05DE\u05D4\xA0 \xA0\u05DE\u05E7\u05E1\u05D9\u05DE\u05D5\u05DD \u05E4\u05E0\u05D9\u05D5\u05EA \u05E8\u05DC\u05D5\u05D5\u05E0\u05D8\u05D9\u05D5\u05EA.", tone: "mint" },
{ icon: ClipboardList, title: "סיכום תקציר מנהלים אוטומטי", text: "תקציר מנהלים מהקלטת השיעור באמצעות בינה מלאכותית AI.", tone: "indigo" },
{ icon: ShieldCheck, title: "תשלום מאובטח", text: "בלי לרדוף אחרי תשלומים — גבייה בטוחה ואוטומטית עבור כל שיעור.", tone: "mint" },
{ icon: MessageCircle, title: "צ'אט ישיר", text: "תקשורת ישירה ובטוחה עם התלמידים שלכם לפני ואחרי השיעור.", tone: "indigo" }];


const FEATURES_MOCKUP = "https://media.base44.com/images/public/6a37f1517bf59551c5f4b6f9/ba326d5b5_generated_image.png";

export default function LandingFeatures() {
  return (
    <section id="features" className="relative bg-background py-20 sm:py-28 overflow-hidden">
      {/* decorative indigo blur + dot grid */}
      <div className="absolute -top-20 -right-20 w-[380px] h-[380px] rounded-full blur-[120px] opacity-[0.05] pointer-events-none" style={{ background: "radial-gradient(circle, hsl(262 67% 35%), transparent 70%)" }} />
      <div className="absolute bottom-12 left-12 w-40 h-40 opacity-[0.07] pointer-events-none" style={{ backgroundImage: "radial-gradient(hsl(262 67% 35%) 1.5px, transparent 1.5px)", backgroundSize: "16px 16px" }} />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        {/* Intro + mockup */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
          <div className="text-center lg:text-start">
            <Reveal>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 rounded-full text-primary text-xs font-body font-medium tracking-wide mb-5">
                הכלים שלנו
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="text-4xl sm:text-5xl font-heading font-semibold tracking-tight text-foreground mb-4">
                כל הכלים להצלחה <span className="land-gradient-text">במקום אחד</span>
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-lg text-muted-foreground font-body font-light">כל מה שצריך כדי ללמוד וללמד — בפלטפורמה אחת</p>
            </Reveal>
          </div>

          <Reveal delay={120} className="relative">
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-xl shadow-primary/5 group">
              <img src={FEATURES_MOCKUP} alt="סטודנטים בשיחת וידאו" className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
          </Reveal>
        </div>

        {/* Feature cards — centered */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {features.map((f, i) => {
            const isMint = f.tone === "mint";
            return (
              <Reveal key={f.title} delay={i % 3 * 100}>
                <div className="group relative bg-card rounded-2xl p-7 border border-border hover:shadow-xl hover:shadow-primary/8 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden h-full text-center">
                  <div
                    className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(circle, ${isMint ? "hsl(160 84% 39% / 0.15)" : "hsl(262 67% 35% / 0.15)"}, transparent 70%)` }} />
                  
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 mx-auto transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 ${isMint ? "bg-mint/10 group-hover:bg-mint" : "bg-primary/10 group-hover:bg-primary"}`}>
                      <f.icon className={`w-6 h-6 transition-colors duration-300 ${isMint ? "text-mint group-hover:text-mint-foreground" : "text-primary group-hover:text-primary-foreground"}`} />
                    </div>
                    <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground font-body font-light leading-relaxed">{f.text}</p>
                  </div>
                </div>
              </Reveal>);

          })}
        </div>
      </div>
    </section>);

}