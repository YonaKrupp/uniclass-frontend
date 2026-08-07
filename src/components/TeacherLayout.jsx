import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Home, Menu, X, LogOut, GraduationCap, Calendar, Video, User, Sun, Moon, ClipboardList, MessageCircle, Shield, Mail } from "lucide-react";
import { useDarkMode } from "@/lib/useDarkMode";
import { useSessionRenewal } from "@/lib/useSessionRenewal";
import { clearFetchGuard } from "@/lib/fetchGuard";

const teacherMenuItems = [
  { label: "דף הבית", path: "/teacher-home", icon: Home },
  { label: "ניהול שיעורים", path: "/teacher-schedule", icon: Calendar },
  { label: "כניסה לכיתה", path: "/teacher-video", icon: Video },
  { label: "רשימת תלמידים", path: "/teacher-students", icon: GraduationCap },
  { label: "סיכום שיעור", path: "/lesson-summary", icon: ClipboardList },
  { label: "פרופיל מורה", path: "/teacher-profile", icon: User },
  { label: "צ'אט", path: "/teacher-chat", icon: MessageCircle },
  { label: "צור קשר", path: "/teacher-contact", icon: Mail },
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

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      {/* Navbar */}
      {!hideNav && (
        <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border shadow-sm">
          <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/teacher-home" className="flex items-center gap-2">
              <span className="font-heading font-bold text-foreground text-lg hidden sm:inline">פאנל מורים</span>
            </Link>

            {/* Desktop menu */}
            <div className="hidden lg:flex items-center gap-1">
              {visibleMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-heading font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}

              <button
                onClick={() => setDark(!dark)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                title={dark ? "מצב בהיר" : "מצב כהה"}
              >
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-heading font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors mr-2"
              >
                <LogOut className="w-4 h-4" />
                התנתקות
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-lg text-foreground hover:bg-muted transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="lg:hidden border-t border-border bg-card">
              <div className="px-4 py-3 space-y-1">
                {visibleMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-heading font-medium transition-colors min-h-[48px] ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </Link>
                  );
                })}

                <button
                  onClick={() => { setDark(!dark); setMenuOpen(false); }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-heading font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors w-full min-h-[48px]"
                >
                  {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  {dark ? "מצב בהיר" : "מצב כהה"}
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-heading font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full min-h-[48px]"
                >
                  <LogOut className="w-5 h-5" />
                  התנתקות
                </button>
              </div>
            </div>
          )}
        </nav>
      )}

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}