import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Mail, Lock, Eye, EyeOff, Loader2, Sun, Moon, User, Phone, Calendar, ArrowRight, ShieldCheck, KeyRound } from "lucide-react";
import { useDarkMode } from "@/lib/useDarkMode";
import StudentConsentCheckbox from "@/components/legal/StudentConsentCheckbox";
import { trackGaEvent } from "@/lib/gtagEvents";
import { passwordError } from "@/lib/passwordPolicy";

import { FUNCTIONS_BASE } from "@/lib/functionsBase";

const API_BASE = FUNCTIONS_BASE;

// The server invalidates a verification code 10 minutes after it was issued.
const OTP_VALID_SECONDS = 10 * 60;

function formatCountdown(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// הגיל המינימלי להרשמת תלמיד
const MIN_STUDENT_AGE = 14;

// גיל בשנים מתאריך לידה (yyyy-mm-dd) — null אם התאריך חסר או לא תקין
function ageFromBirthDate(value) {
  if (!value) return null;
  const birth = new Date(value);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age;
}

export default function RegisterStudent() {
  const [dark, setDark] = useDarkMode();
  const [step, setStep] = useState("form");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(0);
  const [notice, setNotice] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);
  const [dobError, setDobError] = useState("");
  const navigate = useNavigate();

  // Restore form data if returning from terms page or Google auth redirect
  useEffect(() => {
    const googleEmail = sessionStorage.getItem("googleAuthEmail");
    if (googleEmail) {
      setEmail(googleEmail);
      sessionStorage.removeItem("googleAuthEmail");
    }
    const googleMsg = sessionStorage.getItem("googleAuthMessage");
    if (googleMsg) {
      setError(googleMsg);
      sessionStorage.removeItem("googleAuthMessage");
    }
    const saved = sessionStorage.getItem("registerStudentDraft");
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.email) setEmail(d.email);
        if (d.firstName) setFirstName(d.firstName);
        if (d.lastName) setLastName(d.lastName);
        if (d.phoneNumber) setPhoneNumber(d.phoneNumber);
        if (d.password) setPassword(d.password);
        if (d.confirmPassword) setConfirmPassword(d.confirmPassword);
        sessionStorage.removeItem("registerStudentDraft");
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Count down the code's validity while the student is on the verification step.
  useEffect(() => {
    if (step !== "otp" || otpSecondsLeft === 0) return;
    const timer = setInterval(() => setOtpSecondsLeft((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [step, otpSecondsLeft]);

  // Code expired: return to the registration form with everything they typed, so a
  // new code can be requested from there.
  useEffect(() => {
    if (step !== "otp" || otpSecondsLeft > 0) return;
    setStep("form");
    setOtpCode("");
    setResendCooldown(0);
    setNotice("פג תוקף קוד האימות. הפרטים שהזנתם נשמרו — לחצו שוב על ״שלח קוד אימות״ לקבלת קוד חדש לנייד.");
  }, [step, otpSecondsLeft]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");

    if (password !== confirmPassword) {
      setError("הסיסמאות אינן תואמות");
      return;
    }
    const pwProblem = passwordError(password);
    if (pwProblem) {
      setError(pwProblem);
      return;
    }
    if (!/^\d{9,10}$/.test(phoneNumber.replace(/[\s-]/g, ""))) {
      setError("מספר הטלפון אינו תקין");
      return;
    }
    const age = ageFromBirthDate(dateOfBirth);
    if (age !== null && age < MIN_STUDENT_AGE) {
      setDobError("לא ניתן להירשם מתחת לגיל 14");
      setError("לא ניתן להירשם מתחת לגיל 14");
      return;
    }
    if (!termsAccepted) {
      setShowTermsError(true);
      setError("יש לאשר את התנאים כדי להירשם");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        action: "sendOtp",
        email,
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth,
        password,
        consents: { acceptedTerms: termsAccepted },
      };
      const response = await fetch(`${API_BASE}/studentRegisterProxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.error || data.success === false) {
        setError(data.message || "שליחת קוד האימות נכשלה. אנא נסו שוב.");
        return;
      }

      setSessionId(data.sessionId);
      setStep("otp");
      setResendCooldown(60);
      setOtpSecondsLeft(OTP_VALID_SECONDS);
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
      const payload = {
        action: "verifyAndRegister",
        sessionId,
        otpCode,
        email,
        dateOfBirth,
        consents: { acceptedTerms: termsAccepted },
      };
      const response = await fetch(`${API_BASE}/studentRegisterProxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.error || data.success === false || data._status >= 400) {
        setError(data.message || "האימות נכשל. אנא נסו שוב.");
        return;
      }

      trackGaEvent("sign_up", { method: "email", user_type: "student" });
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
      const response = await fetch(`${API_BASE}/studentRegisterProxy`, {
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
      setOtpSecondsLeft(OTP_VALID_SECONDS);
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
        aria-label={dark ? "מעבר למצב בהיר" : "מעבר למצב כהה"}
        aria-pressed={dark ? "true" : "false"}
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
            {step === "form" ? "רישום תלמיד" : "אימות קוד"}
          </h1>
          <p className="text-muted-foreground font-body">
            {step === "form" ? "צרו חשבון תלמיד חדש" : `קוד אימות נשלח ל-${phoneNumber}`}
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-xl border border-border p-6 sm:p-8 space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-xl p-3 text-center font-body">
              {error}
            </div>
          )}

          {notice && (
            <div className="bg-primary/10 text-primary text-sm rounded-xl p-3 text-center font-body">
              {notice}
            </div>
          )}

          {/* =================== STEP 1: REGISTRATION FORM =================== */}
          {step === "form" && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="student-register-email" className="text-sm font-heading font-medium text-foreground">מייל</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="student-register-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="הכניסו את האימייל שלכם"
                    required
                    aria-required="true"
                    autoComplete="email"
                    inputMode="email"
                    className="w-full pr-10 pl-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base font-body min-h-[48px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label htmlFor="student-register-first-name" className="text-sm font-heading font-medium text-foreground">שם פרטי</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      id="student-register-first-name"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="שם פרטי"
                      required
                      aria-required="true"
                      autoComplete="given-name"
                      className="w-full pr-10 pl-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base font-body min-h-[48px]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="student-register-last-name" className="text-sm font-heading font-medium text-foreground">שם משפחה</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      id="student-register-last-name"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="שם משפחה"
                      required
                      aria-required="true"
                      autoComplete="family-name"
                      className="w-full pr-10 pl-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base font-body min-h-[48px]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="student-register-phone" className="text-sm font-heading font-medium text-foreground">מספר טלפון</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="student-register-phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="050-1234567"
                    required
                    aria-required="true"
                    autoComplete="tel"
                    inputMode="tel"
                    className="w-full pr-10 pl-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base font-body min-h-[48px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="student-date-of-birth" className="text-sm font-heading font-medium text-foreground">תאריך לידה</label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                  <input
                    id="student-date-of-birth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => {
                      setDateOfBirth(e.target.value);
                      setDobError("");
                    }}
                    max={new Date().toISOString().slice(0, 10)}
                    required
                    aria-required="true"
                    autoComplete="bday"
                    aria-invalid={dobError ? true : undefined}
                    aria-describedby={dobError ? "student-date-of-birth-error" : undefined}
                    className="w-full pr-10 pl-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base font-body min-h-[48px]"
                  />
                </div>
                {dobError && (
                  <p id="student-date-of-birth-error" role="alert" className="text-sm text-destructive font-body">
                    {dobError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="student-register-password" className="text-sm font-heading font-medium text-foreground">סיסמה</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="student-register-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="לפחות 8 תווים, כולל אות וספרה"
                    required
                    aria-required="true"
                    autoComplete="new-password"
                    className="w-full pr-10 pl-12 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base font-body min-h-[48px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "הסתרת הסיסמה" : "הצגת הסיסמה"}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="student-register-confirm-password" className="text-sm font-heading font-medium text-foreground">אימות סיסמה</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="student-register-confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="הזינו שוב את הסיסמה"
                    required
                    aria-required="true"
                    autoComplete="new-password"
                    className="w-full pr-10 pl-12 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base font-body min-h-[48px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "הסתרת הסיסמה" : "הצגת הסיסמה"}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <StudentConsentCheckbox
                id="student-signup-consent"
                checked={termsAccepted}
                onChange={(value) => {
                  setTermsAccepted(value);
                  setShowTermsError(false);
                }}
                variant="signup"
                note="אישור נוסף של ההורה יידרש בעמוד התשלום."
                showError={showTermsError}
              />

              <button
                type="submit"
                disabled={loading}
                aria-disabled={!termsAccepted || undefined}
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
            </form>
          )}

          {/* =================== STEP 2: OTP VERIFICATION =================== */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="text-center space-y-1">
                <p className="text-sm text-muted-foreground font-body">
                  הזינו את קוד האימות בן 6 הספרות שנשלח לנייד
                </p>
                <p className="text-xs text-muted-foreground font-body">
                  תוקף הקוד: {formatCountdown(otpSecondsLeft)}
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="student-register-otp" className="text-sm font-heading font-medium text-foreground">קוד אימות</label>
                <div className="relative">
                  <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="student-register-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    aria-required="true"
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
                    אימות והשלמת רישום
                  </>
                )}
              </button>

              <div className="text-center text-sm font-body">
                <button
                  type="button"
                  onClick={() => { setStep("form"); setError(""); setOtpCode(""); }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← חזרה לפרטים
                </button>
              </div>
            </form>
          )}

          {step === "form" && (
            <div className="space-y-3 text-center text-sm font-body">
              <Link to="/student-login" className="block text-muted-foreground hover:text-primary transition-colors">
                יש לכם חשבון? <span className="text-primary font-medium">התחברו כאן</span>
              </Link>
            </div>
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