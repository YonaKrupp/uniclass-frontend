import { base44 } from "@/api/base44Client";

const STORAGE_KEY = "uniclass_student_tutorial_done";

/**
 * שלבי ההדרכה לתלמידים.
 * selector — אלמנט להדגשה (data-tour). אלמנט שלא נמצא/לא נראה — השלב מדולג אוטומטית.
 * route    — הדף שבו השלב נמצא (ניווט אוטומטי).
 * modal    — שלב ללא ספוטלייט, מוצג כמודאל במרכז המסך.
 * nav      — שלב בתפריט העליון (במובייל נפתח התפריט אוטומטית).
 */
export const STUDENT_TUTORIAL_STEPS = [
  {
    key: "intro",
    modal: true,
    route: "/student-home",
    title: "ברוכים הבאים ל-Uniclass 👋",
    body: "בואו נעשה סיור קצר של דקה שיראה לכם איך מוצאים מורה, קובעים שיעור ולומדים.",
    primaryLabel: "בואו נתחיל",
  },
  {
    key: "welcome",
    route: "/student-home",
    selector: '[data-tour="welcome"]',
    title: "הפאנל האישי שלכם",
    body: "כאן תראו הכול במקום אחד: השיעורים, המורים והפעילות שלכם.",
  },
  {
    key: "stats",
    route: "/student-home",
    selector: '[data-tour="stats"]',
    title: "סיכום מהיר",
    body: "כמה שיעורים יש לכם היום, כמה מורים לקחתם, כמה שיעורים מתוכננים וכמה מקצועות פעילים.",
  },
  {
    key: "activity-chart",
    route: "/student-home",
    selector: '[data-tour="activity-chart"]',
    title: "פעילות שיעורים",
    body: "כאן רואים את הפעילות שלכם ב-7 הימים הקרובים, כדי לדעת מתי יש לכם שיעורים.",
  },
  {
    key: "upcoming-lessons",
    route: "/student-home",
    selector: '[data-tour="upcoming-lessons"]',
    title: "השיעורים הבאים",
    body: "כל השיעורים הקרובים שלכם: יום, תאריך, שעה, מקצוע ושם המורה.",
  },
  {
    key: "show-cancel",
    route: "/student-home",
    selector: '[data-tour="show-cancel"]',
    title: "ביטול או שינוי שיעור",
    body: "רוצים לבטל או לשנות שיעור? סמנו כאן ותופיע אפשרות הביטול ליד כל שיעור.",
  },
  {
    key: "nav-find-lesson",
    route: "/student-home",
    nav: true,
    selector: '[data-tour="nav-find-lesson"]',
    title: "בחרו שיעור",
    body: "זה הלב של האתר: מכאן מחפשים מורה וקובעים שיעור.",
  },
  {
    key: "nav-teachers",
    route: "/student-home",
    nav: true,
    selector: '[data-tour="nav-teachers"]',
    title: "רשימת מורים",
    body: "כל המורים שכבר למדתם איתם באתר, עם פרופילים ודירוגים, אם אתם רוצים לעיין לפני שבוחרים.",
  },
  {
    key: "nav-classroom",
    route: "/student-home",
    nav: true,
    selector: '[data-tour="nav-classroom"]',
    title: "כניסה לכיתה",
    body: "בזמן השיעור לוחצים כאן כדי להיכנס לכיתה הווירטואלית ולהתחבר למורה.",
  },
  {
    key: "nav-summary",
    route: "/student-home",
    nav: true,
    selector: '[data-tour="nav-summary"]',
    title: "סיכום שיעור",
    body: "אחרי כל שיעור תמצאו כאן סיכום, כדי לחזור על החומר.",
  },
  {
    key: "nav-chat",
    route: "/student-home",
    nav: true,
    selector: '[data-tour="nav-chat"]',
    title: "צ'אט",
    body: "שיחה ישירה עם המורה לתיאום ושאלות.",
  },
  {
    key: "nav-contact",
    route: "/student-home",
    nav: true,
    selector: '[data-tour="nav-contact"]',
    title: "צור קשר",
    body: "צריכים עזרה? נתקלתם בבעיה? כתבו לנו מכאן.",
  },
  {
    key: "theme-toggle",
    route: "/student-home",
    nav: true,
    selector: '[data-tour="theme-toggle"]',
    title: "מצב בהיר או כהה",
    body: "החליפו בין מצב בהיר למצב כהה לפי מה שנוח לעיניים.",
  },
  {
    key: "lesson-page",
    modal: true,
    route: "/choose-lesson",
    title: "איך מחפשים שיעור?",
    body: "עכשיו נראה איך מחפשים שיעור. יש כמה דרכים.",
  },
  {
    key: "only-with-teachers",
    route: "/choose-lesson",
    selector: '[data-tour="only-with-teachers"]',
    title: "רק קורסים עם מורה",
    body: "מסומן כברירת מחדל, כדי שתראו רק קורסים שיש בהם מורה זמין.",
  },
  {
    key: "search-mode",
    route: "/choose-lesson",
    selector: '[data-tour="search-mode"]',
    title: "שלוש דרכים לחפש",
    body: "חיפוש מלא (מסננים לפי אוניברסיטה, תואר וקורס), חיפוש בהקלדה (מקלידים שם קורס ומוצאים מהר), וחיפוש מורים מתוך שיעורים שכבר לקחתם (כדי לחזור למורה שאהבתם).",
  },
  {
    key: "institution-type",
    route: "/choose-lesson",
    selector: '[data-tour="institution-type"]',
    title: "סוג מוסד",
    body: "בחרו אוניברסיטה, האוניברסיטה הפתוחה או בית ספר.",
  },
  {
    key: "degree-course",
    route: "/choose-lesson",
    selector: '[data-tour="degree-course"]',
    title: "תואר וקורס",
    body: "בחרו קודם תואר אקדמי, ואז יופיעו הקורסים שלו. אחרי שתבחרו קורס תראו את המורים הזמינים ותוכלו לקבוע שיעור.",
  },
  {
    key: "finish",
    modal: true,
    route: "/choose-lesson",
    title: "זהו, אתם מוכנים! 🎉",
    body: "אפשר להפעיל את ההדרכה מחדש בכל זמן מכפתור ה-? בתפריט.",
    primaryLabel: "סיימתי, בואו נתחיל",
  },
];

export function isTutorialDoneLocally() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function markTutorialDoneLocally() {
  try {
    localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    /* ignore */
  }
}

/** בדיקת הדגל בישות User. אם אין הרשאה/אין משתמש — מחזיר false (וממשיכים לגיבוי המקומי). */
export async function isTutorialDoneOnServer() {
  try {
    const me = await base44.auth.me();
    return me?.has_completed_tutorial === true;
  } catch {
    return false;
  }
}

/** עדכון has_completed_tutorial בישות User, עם גיבוי ב-localStorage אם העדכון נכשל. */
export function markTutorialComplete() {
  try {
    localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    /* ignore */
  }
  base44.auth.updateMe({ has_completed_tutorial: true }).catch(() => {
    /* הגיבוי המקומי כבר נשמר */
  });
}