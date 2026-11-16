import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, Mail, Lock, Eye, EyeOff, Loader2, Sun, Moon, User, Phone, ArrowRight, ShieldCheck, KeyRound, CreditCard } from "lucide-react";
import { useDarkMode } from "@/lib/useDarkMode";
import { isValidIsraeliId } from "@/lib/israeliId";
import TeacherBenefits from "@/components/register-teacher/TeacherBenefits";
import TeacherHowItWorks from "@/components/register-teacher/TeacherHowItWorks";
import TeacherFaq from "@/components/register-teacher/TeacherFaq";
import TeacherStickyCta from "@/components/register-teacher/TeacherStickyCta";
import TeacherThanks from "@/components/register-teacher/TeacherThanks";
import ConsentCheckboxes, { CONSENT_ERROR } from "@/components/legal/ConsentCheckboxes";
import { DOCUMENT_SET_VERSION } from "@/content/legalDocs";

import { FUNCTIONS_BASE } from "@/lib/functionsBase";
import { trackGaEvent } from "@/lib/gtagEvents";

const API_BASE = FUNCTIONS_BASE;

export default function RegisterTeacher() {
  const [dark, setDark] = useDarkMode();
  const [step, setStep] = useState("form");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [consents, setConsents] = useState({ terms: false, adult: false });
  const [consentError, setConsentError] = useState("");
  const [showConsentErrors, setShowConsentErrors] = useState(false);
  const navigate = useNavigate();

  const allConsentsAccepted = consents.terms && consents.adult;

  const consentPayload = {
    termsPrivacyConduct: consents.terms,
    adult: consents.adult,
    version: DOCUMENT_SET_VERSION,
  };

  const handleConsentChange = (key, checked) => {
    setConsents((prev) => ({ ...prev, [key]: checked }));
    setShowConsentErrors(false);
    setConsentError("");
  };

  const scrollToForm = () => {
    document.getElementById("register-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
    const saved = sessionStorage.getItem("registerTeacherDraft");
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.email) setEmail(d.email);
        if (d.firstName) setFirstName(d.firstName);
        if (d.lastName) setLastName(d.lastName);
        if (d.phoneNumber) setPhoneNumber(d.phoneNumber);
        if (d.password) setPassword(d.password);
        if (d.confirmPassword) setConfirmPassword(d.confirmPassword);
        sessionStorage.removeItem("registerTeacherDraft");
      } catch {}
    }
  }, []);

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
    if (!isValidIsraeliId(idNumber)) {
      setError("מספר תעודת הזהות אינו תקין");
      return;
    }
    if (!/^\d{9,10}$/.test(phoneNumber.replace(/[\s-]/g, ""))) {
      setError("מספר הטלפון אינו תקין");
      return;
    }
    if (!allConsentsAccepted) {
      setConsentError(CONSENT_ERROR);
      setShowConsentErrors(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/teacherRegisterProxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sendOtp", email, firstName, lastName, idNumber, phoneNumber, password, consents: consentPayload }),
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
      const response = await fetch(`${API_BASE}/teacherRegisterProxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verifyAndRegister", sessionId, otpCode, email, idNumber, consents: consentPayload }),
      });
      const data = await response.json();

      if (data.error || data.success === false || data._status >= 400) {
        setError(data.message || "האימות נכשל. אנא נסו שוב.");
        return;
      }

      // Log in the new teacher (same flow as teacher login) before entering profile
      const loginRes = await fetch(`${API_BASE}/authProxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userType: "teacher", email, password }),
      });
      const loginData = await loginRes.json();
      const token = loginData.accessToken || loginData.AccessToken || loginData.token || "";
      if (!token) {
        setError("הרישום הצליח אך ההתחברות נכשלה. אנא התחברו ידנית.");
        navigate("/teacher-login");
        return;
      }
      localStorage.setItem("userRole", "teacher");
      localStorage.setItem("authToken", token);
      localStorage.setItem("userData", JSON.stringify(loginData));
      sessionStorage.setItem("authToken", token);
      sessionStorage.setItem("userData", JSON.stringify(loginData));

      trackGaEvent("sign_up", { method: "email", user_type: "teacher" });

      if (window.matchMedia("(max-width: 767.98px)").matches) {
        setStep("thanks");
      } else {
        navigate("/teacher-profile");
      }
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
      const response = await fetch(`${API_BASE}/teacherRegisterProxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resendOtp", sessionId }),
      });
      const data = await response.json();

      if (data.error || data.success === false) {
        setError(data.message || "שליחת קוד חדש נכשל");
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

  const errorTarget = !error
    ? null
    : error.includes("סיסמאות")
    ? "confirmPassword"
    : error.includes("סיסמה")
    ? "password"
    : error.includes("תעודת הזהות")
    ? "idNumber"
    : error.includes("טלפון")
    ? "phone"
    : "top";

  if (step === "thanks") {
    return <TeacherThanks onContinue={() => navigate("/teacher-profile")} />;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background flex flex-col items-center justify-center px-4 pb-24 md:pb-0 overflow-x-hidden">
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
        <div className="text-center mb-5 md:mb-8 space-y-3">
          <div className="w-12 h-12 md:w-16 md:h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center">
            {step === "form" ? (
              <Briefcase className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            ) : (
              <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            )}
          </div>
          <h1 className="text-xl md:text-3xl font-heading font-bold text-foreground">
            {step === "form" ? (
              <>
                <span className="hidden md:inline">רישום מורה</span>
                <span className="md:hidden">אפס עלות עד שמרוויחים משיעורים פרטיים</span>
              </>
            ) : (
              "אימות קוד"
            )}
          </h1>
          <p className="text-muted-foreground font-body">
            {step === "form" ? (
              <>
                <span className="hidden md:inline">צרו חשבון מורה חדש</span>
                <span className="md:hidden">פתחו פרופיל מורה בחינם בדקה אחת</span>
              </>
            ) : (
              `קוד אימות נשלח ל-${email}`
            )}
          </p>
          {step === "form" && (
            <button
              type="button"
              onClick={scrollToForm}
              className="md:hidden w-full min-h-[52px] rounded-xl bg-primary text-primary-foreground text-base font-heading font-semibold shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform mt-2"
            >
              הרשמה
            </button>
          )}
        </div>

        <div id="register-form" className="bg-card rounded-2xl shadow-xl border border-border p-6 sm:p-8 space-y-6 scroll-mt-4">
          {error && (
            <div
              className={`bg-destructive/10 text-destructive text-sm rounded-xl p-3 text-center font-body ${
                errorTarget === "top" ? "" : "hidden md:block"
              }`}
            >
              {error}
            </div>
          )}

          {/* =================== STEP 1: REGISTRATION FORM =================== */}
          {step === "form" && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="teacher-register-email" className="text-sm font-heading font-medium text-foreground">מייל</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="teacher-register-email"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label htmlFor="teacher-register-first-name" className="text-sm font-heading font-medium text-foreground">שם פרטי</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      id="teacher-register-first-name"
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
                  <label htmlFor="teacher-register-last-name" className="text-sm font-heading font-medium text-foreground">שם משפחה</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      id="teacher-register-last-name"
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
                <label htmlFor="teacher-id-number" className="text-sm font-heading font-medium text-foreground">
                  מספר תעודת זהות
                </label>
                <div className="relative">
                  <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                  <input
                    id="teacher-id-number"
                    type="text"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, "").slice(0, 9))}
                    placeholder="9 ספרות"
                    required
                    inputMode="numeric"
                    pattern="[0-9]{9}"
                    maxLength={9}
                    autoComplete="off"
                    aria-required="true"
                    aria-invalid={errorTarget === "idNumber" || undefined}
                    aria-describedby={errorTarget === "idNumber" ? "teacher-id-number-error" : undefined}
                    className="w-full pr-10 pl-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base font-body min-h-[48px]"
                  />
                </div>
                {errorTarget === "idNumber" && (
                  <p id="teacher-id-number-error" className="md:hidden text-xs text-destructive font-body">{error}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="teacher-phone" className="text-sm font-heading font-medium text-foreground">מספר טלפון</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="teacher-phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="050-1234567"
                    required
                    aria-required="true"
                    inputMode="tel"
                    autoComplete="tel"
                    aria-invalid={errorTarget === "phone" || undefined}
                    aria-describedby={errorTarget === "phone" ? "teacher-phone-error" : undefined}
                    className="w-full pr-10 pl-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-base font-body min-h-[48px]"
                  />
                </div>
                {errorTarget === "phone" && (
                  <p id="teacher-phone-error" className="md:hidden text-xs text-destructive font-body">{error}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="teacher-password" className="text-sm font-heading font-medium text-foreground">סיסמה</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="teacher-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="לפחות 6 תווים"
                    autoComplete="new-password"
                    required
                    aria-required="true"
                    aria-invalid={errorTarget === "password" || undefined}
                    aria-describedby={errorTarget === "password" ? "teacher-password-error" : undefined}
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
                {errorTarget === "password" && (
                  <p id="teacher-password-error" className="md:hidden text-xs text-destructive font-body">{error}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="teacher-confirm-password" className="text-sm font-heading font-medium text-foreground">אימות סיסמה</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="teacher-confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="הזינו שוב את הסיסמה"
                    autoComplete="new-password"
                    required
                    aria-required="true"
                    aria-invalid={errorTarget === "confirmPassword" || undefined}
                    aria-describedby={errorTarget === "confirmPassword" ? "teacher-confirm-password-error" : undefined}
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
                {errorTarget === "confirmPassword" && (
                  <p id="teacher-confirm-password-error" className="md:hidden text-xs text-destructive font-body">{error}</p>
                )}
              </div>

              {/* Legal consent */}
              <ConsentCheckboxes
                value={consents}
                onChange={handleConsentChange}
                showErrors={showConsentErrors}
              />
              {consentError && !showConsentErrors && (
                <p role="alert" className="text-xs text-destructive font-body">{consentError}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                aria-disabled={!allConsentsAccepted || undefined}
                className={`w-full py-3.5 bg-primary text-primary-foreground rounded-xl text-base font-heading font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed min-h-[52px] flex items-center justify-center gap-2 ${
                  !allConsentsAccepted ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    שולח קוד...
                  </>
                ) : (
                  <>
                    <span className="hidden md:inline">שלח קוד אימות</span>
                    <span className="md:hidden">הצטרף כמורה</span>
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
                  הזינו את קוד האימות בן 6 הספרות שנשלח לאימייל
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="teacher-register-otp" className="text-sm font-heading font-medium text-foreground">קוד אימות</label>
                <div className="relative">
                  <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    id="teacher-register-otp"
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

          {step === "form" && (
            <div className="space-y-3 text-center text-sm font-body">
              <Link to="/teacher-login" className="block text-muted-foreground hover:text-primary transition-colors">
                יש לכם חשבון? <span className="text-primary font-medium">התחברו כאן</span>
              </Link>
            </div>
          )}
        </div>

        {step === "form" && (
          <div className="md:hidden mt-10 space-y-8">
            <TeacherBenefits />
            <TeacherHowItWorks />
            <TeacherFaq />
            <button
              type="button"
              onClick={scrollToForm}
              className="w-full min-h-[52px] rounded-xl bg-primary text-primary-foreground text-base font-heading font-semibold shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform"
            >
              הרשמה
            </button>
          </div>
        )}

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors font-body">
            ← חזרה לדף הראשי
          </Link>
        </div>
      </div>
      {step === "form" && <TeacherStickyCta targetId="register-form" />}
    </div>
  );
}