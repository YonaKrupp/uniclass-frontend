import React from "react";
import { UserPlus, MailCheck, Rocket } from "lucide-react";

const steps = [
{ icon: UserPlus, title: "הירשמו לפיילוט", text: "\u05E0\u05E8\u05E9\u05DE\u05D9\u05DD \u05DC\u05E4\u05D9\u05D9\u05DC\u05D5\u05D8 \u2014 \u05DE\u05DE\u05DC\u05D0\u05D9\u05DD \u05D0\u05EA \u05D4\u05E4\u05E8\u05D8\u05D9\u05DD, \u05D4\u05DE\u05E7\u05E6\u05D5\u05E2\u05D5\u05EA \u05E9\u05EA\u05E8\u05E6\u05D5 \u05DC\u05DC\u05DE\u05D3 \u05D5\u05D0\u05EA\u05DD \u05D1\u05E4\u05E0\u05D9\u05DD" },
{ icon: MailCheck, title: "קבלו הזמנה", text: "\u05E0\u05E9\u05DC\u05D7 \u05D0\u05DC\u05D9\u05DB\u05DD \u05D4\u05D5\u05D3\u05E2\u05D4 \u05DB\u05D0\u05E9\u05E8 \u05D4\u05DE\u05E2\u05E8\u05DB\u05EA \u05EA\u05D4\u05D9\u05D4 \u05E4\u05E2\u05D9\u05DC\u05D4 \u05D5\u05E0\u05D9\u05EA\u05DF \u05D9\u05D4\u05D9\u05D4 \u05DC\u05E7\u05D1\u05D5\u05E2 \u05E9\u05D9\u05E2\u05D5\u05E8\u05D9\u05DD\xA0" },
{ icon: Rocket, title: "התחילו ללמוד או ללמד", text: "\u05DE\u05DC\u05DE\u05D3\u05D9\u05DD \u05D5\u05DE\u05E8\u05D5\u05D5\u05D9\u05D7\u05D9\u05DD \u2014 \u05DE\u05E2\u05D1\u05D9\u05E8\u05D9\u05DD \u05E9\u05D9\u05E2\u05D5\u05E8\u05D9\u05DD \u05D0\u05D9\u05DB\u05D5\u05EA\u05D9\u05D9\u05DD \u05D1\u05D6\u05DE\u05DF \u05E9\u05E0\u05D5\u05D7 \u05DC\u05DB\u05DD \u05D5\u05DE\u05E7\u05D1\u05DC\u05D9\u05DD \u05EA\u05E9\u05DC\u05D5\u05DD \u05DE\u05D5\u05D1\u05D8\u05D7." }];


export default function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-card/50">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">איך זה עובד?</h2>
        <p className="text-lg text-muted-foreground font-body mb-12">שלבים פשוטים להתחיל להרוויח מהידע שלכם</p>
        <div className="grid sm:grid-cols-3 gap-8">
          {steps.map((step, i) =>
          <div key={step.title} className="relative">
              <div className="absolute -top-3 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-heading font-bold text-sm z-10">
                {i + 1}
              </div>
              <div className="bg-background rounded-2xl p-6 border border-border pt-8">
                <div className="w-14 h-14 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-heading font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground font-body">{step.text}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}