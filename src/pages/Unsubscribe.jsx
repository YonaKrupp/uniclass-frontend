import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail } from "lucide-react";

const LOGO = "https://media.base44.com/images/public/6a37f1517bf59551c5f4b6f9/c40751db9_Logo_UNICLASS_purple_PNG.png";

export default function Unsubscribe() {
  return (
    <div dir="rtl" className="landing min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <a href="#main-content" className="skip-link">דלג לתוכן הראשי</a>
      <div id="main-content" className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-body font-medium text-primary hover:underline mb-6">
          <ArrowRight className="w-4 h-4" aria-hidden="true" /> חזרה לדף הראשי
        </Link>
        <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
          <img src={LOGO} alt="UniClass" className="h-8 mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold text-foreground text-center mb-4">הסרה מרשימת התפוצה</h1>
          <div className="flex justify-center mb-4" aria-hidden="true">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground font-body text-center leading-relaxed">
            להסרה מרשימת התפוצה אפשר לפנות אל [דוא"ל ליצירת קשר].
          </p>
          <p className="text-xs text-muted-foreground font-body text-center mt-4 leading-relaxed">
            נטפל בבקשתך בהקדם. ההסרה תחול על דוא"ל ועל SMS כאחד.
          </p>
        </div>
      </div>
    </div>
  );
}