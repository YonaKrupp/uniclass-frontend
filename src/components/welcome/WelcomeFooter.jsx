import React from "react";
import { Link } from "react-router-dom";
import { Clock, Mail, Phone } from "lucide-react";
import { LOGO_URL } from "./welcomeConfig";

// פרטי הקשר האמיתיים של שירות הלקוחות.
const CONTACT = {
  email: "idan@uniclass.co.il",
  phone: "055-6657560",
  hours: "א׳–ה׳ · 09:00–18:00",
};

const ANCHORS = [
  { label: "למה UniClass", href: "#why" },
  { label: "איך זה עובד", href: "#how-it-works" },
  { label: "המורים שלנו", href: "#teachers" },
  { label: "שאלות נפוצות", href: "#faq" },
];

const LEGAL = [
  { label: "מדיניות פרטיות", to: "/privacy" },
  { label: "תנאי שימוש", to: "/terms" },
  { label: "קוד התנהגות", to: "/conduct" },
  { label: "הצהרת נגישות", to: "/accessibility" },
];

/** /welcome footer — only routes that already exist in the app. */
export default function WelcomeFooter() {
  return (
    <footer className="relative border-t border-[hsl(var(--wl-hair))] bg-card/40 pb-10 pt-12 md:pt-16">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, hsl(266 64% 40% / 0.35), transparent)" }}
      />

      <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <img src={LOGO_URL} alt="UniClass" loading="lazy" className="h-7 w-auto md:h-8" />
            <p className="mt-4 max-w-xs text-sm font-body font-light leading-relaxed text-muted-foreground">
              הפלטפורמה לשיעורים פרטיים: חיבור בין מורים לתלמידים, עם ניהול יומן, כיתה וירטואלית ותשלום מאובטח.
            </p>
            <div className="mt-5 space-y-2">
              <a
                href={`mailto:${CONTACT.email}`}
                dir="ltr"
                className="flex items-center gap-2 text-sm font-body text-muted-foreground transition-colors hover:text-primary"
              >
                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                {CONTACT.email}
              </a>
              <a
                href={`tel:${CONTACT.phone.replace(/[-\s]/g, "")}`}
                dir="ltr"
                className="flex items-center gap-2 text-sm font-body text-muted-foreground transition-colors hover:text-primary"
              >
                <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                {CONTACT.phone}
              </a>
              <p className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
                שעות מענה: {CONTACT.hours}
              </p>
            </div>
          </div>

          <nav aria-label="ניווט בפוטר">
            <h3 className="text-xs font-heading font-semibold uppercase tracking-wider text-foreground">בעמוד הזה</h3>
            <ul className="mt-4 space-y-2.5">
              {ANCHORS.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="text-sm font-body text-muted-foreground transition-colors hover:text-primary">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-xs font-heading font-semibold uppercase tracking-wider text-foreground">מתחילים</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link to="/register-student" className="text-sm font-body text-muted-foreground transition-colors hover:text-primary">
                  הרשמה כתלמיד/ה
                </Link>
              </li>
              <li>
                <Link to="/register-teacher" className="text-sm font-body text-muted-foreground transition-colors hover:text-primary">
                  הרשמה כמורה
                </Link>
              </li>
              <li>
                <Link to="/student-login" className="text-sm font-body text-muted-foreground transition-colors hover:text-primary">
                  כניסה כתלמיד/ה
                </Link>
              </li>
              <li>
                <Link to="/teacher-login" className="text-sm font-body text-muted-foreground transition-colors hover:text-primary">
                  כניסה כמורה
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm font-body text-muted-foreground transition-colors hover:text-primary">
                  בלוג
                </Link>
              </li>
              <li>
                <Link to="/private-tutor-math" className="text-sm font-body text-muted-foreground transition-colors hover:text-primary">
                  מורה פרטי למתמטיקה
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-heading font-semibold uppercase tracking-wider text-foreground">מידע ותקנון</h3>
            <ul className="mt-4 space-y-2.5">
              {LEGAL.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-sm font-body text-muted-foreground transition-colors hover:text-primary">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-[hsl(var(--wl-hair))] pt-6 sm:flex-row">
          <p className="text-xs font-body font-light text-muted-foreground md:text-sm">
            © {new Date().getFullYear()} UniClass. כל הזכויות שמורות.
          </p>
          <Link
            to="/accessibility"
            className="text-xs font-body text-muted-foreground underline underline-offset-2 transition-colors hover:text-primary md:text-sm"
          >
            הצהרת נגישות
          </Link>
        </div>
      </div>
    </footer>
  );
}