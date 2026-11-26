// רשימת הדפים הציבוריים הקבועים של האתר — מקור אמת אחד לפונקציית ה-sitemap
// ולסקריפט שמייצר את public/sitemap.xml בכל build.
// האזור האישי, דפי התחברות/הרשמה ודפי אדמין אינם נכללים.

export const SITE_URL = "https://www.uniclass.co.il";

// תאריך עדכון אחרון לדפים שאין להם תאריך עדכון במסד הנתונים.
export const LAST_REVIEWED = "2026-11-26";

export const STATIC_PAGES = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/blog", changefreq: "weekly", priority: "0.8" },
  { path: "/private-tutor-math", changefreq: "monthly", priority: "0.8" },
  { path: "/private-tutor-english", changefreq: "monthly", priority: "0.8" },
  { path: "/privacy-policy", changefreq: "monthly", priority: "0.5" },
  { path: "/terms", changefreq: "monthly", priority: "0.5" },
  { path: "/privacy", changefreq: "monthly", priority: "0.5" },
  { path: "/conduct", changefreq: "monthly", priority: "0.5" },
  { path: "/accessibility", changefreq: "monthly", priority: "0.5" },
  { path: "/recording-consent", changefreq: "monthly", priority: "0.5" },
  { path: "/teacher-terms", changefreq: "monthly", priority: "0.5" },
  { path: "/student-terms", changefreq: "monthly", priority: "0.5" },
  { path: "/student-privacy", changefreq: "monthly", priority: "0.5" },
  { path: "/student-recording", changefreq: "monthly", priority: "0.5" },
  { path: "/student-cancellation", changefreq: "monthly", priority: "0.5" },
  { path: "/student-conduct", changefreq: "monthly", priority: "0.5" },
];