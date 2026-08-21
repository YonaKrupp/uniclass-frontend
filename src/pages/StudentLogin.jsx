import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Mail, Lock, Eye, EyeOff, Loader2, Sun, Moon } from "lucide-react";
import { useDarkMode } from "@/lib/useDarkMode";
import { initiateGoogleLogin } from "@/lib/googleAuth";
import GoogleIcon from "@/components/GoogleIcon";
import GoogleAuthLoading from "@/components/GoogleAuthLoading";
import { useGoogleAuthCallback } from "@/hooks/useGoogleAuthCallback";
import MeshGradient from "@/components/landing/MeshGradient";

export default function StudentLogin() {
  const [dark, setDark] = useDarkMode();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [authLoading, setAuthLoading] = useState(() => {
    // Only show loading if we're actually returning from Google (code in URL)
    if (sessionStorage.getItem("googleAuthLoading") !== "true") return false;
    return !!new URLSearchParams(window.location.search).get("code");
  });
  const navigate = useNavigate();
  useGoogleAuthCallback("student", "/student-home", navigate, setAuthLoading);

  useEffect(() => {
    const googleMsg = sessionStorage.getItem("googleAuthMessage");
    if (googleMsg) {
      setError(googleMsg);
      sessionStorage.removeItem("googleAuthMessage");
    }
  }, []);

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    sessionStorage.setItem("googleAuthLoading", "true");
    await initiateGoogleLogin("/student-login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("https://learn-le-connect.base44.app/api/apps/6a37f1517bf59551c5f4b6f9/functions/authProxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userType: "student", email, password }),
      });
      const data = await response.json();
      const token = data.accessToken || data.AccessToken || data.token || "";
      if (data._status === 401) {
        setError("אימייל או סיסמה שגויים");
        return;
      }
      if (!token) {
        setError("האתר לא זמין כרגע, נסו מאוחר יותר");
        return;
      }
      localStorage.setItem("userRole", "student");
      localStorage.setItem("authToken", token);
      localStorage.setItem("userData", JSON.stringify(data));
      sessionStorage.setItem("authToken", token);
      sessionStorage.setItem("userData", JSON.stringify(data));
      console.log("[StudentLogin] Token saved:", token.substring(0, 20) + "...");
      navigate("/student-home");
    } catch (err) {
      setError("האתר לא זמין כרגע, נסו מאוחר יותר");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <GoogleAuthLoading />;

  return (
    <div dir="rtl" className="landing relative min-h-screen overflow-hidden bg-background flex flex-col items-center justify-center px-4">
      <button
        onClick={() => setDark(!dark)}
        className="fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-sm"
        title={dark ? "מצב בהיר" : "מצב כהה"}
      >
        {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
      <MeshGradient className="inset-0" />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent 80%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Header */}
        <div className="app-fade-up text-center mb-8 space-y-3">
          <div className="w-[76px] h-[76px] mx-auto bg-mint/10 rounded-3xl flex items-center justify-center">
            <GraduationCap className="w-9 h-9 text-mint" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold tracking-tight text-foreground">כניסה לתלמידים</h1>
          <p className="text-muted-foreground font-body font-light">התחברו לחשבון התלמיד שלכם</p>
        </div>

        {/* Form Card */}
        <div className="app-fade-up-d1 bg-card/90 backdrop-blur-xl rounded-3xl shadow-xl shadow-primary/5 border border-border p-6 sm:p-8 space-y-6">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading || googleLoading}
            className="w-full py-3.5 bg-card border border-border text-foreground rounded-xl text-base font-heading font-semibold hover:bg-muted hover:-translate-y-0.5 hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed min-h-[52px] flex items-center justify-center gap-2"
          >
            {googleLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                מתחבר...
              </>
            ) : (
              <>
                <GoogleIcon className="w-5 h-5" />
                המשך עם Google
              </>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">או</span>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-xl p-3 text-center font-body">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-heading font-medium text-foreground">אימייל</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="הכניסו את האימייל שלכם"
                  required
                  className="w-full pr-10 pl-4 py-3 rounded-xl border border-primary/15 bg-primary/5 text-foreground placeholder:text-muted-foreground focus:bg-card focus:border-primary focus:ring-2 focus:ring-primary/40 focus:shadow-md focus:shadow-primary/10 transition-all text-base font-body min-h-[48px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-heading font-medium text-foreground">סיסמה</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="הכניסו את הסיסמה שלכם"
                  required
                  className="w-full pr-10 pl-12 py-3 rounded-xl border border-primary/15 bg-primary/5 text-foreground placeholder:text-muted-foreground focus:bg-card focus:border-primary focus:ring-2 focus:ring-primary/40 focus:shadow-md focus:shadow-primary/10 transition-all text-base font-body min-h-[48px]"
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
              className="stripe-gradient-button w-full py-3.5 text-primary-foreground rounded-full text-base font-heading font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed min-h-[52px] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  מתחבר...
                </>
              ) : (
                "התחברות"
              )}
            </button>
          </form>

          {/* Links */}
          <div className="space-y-3 text-center text-sm font-body">
            <Link to="/student-reset-password" className="block text-primary hover:underline">
              שכחתם סיסמה? שחזור סיסמה
            </Link>
            <Link to="/register-student" className="block text-muted-foreground hover:text-primary transition-colors">
              אין לכם חשבון? <span className="text-primary font-medium">הרשמו כאן</span>
            </Link>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors font-body">
            ← חזרה לדף הראשי
          </Link>
        </div>
      </div>
    </div>
  );
}