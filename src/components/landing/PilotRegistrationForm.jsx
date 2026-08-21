import React, { useState } from "react";
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

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateEmail(form.email)) {
    setEmailError("נא להזין כתובת אימייל חוקית");
    return;
  }
  if (!validatePhone(form.phone)) {
    setPhoneError("נא להזין מספר טלפון חוקי");
    return;
  }
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
      <div className="bg-card rounded-2xl p-8 border border-border shadow-sm text-center max-w-xl mx-auto">
        <div className="w-16 h-16 mx-auto bg-green-500/10 rounded-2xl flex items-center justify-center mb-4">
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
        <FormField label="שם מלא" icon={User} value={form.fullName} onChange={update("fullName")} placeholder="הכניסו את שמכם המלא" required />
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="space-y-1">
            <FormField label="אימייל" icon={Mail} type="email" value={form.email} onChange={handleEmailChange} placeholder="you@example.com" required />
            {emailError && <p className="text-xs text-destructive font-body">{emailError}</p>}
          </div>
          <div className="space-y-1">
            <FormField label="טלפון" icon={Phone} value={form.phone} onChange={handlePhoneChange} placeholder="050-1234567" required />
            {phoneError && <p className="text-xs text-destructive font-body">{phoneError}</p>}
          </div>
        </div>
        <FormField label="מוסד לימודי" icon={Building2} value={form.institution} onChange={update("institution")} placeholder="לדוגמה: האוניברסיטה העברית, הפתוחה" required />
        <FormField label="תואר / תחום הוראה" icon={BookMarked} value={form.subjects} onChange={update("subjects")} placeholder="לדוגמה: מדעי המחשב, מתמטיקה, הנדסה" required />
        <div className="space-y-2">
          <label className="text-sm font-heading font-semibold text-foreground block">הערות</label>
          <textarea
            value={form.notes}
            onChange={update("notes")}
            rows={3}
            placeholder="הערות נוספות (אופציונלי)"
            className="w-full rounded-lg border border-primary/15 bg-primary/5 px-3 py-2.5 text-sm shadow-sm outline-none focus:bg-card focus:border-primary focus:ring-2 focus:ring-primary/40 focus:shadow-md focus:shadow-primary/10 transition-all resize-y"
          />
        </div>
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-sm text-destructive font-body text-center">{error}</div>
        )}
        <button type="submit" disabled={loading} className="stripe-gradient-button w-full py-3.5 text-primary-foreground rounded-full text-base font-body font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed min-h-[52px] flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> שולח...</> : "שמרו לי מקום בפיילוט"}
        </button>
        <p className="text-xs text-muted-foreground text-center font-body">ההרשמה ללא עלות וללא התחייבות. ניצור איתכם קשר לפני ההשקה.</p>
      </form>
    </div>
  );
}