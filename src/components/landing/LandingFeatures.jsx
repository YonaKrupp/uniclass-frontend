import React from "react";
import { Users, ClipboardList, ShieldCheck, MessageCircle } from "lucide-react";
import { VideoCallMockup, ScheduleMockup } from "./FeatureMockups";

const primaryFeatures = [
  { title: "שיעורי וידאו חיים", text: "כיתה וירטואלית שנפתחת בלחיצה אחת, ישירות מהדפדפן. בלי הורדות ובלי התקנות.", mockup: "video" },
  { title: "ניהול שיעורים חכם", text: "היומן מתעדכן לפי הזמינות שלכם, והתלמידים מקבלים תזכורות אוטומטיות לפני כל שיעור.", mockup: "schedule" },
];

const secondaryFeatures = [
  { icon: Users, title: "התאמה אישית", text: "תלמידים מוצאים את המורה המתאים להם לפי מקצוע, מחיר וזמינות." },
  { icon: ClipboardList, title: "סיכום שיעור אוטומטי", text: "בסיום כל שיעור מופק סיכום מסודר בעזרת בינה מלאכותית." },
  { icon: ShieldCheck, title: "תשלום מאובטח", text: "בלי לרדוף אחרי תשלומים. התשלום נגבה באופן מאובטח ואוטומטי על כל שיעור." },
  { icon: MessageCircle, title: "צ'אט ישיר", text: "תקשורת ישירה ומאובטחת עם התלמידים, לפני השיעור ואחריו." },
];

const FEATURES_MOCKUP = "https://media.base44.com/images/public/6a37f1517bf59551c5f4b6f9/651104762_generated_image.png";

export default function LandingFeatures() {
  return (
    <section id="features" aria-labelledby="features-title" className="hidden md:block relative bg-background py-20 sm:py-28">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        {/* Centered intro */}
        <div className="text-center mb-10">
          <h2 id="features-title" className="text-4xl sm:text-5xl font-heading font-bold tracking-tight text-foreground mb-4">
            כל מה שצריך כדי ללמד ברצינות
          </h2>
          <p className="text-lg text-muted-foreground font-body font-light">שיעורים, יומן, תשלומים ותקשורת עם תלמידים, בפלטפורמה אחת.</p>
        </div>

        {/* Full-width edge-to-edge image */}
        <div className="relative rounded-2xl overflow-hidden border border-border shadow-lg mb-12">
          <img src={FEATURES_MOCKUP} alt="שיעור פרטי בווידאו בין מורה לתלמיד" className="w-full aspect-[21/9] object-cover" />
        </div>

        {/* Primary features — real product mockups */}
        <div className="grid sm:grid-cols-2 gap-5 mb-6">
          {primaryFeatures.map((f) => (
            <div key={f.title} className="bg-card rounded-2xl p-6 border border-border h-full">
              <div className="mb-5" aria-hidden="true">
                {f.mockup === "video" ? <VideoCallMockup /> : <ScheduleMockup />}
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground font-body font-light leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>

        {/* Secondary features — compact */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-2xl overflow-hidden border border-border">
          {secondaryFeatures.map((f) => (
            <div key={f.title} className="bg-card px-6 py-7">
              <div className="w-9 h-9 rounded-md flex items-center justify-center mb-4 bg-primary/10">
                <f.icon className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-base text-foreground mb-1.5">{f.title}</h3>
              <p className="text-sm text-foreground/80 font-body leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}