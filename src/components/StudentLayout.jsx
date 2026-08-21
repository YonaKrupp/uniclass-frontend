import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Home, Menu, X, LogOut, GraduationCap, Video, Sun, Moon, Calendar, ClipboardList, MessageCircle, Mail } from "lucide-react";
import { useDarkMode } from "@/lib/useDarkMode";
import { useSessionRenewal } from "@/lib/useSessionRenewal";
import { clearFetchGuard } from "@/lib/fetchGuard";
import AppBackground from "@/components/AppBackground";

const studentMenuItems = [
  { label: "דף הבית", path: "/student-home", icon: Home },
  { label: "בחרו שיעור", path: "/choose-lesson", icon: Home },
  { label: "רשימת מורים", path: "/student-teachers", icon: GraduationCap },
  { label: "כניסה לכיתה", path: "/student-video", icon: Video },
  { label: "סיכום שיעור", path: "/student-lesson-summary", icon: ClipboardList },
  { label: "צ'אט", path: "/student-chat", icon: MessageCircle },
  { label: "צור קשר", path: "/student-contact", icon: Mail },
];

export default function StudentLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useDarkMode();
  useSessionRenewal();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!localStorage.getItem("authToken") && sessionStorage.getItem("authToken")) {
      localStorage.setItem("authToken", sessionStorage.getItem("authToken"));
      localStorage.setItem("userData", sessionStorage.getItem("userData") || "{}");
    }
  }, []);

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

  return (
    <div dir="rtl" className="min-h-screen">
      <AppBackground />
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
          {/* Desktop menu */}
          <div className="hidden lg:flex items-center gap-0.5">
            {studentMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} className={navItemClass(isActive)}>
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}

            <div className="w-px h-5 bg-border mx-2" />
            <button
              onClick={() => setDark(!dark)}
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
            className="lg:hidden p-2 rounded-md text-foreground hover:bg-muted transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-border bg-background">
            <div className="px-3 py-3 space-y-0.5">
              {studentMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
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

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:py-10 app-fade-up">
        <Outlet />
      </main>
    </div>
  );
}