import { base44 } from "@/api/base44Client";

/** מצב האישור של משתמש מול גרסת חבילת המסמכים הנוכחית. */
export async function fetchConsentStatus(email, audience) {
  const res = await base44.functions.invoke("legalConsentProxy", {
    action: "status",
    email,
    audience,
  });
  return res.data || {};
}

/** שמירת אישור חדש (השרת קובע חותמת זמן, IP ודפדפן). */
export async function acceptLegalConsent(payload) {
  const res = await base44.functions.invoke("legalConsentProxy", {
    action: "accept",
    ...payload,
  });
  return res.data || {};
}

/** גרסאות חבילות המסמכים (מורים / תלמידים). */
export async function fetchDocsVersions() {
  const res = await base44.functions.invoke("legalConsentProxy", { action: "versions" });
  return res.data || {};
}

function ageFromBirthDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const monthDiff = now.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) age -= 1;
  return age;
}

/**
 * האם מדובר בתלמיד קטין (מתחת ל-18).
 * כשהגיל אינו ידוע — מניחים קטין, כדי להציג את נוסח הסכמת ההורה.
 */
export function detectMinor(userData) {
  if (!userData || typeof userData !== "object") return true;
  if (userData.isMinor === true) return true;
  if (userData.isMinor === false) return false;

  const age = Number(userData.age ?? userData.Age ?? userData.studentAge);
  if (Number.isFinite(age) && age > 0) return age < 18;

  const raw = userData.birthDate || userData.dateOfBirth || userData.birthday || userData.BirthDate;
  if (raw) {
    const parsed = ageFromBirthDate(raw);
    if (parsed !== null) return parsed < 18;
  }
  return true;
}