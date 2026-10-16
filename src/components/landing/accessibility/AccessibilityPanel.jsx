import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  AlignHorizontalSpaceAround,
  Baseline,
  CaseSensitive,
  Contrast,
  FlipHorizontal2,
  Heading,
  ImageOff,
  LetterText,
  Link2,
  MousePointer,
  MousePointer2,
  Palette,
  PersonStanding,
  RotateCcw,
  Scan,
  Type,
  X,
  ZapOff,
} from "lucide-react";
import AccessibilityOptionCard from "./AccessibilityOptionCard";
import AccessibilityStepperCard from "./AccessibilityStepperCard";

const COLOR_MODES = [
  { value: "contrast", label: "ניגודיות גבוהה", icon: Contrast },
  { value: "invert", label: "ניגודיות הפוכה", icon: FlipHorizontal2 },
  { value: "grayscale", label: "גווני אפור", icon: Palette },
  { value: "bw", label: "שחור-לבן", icon: Baseline },
];

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function AccessibilityPanel({ a11y, onClose }) {
  const panelRef = useRef(null);
  const {
    settings,
    update,
    toggle,
    reset,
  } = a11y;

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return undefined;

    const focusables = () =>
      Array.from(panel.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null);

    focusables()[0]?.focus();

    const onKeyDown = (event) => {
      if (event.key !== "Tab") return;
      const list = focusables();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    panel.addEventListener("keydown", onKeyDown);
    return () => panel.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      ref={panelRef}
      className="uc-a11y-panel uc-a11y-immune"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="כלי נגישות"
    >
      <div className="uc-a11y-head">
        <h2 className="uc-a11y-title">כלי נגישות</h2>
        <button type="button" className="uc-a11y-close" onClick={onClose} aria-label="סגירת חלונית הנגישות">
          <X aria-hidden="true" />
        </button>
      </div>

      <div className="uc-a11y-body">
        <section className="uc-a11y-group" aria-labelledby="uc-a11y-g1">
          <h3 className="uc-a11y-group-title" id="uc-a11y-g1">
            תצוגה וצבעים
          </h3>
          <div className="uc-a11y-grid">
            {COLOR_MODES.map((mode) => (
              <AccessibilityOptionCard
                key={mode.value}
                icon={mode.icon}
                label={mode.label}
                active={settings.colorMode === mode.value}
                onClick={() =>
                  update({ colorMode: settings.colorMode === mode.value ? "none" : mode.value })
                }
              />
            ))}
          </div>
        </section>

        <section className="uc-a11y-group" aria-labelledby="uc-a11y-g2">
          <h3 className="uc-a11y-group-title" id="uc-a11y-g2">
            טקסט
          </h3>
          <div className="uc-a11y-grid">
            <AccessibilityStepperCard
              icon={Type}
              label="גודל טקסט"
              value={settings.fontScale}
              min={80}
              max={200}
              step={10}
              unit="%"
              defaultValue={100}
              onChange={(value) => update({ fontScale: value })}
            />
            <AccessibilityStepperCard
              icon={AlignHorizontalSpaceAround}
              label="ריווח בין מילים"
              value={settings.wordSpacing}
              min={0}
              max={10}
              step={1}
              unit="px"
              defaultValue={0}
              onChange={(value) => update({ wordSpacing: value })}
            />
            <AccessibilityStepperCard
              icon={LetterText}
              label="ריווח בין אותיות"
              value={settings.letterSpacing}
              min={0}
              max={5}
              step={0.5}
              unit="px"
              defaultValue={0}
              onChange={(value) => update({ letterSpacing: value })}
            />
            <AccessibilityOptionCard
              icon={CaseSensitive}
              label="גופן קריא"
              active={settings.readableFont}
              onClick={() => toggle("readableFont")}
            />
            <AccessibilityOptionCard
              icon={Link2}
              label="הדגשת קישורים"
              active={settings.highlightLinks}
              onClick={() => toggle("highlightLinks")}
            />
            <AccessibilityOptionCard
              icon={Heading}
              label="הדגשת כותרות"
              active={settings.highlightHeadings}
              onClick={() => toggle("highlightHeadings")}
            />
          </div>
        </section>

        <section className="uc-a11y-group" aria-labelledby="uc-a11y-g3">
          <h3 className="uc-a11y-group-title" id="uc-a11y-g3">
            קריאה
          </h3>
          <div className="uc-a11y-grid">
            <AccessibilityOptionCard
              icon={Scan}
              label="מדריך קריאה"
              active={settings.readingGuide}
              onClick={() => toggle("readingGuide")}
            />
            <AccessibilityOptionCard
              icon={PersonStanding}
              label="תמיכה בקורא מסך"
              active={settings.screenReader}
              onClick={() => toggle("screenReader")}
            />
            <AccessibilityOptionCard
              icon={ImageOff}
              label="הסתרת תמונות"
              active={settings.hideImages}
              onClick={() => toggle("hideImages")}
            />
          </div>
        </section>

        <section className="uc-a11y-group" aria-labelledby="uc-a11y-g4">
          <h3 className="uc-a11y-group-title" id="uc-a11y-g4">
            ניווט ותנועה
          </h3>
          <div className="uc-a11y-grid">
            <AccessibilityOptionCard
              icon={MousePointer2}
              label="סמן גדול כהה"
              active={settings.cursor === "dark"}
              onClick={() => update({ cursor: settings.cursor === "dark" ? "none" : "dark" })}
            />
            <AccessibilityOptionCard
              icon={MousePointer}
              label="סמן גדול בהיר"
              active={settings.cursor === "light"}
              onClick={() => update({ cursor: settings.cursor === "light" ? "none" : "light" })}
            />
            <AccessibilityOptionCard
              icon={ZapOff}
              label="ביטול אנימציות"
              active={settings.stopMotion}
              onClick={() => toggle("stopMotion")}
            />
          </div>
        </section>
      </div>

      <div className="uc-a11y-foot">
        <button type="button" className="uc-a11y-reset" onClick={reset}>
          <RotateCcw aria-hidden="true" />
          איפוס הגדרות
        </button>
        <Link to="/accessibility" className="uc-a11y-link" onClick={onClose}>
          הצהרת נגישות
        </Link>
      </div>
    </div>
  );
}