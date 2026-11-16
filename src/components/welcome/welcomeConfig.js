/**
 * /welcome — editable configuration.
 * Everything a non-developer may want to paste or edit lives here.
 */

// ── Tracking IDs ─────────────────────────────────────────────────────────────
// Paste the real IDs between the quotes. An empty string = that tag is NOT loaded.
// Tags load only after the visitor accepts the cookie banner (Consent Mode v2).
export const TRACKING = {
  META_PIXEL_ID: "", // Meta (Facebook / Instagram) Pixel — e.g. "1234567890123456"
  TIKTOK_PIXEL_ID: "", // TikTok Pixel — e.g. "CXXXXXXXXXXXXXX"
  GA4_ID: "", // Google Analytics 4 — e.g. "G-XXXXXXXXXX"
};

export const ATTRIBUTION_KEY = "uniclass_welcome_attribution";
export const CONSENT_KEY = "uniclass_cookie_consent";

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "ttclid",
  "fbclid",
];

// ── Subjects row ─────────────────────────────────────────────────────────────
// Marketing labels. The real subject catalog (with ids) is served per student
// from the university feed on /choose-lesson, so chips lead to sign-up.
export const SUBJECTS = [
  { label: "מתמטיקה", symbol: "∑" },
  { label: "מדעי המחשב", symbol: "</>" },
  { label: "פיזיקה", symbol: "Ω" },
  { label: "אנגלית", symbol: "ABC" },
  { label: "פסיכומטרי", symbol: "120" },
  { label: "כימיה", symbol: "H₂O" },
  { label: "ביולוגיה", symbol: "DNA" },
  { label: "סטטיסטיקה", symbol: "σ" },
  { label: "חשבונאות", symbol: "₪" },
  { label: "ועוד", symbol: "+" },
];

// ── FAQ ──────────────────────────────────────────────────────────────────────
// Answers approved by the product owner. An answer can be a string or an
// array of lines (rendered as a short list, used where several points apply).
export const FAQ = [
  {
    q: "למי Uniclass מתאימה?",
    a: [
      "לסטודנטים אקדמאים שרוצים חיזוק בלימודים.",
      "לתלמידים מכיתה ח' (מגיל 14) ועד כיתה י\"ב, שרוצים עזרה בחומר. הורה יכול לפתוח את החשבון ולשלם, ואין חובה שיהיה נוכח בשיעור.",
    ],
  },
  {
    q: "איך בוחרים מורה?",
    a: "בפרופיל של כל מורה רואים שם, תמונה, מחיר לשיעור, דירוגים, תיאור קצר וזמנים פנויים. בוחרים את המורה שמתאים לכם ומזמינים מועד מהיומן.",
  },
  {
    q: "האם זה בטוח לילדים ולנוער?",
    a: [
      "המורים מעל גיל 18 ומזוהים באמצעות תעודת זהות.",
      "המצלמה של המורה דלוקה לאורך כל השיעור.",
      "הורה יכול להצטרף לכל שיעור, בכל רגע.",
      "בצ'אט מוצג רק שם מלא, ואסור לשתף פרטים אישיים.",
    ],
  },
  {
    q: "מה קורה אם צריך לבטל שיעור?",
    a: "ביטול עד 24 שעות לפני השיעור הוא חינם, בלי חיוב. אם המורה מבטל או שהשיעור לא מתקיים, מקבלים החזר מלא. לשינוי מועד מתאמים מול המורה.",
  },
  {
    q: "איך מצטרפים כמורה?",
    a: "כל סטודנט/ית מגיל 18 יכול/ה להירשם, ההצטרפות חינמית: אפס עלות עד שמרוויחים. אתם קובעים מחיר ושעות, והתשלום מועבר אחת לחודש דרך איזי תלוש, בלי צורך בעוסק.",
  },
];

// ── Social proof (hidden until real content is provided) ─────────────────────
// Set `enabled: true` once you have real content. No invented numbers or reviews.
export const SOCIAL_PROOF = {
  quote: {
    enabled: false,
    text: "", // ציטוט אמיתי ממורה בפיילוט
    author: "", // שם המורה
    role: "", // למשל: "מורה למתמטיקה, הפיילוט"
  },
  partners: {
    enabled: false,
    items: [], // [{ name: "שם השותף", logo: "https://..." }]
  },
};

export const SITE_URL = "https://uniclass.co.il";
// 1376×768 brand banner (purple gradient + UniClass wordmark), safe for WhatsApp / social cards.
export const OG_IMAGE =
  "https://media.base44.com/images/public/6a37f1517bf59551c5f4b6f9/4db52841e_generated_c6e3cf4f.jpg";
export const OG_IMAGE_WIDTH = "1376";
export const OG_IMAGE_HEIGHT = "768";
export const LOGO_URL =
  "https://media.base44.com/images/public/6a37f1517bf59551c5f4b6f9/c40751db9_Logo_UNICLASS_purple_PNG.png";

export const PAGE_TITLE = "שיעורים אונליין עם סטודנטים שמכירים את החומר | UniClass";
export const PAGE_DESCRIPTION =
  "שיעורים פרטיים אונליין עם סטודנטים שעברו את הקורסים והמבחנים. מורים מכל האוניברסיטאות, מחיר ושעות שאתם קובעים, תשלום מאובטח וביטול חינם עד 24 שעות לפני.";