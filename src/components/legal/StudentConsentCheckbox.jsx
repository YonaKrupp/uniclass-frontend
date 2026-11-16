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

export const STUDENT_CONSENT_ERROR = "יש לאשר את התנאים כדי להמשיך";

/**
 * תיבת אישור אחת לתלמידים ולהורים — בהרשמה ובעמוד התשלום.
 * variant: "signup" (הרשמה) · "payment" (תשלום, עם נוסח נפרד לקטין)
 * isMinor: קובע את נוסח הסכמת ההורה בעמוד התשלום.
 */
export default function StudentConsentCheckbox({
  id = "student-consent",
  checked,
  onChange,
  variant = "signup",
  isMinor = false,
  note,
  showError = false,
}) {
  let label;
  if (variant === "payment") {
    label = isMinor ? (
      <>
        אני ההורה או האפוטרופוס של התלמיד, קראתי ואני מסכים, בשמי ובשם התלמיד, ל
        <DocLink to="/student-terms">תנאי השימוש וההתקשרות</DocLink> (גרסה 2.0), ל
        <DocLink to="/student-privacy">מדיניות הפרטיות</DocLink>, ל
        <DocLink to="/student-cancellation">מדיניות הביטולים וההחזרים</DocLink>, ל
        <DocLink to="/student-recording">ההסכמה להקלטה ולסיכומי AI</DocLink> ול
        <DocLink to="/student-conduct">כללי ההתנהגות</DocLink>. אני מבין שההקלטה
        אופציונלית ואינה מופעלת כברירת מחדל.
      </>
    ) : (
      <>
        אני מצהיר שאני בן 18 ומעלה, וקראתי ואני מסכים ל
        <DocLink to="/student-terms">תנאי השימוש וההתקשרות</DocLink>, ל
        <DocLink to="/student-privacy">מדיניות הפרטיות</DocLink>, ל
        <DocLink to="/student-cancellation">מדיניות הביטולים וההחזרים</DocLink>, ל
        <DocLink to="/student-recording">הסכמה להקלטה ולסיכומי AI</DocLink> ול
        <DocLink to="/student-conduct">כללי ההתנהגות</DocLink>.
      </>
    );
  } else {
    label = (
      <>
        קראתי והסכמתי ל<DocLink to="/student-terms">תנאי השימוש וההתקשרות</DocLink> ול
        <DocLink to="/student-privacy">מדיניות הפרטיות</DocLink>.
      </>
    );
  }

  const errorId = `${id}-error`;
  const missing = showError && !checked;

  return (
    <div className="bg-muted/60 border border-border rounded-xl p-4 space-y-2">
      <label htmlFor={id} className="flex items-start gap-3 cursor-pointer select-none rounded-lg">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={missing || undefined}
          aria-describedby={missing ? errorId : undefined}
          className="mt-0.5 w-5 h-5 rounded border-border text-primary accent-primary cursor-pointer shrink-0 min-w-[20px]"
        />
        <span className="text-sm font-body text-foreground leading-relaxed">{label}</span>
      </label>

      {note && <p className="text-xs text-muted-foreground font-body leading-relaxed pr-8">{note}</p>}

      {missing && (
        <p id={errorId} role="alert" className="text-xs text-destructive font-body pr-8">
          {STUDENT_CONSENT_ERROR}
        </p>
      )}
    </div>
  );
}