import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Accessibility } from "lucide-react";
import useAccessibility from "./accessibility/useAccessibility";
import AccessibilityPanel from "./accessibility/AccessibilityPanel";

export default function AccessibilityToolbar() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);
  const a11y = useAccessibility();
  const { guideRef } = a11y;

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open, close]);

  return (
    <>
      <div className="fixed left-3 bottom-3 z-[70]">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-label="פתיחת סרגל נגישות"
          aria-expanded={open}
          className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <Accessibility className="w-5 h-5" />
        </button>
      </div>

      {createPortal(
        <>
          <div ref={guideRef} className="uc-guide uc-a11y-immune" aria-hidden="true" />
          {open && (
            <>
              <div className="uc-a11y-backdrop uc-a11y-immune" onClick={close} />
              <AccessibilityPanel a11y={a11y} onClose={close} />
            </>
          )}
        </>,
        document.body
      )}
    </>
  );
}