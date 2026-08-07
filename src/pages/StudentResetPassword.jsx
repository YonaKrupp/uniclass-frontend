import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Mail, Lock, Eye, EyeOff, Loader2, Sun, Moon, ShieldCheck, KeyRound, ArrowRight } from "lucide-react";
import { useDarkMode } from "@/lib/useDarkMode";

const API_BASE = "https://learn-le-connect.base44.app/api/apps/6a37f1517bf59551c5f4b6f9/functions";

export default function StudentResetPassword() {
  const [dark, setDark] = useDarkMode();
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("הסיסמאות אינן תואמות");
      return;
    }
    if (password.length < 6) {
      setError("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/studentResetPasswordProxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sendOtp", email }),
      });
      const data = await response.json();

      if (data.error || data.success === false) {
        setError(data.message || "שליחת קוד האימות נכשלה. אנא נסו שוב.");
        return;
      }

      setSessionId(data.sessionId);
      setStep("otp");
      setResendCooldown(60);
      setOtpCode("");
    } catch (err) {
      setError("שגיאה: " + (err.message || "בדקו את החיבור לאינטרנט ונסו שוב."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (otpCode.length !== 6) {
      setError("נא להזין קוד אימות בן 6 ספרות");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/studentResetPasswordProxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verifyAndReset", sessionId, otpCode, newPassword: password }),
      });
      const data = await response.json();

      if (data.error || data.success === false || data._status >= 400) {
        setError(data.message || "האימות נכשל. אנא נסו שוב.");
        return;
      }

      navigate("/student-login");
    } catch (err) {
      setError("שגיאה: " + (err.message || "בדקו את החיבור לאינטרנט ונסו שוב."));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/studentResetPasswordProxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resendOtp", sessionId }),
      });
      const data = await response.json();

      if (data.error || data.success === false) {
        setError(data.message || "שליחת קוד חדש נכשלה");
        return;
      }

      setResendCooldown(60);
      setOtpCode("");
    } catch (err) {
      setError("שגיאה: " + (err.message || "נסו שוב."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background flex flex-col items-center justify-center px-4 overflow-x-hidden">
      <button
        onClick={() => setDark(!dark)}
        className="fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-sm"
        title={dark ? "מצב בהיר" : "מצב כהה"}
      >
        {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="text-center mb-8 space-y-3">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
            {step === "form" ? (
              <GraduationCap className="w-8 h-8 text-primary" />
            ) : (
              <ShieldCheck className="w-8 h-8 text-primary" />
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
            {step === "form" ? "שחזור סיסמה" : "אימות קוד"}
          </h1>
          <p className="text-muted-foreground font-body">
            {step === "form" ? "הזינו את פרטיכם לאיפוס הסיסמה" : `קוד אימות נשלח ל-${email}`}
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-xl border border-border p-6 sm:p-8 space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-xl p-3 text-center font-body">
              {error}
            </div>
          )}

          {/* STEP 1: FORM */}
          {step === "form" && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-heading font-medium text-foreground">מייל</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="הכניסו את האימייל שלכם"
                    required
                    className="w-full pr-10 pl-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base font-body min-h-[48px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-heading font-medium text-foreground">סיסמה חדשה</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="לפחות 6 תווים"
                    required
                    className="w-full pr-10 pl-12 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base font-body min-h-[48px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-heading font-medium text-foreground">אימות סיסמה</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="הזינו שוב את הסיסמה"
                    required
                    className="w-full pr-10 pl-12 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base font-body min-h-[48px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl text-base font-heading font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed min-h-[52px] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    שולח קוד...
                  </>
                ) : (
                  <>
                    שלח קוד אימות
                    <ArrowRight className="w-5 h-5 rotate-180" />
                  </>
                )}
              </button>

              <div className="text-center text-sm font-body">
                <Link to="/student-login" className="text-muted-foreground hover:text-primary transition-colors">
                  חזרה לדף ההתחברות
                </Link>
              </div>
            </form>
          )}

          {/* STEP 2: OTP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center space-y-1">
                <p className="text-sm text-muted-foreground font-body">
                  הזינו את קוד האימות בן 6 הספרות שנשלח ב-SMS
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-heading font-medium text-foreground">קוד אימות</label>
                <div className="relative">
                  <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    required
                    autoFocus
                    className="w-full pr-10 pl-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-2xl font-mono tracking-[0.5em] text-center min-h-[48px]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl text-base font-heading font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed min-h-[52px] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    מאמת...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    אימות ואיפוס סיסמה
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-sm font-body">
                <button
                  type="button"
                  onClick={() => { setStep("form"); setError(""); setOtpCode(""); }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← חזרה לפרטים
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  className="text-primary hover:underline disabled:text-muted-foreground disabled:no-underline transition-colors"
                >
                  {resendCooldown > 0 ? `שלח שוב (${resendCooldown}s)` : "שלח קוד מחדש"}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors font-body">
            ← חזרה לדף הראשי
          </Link>
        </div>
      </div>
    </div>
  );
}