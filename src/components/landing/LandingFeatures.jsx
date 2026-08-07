import React from "react";
import { Video, CalendarClock, Users, ClipboardList, ShieldCheck, MessageCircle } from "lucide-react";

const features = [
{ icon: Video, title: "שיעורי וידאו חיים", text: "כניסה לכיתה וירטואלית בלחיצת כפתור — ללא הורדות, ללא התקנות." },
{ icon: CalendarClock, title: "ניהול שיעורים חכם", text: "\u05EA\u05D6\u05DE\u05D5\u05DF \u05D2\u05DE\u05D9\u05E9 \u05DC\u05E4\u05D9 \u05D4\u05D9\u05D5\u05DE\u05DF \u05E9\u05DC\u05DB\u05DD, \u05DE\u05E2\u05E7\u05D1 \u05D0\u05D7\u05E8 \u05E9\u05D9\u05E2\u05D5\u05E8\u05D9\u05DD \u05D5\u05EA\u05D6\u05DB\u05D5\u05E8\u05D5\u05EA \u05D0\u05D5\u05D8\u05D5\u05DE\u05D8\u05D9\u05D5\u05EA \u05DC\u05E1\u05D8\u05D5\u05D3\u05E0\u05D8\u05D9\u05DD." },
{ icon: Users, title: "התאמה אישית", text: "\u05EA\u05DC\u05DE\u05D9\u05D3\u05D9\u05DD \u05DE\u05D5\u05E6\u05D0\u05D9\u05DD \u05D0\u05EA\u05DB\u05DD \u05DC\u05E4\u05D9 \u05DE\u05E7\u05E6\u05D5\u05E2, \u05E8\u05DE\u05D4 \u05D5\u05D0\u05D6\u05D5\u05E8 \u05E0\u05D5\u05D7\u05D5\u05EA \u2014 \u05DE\u05E7\u05E1\u05D9\u05DE\u05D5\u05DD \u05E4\u05E0\u05D9\u05D5\u05EA \u05E8\u05DC\u05D5\u05D5\u05E0\u05D8\u05D9\u05D5\u05EA." },
{ icon: ClipboardList, title: "\u05E1\u05D9\u05DB\u05D5\u05DD \u05EA\u05E7\u05E6\u05D9\u05E8 \u05DE\u05E0\u05D4\u05DC\u05D9\u05DD \u05D0\u05D5\u05D8\u05D5\u05DE\u05D8\u05D9", text: "\u05EA\u05E7\u05E6\u05D9\u05E8 \u05DE\u05E0\u05D4\u05DC\u05D9\u05DD \u05DE\u05D4\u05E7\u05DC\u05D8\u05EA \u05D4\u05E9\u05D9\u05E2\u05D5\u05E8 \u05D1\u05D0\u05DE\u05E6\u05E2\u05D5\u05EA \u05D1\u05D9\u05E0\u05D4 \u05DE\u05DC\u05D0\u05DB\u05D5\u05EA\u05D9\u05EA AI\xA0" },
{ icon: ShieldCheck, title: "תשלום מאובטח", text: "\u05D1\u05DC\u05D9 \u05DC\u05E8\u05D3\u05D5\u05E3 \u05D0\u05D7\u05E8\u05D9 \u05EA\u05E9\u05DC\u05D5\u05DE\u05D9\u05DD \u2014 \u05D2\u05D1\u05D9\u05D9\u05D4 \u05D1\u05D8\u05D5\u05D7\u05D4 \u05D5\u05D0\u05D5\u05D8\u05D5\u05DE\u05D8\u05D9\u05EA \u05E2\u05D1\u05D5\u05E8 \u05DB\u05DC \u05E9\u05D9\u05E2\u05D5\u05E8." },
{ icon: MessageCircle, title: "צ'אט ישיר", text: "\u05EA\u05E7\u05E9\u05D5\u05E8\u05EA \u05D9\u05E9\u05D9\u05E8\u05D4 \u05D5\u05D1\u05D8\u05D5\u05D7\u05D4 \u05E2\u05DD \u05D4\u05EA\u05DC\u05DE\u05D9\u05D3\u05D9\u05DD \u05E9\u05DC\u05DB\u05DD \u05DC\u05E4\u05E0\u05D9 \u05D5\u05D0\u05D7\u05E8\u05D9 \u05D4\u05E9\u05D9\u05E2\u05D5\u05E8." }];


export default function LandingFeatures() {
  return (
    <section id="features" className="py-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">כל הכלים להצלחה במקום אחד</h2>
          <p className="text-lg text-muted-foreground font-body">כל מה שצריך כדי ללמוד וללמד — בפלטפורמה אחת</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) =>
          <div key={f.title} className="bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground font-body leading-relaxed">{f.text}</p>
            </div>
          )}
        </div>
      </div>
    </section>);

}