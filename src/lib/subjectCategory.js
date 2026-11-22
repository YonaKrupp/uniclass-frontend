// סיווג מקצועות לפי שם המוסד (Gn23_uni_Name) שמגיע מהשרת:
// שם מוסד שמציין אוניברסיטה פתוחה = האוניברסיטה הפתוחה,
// שם מוסד שמציין בית ספר / תיכון / חטיבה (או רמת לימוד של כיתה ח׳–י״ב) = בית ספר,
// כל שם מוסד אחר = אוניברסיטה.
const SCHOOL_GRADES = ["ח", "ט", "י", "יא", "יב"];

const OPEN_UNIVERSITY_HINTS = ["פתוח"];
const SCHOOL_NAME_HINTS = [
  "בית ספר",
  "תיכון",
  "חטיב",
  'חט"ב',
  "חטב",
  "יסודי",
  "מקיף",
  "עירוני",
  "אולפנ",
  "כפר נוער",
  "תלמוד תורה",
  "ישיבה",
  "ממ\"ד",
];

const normalizeText = (value) =>
  String(value ?? "")
    .replace(/[\u00a0\u200e\u200f]/g, " ")
    .replace(/["'׳״’‘]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export function institutionName(subject) {
  return normalizeText(
    subject?.Gn23_uni_Name ?? subject?.gn23_uni_Name ?? subject?.GN23_UNI_NAME ?? ""
  );
}

export function isSchoolLevel(levelName) {
  const text = normalizeText(levelName);
  if (!text) return false;
  const match = text.match(/כיתה\s*([א-ת]{1,3})/);
  const grade = match ? match[1] : (/^(ח|ט|י|יא|יב)$/.test(text) ? text : "");
  return SCHOOL_GRADES.includes(grade);
}

/**
 * @param {object} subject פריט מרשימת המקצועות (כולל Gn23_uni_Name ו-gn04_levelName)
 */
export function subjectCategory(subject) {
  const uniName = institutionName(subject);
  const lower = uniName.toLowerCase();

  if (OPEN_UNIVERSITY_HINTS.some((hint) => lower.includes(hint))) return "openUniversity";
  if (
    SCHOOL_NAME_HINTS.some((hint) => lower.includes(hint)) ||
    isSchoolLevel(subject?.gn04_levelName)
  ) {
    return "school";
  }
  return "university";
}