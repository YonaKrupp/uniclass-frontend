import React from "react";
import { CheckCircle2, MessageCircle, Share2 } from "lucide-react";

// הכניסו כאן את קישור קבוצת ה-WhatsApp של המורים כדי להפעיל את הכפתור.
const WHATSAPP_GROUP_URL = "";

export default function TeacherThanks({ onContinue }) {
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/register-teacher` : "";
  const shareText = `נרשמתי ל-UniClass כדי ללמד שיעורים פרטיים. גם אתם מוזמנים: ${shareUrl}`;
  const shareHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  return (
    <div dir="rtl" className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-primary" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-heading font-bold text-foreground">נרשמת בהצלחה!</h1>
          <p className="text-base text-muted-foreground font-body leading-relaxed">
            תודה שהצטרפת ל-UniClass. אנחנו שמחים שהגעת, ונתחיל איתך בקרוב.
          </p>
        </div>

        {WHATSAPP_GROUP_URL ? (
          <a
            href={WHATSAPP_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[52px] rounded-xl bg-primary text-primary-foreground text-base font-heading font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform"
          >
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
            הצטרף לקבוצת ה-WhatsApp
          </a>
        ) : (
          <span className="w-full min-h-[52px] rounded-xl bg-primary text-primary-foreground text-base font-heading font-semibold flex items-center justify-center gap-2 opacity-60">
            <MessageCircle className="w-5 h-5" aria-hidden="true" />
            הצטרף לקבוצת ה-WhatsApp
          </span>
        )}

        <a
          href={shareHref}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full min-h-[52px] rounded-xl border border-border bg-card text-foreground text-base font-heading font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Share2 className="w-5 h-5" aria-hidden="true" />
          שתף עם חבר
        </a>

        <button
          type="button"
          onClick={onContinue}
          className="text-sm font-body text-muted-foreground hover:text-primary transition-colors"
        >
          המשך למילוי הפרופיל
        </button>
      </div>
    </div>
  );
}