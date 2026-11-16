import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Home, Menu, X, LogOut, GraduationCap, Calendar, Video, User, Sun, Moon, ClipboardList, MessageCircle, Shield, Mail } from "lucide-react";
import { useDarkMode } from "@/lib/useDarkMode";
import { useSessionRenewal } from "@/lib/useSessionRenewal";
import { clearFetchGuard } from "@/lib/fetchGuard";
import AppBackground from "@/components/AppBackground";
import TeacherOnboarding from "@/components/teacher/onboarding/TeacherOnboarding";
import { ONBOARDING_TOUR_STEP_EVENT } from "@/lib/teacherOnboarding";
import { base44 } from "@/api/base44Client";
import ConsentGate from "@/components/teacher/ConsentGate";

const teacherMenuItems = [
  { label: "דף הבית", path: "/teacher-home", icon: Home, tour: "home" },
  { label: "ניהול שיעורים", path: "/teacher-schedule", icon: Calendar, tour: "schedule" },
  { label: "כניסה לכיתה", path: "/teacher-video", icon: Video, tour: "video" },
  { label: "רשימת תלמידים", path: "/teacher-students", icon: GraduationCap, tour: "students" },
  { label: "סיכום שיעור", path: "/lesson-summary", icon: ClipboardList, tour: "summary" },
  { label: "פרופיל מורה", path: "/teacher-profile", icon: User, tour: "profile" },
  { label: "צ'אט", path: "/teacher-chat", icon: MessageCircle, tour: "chat" },
  { label: "צור קשר", path: "/teacher-contact", icon: Mail, tour: "contact" },
];

const ADMIN_EMAIL = "idanmichaly@gmail.com";

export default function TeacherLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useDarkMode();
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const hideNav = location.pathname === "/teacher-picture";
  useSessionRenewal();

  const teacherEmail = (() => {
    try {
      const stored = JSON.parse(localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}");
      return String(stored.teacherEmail || stored.email || "").toLowerCase();
    } catch {
      return "";
    }
  })();
  const [consentRequired, setConsentRequired] = useState(false);

  // מורה שאישר גרסת מסמכים ישנה נחסם עד לאישור מחדש.
  useEffect(() => {
    if (!teacherEmail) return undefined;
    let alive = true;
    base44.functions
      .invoke("legalConsentProxy", { action: "status", email: teacherEmail, audience: "teacher" })
      .then((res) => {
        if (alive && res.data?.needsConsent) setConsentRequired(true);
      })
      .catch((err) => console.error("[consent] status check failed:", err));
    return () => {
      alive = false;
    };
  }, [teacherEmail]);

  useEffect(() => {
    // If no localStorage auth but sessionStorage has it (login without "remember me"),
    // copy to localStorage so the rest of the app works for this browser session.
    if (!localStorage.getItem("authToken") && sessionStorage.getItem("authToken")) {
      localStorage.setItem("authToken", sessionStorage.getItem("authToken"));
      localStorage.setItem("userData", sessionStorage.getItem("userData") || "{}");
    }
    // Check if logged-in teacher is the admin
    try {
      const userDataStr = localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}";
      const userData = JSON.parse(userDataStr);
      const email = (userData.teacherEmail || userData.email || "").toLowerCase();
      setIsAdmin(email === ADMIN_EMAIL);
    } catch {}
  }, []);

  // The onboarding tour opens the collapsed menu so its current item can be highlighted
  useEffect(() => {
    const onTourStep = (event) => {
      if (event.detail?.openMenu) setMenuOpen(true);
    };
    window.addEventListener(ONBOARDING_TOUR_STEP_EVENT, onTourStep);
    return () => window.removeEventListener(ONBOARDING_TOUR_STEP_EVENT, onTourStep);
  }, []);

  const visibleMenuItems = isAdmin
    ? [...teacherMenuItems, { label: "ממשק ניהול", path: "/admin-interface", icon: Shield }]
    : teacherMenuItems;

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userData");
    sessionStorage.removeItem("sessionCredentials");
    sessionStorage.removeItem("googleAuthCallbackDone");
    sessionStorage.removeItem("googleAuthLoading");
    sessionStorage.removeItem("googleAuthMessage");
    sessionStorage.removeItem("googleAuthEmail");
    clearFetchGuard();
    // Local logout only — do NOT call base44.auth.logout(): it redirects to the
    // Base44 app domain (learn-le-connect.base44.app) and the user can't get back.
    // Clear all local session data and navigate to the login page on the current domain.
    navigate("/login-choice", { replace: true });
  };

  const navItemClass = (isActive) =>
    `flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
      isActive
        ? "bg-muted text-foreground"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
    }`;

  if (consentRequired) {
    return <ConsentGate email={teacherEmail} onAccepted={() => setConsentRequired(false)} />;
  }

  return (
    <div dir="rtl" className="min-h-screen">
      <AppBackground />
      {/* Navbar */}
      {!hideNav && (
        <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/teacher-home" className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-semibold tracking-tight text-foreground hidden sm:inline">פאנל מורים</span>
            </Link>

            {/* Desktop menu */}
            <div className="hidden lg:flex items-center gap-0.5">
              {visibleMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.path} to={item.path} data-tour={item.tour} className={navItemClass(isActive)}>
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </Link>
                );
              })}

              <div className="w-px h-5 bg-border mx-2" />
              <button
                onClick={() => setDark(!dark)}
                aria-label={dark ? "מעבר למצב בהיר" : "מעבר למצב כהה"}
                aria-pressed={dark ? "true" : "false"}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title={dark ? "מצב בהיר" : "מצב כהה"}
              >
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                התנתקות
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "סגירת תפריט הניווט" : "פתיחת תפריט הניווט"}
              aria-expanded={menuOpen}
              className="lg:hidden p-2 rounded-md text-foreground hover:bg-muted transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="lg:hidden border-t border-border bg-background">
              <div className="px-3 py-3 space-y-0.5">
                {visibleMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      data-tour={item.tour}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[48px] ${
                        isActive
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}

                <div className="h-px bg-border my-1.5" />
                <button
                  onClick={() => { setDark(!dark); setMenuOpen(false); }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors w-full min-h-[48px]"
                >
                  {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {dark ? "מצב בהיר" : "מצב כהה"}
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors w-full min-h-[48px]"
                >
                  <LogOut className="w-4 h-4" />
                  התנתקות
                </button>
              </div>
            </div>
          )}
        </nav>
      )}

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-10 app-fade-up">
        <Outlet />
      </main>

      <TeacherOnboarding />
    </div>
  );
}