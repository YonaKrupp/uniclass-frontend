import React from "react";
import TutorialCardContent from "./TutorialCardContent";

/** שלב ללא ספוטלייט — כרטיס במרכז המסך (פתיחה / מעבר בין חלקים / סיום). */
export default function TutorialModal({ step, index, total, onPrev, onNext, onSkip }) {
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      <div
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-label={step.title}
        key={index}
        className="relative w-full max-w-[420px] rounded-3xl border border-border bg-card text-card-foreground shadow-2xl p-6 app-fade-up"
      >
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