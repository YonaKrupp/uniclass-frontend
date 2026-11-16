import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Mail, Phone, Clock } from "lucide-react";

const CONTACT = {
  email: "idan@uniclass.co.il",
  phone: "055-6657560",
  hours: "א׳–ה׳ · 09:00–18:00",
};

const LOGO_URL =
  "https://media.base44.com/images/public/6a37f1517bf59551c5f4b6f9/c40751db9_Logo_UNICLASS_purple_PNG.png";

// עמודים שבהם המשתמש כבר בפנים — הניווט מותאם לאזור האישי שלו
const TEACHER_PAGES = [
  "/teacher-home",
  "/teacher-schedule",
  "/teacher-picture",
  "/teacher-video",
  "/teacher-profile",
  "/teacher-students",
  "/teacher-chat",
  "/teacher-contact",
  "/lesson-summary",
  "/admin-interface",
  "/admin/legal",
  "/admin/blog",
];

const STUDENT_PAGES = [
  "/student-home",
  "/student-video",
  "/student-test",
  "/student-teachers",
  "/student-schedule",
  "/student-lesson-summary",
  "/student-chat",
  "/student-contact",
  "/student-payment",
  "/payment-packages",
  "/choose-lesson",
  "/teacher-results",
  "/rate-teacher",
];

const NAV_LINKS = {
  teacher: [
    { label: "דף הבית", to: "/teacher-home" },
    { label: "היומן שלי", to: "/teacher-schedule" },
    { label: "התלמידים שלי", to: "/teacher-students" },
    { label: "הפרופיל שלי", to: "/teacher-profile" },
    { label: "צ׳אט", to: "/teacher-chat" },
  ],
  student: [
    { label: "דף הבית", to: "/student-home" },
    { label: "בחירת שיעור", to: "/choose-lesson" },
    { label: "רשימת מורים", to: "/student-teachers" },
    { label: "היומן שלי", to: "/student-schedule" },
    { label: "צ׳אט", to: "/student-chat" },
  ],
  public: [
    { label: "אודות", to: "/#about" },
    { label: "יכולות", to: "/#features" },
    { label: "איך זה עובד", to: "/#how-it-works" },
    { label: "שאלות נפוצות", to: "/#faq" },
    { label: "הצטרפות כמורים", to: "/register-teacher" },
  ],
};

const INFO_LINKS = {
  teacher: [
    { label: "מדיניות פרטיות", to: "/privacy" },
    { label: "תנאי שימוש", to: "/terms" },
    { label: "קוד התנהגות", to: "/conduct" },
    { label: "הסכמה להקלטה", to: "/recording-consent" },
    { label: "הצהרת נגישות", to: "/accessibility" },
    { label: "בלוג", to: "/blog" },
    { label: "הסרה מרשימת תפוצה", to: "/unsubscribe" },
  ],
  student: [
    { label: "מדיניות פרטיות", to: "/student-privacy" },
    { label: "תנאי שימוש", to: "/student-terms" },
    { label: "ביטולים והחזרים", to: "/student-cancellation" },
    { label: "הצהרת נגישות", to: "/accessibility" },
    { label: "הסרה מרשימת תפוצה", to: "/unsubscribe" },
  ],
  public: [
    { label: "בלוג", to: "/blog" },
    { label: "הצהרת נגישות", to: "/accessibility" },
    { label: "הסרה מרשימת תפוצה", to: "/unsubscribe" },
  ],
};

