import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, Clock } from "lucide-react";

// עדכנו כאן את פרטי הקשר האמיתיים של שירות הלקוחות.
const CONTACT = {
  email: "idan@uniclass.co.il",
  phone: "055-6657560",
  hours: "א׳–ה׳ · 09:00–18:00",
};

export default function LandingFooter() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const columns = [
    {
      title: "ניווט",
      links: [
        { label: "אודות", action: () => scrollTo("about") },
        { label: "תכונות", action: () => scrollTo("features") },
        { label: "איך זה עובד", action: () => scrollTo("how-it-works") },
        { label: "שאלות נפוצות", action: () => scrollTo("faq") },
        { label: "הצטרפות כמורים", action: () => scrollTo("register") },
      ],
    },
    {
      title: "מידע ותקנון",
      links: [
        { label: "מדיניות פרטיות", to: "/privacy" },
        { label: "תנאי שימוש", to: "/terms" },
        { label: "הצהרת נגישות", to: "/accessibility" },
        { label: "בלוג", to: "/blog" },
        { label: "הסרה מרשימת תפוצה", to: "/unsubscribe" },
      ],
    },
  ];

  return (
    <footer className="order-8 relative bg-background border-t border-border pt-8 pb-24 md:pt-14 md:pb-8 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(262 67% 35% / 0.35), transparent)" }} />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand + contact */}
          <div className="lg:col-span-4">
            <img
              src="https://media.base44.com/images/public/6a37f1517bf59551c5f4b6f9/c40751db9_Logo_UNICLASS_purple_PNG.png"
              alt="UniClass"
              loading="lazy"
              className="h-7 md:h-8 w-auto mb-3 md:mb-4"
            />
            <p className="hidden md:block text-sm text-muted-foreground font-body font-light leading-relaxed max-w-xs">
              הפלטפורמה לשיעורים פרטיים: חיבור בין מורים לתלמידים, עם ניהול יומן, כיתה וירטואלית ותשלום מאובטח.
            </p>
            <div className="mt-2 md:mt-5 space-y-2">
              <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 text-sm text-muted-foreground font-body hover:text-primary transition-colors" dir="ltr">
                <Mail className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{CONTACT.email}</span>
              </a>
              <a href={`tel:${CONTACT.phone.replace(/[-\s]/g, "")}`} className="hidden md:flex items-center gap-2 text-sm text-muted-foreground font-body hover:text-primary transition-colors" dir="ltr">
                <Phone className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{CONTACT.phone}</span>
              </a>
              <p className="hidden md:flex items-center gap-2 text-sm text-muted-foreground font-body" dir="rtl">
                <Clock className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>שעות מענה: {CONTACT.hours}</span>
              </p>
            </div>
          </div>

          {/* Link columns */}
          <div className="hidden md:grid lg:col-span-8 grid-cols-2 sm:grid-cols-3 gap-8">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-heading font-semibold text-foreground mb-4">{col.title}</h3>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      {link.to ? (
                        <Link
                          to={link.to}
                          aria-disabled={link.disabled}
                          tabIndex={link.disabled ? -1 : undefined}
                          className={`text-sm font-body transition-colors ${link.disabled ? "text-muted-foreground/50 pointer-events-none cursor-not-allowed" : "text-muted-foreground hover:text-primary"}`}
                        >
                          {link.label}
                          {link.note && <span className="text-[10px] text-muted-foreground/70"> · {link.note}</span>}
                        </Link>
                      ) : (
                        <button onClick={link.action} className="text-sm font-body text-muted-foreground hover:text-primary transition-colors text-right">
                          {link.label}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="md:hidden flex flex-wrap items-center gap-x-4 gap-y-2 mt-4">
          <Link to="/privacy" className="text-xs font-body text-muted-foreground hover:text-primary transition-colors">מדיניות פרטיות</Link>
          <Link to="/terms" className="text-xs font-body text-muted-foreground hover:text-primary transition-colors">תנאי שימוש</Link>
          <Link to="/accessibility" className="text-xs font-body text-muted-foreground hover:text-primary transition-colors">נגישות</Link>
          <Link to="/blog" className="text-xs font-body text-muted-foreground hover:text-primary transition-colors">בלוג</Link>
          <Link to="/unsubscribe" className="text-xs font-body text-muted-foreground hover:text-primary transition-colors">הסרה מרשימת תפוצה</Link>
        </div>

        <div className="mt-6 md:mt-10 pt-5 md:pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/accessibility" className="text-xs md:text-sm text-muted-foreground font-body underline underline-offset-2 hover:text-primary transition-colors">
            האתר הונגש לאנשים עם מוגבלות · להצהרת הנגישות
          </Link>
          <p className="text-xs md:text-sm text-muted-foreground font-body font-light">
            © {new Date().getFullYear()} UniClass. כל הזכויות שמורות.
          </p>
        </div>
      </div>
    </footer>
  );
}