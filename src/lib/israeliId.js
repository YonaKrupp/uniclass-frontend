// בדיקת תקינות מספר תעודת זהות ישראלית (9 ספרות עם ספרת ביקורת).
export function isValidIsraeliId(value) {
  const id = String(value || "").replace(/\D/g, "");
  if (id.length !== 9) return false;

  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    let digit = Number(id[i]) * ((i % 2) + 1);
    if (digit > 9) digit -= 9;
    sum += digit;
  }
  return sum % 10 === 0;
}