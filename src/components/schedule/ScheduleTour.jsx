import React, { useEffect, useRef, useState } from "react";
import TourCard from "./TourCard";

// השלבים מסודרים לפי סדר האלמנטים בעמוד, מלמעלה למטה,
// כדי שההדגשה תתקדם באופן רציף ולא תקפוץ קדימה ואחורה.
export const SCHEDULE_TOUR_STEPS = [
  {
    key: "intro",
    title: "כאן קובעים מתי אתה פנוי",
    text: "כאן אתה קובע מתי אתה פנוי ללמד. תלמידים יוכלו להזמין שיעורים רק בשעות שתפתח. בוא נראה איך זה עובד – 30 שניות.",
    target: null,
  },
  {
    key: "tabs",
    title: "שלושה מצבים",
    text: "בחר מה אתה רוצה לעשות: לפתוח שעות פנויות, לבטל שיעור, או להעביר שיעור למועד אחר. מתחילים תמיד ב'פתח זמינות'.",
    target: '[data-tour="tabs"]',
  },
  {
    key: "shortcuts",
    title: "קיצורי דרך",
    text: "רוצה לפתוח הרבה שעות מהר? אפשר להעתיק את השעות מהשבוע הקודם או לחזור על השעות שפתחת לשבועות הבאים.",
    target: '[data-tour="quick-actions"]',
  },
  {
    key: "week",
    title: "ניווט בין שבועות",
    text: "עבור בין שבועות עם החיצים. אפשר לתכנן קדימה.",
    target: '[data-tour="week-nav"]',
  },
  {
    key: "legend",
    title: "מה מסמן כל צבע",
    text: "ירוק = פנוי ללמד, כחול = יש שיעור עם תלמיד, אפור = עבר או לא זמין.",
    target: '[data-tour="legend"]',
  },
  {
    key: "slot",
    title: "נסה בעצמך",
    text: "נסה בעצמך! לחץ על המשבצת המוזהרת כדי לסמן שאתה פנוי. אפשר גם לגרור על כמה משבצות, או ללחוץ על שם היום כדי לסמן יום שלם.",
    target: '[data-tour="target-slot"]',
  },
  {
    key: "finish",
    title: "מוכנים להתחיל",
    text: "זהו! ככל שתפתח יותר שעות, יותר תלמידים יוכלו להזמין ממך. תמיד אפשר ללחוץ על ? בפינה כדי לראות את המדריך שוב.",
    target: '[data-tour="tour-help"]',
  },
];

export default function ScheduleTour({ step, onNext, onPrev, onSkip, onFinish }) {
  const [rect, setRect] = useState(null);
  const definition = SCHEDULE_TOUR_STEPS[step] || SCHEDULE_TOUR_STEPS[0];
  const total = SCHEDULE_TOUR_STEPS.length;
  const onNextRef = useRef(onNext);
  onNextRef.current = onNext;

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onSkip();
      if (event.key === "ArrowLeft") onNext();
      if (event.key === "ArrowRight") onPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onNext, onPrev, onSkip]);

  useEffect(() => {
    const selector = definition.target;
    if (!selector) {
      setRect(null);
      return undefined;
    }

    let alive = true;
    let skipped = false;
    const measure = () => {
      if (!alive) return;
      const el = document.querySelector(selector);
      if (!el) return;
      const box = el.getBoundingClientRect();
      setRect({ top: box.top, left: box.left, width: box.width, height: box.height });
    };

    const element = document.querySelector(selector);
    if (element && typeof element.scrollIntoView === "function") {
      element.scrollIntoView({ block: "center", behavior: "smooth" });
    }

    measure();
    const interval = window.setInterval(measure, 120);
    const stop = window.setTimeout(() => window.clearInterval(interval), 900);
    // אלמנט שאינו קיים בעמוד (למשל לוח שעוד לא נטען) — מדלגים לשלב הבא
    // במקום להציג שלב שמצביע על כלום.
    const skipTimer = window.setTimeout(() => {
      if (!alive || skipped) return;
      if (!document.querySelector(selector)) {
        skipped = true;
        onNextRef.current?.();
      }
    }, 700);
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);

    return () => {
      alive = false;
      window.clearInterval(interval);
      window.clearTimeout(stop);
      window.clearTimeout(skipTimer);
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [step, definition.target]);

  return (
    <TourCard
      step={definition}
      index={step}
      total={total}
      rect={rect}
      onPrev={onPrev}
      onNext={onNext}
      onSkip={onSkip}
      onFinish={onFinish}
    />
  );
}