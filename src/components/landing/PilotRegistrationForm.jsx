import React, { useState, useEffect } from "react";
import { Loader2, CheckCircle2, User, Mail, Phone, BookMarked, Building2 } from "lucide-react";
import FormField from "./FormField";

const API_BASE = "https://learn-le-connect.base44.app/api/apps/6a37f1517bf59551c5f4b6f9/functions";

export default function PilotRegistrationForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", institution: "", subjects: "", notes: "" });
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [confirmNoMarketing, setConfirmNoMarketing] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("uniclass_cookie_consent") === "accepted") setConsentAccepted(true);
    } catch {
      /* ignore */
    }
    const handler = (e) => setConsentAccepted(e.detail === "accepted");
    window.addEventListener("uniclass-consent-change", handler);
    return () => window.removeEventListener("uniclass-consent-change", handler);
  }, []);

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validatePhone = (value) => /^05\d{8}$/.test(value.replace(/[-\s]/g, ""));

  const handleEmailChange = (e) => {
  const value = e.target.value;
  setForm({ ...form, email: value });
  setEmailError(value && !validateEmail(value) ? "נא להזין כתובת אימייל חוקית" : "");
  };

  const handlePhoneChange = (e) => {
  const value = e.target.value;
  setForm({ ...form, phone: value });
  setPhoneError(value && !validatePhone(value) ? "נא להזין מספר חוקי המתחיל ב-05 ובעל 10 ספרות" : "");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!consentAccepted) return;
    if (!consentPrivacy) {
      setError("יש לאשר את מדיניות הפרטיות ואת תנאי השימוש כדי להמשיך");
      return;
    }
    if (!validateEmail(form.email)) {
      setEmailError("נא להזין כתובת אימייל חוקית");
      return;
    }
    if (!validatePhone(form.phone)) {
      setPhoneError("נא להזין מספר טלפון חוקי");
      return;
    }
    setError("");
    if (!consentMarketing) {
      setConfirmNoMarketing(true);
      return;
    }
    doSubmit();
  };

  const doSubmit = async () => {
    setConfirmNoMarketing(false);
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_BASE}/pilotInsertProxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          educationalInstitution: form.institution,
          academicDegree: form.subjects,
          gn32_Notes: form.notes,
        }),
      });
      const res = await response.json();
      if (res?.error || res?._status >= 400) {
        setError(res?.error || "שגיאה בשליחת הטופס. נסו שוב.");
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error("Pilot registration error:", err);
      setError("שגיאה בשליחת הטופס. נסו שוב.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-card rounded-2xl p-8 border border-border shadow-sm text-center max-w-xl mx-auto" role="status" aria-live="polite">
        <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-2xl flex items-center justify-center mb-4" aria-hidden="true">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-2xl font-heading font-bold text-foreground mb-2">נרשמתם בהצלחה!</h3>
        <p className="text-muted-foreground font-body">תודה! שמרנו את המקום שלכם בפיילוט. ניצור איתכם קשר בהקדם עם פרטי ההצטרפות.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 sm:p-8 border border-border shadow-sm space-y-5">
        <FormField label="שם מלא" icon={User} value={form.fullName} onChange={update("fullName")} placeholder="הכניסו את שמכם המלא" required autoComplete="name" />
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="space-y-1">
            <FormField label="אימייל" icon={Mail} type="email" value={form.email} onChange={handleEmailChange} placeholder="you@example.com" required autoComplete="email" describedBy={emailError ? "email-error" : undefined} />
            {emailError && <p id="email-error" role="alert" className="text-xs text-destructive font-body">{emailError}</p>}
          </div>
          <div className="space-y-1">
            <FormField label="טלפון" icon={Phone} value={form.phone} onChange={handlePhoneChange} placeholder="050-1234567" required autoComplete="tel" describedBy={phoneError ? "phone-error" : undefined} />
            {phoneError && <p id="phone-error" role="alert" className="text-xs text-destructive font-body">{phoneError}</p>}
          </div>
        </div>
        <FormField label="מוסד לימודי / מקום עבודה" icon={Building2} value={form.institution} onChange={update("institution")} placeholder="לדוגמה: אוניברסיטה, מכללה או הוראה פרטית" required autoComplete="organization" />
        <FormField label="תואר / תחום הוראה" icon={BookMarked} value={form.subjects} onChange={update("subjects")} placeholder="לדוגמה: מדעי המחשב, מתמטיקה, הנדסה" required />
        <div className="space-y-2">
          <label htmlFor="pilot-notes" className="text-sm font-heading font-semibold text-foreground block">הערות</label>
          <textarea
            id="pilot-notes"
            value={form.notes}
            onChange={update("notes")}
            rows={3}
            placeholder="הערות נוספות (אופציונלי)"
            className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm shadow-sm outline-none focus:bg-card focus:border-primary focus:ring-2 focus:ring-primary/30 focus:shadow-sm focus:shadow-primary/10 transition-all resize-y"
          />
          <p className="text-xs text-muted-foreground font-body">אנא אל תכתוב/י מידע רגיש (כגון מידע רפואי או כלכלי).</p>
        </div>
        {error && (
          <div role="alert" className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-sm text-destructive font-body text-center">{error}</div>
        )}
        <fieldset className="space-y-3 pt-1">
          <legend className="sr-only">הסכמות</legend>
          <div className="flex items-start gap-3">
            <input
              id="consent-privacy"
              type="checkbox"
              checked={consentPrivacy}
              onChange={(e) => setConsentPrivacy(e.target.checked)}
              aria-required="true"
              className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary/30 focus:outline-none shrink-0"
            />
            <label htmlFor="consent-privacy" className="text-sm font-body text-foreground leading-relaxed">
              קראתי ואני מסכים/ה ל<a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">מדיניות הפרטיות</a> ול<a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">תנאי השימוש</a>.
              <span aria-hidden="true" className="text-primary mr-1">*</span>
              <span className="sr-only"> (שדה חובה)</span>
            </label>
          </div>
          <div className="flex items-start gap-3">
            <input
              id="consent-marketing"
              type="checkbox"
              checked={consentMarketing}
              onChange={(e) => setConsentMarketing(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary/30 focus:outline-none shrink-0"
            />
            <label htmlFor="consent-marketing" className="text-sm font-body text-foreground leading-relaxed">
              אני מאשר/ת קבלת הודעות SMS ודוא"ל על השקת השירות, ומבין/ה שאפשר להסיר את ההסכמה בכל עת.
            </label>
          </div>
        </fieldset>
        {confirmNoMarketing && (
          <div role="alert" className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 space-y-3">
            <p className="text-sm text-destructive font-body text-center leading-relaxed">לא סימנתם את ההסכמה לקבלת עדכונים ב-SMS ובמייל על השקת האתר. האם אתם בטוחים שברצונכם להגיש את הטופס מבלי לקבל עדכונים?</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button type="button" onClick={doSubmit} disabled={loading} className="px-5 py-2.5 bg-destructive text-destructive-foreground rounded-full text-sm font-body font-semibold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-60 min-h-[44px] flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> שולח...</> : "כן, המשך ללא עדכונים"}
              </button>
              <button type="button" onClick={() => setConfirmNoMarketing(false)} className="px-5 py-2.5 border border-border rounded-full text-sm font-body font-semibold text-foreground hover:bg-muted/50 transition-colors min-h-[44px]">
                חזרה לטופס
              </button>
            </div>
          </div>
        )}
        <button type="submit" disabled={loading || !consentAccepted} className="w-full py-3.5 bg-primary text-primary-foreground rounded-full text-base font-body font-semibold shadow-sm hover:shadow-md hover:shadow-primary/20 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed min-h-[52px] flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> שולח...</> : "שמרו לי מקום בפיילוט"}
        </button>
        {!consentAccepted && (
          <p className="text-xs text-destructive text-center font-body">כדי לשלוח את הטופס יש לאשר תחילה את השימוש בעוגיות ובאחסון מקומי בבאנר למטה.</p>
        )}
        <p className="text-xs text-muted-foreground text-center font-body">ההרשמה ללא עלות וללא התחייבות. ניצור איתכם קשר לפני ההשקה.</p>
        <p className="text-xs text-muted-foreground text-center font-body leading-relaxed">הפרטים נאספים לצורך הרשמה לפיילוט ויצירת קשר, ולא נמסרים לגורם אחר ללא הסכמתך, למעט ספקי שירות טכניים. פרטים נוספים ב<a href="/privacy" className="text-primary underline underline-offset-2">מדיניות הפרטיות</a>.</p>
      </form>
    </div>
  );
}