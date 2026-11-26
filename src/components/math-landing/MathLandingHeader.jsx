import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { LOGO_URL } from "@/components/welcome/welcomeConfig";

const NAV = [
  { label: "איך זה עובד", href: "#how-it-works" },
  { label: "למי זה מתאים", href: "#audience" },
  { label: "למה UniClass", href: "#why" },
  { label: "שאלות נפוצות", href: "#faq" },
];

/** כותרת עליונה לדף הנחיתה — לוגו, ניווט עוגנים וקריאה להרשמה. */
export default function MathLandingHeader() {
  const [scrolled, setScrolled] = useState(false);

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
        <Link to="/" aria-label="UniClass — לדף הבית" className="shrink-0">
          <img src={LOGO_URL} alt="UniClass" className="h-7 w-auto md:h-8" />
        </Link>

        <nav aria-label="ניווט בדף" className="hidden items-center gap-1 md:flex">
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

        <div className="flex items-center gap-2">
          <Link
            to="/student-login"
            className="hidden rounded-full px-3 py-2 text-sm font-body font-semibold text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            כניסה
          </Link>
          <Link
            to="/register-student"
            className="wl-btn wl-btn-student px-4 py-2.5 text-xs md:px-5 md:py-3 md:text-sm"
          >
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
            הרשמה כתלמיד/ה
          </Link>
        </div>
      </div>
    </header>
  );
}