import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, ShieldAlert } from "lucide-react";
import StudentConsentCheckbox, { STUDENT_CONSENT_ERROR } from "@/components/legal/StudentConsentCheckbox";
import { acceptLegalConsent } from "@/lib/legalConsent";

/**
 * מסך חוסם לתלמיד שאישר גרסת מסמכים ישנה — לא ניתן להמשיך לפני אישור הגרסה הנוכחית.
 */
export default function StudentConsentGate({ email, onAccepted }) {
  const [accepted, setAccepted] = useState(false);
  const [showError, setShowError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!accepted) {
      setShowError(true);
      return;
    }

    setBusy(true);
    try {
      const res = await acceptLegalConsent({
        email,
        consentType: "student_signup",
        roleOfApprover: "student",
        acceptedTerms: true,
      });
      if (res.success === false) {
        setError(res.message || "שמירת האישור נכשלה. אנא נסו שוב.");
        return;
      }
      onAccepted?.();
    } catch (err) {
      setError("שמירת האישור נכשלה: " + (err.message || "נסו שוב."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-xl p-6 sm:p-8 space-y-5">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-primary" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-heading font-bold text-foreground">עדכון תנאים</h1>
          <p className="text-sm font-body text-muted-foreground leading-relaxed">
            עדכנו את המסמכים המשפטיים. כדי להמשיך להשתמש באתר יש לאשר את הגרסה המעודכנת.
          </p>
        </div>

        {error && (
          <div role="alert" className="bg-destructive/10 text-destructive text-sm rounded-xl p-3 text-center font-body">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <StudentConsentCheckbox
            id="student-gate-consent"
            checked={accepted}
            onChange={(value) => {
              setAccepted(value);
              setShowError(false);
            }}
            variant="signup"
            showError={showError}
          />

          <p className="text-xs text-muted-foreground font-body">
            אפשר לקרוא את המסמכים גם ב<Link to="/student-terms" className="text-primary underline">תנאי השימוש</Link> וב
            <Link to="/student-privacy" className="text-primary underline">מדיניות הפרטיות</Link>.
          </p>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl text-base font-heading font-semibold transition-colors hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed min-h-[52px] flex items-center justify-center gap-2"
            aria-describedby={showError && !accepted ? "student-gate-consent-error" : undefined}
          >
            {busy ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                שומר...
              </>
            ) : (
              "אישור והמשך"
            )}
          </button>
          {showError && !accepted && (
            <p role="alert" className="text-xs text-destructive font-body text-center">
              {STUDENT_CONSENT_ERROR}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}