export const DOCUMENT_SET_VERSION = "2.0";

export const CONSENT_REQUIRED_MESSAGE = "יש לאשר את התנאים כדי להירשם";

/**
 * בודק שהבקשה נושאת את אישורי החובה (תנאים ופרטיות + גיל 18) ואת גרסת המסמכים הנוכחית.
 * ההסכמה להקלטה אינה תנאי — ההקלטה אופציונלית ומופעלת בתוך השיעור.
 * משמש גם את הרישום וגם את אישור מחדש של מורים קיימים.
 */
export function hasValidConsent(consents: unknown): boolean {
  if (!consents || typeof consents !== "object") return false;
  const value = consents as Record<string, unknown>;
  return (
    value.termsPrivacyConduct === true &&
    value.adult === true &&
    value.version === DOCUMENT_SET_VERSION
  );
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  return forwarded.split(",")[0].trim() || req.headers.get("cf-connecting-ip") || "";
}