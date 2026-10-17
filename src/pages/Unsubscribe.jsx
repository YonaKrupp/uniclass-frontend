import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const LOGO = "https://media.base44.com/images/public/6a37f1517bf59551c5f4b6f9/c40751db9_Logo_UNICLASS_purple_PNG.png";

const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default function Unsubscribe() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email.trim())) {
      setError("נא להזין כתובת אימייל חוקית");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await base44.functions.invoke("unsubscribeProxy", { email: email.trim() });
      const res = response?.data ?? response;
      if (res?.error) {
        setError("אירעה שגיאה בהסרה. נסו שוב.");
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error("Unsubscribe error:", err);
      setError("אירעה שגיאה בהסרה. נסו שוב.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="landing min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <a href="#main-content" className="skip-link">דלג לתוכן הראשי</a>
      <div id="main-content" className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-body font-medium text-primary hover:underline mb-6">
          <ArrowRight className="w-4 h-4" aria-hidden="true" /> חזרה לדף הראשי
        </Link>
        <div className="bg-card rounded-2xl border border-border shadow-sm p-8">
          <img src={LOGO} alt="UniClass" className="h-8 mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold text-foreground text-center mb-4">הסרה מרשימת התפוצה</h1>
          <div className="flex justify-center mb-4" aria-hidden="true">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Mail className="w-6 h-6 text-primary" />
            </div>
          </div>
          {success ? (
            <div role="status" aria-live="polite" className="text-center">
              <div className="flex justify-center mb-4" aria-hidden="true">
                <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
              </div>
              <p className="text-base font-heading font-semibold text-foreground">המייל הוסר מהרשימה בהצלחה</p>
              <p className="text-xs text-muted-foreground font-body mt-3 leading-relaxed">
                ההסרה תחול על דוא"ל ועל SMS כאחד.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground font-body text-center leading-relaxed">
                הזינו את כתובת האימייל שברצונכם להסיר מרשימת התפוצה.
              </p>
              <form onSubmit={handleSubmit} className="mt-5 space-y-3" noValidate>
                <div className="space-y-1">
                  <label htmlFor="unsubscribe-email" className="sr-only">כתובת אימייל</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-muted-foreground absolute top-1/2 -translate-y-1/2 right-3" aria-hidden="true" />
                    <input
                      id="unsubscribe-email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      dir="ltr"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (error) setError(""); }}
                      placeholder="you@example.com"
                      aria-invalid={!!error}
                      aria-describedby={error ? "unsubscribe-error" : undefined}
                      className="w-full rounded-lg border border-border bg-muted/30 py-2.5 pr-9 pl-3 text-sm text-left shadow-sm outline-none focus:bg-card focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all min-h-[48px]"
                    />
                  </div>
                  {error && <p id="unsubscribe-error" role="alert" className="text-xs text-destructive font-body">{error}</p>}
                </div>
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-full text-sm font-body font-semibold shadow-sm hover:shadow-md hover:shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed min-h-[48px] flex items-center justify-center gap-2"
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> מסיר...</> : "הסר מהרשימה"}
                </button>
              </form>
              <p className="text-xs text-muted-foreground font-body text-center mt-4 leading-relaxed">
                נטפל בבקשתך בהקדם. ההסרה תחול על דוא"ל ועל SMS כאחד.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}