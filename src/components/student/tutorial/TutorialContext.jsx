import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  STUDENT_TUTORIAL_STEPS,
  isTutorialDoneLocally,
  isTutorialDoneOnServer,
  markTutorialComplete,
  markTutorialDoneLocally,
} from "@/lib/studentTutorial";

const TutorialContext = createContext(null);

export function useTutorial() {
  return useContext(TutorialContext);
}

/**
 * מצב ההדרכה חי ב-layout של התלמידים, כך שהוא לא מתאפס במעבר בין דפים.
 * שכבת התצוגה בלבד — לא נוגעת בשום לוגיקה קיימת.
 */
export function TutorialProvider({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const startedRef = useRef(false);

  const total = STUDENT_TUTORIAL_STEPS.length;
  const step = STUDENT_TUTORIAL_STEPS[index] || null;

  const start = useCallback(() => {
    startedRef.current = true;
    setIndex(0);
    setActive(true);
  }, []);

  const end = useCallback(() => {
    markTutorialComplete();
    setActive(false);
    setIndex(0);
    navigate("/student-home");
  }, [navigate]);

  const next = useCallback(() => setIndex((i) => Math.min(i + 1, total - 1)), [total]);
  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  // הופעה אוטומטית בכניסה הראשונה לדף הבית של התלמיד
  useEffect(() => {
    if (startedRef.current || pathname !== "/student-home") return undefined;
    if (isTutorialDoneLocally()) {
      startedRef.current = true;
      return undefined;
    }

    let alive = true;
    isTutorialDoneOnServer().then((done) => {
      if (!alive || startedRef.current) return;
      startedRef.current = true;
      if (done) {
        markTutorialDoneLocally();
        return;
      }
      setIndex(0);
      setActive(true);
    });

    return () => {
      alive = false;
    };
  }, [pathname]);

  // ניווט אוטומטי לדף של השלב הנוכחי
  useEffect(() => {
    if (!active || !step?.route) return;
    if (pathname !== step.route) navigate(step.route);
  }, [active, step, pathname, navigate]);

  const value = useMemo(
    () => ({ active, index, total, step, start, next, prev, skip: end, finish: end }),
    [active, index, total, step, start, next, prev, end]
  );

  return <TutorialContext.Provider value={value}>{children}</TutorialContext.Provider>;
}