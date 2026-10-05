import React from "react";
import { Users, ClipboardList, ShieldCheck, MessageCircle } from "lucide-react";
import { VideoCallMockup, ScheduleMockup } from "./FeatureMockups";

const primaryFeatures = [
  { title: "שיעורי וידאו חיים", text: "כניסה לכיתה וירטואלית בלחיצת כפתור — ללא הורדות, ללא התקנות.", mockup: "video" },
  { title: "ניהול שיעורים חכם", text: "תזמון גמיש לפי היומן שלכם, מעקב אחר שיעורים ותזכורות אוטומטיות לתלמידים.", mockup: "schedule" },
];

const secondaryFeatures = [
  { icon: Users, title: "התאמה אישית", text: "תלמידים מוצאים אתכם לפי מקצוע ורמה — מקסימום פניות רלוונטיות." },
  { icon: ClipboardList, title: "סיכום תקציר מנהלים אוטומטי", text: "תקציר מנהלים מהקלטת השיעור באמצעות בינה מלאכותית AI." },
  { icon: ShieldCheck, title: "תשלום מאובטח", text: "בלי לרדוף אחרי תשלומים — גבייה בטוחה ואוטומטית עבור כל שיעור." },
  { icon: MessageCircle, title: "צ'אט ישיר", text: "תקשורת ישירה ובטוחה עם התלמידים שלכם לפני ואחרי השיעור." },
];

const FEATURES_MOCKUP = "https://media.base44.com/images/public/6a37f1517bf59551c5f4b6f9/ba326d5b5_generated_image.png";

export default function LandingFeatures() {
  return (
    <section id="features" aria-labelledby="features-title" className="relative bg-background py-20 sm:py-28">
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        {/* Centered intro */}
        <div className="text-center mb-10">
          <h2 id="features-title" className="text-4xl sm:text-5xl font-heading font-bold tracking-tight text-foreground mb-4">
            כל הכלים להצלחה במקום אחד
          </h2>
          <p className="text-lg text-muted-foreground font-body font-light">כל מה שצריך כדי ללמוד וללמד — בפלטפורמה אחת</p>
        </div>

        {/* Full-width edge-to-edge image */}
        <div className="relative rounded-2xl overflow-hidden border border-border shadow-lg mb-12">
          <img src={FEATURES_MOCKUP} alt="סטודנטים בשיחת וידאו" className="w-full aspect-[21/9] object-cover" />
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
              <h3 className="font-heading font-semibold text-sm text-foreground mb-1.5">{f.title}</h3>
              <p className="text-xs text-muted-foreground font-body font-light leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}