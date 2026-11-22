// סיווג מקצועות לפי רמת הלימוד: כיתות ח׳–י״ב = בית ספר, כל יתר הרמות = אוניברסיטה.
const SCHOOL_GRADES = ["ח", "ט", "י", "יא", "יב"];

const normalizeLevel = (value) =>
  String(value ?? "")
    .replace(/[\u00a0\u200e\u200f]/g, " ")
    .replace(/["'׳״’‘]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export function isSchoolLevel(levelName) {
  const text = normalizeLevel(levelName);
  if (!text) return false;
  const match = text.match(/כיתה\s*([א-ת]{1,3})/);
  const grade = match ? match[1] : (/^(ח|ט|י|יא|יב)$/.test(text) ? text : "");
  return SCHOOL_GRADES.includes(grade);
}

export function subjectCategory(subject) {
  return isSchoolLevel(subject?.gn04_levelName) ? "school" : "university";
}