import React from "react";
import { Link } from "react-router-dom";

export default function LandingFooter() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  const links = [
    { label: "אודות", action: () => scrollTo("about") },
    { label: "תכונות", action: () => scrollTo("features") },
    { label: "הצטרפות", action: () => scrollTo("register") },
    { label: "כניסת מורים", to: "/teacher-login", disabled: true },
    { label: "כניסת תלמידים", to: "/student-login", disabled: true },
  ];

  return (
    <footer className="relative bg-background border-t border-border py-12 overflow-hidden">
      {/* subtle top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(262 67% 35% / 0.35), transparent)" }} />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <img
            src="https://media.base44.com/images/public/6a37f1517bf59551c5f4b6f9/c40751db9_Logo_UNICLASS_purple_PNG.png"
            alt="UniClass"
            className="h-7 w-auto"
          />
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-body font-light">
            {links.map((link) =>
              link.to ? (
                <Link key={link.label} to={link.to} aria-disabled={link.disabled} className={`transition-colors ${link.disabled ? "text-muted-foreground/50 pointer-events-none cursor-not-allowed" : "text-muted-foreground hover:text-primary"}`}>
                  {link.label}
                </Link>
              ) : link.action ? (
                <button key={link.label} onClick={link.action} className="text-muted-foreground hover:text-primary transition-colors">
                  {link.label}
                </button>
              ) : (
                <span key={link.label} className="text-muted-foreground/40">
                  {link.label}
                </span>
              )
            )}
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-border/60 text-center text-sm text-muted-foreground font-body font-light">
          © {new Date().getFullYear()} UniClass. כל הזכויות שמורות.
        </div>
      </div>
    </footer>
  );
}