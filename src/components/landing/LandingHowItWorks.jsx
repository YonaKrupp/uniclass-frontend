import React from "react";
import { UserPlus, MailCheck, Rocket } from "lucide-react";

const steps = [
  { icon: UserPlus, title: "הירשמו לפיילוט", text: "ממלאים את הפרטים, המקצועות שתרצו ללמד ואתם בפנים.", tint: "217 90% 52%" },
  { icon: MailCheck, title: "קבלו הזמנה", text: "נשלח אליכם הודעה כאשר המערכת תהיה פעילה וניתן יהיה לקבוע שיעורים.", tint: "190 95% 42%" },
  { icon: Rocket, title: "התחילו ללמוד או ללמד", text: "מלמדים ומרוויחים — מעבירים שיעורים איכותיים בזמן שנוח לכם ומקבלים תשלום מובטח.", tint: "260 80% 60%" },
];

export default function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-24">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 rounded-full text-primary text-xs font-heading font-bold tracking-wide mb-4">פשוט ומהיר</span>
        <h2 className="text-4xl sm:text-5xl font-heading font-extrabold text-foreground mb-4">איך זה <span className="land-gradient-text">עובד?</span></h2>
        <p className="text-lg text-muted-foreground font-body mb-14">שלבים פשוטים להתחיל להרוויח מהידע שלכם</p>
        <div className="relative grid sm:grid-cols-3 gap-6">
          {/* connecting gradient line (desktop) */}
          <div className="hidden sm:block absolute top-9 right-[16%] left-[16%] h-0.5 bg-gradient-to-l from-primary/30 via-accent2/40 to-primary/30" />
          {steps.map((step, i) => (
            <div key={step.title} className="relative">
              <div className="absolute -top-2 right-1/2 translate-x-1/2 w-9 h-9 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-heading font-bold text-sm z-10 shadow-lg shadow-primary/30">
                {i + 1}
              </div>
              <div className="bg-card rounded-3xl p-7 border border-border/70 pt-12 hover:shadow-lg hover:-translate-y-1 transition-all h-full">
                <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: `hsl(${step.tint} / 0.14)` }}>
                  <step.icon className="w-8 h-8" style={{ color: `hsl(${step.tint})` }} />
                </div>
                <h3 className="font-heading font-bold text-lg text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground font-body">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}