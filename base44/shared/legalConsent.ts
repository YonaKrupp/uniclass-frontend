import { clientIp } from './legalDocs.ts';

/** גרסת הבסיס של חבילות המסמכים (ברירת מחדל כשטבלת ההגדרות ריקה). */
export const INITIAL_DOCS_VERSION = '1.0';

/** הגיל המינימלי להרשמת תלמיד. */
export const MIN_STUDENT_AGE = 14;

export const CONSENT_TYPES = ['teacher_signup', 'student_signup', 'student_payment'];

export const CONSENT_REQUIRED_ERROR = 'יש לאשר את התנאים כדי להמשיך';

export function isConsentType(value: unknown): boolean {
  return typeof value === 'string' && CONSENT_TYPES.includes(value);
}

/** מנרמל תוצאת list/filter גם לפורמט עמוד ({items}) וגם למערך. */
function toItems(result: any): any[] {
  if (!result) return [];
  if (Array.isArray(result)) return result;
  if (Array.isArray(result.items)) return result.items;
  return [];
}

/** קורא את גרסאות חבילות המסמכים מהגדרות המערכת. */
export async function getDocsVersions(base44: any) {
  let record: any = null;
  try {
    const page = await base44.asServiceRole.entities.Settings.list({ limit: 1 });
    record = toItems(page)[0] || null;
  } catch (error) {
    // גרסאות SDK ותיקות יותר אינן מקבלות אובייקט אפשרויות ב-list.
    try {
      record = toItems(await base44.asServiceRole.entities.Settings.list())[0] || null;
    } catch (fallbackError) {
      console.error('legalConsent: failed to read Settings:', fallbackError.message);
    }
  }
  return {
    teacher: String(record?.teacher_docs_version || INITIAL_DOCS_VERSION),
    student: String(record?.student_docs_version || INITIAL_DOCS_VERSION),
  };
}

/** הגרסה הרלוונטית לקהל (מורים או תלמידים והורים). */
export async function docsVersionForAudience(base44: any, audience: string) {
  const versions = await getDocsVersions(base44);
  return audience === 'teacher' ? versions.teacher : versions.student;
}

/** כל רשומות האישור של משתמש, מהחדשה לישנה. */
export async function listConsents(base44: any, email: string) {
  try {
    const page = await base44.asServiceRole.entities.ConsentRecord.filter(
      { user_email: email },
      { sort: '-created_date', limit: 200 },
    );
    return toItems(page);
  } catch (error) {
    // גרסאות SDK ותיקות יותר אינן מקבלות אובייקט אפשרויות ב-filter.
    const page = await base44.asServiceRole.entities.ConsentRecord.filter({ user_email: email });
    return toItems(page);
  }
}

/**
 * האם הרשומה מהווה אישור תקף לסוג האישור ולגרסה הנוכחית.
 * רשומות מלפני מודל הגרסאות (אישור תנאים ישן) נחשבות תקפות כל עוד הגרסה
 * הנוכחית היא גרסת הבסיס — כדי לא לחסום משתמשים קיימים. ברגע שהגרסה עולה,
 * נדרש אישור חדש.
 */
function isCurrent(record: any, consentType: string, version: string) {
  if (
    record.consent_type === consentType &&
    record.accepted_terms === true &&
    String(record.docs_version || '') === version
  ) {
    return true;
  }
  if (version === INITIAL_DOCS_VERSION && record.accepted_terms_privacy_conduct === true) {
    return true;
  }
  return false;
}

/** בדיקה מהירה: האם קיים אישור תקף לגרסה הנוכחית. */
export async function hasCurrentConsent(
  base44: any,
  email: string,
  consentType: string,
  version: string,
) {
  const records = await listConsents(base44, email);
  return records.some((record) => isCurrent(record, consentType, version));
}

/**
 * מצב האישור של משתמש מול הגרסה הנוכחית.
 * מורה: חייב אישור תקף. תלמיד: נחסם רק אם אישר בעבר גרסה שאינה מעודכנת
 * (תלמיד חדש מאשר בהרשמה ובתשלום).
 */
export async function consentStatus(base44: any, email: string, audience: string) {
  const version = await docsVersionForAudience(base44, audience);
  const consentType = audience === 'teacher' ? 'teacher_signup' : 'student_signup';
  const records = await listConsents(base44, email);
  const currentSignup = records.some((record) => isCurrent(record, consentType, version));
  // אישור תשלום עדכני (הורה או תלמיד בגיר) נחשב גם הוא לאישור בתוקף.
  const currentPayment = records.some((record) => isCurrent(record, 'student_payment', version));
  // גרסה ישנה של אישור הרשמה בלבד מחייבת אישור חוזר בכניסה; אישור הורה מתחדש בתשלום הבא.
  const hasStaleApproval = records.some(
    (record) =>
      (record.consent_type === consentType || record.accepted_terms_privacy_conduct === true) &&
      String(record.docs_version || '') !== version &&
      !(version === INITIAL_DOCS_VERSION && record.accepted_terms_privacy_conduct === true),
  );
  const needsConsent =
    audience === 'teacher' ? !currentSignup : !currentSignup && !currentPayment && hasStaleApproval;
  console.log(
    `legalConsent status: ${email} audience=${audience} version=${version} needsConsent=${needsConsent}`,
  );
  return { audience, docsVersion: version, needsConsent };
}

/**
 * שומר רשומת אישור חדשה. חותמת הזמן, כתובת ה-IP והדפדפן נקבעים בשרת בלבד,
 * ותמיד נשמרת רשומה חדשה — אין דריסה של רשומות קודמות.
 */
export async function recordConsent(base44: any, req: Request, data: any) {
  const version = data.docsVersion || (await docsVersionForAudience(base44, data.audience));

  const record = await base44.asServiceRole.entities.ConsentRecord.create({
    user_id: String(data.userId || ''),
    user_email: String(data.email || '').trim().toLowerCase(),
    consent_type: data.consentType,
    role_of_approver: data.roleOfApprover,
    docs_version: version,
    accepted_terms: data.acceptedTerms === true,
    confirmed_18_plus: data.confirmed18Plus === true,
    confirmed_parent_guardian: data.confirmedParentGuardian === true,
    accepted_at: new Date().toISOString(),
    ip_address: clientIp(req),
    user_agent: req.headers.get('user-agent') || '',
  });

  console.log(
    `legalConsent: saved ${data.consentType} for ${data.email} (version ${version}, record ${record.id})`,
  );
  return record;
}

/** מחזיר את הגיל המספרי אם נשלח, אחרת null. */
export function parseAge(value: unknown): number | null {
  const age = Number(value);
  return Number.isFinite(age) && age > 0 ? age : null;
}

/** גיל בשנים מתאריך לידה (yyyy-mm-dd) — null אם התאריך חסר או לא תקין. */
export function ageFromDateOfBirth(value: unknown): number | null {
  const raw = String(value ?? '').trim();
  if (!raw) return null;
  const birth = new Date(raw);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) age -= 1;
  return age >= 0 ? age : null;
}