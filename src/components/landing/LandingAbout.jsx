import React from "react";
import { GraduationCap, Heart, Target } from "lucide-react";

const values = [
{ icon: Target, title: "המטרה שלנו", text: "\u05DC\u05D4\u05E2\u05E0\u05D9\u05E7 \u05DC\u05E1\u05D8\u05D5\u05D3\u05E0\u05D8\u05D9\u05DD \u05DE\u05DC\u05DE\u05D3\u05D9\u05DD \u05E2\u05E6\u05DE\u05D0\u05D5\u05EA \u05E4\u05D9\u05E0\u05E0\u05E1\u05D9\u05EA \u05DE\u05DC\u05D0\u05D4 \u05D1\u05D6\u05DE\u05DF \u05D4\u05EA\u05D5\u05D0\u05E8." },
{ icon: Heart, title: "הדרך שלנו", text: "\u05DE\u05E2\u05E8\u05DB\u05EA \u05D8\u05DB\u05E0\u05D5\u05DC\u05D5\u05D2\u05D9\u05EA \u05E9\u05DE\u05E0\u05D4\u05DC\u05EA \u05E2\u05D1\u05D5\u05E8\u05DB\u05DD \u05D0\u05EA \u05D4\u05DC\u05D5\"\u05D6, \u05D4\u05EA\u05E9\u05DC\u05D5\u05DE\u05D9\u05DD \u05D5\u05D4\u05E9\u05D9\u05E2\u05D5\u05E8\u05D9\u05DD." },
{ icon: GraduationCap, title: "החזון שלנו", text: "\u05E2\u05D1\u05D5\u05D3\u05D4 \u05D2\u05DE\u05D9\u05E9\u05D4, \u05DE\u05EA\u05D2\u05DE\u05DC\u05EA \u05D5\u05E0\u05D2\u05D9\u05E9\u05D4 \u05DC\u05DB\u05DC \u05E1\u05D8\u05D5\u05D3\u05E0\u05D8 \u05DE\u05E6\u05D8\u05D9\u05D9\u05DF." }];


export default function LandingAbout() {
  return (
    <section id="about" className="py-20 bg-card/50">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-6">מה זה UniClass?</h2>
        <p className="text-lg text-muted-foreground font-body leading-relaxed mb-12 max-w-3xl mx-auto">UniClass היא פלטפורמה חכמה המחברת בין סטודנטים מלמדים לסטודנטים שזקוקים לחיזוק. אנחנו מאמינים שסטודנטים מבריקים צריכים להרוויח בכבוד על הידע שלהם, תוך שמירה מלאה על לוח הזמנים של הלימודים שלהם. בלי בוס, בלי משמרות חובה — אתם הקובעים.


        </p>
        <div className="grid sm:grid-cols-3 gap-6">
          {values.map((item) => <div key={item.title} className="bg-background rounded-2xl p-6 border border-border text-center">
              <div className="w-12 h-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground font-body">{item.text}</p>
            </div>
          )}
        </div>
      </div>
    </section>);

}