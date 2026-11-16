import React, { useEffect, useRef } from "react";
import { useTutorial } from "./TutorialContext";
import useAnchorRect from "./useAnchorRect";
import TutorialBubble from "./TutorialBubble";
import TutorialModal from "./TutorialModal";

/** שכבת ההדרכה: האפלה, ספוטלייט סביב האלמנט הנוכחי, בועת הסבר וניווט מקלדת. */
export default function TutorialOverlay() {
  const { active, index, total, step, next, prev, skip, finish } = useTutorial();
  const { rect, missing } = useAnchorRect(active && step ? step.selector : null);
  const advancedRef = useRef(-1);

  // אלמנט חסר — מדלגים לשלב הבא בלי לקרוס
  useEffect(() => {
    if (!active || !missing) return;
    if (advancedRef.current === index) return;
    advancedRef.current = index;
    if (index >= total - 1) finish();
    else next();
  }, [active, missing, index, total, next, finish]);

  useEffect(() => {
    if (!active) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        skip();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        next();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, next, prev, skip]);

  if (!active || !step) return null;

  const isLast = index >= total - 1;
  const handleNext = () => (isLast ? finish() : next());

  if (step.modal) {
    return (
      <>
        <div className="fixed inset-0 z-[9998]" style={{ background: "rgba(0,0,0,0.65)" }} aria-hidden="true" />
        <TutorialModal
          step={step}
          index={index}
          total={total}
          onPrev={prev}
          onNext={handleNext}
          onSkip={skip}
        />
      </>
    );
  }

  return (
    <>
      {/* חוסם לחיצות על שאר המסך */}
      <div className="fixed inset-0 z-[9998]" aria-hidden="true" />

      {rect ? (
        <>
          <div
            aria-hidden="true"
            className="fixed z-[9999] pointer-events-none rounded-xl transition-all duration-300 ease-out"
            style={{
              top: rect.top - 8,
              left: rect.left - 8,
              width: rect.width + 16,
              height: rect.height + 16,
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.65)",
              border: "1px solid hsl(var(--primary) / 0.65)",
            }}
          />
          <TutorialBubble
            key={index}
            step={step}
            index={index}
            total={total}
            rect={rect}
            onPrev={prev}
            onNext={handleNext}
            onSkip={skip}
          />
        </>
      ) : (
        <div className="fixed inset-0 z-[9998]" style={{ background: "rgba(0,0,0,0.65)" }} aria-hidden="true" />
      )}
    </>
  );
}