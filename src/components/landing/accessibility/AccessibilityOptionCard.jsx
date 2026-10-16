import React from "react";
import { Check } from "lucide-react";

export default function AccessibilityOptionCard({ icon: Icon, label, active, onClick }) {
  return (
    <button type="button" className="uc-a11y-card" aria-pressed={active} onClick={onClick}>
      <Icon aria-hidden="true" />
      <span className="uc-a11y-card-label">{label}</span>
      <span className="uc-a11y-check" aria-hidden="true">
        <Check />
      </span>
    </button>
  );
}