// חישוב החזר על ביטול שיעור מצד התלמיד, לפי מדיניות הביטולים:
// 24 שעות או יותר לפני השיעור — החזר מלא.
// פחות מ-24 שעות — דמי ביטול של 5% ממחיר המורה, ולא יותר מ-100 ₪.

export const CANCEL_FEE_RATE = 0.05;
export const CANCEL_FEE_CAP = 100;
export const FULL_REFUND_HOURS = 24;

const PRICE_KEYS = ["totalPayment", "hourlyPayment", "payment", "price", "amount", "gn06_payment"];

function parseLessonDate(value) {
  const s = String(value || "").trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return { y: +m[1], mo: +m[2], d: +m[3] };
  m = s.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})/);
  if (m) return { y: +m[3], mo: +m[2], d: +m[1] };
  return null;
}

function parseStartTime(value) {
  const m = String(value || "").match(/(\d{1,2}):(\d{2})/);
  return m ? { h: +m[1], mi: +m[2] } : null;
}

/** מועד תחילת השיעור, או null אם התאריך חסר/לא תקין */
export function lessonStart(dateValue, timeRange) {
  const date = parseLessonDate(dateValue);
  if (!date) return null;
  const time = parseStartTime(timeRange) || { h: 0, mi: 0 };
  return new Date(date.y, date.mo - 1, date.d, time.h, time.mi, 0, 0);
}

/** מחיר השיעור כפי שהוא מגיע מהשרת, או null אם אינו זמין */
export function lessonPrice(lesson) {
  if (!lesson) return null;
  for (const key of PRICE_KEYS) {
    const raw = lesson[key];
    if (raw === null || raw === undefined || raw === "") continue;
    const num = Number(String(raw).replace(/[^\d.-]/g, ""));
    if (Number.isFinite(num) && num > 0) return num;
  }
  return null;
}

/**
 * מחזיר { hoursLeft, fullRefund, fee, refund, hasPrice }
 * fee/refund הם null כשמחיר השיעור אינו זמין — ואז מוצג רק כלל הביטול.
 */
export function computeCancelRefund({ price, dateValue, timeRange, now = new Date() }) {
  const start = lessonStart(dateValue, timeRange);
  if (!start) return null;

  const hoursLeft = (start.getTime() - now.getTime()) / 36e5;
  const fullRefund = hoursLeft >= FULL_REFUND_HOURS;

  const amount = Number(price);
  const hasPrice = Number.isFinite(amount) && amount > 0;
  const fee = fullRefund || !hasPrice ? 0 : Math.min(amount * CANCEL_FEE_RATE, CANCEL_FEE_CAP);

  return {
    hoursLeft,
    fullRefund,
    hasPrice,
    fee: hasPrice ? fee : null,
    refund: hasPrice ? Math.max(0, amount - fee) : null,
  };
}

export function formatShekel(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "";
  return `₪${Number(value).toFixed(2)}`;
}