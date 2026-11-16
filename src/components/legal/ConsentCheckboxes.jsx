import React from "react";

const LINK_CLASS =
  "text-primary font-medium underline underline-offset-2 hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

function DocLink({ to, children }) {
  return (
    <a href={to} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
      {children}
    </a>
  );
}

const CONSENT_ERROR = "יש לאשר את התנאים כדי להירשם";

const ITEMS = [
  {
    key: "terms",
    label: (
      <>
        קראתי והסכמתי ל<DocLink to="/terms">תנאי השימוש</DocLink>, ל
        <DocLink to="/privacy">מדיניות הפרטיות</DocLink> ול
        <DocLink to="/conduct">קוד ההתנהגות והגנה על קטינים</DocLink>.
      </>
    ),
  },
  {
    key: "adult",
    label: <>אני מצהיר שאני בן/בת 18 ומעלה.</>,
  },
];

/**
 * תיבות הסימון של האישור המשפטי. אינן מסומנות מראש.
 * value: { terms, adult } · onChange(key, checked)
 * ההקלטה אינה נדרשת ברישום — היא אופציונלית ומופעלת בתוך השיעור.
 */
export default function ConsentCheckboxes({ value, onChange, showErrors = false }) {
  return (
    <fieldset className="bg-muted/60 border border-border rounded-xl p-4 space-y-3">
      <legend className="text-sm font-heading font-semibold text-foreground px-1">אישור משפטי</legend>

      {ITEMS.map((item) => {
        const checked = Boolean(value?.[item.key]);
        const errorId = `consent-error-${item.key}`;
        const missing = showErrors && !checked;
        return (
          <div key={item.key} className="space-y-1">
            <label
              htmlFor={`consent-${item.key}`}
              className="flex items-start gap-3 cursor-pointer select-none rounded-lg"
            >
              <input
                id={`consent-${item.key}`}
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(item.key, e.target.checked)}
                aria-invalid={missing || undefined}
                aria-describedby={missing ? errorId : undefined}
                className="mt-0.5 w-5 h-5 rounded border-border text-primary accent-primary cursor-pointer shrink-0 min-w-[20px]"
              />
              <span className="text-sm font-body text-foreground leading-relaxed">{item.label}</span>
            </label>
            {missing && (
              <p id={errorId} role="alert" className="text-xs text-destructive font-body pr-8">
                {CONSENT_ERROR}
              </p>
            )}
          </div>
        );
      })}
    </fieldset>
  );
}

export { CONSENT_ERROR };