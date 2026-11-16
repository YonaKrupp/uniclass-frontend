import React, { useState } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ConsentCheckboxes, { CONSENT_ERROR } from "@/components/legal/ConsentCheckboxes";

/**
 * מסך חוסם למורה קיים שאישר גרסת מסמכים ישנה — לא ניתן להמשיך באתר
 * לפני אישור מחדש של הגרסה הנוכחית.
 */
export default function ConsentGate({ email, onAccepted }) {
  const [value, setValue] = useState({ terms: false, adult: false });
  const [showErrors, setShowErrors] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const allAccepted = value.terms && value.adult;

  const handleChange = (key, checked) => {
    setValue((prev) => ({ ...prev, [key]: checked }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!allAccepted) {
      setShowErrors(true);
      setError(CONSENT_ERROR);
      return;
    }

    setBusy(true);
    try {
      const res = await base44.functions.invoke("legalConsentProxy", {
        action: "accept",
        email,
        consentType: "teacher_signup",
        roleOfApprover: "teacher",
        acceptedTerms: value.terms,
        confirmed18Plus: value.adult,
      });
      if (res.data?.success === false) {
        setError(res.data?.message || "שמירת האישור נכשלה. אנא נסו שוב.");
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
            עדכנו את המסמכים המשפטיים (גרסה חדשה). כדי להמשיך להשתמש באתר יש לאשר את הגרסה החדשה.
          </p>
        </div>

        {error && (
          <div role="alert" className="bg-destructive/10 text-destructive text-sm rounded-xl p-3 text-center font-body">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <ConsentCheckboxes value={value} onChange={handleChange} showErrors={showErrors} />

          <button
            type="submit"
            disabled={busy || !allAccepted}
            className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl text-base font-heading font-semibold transition-colors hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed min-h-[52px] flex items-center justify-center gap-2"
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
        </form>
      </div>
    </div>
  );
}