// הפוטר הציבורי מציג את מסמכי התקנון בשתי קבוצות — למורים ולתלמידים ולהורים.
const PUBLIC_INFO_GROUPS = [
  {
    title: "למורים",
    links: [
      { label: "תנאי שימוש", to: "/terms" },
      { label: "מדיניות פרטיות", to: "/privacy" },
      { label: "קוד התנהגות", to: "/conduct" },
      { label: "הסכמה להקלטה", to: "/recording-consent" },
    ],
  },
  {
    title: "לתלמידים ולהורים",
    links: [
      { label: "תנאי שימוש", to: "/student-terms" },
      { label: "מדיניות פרטיות", to: "/student-privacy" },
      { label: "ביטולים והחזרים", to: "/student-cancellation" },
      { label: "כללי התנהגות", to: "/student-conduct" },
      { label: "הסכמה להקלטה", to: "/student-recording" },
    ],
  },
];

function resolveArea(pathname) {
  if (TEACHER_PAGES.includes(pathname)) return "teacher";
  if (STUDENT_PAGES.includes(pathname)) return "student";
  return "public";
}

/**
 * הפוטר האחיד של האתר — תוכן הניווט והמסמכים מותאם לאזור שבו המשתמש נמצא.
 */
export default function SiteFooter() {
  const { pathname } = useLocation();

  // לעמודים האלה יש כבר פוטר משלהם
  if (pathname === "/" || pathname === "/welcome") return null;

  const area = resolveArea(pathname);
  const infoGroups =
    area === "public"
      ? PUBLIC_INFO_GROUPS
      : [{ title: null, links: INFO_LINKS[area] }];
  const columns = [
    { title: "ניווט", groups: [{ title: null, links: NAV_LINKS[area] }] },
    { title: "מידע ותקנון", groups: infoGroups },
  ];

  return (
    <footer dir="rtl" className="relative bg-background border-t border-border pt-10 pb-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          {/* מיתוג ופרטי קשר */}
          <div className="lg:col-span-4">
            <img src={LOGO_URL} alt="UniClass" loading="lazy" className="mb-4 h-8 w-auto" />
            <p className="max-w-xs text-sm font-body font-light leading-relaxed text-muted-foreground">
              הפלטפורמה לשיעורים פרטיים: חיבור בין מורים לתלמידים, עם ניהול יומן, כיתה וירטואלית ותשלום מאובטח.
            </p>
            <div className="mt-4 space-y-2">
              <a
                href={`mailto:${CONTACT.email}`}
                dir="ltr"
                className="flex items-center gap-2 text-sm font-body text-muted-foreground transition-colors hover:text-primary"
              >
                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{CONTACT.email}</span>
              </a>
              <a
                href={`tel:${CONTACT.phone.replace(/[-\s]/g, "")}`}
                dir="ltr"
                className="flex items-center gap-2 text-sm font-body text-muted-foreground transition-colors hover:text-primary"
              >
                <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{CONTACT.phone}</span>
              </a>
              <p className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>שעות מענה: {CONTACT.hours}</span>
              </p>
            </div>
          </div>

          {/* עמודות קישורים */}
          <div className="grid grid-cols-2 gap-8 lg:col-span-8">
            {columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h3 className="mb-4 text-sm font-heading font-semibold text-foreground">{col.title}</h3>
                <div className="space-y-5">
                  {col.groups.map((group, gi) => (
                    <div key={group.title || gi}>
                      {group.title && (
                        <h4 className="mb-2 text-xs font-heading font-semibold text-foreground/80">{group.title}</h4>
                      )}
                      <ul className="space-y-2.5">
                        {group.links.map((link) => (
                          <li key={link.label}>
                            <Link
                              to={link.to}
                              className="text-sm font-body text-muted-foreground transition-colors hover:text-primary"
                            >
                              {link.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-9 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-5 sm:flex-row md:mt-10 md:pt-6">
          <Link
            to="/accessibility"
            className="text-xs font-body text-muted-foreground underline underline-offset-2 transition-colors hover:text-primary md:text-sm"
          >
            הצהרת נגישות
          </Link>
          <p className="text-xs font-body font-light text-muted-foreground md:text-sm">
            © {new Date().getFullYear()} UniClass. כל הזכויות שמורות.
          </p>
        </div>
      </div>
    </footer>
  );
}