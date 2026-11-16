import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const BUBBLE_WIDTH = 348;
const PAD = 6;

export default function TourBubble({ rect, sheet, step, index, total, onPrev, onNext, onFinish, onRequestSkip }) {
  const isFinish = step.key === "finish";
  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  const spot = rect
    ? {
        top: Math.max(0, rect.top - PAD),
        left: Math.max(0, rect.left - PAD),
        width: rect.width + PAD * 2,
        height: rect.height + PAD * 2,
      }
    : null;

  const centered = !sheet && !spot;
  let cardStyle = null;
  let arrowLeft = null;
  if (!sheet && spot) {
    const width = Math.min(BUBBLE_WIDTH, vw - 24);
    const center = spot.left + spot.width / 2;
    const left = Math.max(12, Math.min(center - width / 2, vw - width - 12));
    const top = Math.min(spot.top + spot.height + 18, vh - 300);
    cardStyle = { top: Math.max(12, top), left, width };
    arrowLeft = Math.max(18, Math.min(center - left - 8, width - 26));
  }

  const card = (
    <div
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label={step.title}
      style={cardStyle ? { position: "fixed", ...cardStyle } : undefined}
      className={
        sheet
          ? "fixed inset-x-0 bottom-0 z-[100] bg-card border-t border-border rounded-t-3xl shadow-2xl p-5 pb-6 app-fade-up"
          : "z-[100] bg-card border border-border rounded-2xl shadow-2xl p-4 app-fade-up"
      }
    >
      {arrowLeft !== null && (
        <span
          aria-hidden="true"
          className="absolute -top-2 w-4 h-4 rotate-45 bg-card border-r border-t border-border"
          style={{ left: `${arrowLeft}px` }}
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
            onClick={isFinish ? onFinish : onNext}
            className="min-h-[36px] px-3 rounded-lg bg-primary text-primary-foreground text-xs font-heading font-semibold hover:bg-primary/90 transition-colors"
          >
            הבנתי
          </button>
          <button
            type="button"
            onClick={onRequestSkip}
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
          onClick={isFinish ? onFinish : onNext}
          className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-xl bg-primary text-primary-foreground text-sm font-heading font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors"
        >
          {isFinish ? "בוא נתחיל" : "הבא"}
          {!isFinish && <ArrowLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {spot ? (
        <>
          <div className="fixed z-[97] bg-black/60" style={{ top: 0, left: 0, width: vw, height: spot.top }} />
          <div
            className="fixed z-[97] bg-black/60"
            style={{ top: spot.top + spot.height, left: 0, width: vw, height: Math.max(0, vh - spot.top - spot.height) }}
          />
          <div className="fixed z-[97] bg-black/60" style={{ top: spot.top, left: 0, width: spot.left, height: spot.height }} />
          <div
            className="fixed z-[97] bg-black/60"
            style={{
              top: spot.top,
              left: spot.left + spot.width,
              width: Math.max(0, vw - spot.left - spot.width),
              height: spot.height,
            }}
          />
          <div
            aria-hidden="true"
            className="fixed z-[98] rounded-xl ring-2 ring-primary pointer-events-none transition-all duration-300"
            style={{
              top: spot.top,
              left: spot.left,
              width: spot.width,
              height: spot.height,
              boxShadow: "0 0 0 4px hsl(var(--primary) / 0.22), 0 0 38px 6px hsl(var(--primary) / 0.32)",
            }}
          />
          <div
            aria-hidden="true"
            className="fixed z-[99] cursor-default"
            style={{ top: spot.top, left: spot.left, width: spot.width, height: spot.height }}
          />
        </>
      ) : (
        <div className="fixed inset-0 z-[97] bg-black/60" />
      )}

      {centered ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-[348px]">{card}</div>
        </div>
      ) : (
        card
      )}
    </>
  );
}