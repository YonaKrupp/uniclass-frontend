import React from "react";
import { UserPlus, MailCheck, Rocket } from "lucide-react";

const STUDENT_IMG = "https://media.base44.com/images/public/6a37f1517bf59551c5f4b6f9/13693adc5_generated_image.png";

const steps = [
  { icon: UserPlus, title: "הירשמו", text: "ממלאים טופס קצר ואתם בפנים." },
  { icon: MailCheck, title: "קבלו הזמנה", text: "נעדכן אתכם במייל ברגע שהמערכת תיפתח ואפשר יהיה לקבוע שיעורים." },
  { icon: Rocket, title: "התחילו ללמד", text: "מגדירים מחיר ושעות, מעבירים שיעורים ומקבלים תשלום דרך הפלטפורמה." },
];

export default function LandingHowItWorks() {
  const [featured, ...rest] = steps;
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="order-4 relative bg-background py-10 md:py-28">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6 md:mb-12">
          <h2 id="how-title" className="text-2xl md:text-5xl font-heading font-bold tracking-tight text-foreground mb-2 md:mb-4">
            איך זה עובד?
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground font-body font-light">שלושה שלבים פשוטים להתחיל להרוויח מהידע שלכם</p>
        </div>

        {/* Mobile: compact steps */}
        <ul className="md:hidden space-y-2.5">
          {steps.map((step, i) => (
            <li key={step.title} className="flex items-start gap-3 bg-card rounded-xl border border-border px-3.5 py-3">
              <span className="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center font-heading font-bold text-xs text-primary-foreground bg-primary">{i + 1}</span>
              <div className="min-w-0">
                <h3 className="font-heading font-semibold text-sm text-foreground">{step.title}</h3>
                <p className="text-xs text-muted-foreground font-body font-light leading-snug mt-0.5">{step.text}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Full-width image with step 1 overlay */}
        <div className="hidden md:block relative rounded-2xl overflow-hidden border border-border shadow-lg mb-8">
          <img src={STUDENT_IMG} alt="מורה מעביר שיעור וידאו פרטי" className="w-full aspect-[21/9] object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to left, hsl(240 10% 6% / 0.82) 0%, hsl(240 10% 6% / 0.1) 55%, transparent 100%)" }} />
          <div className="absolute bottom-7 right-7 max-w-sm">
            <div className="flex items-center gap-3 mb-3">
              <span className="w-9 h-9 rounded-lg flex items-center justify-center font-heading font-bold text-sm text-white bg-primary">1</span>
              <featured.icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-heading font-bold text-2xl text-white mb-2">{featured.title}</h3>
            <p className="text-sm text-white/80 font-body font-light leading-relaxed">{featured.text}</p>
          </div>
        </div>

        {/* Steps 2 & 3 */}
        <div className="hidden md:grid sm:grid-cols-2 gap-6">
          {rest.map((step, i) => (
            <div key={step.title} className="bg-card rounded-2xl border border-border p-7">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-lg flex items-center justify-center font-heading font-bold text-sm text-primary-foreground bg-primary">{i + 2}</span>
                <step.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground font-body font-light leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}