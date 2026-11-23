import React, { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

const CARD_WIDTH = 360;
const GAP = 14;

export default function TourCard({ step, index, total, rect, onPrev, onNext, onSkip, onFinish }) {
  const cardRef = useRef(null);
  const [size, setSize] = useState({ h: 240 });
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  const isLast = index === total - 1;
  const sheet = vw < 640;

  useLayoutEffect(() => {
    if (cardRef.current) setSize({ h: cardRef.current.offsetHeight });
  }, [index, rect?.top, rect?.height, vw]);

  const width = Math.min(CARD_WIDTH, vw - 24);
  let cardStyle = null;
  let arrow = null;

  if (!sheet && rect) {
    const cx = rect.left + rect.width / 2;
    const left = Math.max(12, Math.min(cx - width / 2, vw - width - 12));
    const spaceBelow = vh - (rect.top + rect.height);
    const below = spaceBelow > size.h + GAP + 16;
    const top = below
      ? rect.top + rect.height + GAP
      : Math.max(12, Math.min(rect.top - size.h - GAP, vh - size.h - 12));
    cardStyle = { top, left, width };
    arrow = { left: Math.max(20, Math.min(cx - left - 8, width - 28)), below };
  }

  const primaryLabel = isLast ? "מתחילים" : "הבא";

  // Portal into <body>: the page's <main> has a CSS transform (fade-up animation),
  // which would otherwise make these fixed layers position against <main> instead
  // of the viewport and shift the spotlight off its target.
  return createPortal(
    <>
      {rect ? (
        <>
          <div className="fixed z-[97] bg-black/55 transition-all duration-300" style={{ top: 0, left: 0, width: vw, height: Math.max(0, rect.top) }} />
          <div
            className="fixed z-[97] bg-black/55 transition-all duration-300"
            style={{ top: rect.top + rect.height, left: 0, width: vw, height: Math.max(0, vh - rect.top - rect.height) }}
          />
          <div
            className="fixed z-[97] bg-black/55 transition-all duration-300"
            style={{ top: rect.top, left: 0, width: Math.max(0, rect.left), height: rect.height }}
          />
          <div
            className="fixed z-[97] bg-black/55 transition-all duration-300"
            style={{
              top: rect.top,
              left: rect.left + rect.width,
              width: Math.max(0, vw - rect.left - rect.width),
              height: rect.height,
            }}
          />
          <div
            aria-hidden="true"
            className="fixed z-[98] rounded-xl ring-2 ring-primary pointer-events-none transition-all duration-300"
            style={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
              boxShadow: "0 0 0 5px hsl(var(--primary) / 0.25), 0 0 40px 8px hsl(var(--primary) / 0.35)",
            }}
          />
        </>
      ) : (
        <div className="fixed inset-0 z-[97] bg-black/55" />
      )}

      <div
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-label={step.title}
        className={
          sheet
            ? "fixed inset-x-0 bottom-0 z-[100] bg-card border-t border-border rounded-t-3xl shadow-2xl p-5 pb-6 app-fade-up"
            : `z-[100] bg-card border border-border rounded-2xl shadow-2xl p-4 ${rect ? "app-fade-up" : ""}`
        }
        style={sheet ? undefined : cardStyle ? { position: "fixed", ...cardStyle } : { position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width }}
      >
        <div ref={cardRef}>
          {arrow && (
            <span
              aria-hidden="true"
              className={`absolute w-4 h-4 rotate-45 bg-card ${
                arrow.below ? "-top-2 border-r border-t border-border" : "-bottom-2 border-l border-b border-border"
              }`}
              style={{ left: `${arrow.left}px` }}
            />
          )}

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <p className="text-[11px] font-heading font-semibold text-muted-foreground">
                שלב {index + 1} מתוך {total}
              </p>
              <h3 className="text-base font-heading font-bold text-foreground leading-snug">{step.title}</h3>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={isLast ? onFinish : onNext}
                className="min-h-[36px] px-3 rounded-lg bg-primary text-primary-foreground text-xs font-heading font-semibold hover:bg-primary/90 transition-colors"
              >
                הבנתי
              </button>
              <button
                type="button"
                onClick={onSkip}
                className="min-h-[36px] px-2 rounded-lg text-xs font-body text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                דלג
              </button>
            </div>
          </div>

          <p className="mt-2.5 text-sm font-body text-foreground/80 leading-relaxed">{step.text}</p>

          <div className="mt-4 flex items-center justify-center gap-1.5" aria-hidden="true">
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-5 bg-primary" : i < index ? "w-1.5 bg-primary/40" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>

          <div className="mt-3.5 flex items-center gap-2">
            <button
              type="button"
              onClick={onPrev}
              disabled={index === 0}
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 rounded-xl bg-muted text-foreground text-sm font-heading font-semibold hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-4 h-4" />
              הקודם
            </button>
            <button
              type="button"
              onClick={isLast ? onFinish : onNext}
              className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-xl bg-primary text-primary-foreground text-sm font-heading font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors"
            >
              {primaryLabel}
              {!isLast && <ArrowLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}