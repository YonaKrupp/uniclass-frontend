import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const LOGO = "https://media.base44.com/images/public/6a37f1517bf59551c5f4b6f9/c40751db9_Logo_UNICLASS_purple_PNG.png";

export default function BlogShell({ children, width = "max-w-[820px]" }) {
  return (
    <div dir="rtl" className="landing min-h-screen bg-background">
      <a href="#main-content" className="skip-link">דלג לתוכן הראשי</a>
      <div id="main-content" className={`${width} mx-auto px-4 sm:px-6 py-12 sm:py-16`}>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-body font-medium text-primary hover:underline mb-6"
        >
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
          חזרה לדף הראשי
        </Link>
        <img src={LOGO} alt="UniClass" className="h-8 mb-8" />
        {children}
      </div>
    </div>
  );
}