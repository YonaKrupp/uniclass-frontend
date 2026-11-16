import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie, X, Check } from "lucide-react";

const STORAGE_KEY = "uniclass_cookie_consent";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

// קריאת הבחירה — אחסון מקומי, ואם הוא חסום/unavailable, עוגייה
function readChoice() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
  } catch {
    /* ignore */
  }
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${STORAGE_KEY}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

// שמירת הבחירה בשני המקומות, כדי שתחזיק גם אחרי רענון
function saveChoice(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* ignore */
  }
  try {
    document.cookie = `${STORAGE_KEY}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

// דיווח הבחירה ל-Google Consent Mode v2 (כל ארבעת המפתחות)
function reportConsent(value) {
  try {
    window.dataLayer = window.dataLayer || [];
    const gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    const state = value === "accepted" ? "granted" : "denied";
    gtag("consent", "update", {
      analytics_storage: state,
      ad_storage: state,
      ad_user_data: state,
      ad_personalization: state,
    });
  } catch {
    /* ignore */
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = readChoice();
    if (saved === "accepted" || saved === "declined") {
      reportConsent(saved);
      return;
    }
    // אין בחירה שמורה — הביקור הראשון: מציגים את הבאנר
    reportConsent("declined");
    setVisible(true);
  }, []);

  const choose = (value) => {
    saveChoice(value);
    setVisible(false);
    reportConsent(value);
    window.dispatchEvent(new CustomEvent("uniclass-consent-change", { detail: value }));
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-4 sm:p-6 pointer-events-none">
      <div className="max-w-3xl mx-auto pointer-events-auto bg-card border border-border shadow-xl rounded-2xl p-5 sm:p-6 app-fade-up">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex w-11 h-11 rounded-xl bg-primary/10 items-center justify-center shrink-0">
            <Cookie className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-semibold text-foreground text-base sm:text-lg mb-1">
              שימוש בעוגיות ובאחסון מקומי
            </h3>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              אנחנו משתמשים באחסון מקומי בדפדפן לצורך תפעול שוטף של האתר (כניסה לחשבון, שמירת העדפות). עוגיות ואחסון שאינם הכרחיים יופעלו רק בהסכמתך. לפרטים נוספים ניתן לעיין ב{" "}
              <Link to="/privacy" className="text-primary font-medium underline underline-offset-2 hover:opacity-80">
                מדיניות הפרטיות
              </Link>
              .
            </p>
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <button
                onClick={() => choose("accepted")}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-body font-semibold shadow-sm hover:shadow-md hover:shadow-primary/20 hover:-translate-y-0.5 transition-all active:scale-[0.98]"
              >
                <Check className="w-4 h-4" />
                מאשר/ת
              </button>
              <button
                onClick={() => choose("declined")}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-muted text-foreground rounded-full text-sm font-body font-medium hover:bg-muted/70 transition-all"
              >
                <X className="w-4 h-4" />
                דחייה
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}