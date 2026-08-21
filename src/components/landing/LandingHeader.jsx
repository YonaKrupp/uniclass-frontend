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
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <img src="https://media.base44.com/images/public/6a37f1517bf59551c5f4b6f9/0cf1a42dc_Logo_UNICLASS_2_PNG.png" alt="UniClass" className="h-7 sm:h-8 w-auto" />
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <button key={link.target} onClick={() => scrollTo(link.target)} className="px-4 py-2 rounded-full text-sm font-body font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
              {link.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => setDark(!dark)} className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title={dark ? "מצב בהיר" : "מצב כהה"}>
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <Link to="/login-choice" className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm font-body font-medium text-muted-foreground hover:text-foreground transition-colors">
            <LogIn className="w-4 h-4" /> כניסה
          </Link>
          <button onClick={() => scrollTo("register")} className="hidden sm:inline-flex items-center px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-body font-semibold shadow-sm hover:shadow-md hover:shadow-primary/20 hover:-translate-y-0.5 transition-all">
            הצטרפו לפיילוט
          </button>
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-full text-foreground hover:bg-muted transition-colors">
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <button key={link.target} onClick={() => scrollTo(link.target)} className="block w-full text-right px-4 py-2.5 text-sm font-body font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors">
              {link.label}
            </button>
          ))}
          <Link to="/login-choice" className="block px-4 py-2.5 text-sm font-body font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors">
            כניסה
          </Link>
        </div>
      )}
    </header>
  );
}