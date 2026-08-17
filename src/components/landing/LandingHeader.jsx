import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sun, Moon, Menu, X, LogIn } from "lucide-react";
import { useDarkMode } from "@/lib/useDarkMode";

export default function LandingHeader() {
  const [dark, setDark] = useDarkMode();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: "אודות", target: "about" },
    { label: "תכונות", target: "features" },
    { label: "איך זה עובד", target: "how-it-works" },
    { label: "הצטרפות", target: "register" },
  ];

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-card/70 backdrop-blur-xl border-b border-border/60">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <img src="https://media.base44.com/images/public/6a37f1517bf59551c5f4b6f9/0cf1a42dc_Logo_UNICLASS_2_PNG.png" alt="UniClass" className="h-8 sm:h-10 w-auto" />
        <nav className="hidden md:flex items-center gap-1 bg-background/60 backdrop-blur-md border border-border/60 rounded-full px-2 py-1">
          {navLinks.map((link) => (
            <button key={link.target} onClick={() => scrollTo(link.target)} className="px-4 py-1.5 rounded-full text-sm font-heading font-medium text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
              {link.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={() => setDark(!dark)} className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title={dark ? "מצב בהיר" : "מצב כהה"}>
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <Link to="/login-choice" className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-heading font-medium text-muted-foreground hover:text-primary transition-colors">
            <LogIn className="w-4 h-4" /> כניסה
          </Link>
          <button onClick={() => scrollTo("register")} className="hidden sm:block px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-heading font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 transition-all">
            הצטרפו לפיילוט
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-full text-foreground hover:bg-muted transition-colors">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-xl px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <button key={link.target} onClick={() => scrollTo(link.target)} className="block w-full text-right px-4 py-2.5 text-sm font-heading font-medium text-muted-foreground hover:text-primary hover:bg-muted rounded-xl transition-colors">
              {link.label}
            </button>
          ))}
          <span className="block px-4 py-2.5 text-sm font-heading font-medium text-muted-foreground/40">כניסה למורים</span>
          <span className="block px-4 py-2.5 text-sm font-heading font-medium text-muted-foreground/40">כניסה לתלמידים</span>
        </div>
      )}
    </header>
  );
}