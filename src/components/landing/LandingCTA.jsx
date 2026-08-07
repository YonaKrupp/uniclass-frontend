import React from "react";
import { Rocket, Megaphone, Gift } from "lucide-react";

const benefits = [
{ icon: Rocket, title: "גישה מוקדמת", text: "\u05D4\u05D9\u05D5 \u05DE\u05D4\u05DE\u05D5\u05E8\u05D9\u05DD \u05D4\u05E8\u05D0\u05E9\u05D5\u05E0\u05D9\u05DD \u05D1\u05E4\u05DC\u05D8\u05E4\u05D5\u05E8\u05DE\u05D4 \u05D5\u05D9\u05E6\u05E8\u05D5 \u05DC\u05E2\u05E6\u05DE\u05DB\u05DD \u05DE\u05D5\u05E0\u05D9\u05D8\u05D9\u05DF \u05D5\u05E7\u05D4\u05DC \u05EA\u05DC\u05DE\u05D9\u05D3\u05D9\u05DD \u05E0\u05D0\u05DE\u05DF." },
{ icon: Megaphone, title: "הקול שלכם נשמע", text: "\u05D4\u05DE\u05E9\u05D5\u05D1 \u05E9\u05DC\u05DB\u05DD \u05DE\u05E2\u05E6\u05D1 \u05D0\u05EA \u05E4\u05D9\u05E6'\u05E8\u05D9 \u05D4\u05D4\u05D5\u05E8\u05D0\u05D4 \u05D5\u05D4\u05E0\u05D9\u05D4\u05D5\u05DC \u05E9\u05DC \u05D4\u05DE\u05E2\u05E8\u05DB\u05EA." },
{ icon: Gift, title: "בחינם לגמרי", text: "\u05D4\u05E8\u05E9\u05DE\u05D5 \u05D1\u05D7\u05D9\u05E0\u05DD \u05DC\u05D2\u05DE\u05E8\u05D9 \u05DC\u05E4\u05D9\u05D9\u05DC\u05D5\u05D8.\xA0" }];


export default function LandingCTA() {
  return (
    <section className="py-20 bg-primary/5">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">למה להצטרף כמורה לפיילוט?</h2>
        <p className="text-lg text-muted-foreground font-body mb-12">הזדמנות לקחת חלק במיזם שנבנה במיוחד עבור סטודנטים</p>
        <div className="grid sm:grid-cols-3 gap-6">
          {benefits.map((b) =>
          <div key={b.title} className="text-center">
              <div className="w-14 h-14 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <b.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-foreground mb-2">{b.title}</h3>
              <p className="text-sm text-muted-foreground font-body">{b.text}</p>
            </div>
          )}
        </div>
      </div>
    </section>);

}