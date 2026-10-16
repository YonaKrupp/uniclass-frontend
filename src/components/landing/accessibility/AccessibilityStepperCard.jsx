import React from "react";
import { Minus, Plus, RotateCcw } from "lucide-react";

export default function AccessibilityStepperCard({
  icon: Icon,
  label,
  value,
  min,
  max,
  step,
  unit,
  defaultValue,
  onChange,
}) {
  const decimals = step < 1 ? 1 : 0;
  const clamp = (v) => Math.min(max, Math.max(min, Number(v.toFixed(2))));
  const shown = `${value.toFixed(decimals)}${unit}`;

  return (
    <div className="uc-a11y-stepper" role="group" aria-label={label}>
      <Icon aria-hidden="true" />
      <span className="uc-a11y-stepper-value" aria-live="polite">
        {shown}
      </span>
      <span className="uc-a11y-card-label">{label}</span>
      <div className="uc-a11y-stepper-row">
        <button
          type="button"
          className="uc-a11y-mini"
          onClick={() => onChange(clamp(value - step))}
          disabled={value <= min}
          aria-label={`הקטנת ${label}`}
        >
          <Minus aria-hidden="true" />
        </button>
        <button
          type="button"
          className="uc-a11y-mini"
          onClick={() => onChange(defaultValue)}
          disabled={value === defaultValue}
          aria-label={`איפוס ${label}`}
        >
          <RotateCcw aria-hidden="true" />
        </button>
        <button
          type="button"
          className="uc-a11y-mini"
          onClick={() => onChange(clamp(value + step))}
          disabled={value >= max}
          aria-label={`הגדלת ${label}`}
        >
          <Plus aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}