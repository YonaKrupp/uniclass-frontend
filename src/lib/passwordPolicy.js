export const MIN_PASSWORD_LENGTH = 8;

// סיסמאות נפוצות שעוברות את כללי האורך והתווים אך הן הראשונות שמנסים בניסיון פריצה.
// הרשימה זהה לזו שבשרת (base44/shared/passwordPolicy.ts) ואינה נשלחת לשום שירות חיצוני.
const COMMON_PASSWORDS = new Set([
  "password", "password1", "password12", "password123", "passw0rd", "p@ssw0rd",
  "12345678", "123456789", "1234567890", "87654321", "11111111", "00000000",
  "11223344", "12341234", "1234abcd", "abcd1234", "a1234567", "aa123456",
  "abc12345", "qwerty12", "qwerty123", "qwertyui", "1q2w3e4r", "1qaz2wsx",
  "iloveyou1", "welcome1", "welcome123", "admin123", "admin1234", "letmein1",
  "master123", "sunshine1", "princess1", "football1", "baseball1", "shalom12",
  "shalom123", "israel123", "sagol1234", "uniclass1", "uniclass123",
]);

/** מחזיר הודעת שגיאה בעברית, או מחרוזת ריקה אם הסיסמה תקינה. */
export function passwordError(password) {
  const value = String(password ?? "");
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `הסיסמה חייבת להכיל לפחות ${MIN_PASSWORD_LENGTH} תווים`;
  }
  if (!/[A-Za-zא-ת]/.test(value)) {
    return "הסיסמה חייבת להכיל לפחות אות אחת";
  }
  if (!/[0-9]/.test(value)) {
    return "הסיסמה חייבת להכיל לפחות ספרה אחת";
  }
  if (COMMON_PASSWORDS.has(value.toLowerCase())) {
    return "הסיסמה נפוצה מדי. אנא בחרו סיסמה אחרת";
  }
  return "";
}