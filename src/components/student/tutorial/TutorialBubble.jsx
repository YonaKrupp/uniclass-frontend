import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import TutorialCardContent from "./TutorialCardContent";

const CARD_W = 372;
const GAP = 16;
const MARGIN = 12;

/**
 * בועת ההסבר — ממוקמת אוטומטית מעל/מתחת/בצד לפי המקום הפנוי,
 * נשארת בגבולות המסך, ובמובייל הופכת לגיליון בתחתית המסך.
 */
export default function TutorialBubble({ step, index, total, rect, onPrev, onNext, onSkip }) {
  const cardRef = useRef(null);
  const [size, setSize] = useState({ h: 240 });
  const [viewport, setViewport] = useState({
    w: typeof window === "undefined" ? 1200 : window.innerWidth,
    h: typeof window === "undefined" ? 800 : window.innerHeight,
  });

  useLayoutEffect(() => {
    if (cardRef.current) setSize({ h: cardRef.current.offsetHeight });
  }, [index, viewport.w, viewport.h]);

  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = viewport.w < 640;
  let cardStyle = null;
  let arrowStyle = null;

  if (isMobile) {
    cardStyle = { left: MARGIN, right: MARGIN, bottom: MARGIN };
  } else {
    const width = Math.min(CARD_W, viewport.w - MARGIN * 2);
    const spaceBelow = viewport.h - (rect.top + rect.height);
    const spaceAbove = rect.top;
    const spaceRight = viewport.w - (rect.left + rect.width);
    const spaceLeft = rect.left;
    const needed = size.h + GAP + MARGIN;

    let side = step.placement;
    if (!side) {
      if (spaceBelow >= needed) side = "bottom";
      else if (spaceAbove >= needed) side = "top";
      else if (spaceRight >= width + GAP) side = "right";
      else if (spaceLeft >= width + GAP) side = "left";
      else side = spaceBelow >= spaceAbove ? "bottom" : "top";
    }

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const clamp = (v, min, max) => Math.max(min, Math.min(v, max));

    if (side === "bottom" || side === "top") {
      const left = clamp(cx - width / 2, MARGIN, viewport.w - width - MARGIN);
      const top = clamp(
        side === "bottom" ? rect.top + rect.height + GAP : rect.top - size.h - GAP,
        MARGIN,
        viewport.h - size.h - MARGIN
      );
      const arrowLeft = clamp(cx - left - 7, 16, width - 30);
      cardStyle = { top, left, width };
      arrowStyle = side === "bottom" ? { top: -6, left: arrowLeft } : { bottom: -6, left: arrowLeft };
    } else {
      const left = clamp(
        side === "right" ? rect.left + rect.width + GAP : rect.left - width - GAP,
        MARGIN,
        viewport.w - width - MARGIN
      );
      const top = clamp(cy - size.h / 2, MARGIN, viewport.h - size.h - MARGIN);
      const arrowTop = clamp(cy - top - 7, 16, size.h - 30);
      cardStyle = { top, left, width };
      arrowStyle = side === "right" ? { left: -6, top: arrowTop } : { right: -6, top: arrowTop };
    }
  }

  return (
    <div
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label={step.title}
      className="fixed z-[10000]"
      style={cardStyle}
    >
      <div
        ref={cardRef}
        key={index}
        className="relative rounded-2xl border border-border bg-card text-card-foreground shadow-2xl p-5 app-fade-up"
      >
        {arrowStyle && (
          <span
            aria-hidden="true"
            className="absolute w-3 h-3 rotate-45 rounded-[2px] bg-card"
            style={arrowStyle}
          />
        )}
        <TutorialCardContent
          step={step}
          index={index}
          total={total}
          onPrev={onPrev}
          onNext={onNext}
          onSkip={onSkip}
        />
      </div>
    </div>
  );
}