import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TourBubble from "./TourBubble";
import SkipConfirmDialog from "./SkipConfirmDialog";
import { ONBOARDING_TOUR_STEP_EVENT } from "@/lib/teacherOnboarding";

export const TOUR_STEPS = [
  { key: "home", path: "/teacher-home", title: "דף הבית", text: "זה מרכז השליטה שלך: סיכום שיעורים קרובים והתראות." },
  { key: "schedule", path: "/teacher-schedule", title: "ניהול שיעורים", text: "כאן אתה רואה את כל השיעורים, מאשר או דוחה בקשות, ומתאם מועדים. לחץ על שיעור כדי לראות פרטים ולנהל אותו." },
  { key: "video", path: "/teacher-video", title: "כניסה לכיתה", text: "כאן מתחברים לשיעור הווירטואלי בזמן אמת. הכפתור פעיל מעט לפני תחילת השיעור." },
  { key: "students", path: "/teacher-students", title: "רשימת תלמידים", text: "כל התלמידים שלך במקום אחד. לחץ על תלמיד כדי לראות היסטוריית שיעורים ולשלוח הודעה." },
  { key: "summary", path: "/lesson-summary", title: "סיכום שיעור", text: "אחרי כל שיעור כותבים כאן סיכום קצר שהתלמיד וההורים יכולים לראות." },
  { key: "profile", path: "/teacher-profile", title: "פרופיל מורה", text: "זה הפרופיל הציבורי שלך. כאן אפשר לעדכן אודות, מחיר, תמונה ופרטים בכל רגע." },
  { key: "chat", path: "/teacher-chat", title: "צ'אט", text: "תקשורת ישירה עם תלמידים. הודעות חדשות יסומנו בעיגול אדום." },
  { key: "contact", path: "/teacher-contact", title: "צור קשר", text: "צריך עזרה? כאן יוצרים קשר עם התמיכה." },
  { key: "finish", title: "מוכן להתחיל! 🎉", text: "אפשר להפעיל את המדריך שוב בכל רגע דרך פרופיל מורה." },
];

const useViewport = () => {
  const [size, setSize] = useState({ width: typeof window !== "undefined" ? window.innerWidth : 1200 });
  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
};

export default function ProfileTour({ step, onStep, onFinish, onSkip }) {
  const navigate = useNavigate();
  const { width } = useViewport();
  const [rect, setRect] = useState(null);
  const [askSkip, setAskSkip] = useState(false);

  const index = Math.min(Math.max(step, 0), TOUR_STEPS.length - 1);
  const current = TOUR_STEPS[index];
  const navCollapsed = width < 1024;
  const sheet = width < 640;

  // Follow the teacher's menu: on a narrow screen the links live in the
  // collapsed menu, so the layout opens it for the step being explained.
  useEffect(() => {
    if (current.path) navigate(current.path, { replace: true });
    window.dispatchEvent(
      new CustomEvent(ONBOARDING_TOUR_STEP_EVENT, { detail: { openMenu: navCollapsed && Boolean(current.path) } })
    );
    return () => {
      window.dispatchEvent(new CustomEvent(ONBOARDING_TOUR_STEP_EVENT, { detail: { openMenu: false } }));
    };
  }, [index, navCollapsed]);

  // Lock the page behind the tour.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  // Measure the highlighted menu item; the collapsed menu mounts a moment later.
  useEffect(() => {
    if (!current.key || current.key === "finish") {
      setRect(null);
      return undefined;
    }
    let cancelled = false;
    let tries = 0;
    const measure = () => {
      const nodes = Array.from(document.querySelectorAll(`[data-tour="${current.key}"]`));
      const element = nodes.find((node) => node.getClientRects().length > 0);
      if (element) {
        const box = element.getBoundingClientRect();
        if (!cancelled) setRect({ top: box.top, left: box.left, width: box.width, height: box.height });
        return;
      }
      if (tries < 15 && !cancelled) {
        tries += 1;
        window.setTimeout(measure, 80);
      } else if (!cancelled) {
        setRect(null);
      }
    };
    measure();
    const onResize = () => {
      tries = 0;
      measure();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
    };
  }, [index, navCollapsed, current.key]);

  const goNext = () => {
    if (index + 1 >= TOUR_STEPS.length) onFinish();
    else onStep(index + 1);
  };

  const goPrev = () => {
    if (index > 0) onStep(index - 1);
  };

  const finish = () => {
    navigate("/teacher-home", { replace: true });
    onFinish();
  };

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") {
        setAskSkip(true);
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goNext();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index]);

  return (
    <>
      <TourBubble
        rect={rect}
        sheet={sheet}
        step={current}
        index={index}
        total={TOUR_STEPS.length}
        onPrev={goPrev}
        onNext={goNext}
        onFinish={finish}
        onRequestSkip={() => setAskSkip(true)}
      />
      {askSkip && <SkipConfirmDialog onCancel={() => setAskSkip(false)} onConfirm={onSkip} />}
    </>
  );
}