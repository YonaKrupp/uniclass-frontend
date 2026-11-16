import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Sun, Moon, LogIn, UserPlus, GraduationCap, BookOpen, ArrowLeft } from "lucide-react";
import { useDarkMode } from "@/lib/useDarkMode";
import { LOGO_URL } from "./welcomeConfig";
import { trackEvent, withAttribution } from "./useWelcomeAnalytics";

const PICKERS = {
  login: {
    title: "כניסה לאזור האישי",
    options: [
      { label: "כניסה כתלמיד/ה", hint: "מציאת מורים וקביעת שיעורים", to: "/student-login", icon: GraduationCap, tone: "student" },
      { label: "כניסה כמורה", hint: "ניהול שיעורים, תלמידים והכנסות", to: "/teacher-login", icon: BookOpen, tone: "teacher" },
    ],
  },
  signup: {
    title: "איך להירשם?",
    options: [
      { label: "הרשמה כתלמיד/ה", hint: "חשבון תלמיד בחינם", to: "/register-student", icon: GraduationCap, tone: "student" },
      { label: "הרשמה כמורה", hint: "פרופיל מורה בחינם", to: "/register-teacher", icon: BookOpen, tone: "teacher" },
    ],
  },
};

const TONE_CLASS = {
  student: "bg-mint/10 text-mint",
  teacher: "bg-primary/10 text-primary",
};

const NAV = [
  { label: "למה UniClass", href: "#why" },
  { label: "איך זה עובד", href: "#how-it-works" },
  { label: "המורים", href: "#teachers" },
  { label: "שאלות נפוצות", href: "#faq" },
];

export default function WelcomeHeader() {
  const [dark, setDark] = useDarkMode();
  const [open, setOpen] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(null);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled
          ? "border-[hsl(var(--wl-hair))] bg-background/80 wl-header-shadow backdrop-blur-xl"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-5 sm:px-8 md:h-[76px]">
        <div className="flex items-center gap-7">
          <Link to="/" aria-label="UniClass — לדף הבית" className="shrink-0">
            <img src={LOGO_URL} alt="UniClass" className="h-7 w-auto md:h-8" />
          </Link>

          <nav aria-label="ניווט בדף" className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-2 text-sm font-body font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div ref={wrapRef} className="relative flex items-center gap-1.5 md:gap-2.5">
          <button
            onClick={() => setDark(!dark)}
            aria-label={dark ? "הפעלת מצב בהיר" : "הפעלת מצב כהה"}
            aria-pressed={dark ? "true" : "false"}
            className="rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            {dark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
          </button>

          <button
            onClick={() => setOpen(open === "login" ? null : "login")}
            aria-expanded={open === "login"}
            aria-haspopup="menu"
            aria-label="אזור אישי"
            className="welcome-role-ring inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[hsl(var(--wl-hair))] bg-card/60 p-2.5 text-xs font-body font-semibold text-foreground backdrop-blur transition-colors hover:bg-card sm:px-4 md:text-sm"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">אזור אישי</span>
          </button>

          <button
            onClick={() => setOpen(open === "signup" ? null : "signup")}
            aria-expanded={open === "signup"}
            aria-haspopup="menu"
            className="wl-btn wl-btn-teacher whitespace-nowrap px-4 py-2.5 text-xs md:px-5 md:py-3 md:text-sm"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            הרשמה
          </button>

          {open && (
            <div
              role="menu"
              aria-label={PICKERS[open].title}
              className="wl-glass wl-rise absolute left-0 top-full z-50 mt-3 w-72 rounded-2xl p-2.5"
            >
              <p className="px-3 pb-2 pt-1.5 text-[11px] font-heading font-semibold uppercase tracking-wide text-muted-foreground">
                {PICKERS[open].title}
              </p>
              {PICKERS[open].options.map((option) => (
                <Link
                  key={option.to}
                  to={withAttribution(option.to)}
                  role="menuitem"
                  onClick={() => {
                    setOpen(null);
                    trackEvent(
                      open === "login" ? "login_click" : option.tone === "student" ? "signup_student_click" : "signup_teacher_click",
                      { location: "header_menu" }
                    );
                  }}
                  className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-foreground/5"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${TONE_CLASS[option.tone]}`}>
                    <option.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-body font-semibold text-foreground">{option.label}</span>
                    <span className="block truncate text-xs font-body text-muted-foreground">{option.hint}</span>
                  </span>
                  <ArrowLeft
                    className="mr-auto h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}