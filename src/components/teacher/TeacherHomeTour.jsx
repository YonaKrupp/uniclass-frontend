import React, { useEffect, useRef, useState } from "react";
import TourCard from "@/components/schedule/TourCard";

// השלבים מסודרים לפי סדר האלמנטים בדף הבית, מלמעלה למטה.
export const TEACHER_HOME_TOUR_STEPS = [
  {
    key: "intro",
    title: "ברוכים הבאים לפאנל המורים",
    text: "סיור קצר של חצי דקה שיראה איפה רואים את השיעורים, התלמידים והפעילות שלך — הכול במקום אחד.",
    target: null,
  },
  {
    key: "banner",
    title: "הפאנל האישי שלך",
    text: "כאן מופיעים השם והתמונה שלך, וזה המקום שממנו מתחילים את היום.",
    target: '[data-tour="home-banner"]',
  },
  {
    key: "stats",
    title: "סיכום מהיר",
    text: "כמה שיעורים יש לך היום, כמה תלמידים למדו איתך, כמה שיעורים מתוכננים והדירוג הממוצע שלך.",
    target: '[data-tour="home-stats"]',
  },
  {
    key: "activity",
    title: "פעילות שיעורים",
    text: "כאן רואים את הפעילות של 7 הימים הקרובים, כדי לדעת מראש איך נראה השבוע.",
    target: '[data-tour="home-activity"]',
  },
  {
    key: "lessons",
    title: "השיעורים שלך",
    text: "כל השיעורים הקרובים: תאריך, שעה, מקצוע ותלמיד.",
    target: '[data-tour="home-lessons"]',
  },
  {
    key: "finish",
    title: "נמשיך לניהול השיעורים",
    text: "עוד רגע נעבור לדף ניהול השיעורים ונראה איך פותחים זמינות לשיעורים. תמיד אפשר לחזור לכאן בלחיצה על ?.",
    target: '[data-tour="home-tour-help"]',
    primaryLabel: "המשך לניהול שיעורים",
  },
];

export default function TeacherHomeTour({ step, onNext, onPrev, onSkip, onFinish }) {
  const [rect, setRect] = useState(null);
  const definition = TEACHER_HOME_TOUR_STEPS[step] || TEACHER_HOME_TOUR_STEPS[0];
  const total = TEACHER_HOME_TOUR_STEPS.length;
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
    // אלמנט שאינו קיים (למשל לוח שעוד לא נטען) — מדלגים לשלב הבא
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
      window.clearTimeout(skipTimer);
      window.clearTimeout(stop);
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