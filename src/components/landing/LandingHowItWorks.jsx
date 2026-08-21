import React from "react";
import { UserPlus, MailCheck, Rocket } from "lucide-react";
import Reveal from "./Reveal";

const steps = [
  { icon: UserPlus, title: "הירשמו לפיילוט", text: "ממלאים את הפרטים, המקצועות שתרצו ללמד ואתם בפנים.", tone: "indigo" },
  { icon: MailCheck, title: "קבלו הזמנה", text: "נשלח אליכם הודעה כאשר המערכת תהיה פעילה וניתן יהיה לקבוע שיעורים.", tone: "mint" },
  { icon: Rocket, title: "התחילו ללמוד או ללמד", text: "מלמדים ומרוויחים — מעבירים שיעורים איכותיים בזמן שנוח לכם ומקבלים תשלום מובטח.", tone: "indigo" },
];

const STUDENT_IMG = "https://media.base44.com/images/public/6a37f1517bf59551c5f4b6f9/36cf222ec_generated_image.png";

export default function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="relative bg-background py-20 sm:py-28 overflow-hidden">
      {/* decorative indigo blur */}
      <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full blur-[130px] opacity-[0.05] pointer-events-none" style={{ background: "radial-gradient(circle, hsl(262 67% 35%), transparent 70%)" }} />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
        {/* Intro + illustration */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
          <div className="text-center lg:text-start">
            <Reveal>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 rounded-full text-primary text-xs font-body font-medium tracking-wide mb-5">
                פשוט ומהיר
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="text-4xl sm:text-5xl font-heading font-semibold tracking-tight text-foreground mb-4">
                איך זה <span className="land-gradient-text">עובד?</span>
              </h2>
            </Reveal>
            <Reveal delay={160}>
              <p className="text-lg text-muted-foreground font-body font-light">שלבים פשוטים להתחיל להרוויח מהידע שלכם</p>
            </Reveal>
          </div>

          <Reveal delay={120} className="relative">
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-lg group">
              <img src={STUDENT_IMG} alt="סטודנט לומד" className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-card/40 to-transparent" />
            </div>
          </Reveal>
        </div>

        {/* Steps */}
        <div className="relative grid sm:grid-cols-3 gap-6 text-center">
          <div className="hidden sm:block absolute top-8 right-[16%] left-[16%] h-px bg-gradient-to-l from-transparent via-border to-transparent" />
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 120} className="relative h-full group">
              <div className="absolute -top-3 right-1/2 translate-x-1/2 w-10 h-10 bg-card border-2 border-primary text-primary rounded-full flex items-center justify-center font-heading font-semibold text-sm z-10 shadow-sm group-hover:scale-110 transition-transform duration-300">
                {i + 1}
              </div>
              <div className="group bg-card rounded-2xl p-7 border border-border pt-14 hover:shadow-xl hover:shadow-primary/8 hover:-translate-y-1.5 transition-all duration-300 h-full">
                <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 ${step.tone === "mint" ? "bg-mint/10" : "bg-primary/10"}`}>
                  <step.icon className={`w-7 h-7 ${step.tone === "mint" ? "text-mint" : "text-primary"}`} />
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground font-body font-light leading-relaxed">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}