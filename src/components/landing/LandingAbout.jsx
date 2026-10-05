import React from "react";
import { GraduationCap, Heart, Target } from "lucide-react";

const values = [
  { icon: Target, title: "המטרה שלנו", text: "להעניק לכל מלמד — סטודנט או מורה פרטי — עצמאות פיננסית מלאה, בזמן שלו." },
  { icon: Heart, title: "הדרך שלנו", text: "מערכת טכנולוגית שמנהלת עבורכם את הלו\"ז, התשלומים והשיעורים." },
  { icon: GraduationCap, title: "החזון שלנו", text: "עבודה גמישה, מתגמלת ונגישה לכל מי שרוצה ללמד." },
];

const ABOUT_IMG = "https://media.base44.com/images/public/6a37f1517bf59551c5f4b6f9/aa21c278c_generated_image.png";

export default function LandingAbout() {
  return (
    <section id="about" aria-labelledby="about-title" className="relative bg-background py-20 sm:py-28">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        {/* Text + large image */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
          <div>
            <h2 id="about-title" className="text-4xl sm:text-5xl font-heading font-bold tracking-tight text-foreground mb-6">
              מה זה UniClass?
            </h2>
            <p className="text-lg text-muted-foreground font-body font-light leading-relaxed">
              UniClass היא פלטפורמה חכמה המחברת בין מלמדים — סטודנטים ומורים פרטיים — לבין תלמידים שזקוקים לחיזוק. אנחנו מאמינים שכל מי שיודע חומר יכול להרוויח בכבוד על הידע שלו, תוך שמירה מלאה על לוח הזמנים שלו. בלי בוס, בלי משמרות חובה — אתם הקובעים.
            </p>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-lg">
              <img src={ABOUT_IMG} alt="שיעור אונליין ב-UniClass" className="w-full aspect-[4/3] object-cover" />
              <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-card/95 backdrop-blur border border-border rounded-lg px-3 py-2 shadow-sm">
                <span className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 text-primary text-xs font-heading font-bold">AI</span>
                <span className="text-xs font-body font-medium text-foreground">סיכום שיעור אוטומטי</span>
              </div>
            </div>
          </div>
        </div>

        {/* Value cards */}
        <div className="grid sm:grid-cols-3 gap-5">
          {values.map((item) => (
            <div key={item.title} className="bg-card rounded-2xl p-8 border border-border h-full text-center">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-5 mx-auto bg-primary/10">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-lg text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground font-body font-light leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}