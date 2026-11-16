export const HEBREW_MONTHS = [
  "ינואר",
  "פברואר",
  "מרץ",
  "אפריל",
  "מאי",
  "יוני",
  "יולי",
  "אוגוסט",
  "ספטמבר",
  "אוקטובר",
  "נובמבר",
  "דצמבר",
];

// "1–6 בנובמבר" / "30 באוקטובר – 4 בנובמבר"
export function formatHebrewWeekRange(start, end) {
  const d1 = start.getDate();
  const d2 = end.getDate();
  const m1 = HEBREW_MONTHS[start.getMonth()];
  const m2 = HEBREW_MONTHS[end.getMonth()];
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const yearSuffix = end.getFullYear() !== new Date().getFullYear() ? ` ${end.getFullYear()}` : "";
  if (sameMonth) return `${d1}–${d2} ב${m2}${yearSuffix}`;
  return `${d1} ב${m1} – ${d2} ב${m2}${yearSuffix}`;
}

const FREE_CLASSES = ["available"];
const PENDING_CLASSES = ["tentative"];
const BOOKED_CLASSES = ["selected", "booked", "bookedAtherteacher", "occupiedMove"];

export const isFreeSlot = (slot) => FREE_CLASSES.includes(slot?.gn06_CssClass);
export const isPendingSlot = (slot) => PENDING_CLASSES.includes(slot?.gn06_CssClass);
export const isBookedSlot = (slot) => BOOKED_CLASSES.includes(slot?.gn06_CssClass);

export function slotsOpenedMessage(count) {
  if (count === 1) return "נפתחה שעה פנויה";
  return `נפתחו ${count} שעות פנויות`;
}