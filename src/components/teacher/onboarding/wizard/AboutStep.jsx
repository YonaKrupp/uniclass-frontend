import React from "react";

export default function AboutStep({ value, onChange }) {
  return (
    <div className="space-y-3">
      <label htmlFor="onboarding-about" className="block text-sm font-heading font-semibold text-foreground">
        מה מספרים עליך?
      </label>
      <textarea
        id="onboarding-about"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        autoFocus
        placeholder="לדוגמה: סטודנט להנדסה בטכניון, מלמד מתמטיקה ופיזיקה כבר שלוש שנים."
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-body text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <p className="text-xs font-body text-muted-foreground">
        הטקסט הזה יופיע בפרופיל הציבורי שלך. {value.trim().length}/10 תווים מינימום.
      </p>
    </div>
  );
}