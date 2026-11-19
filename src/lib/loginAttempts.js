// מספר ניסיונות ההתחברות המותרים לפני נעילה — חייב להיות זהה לערך שבפונקציית authProxy
export const MAX_LOGIN_ATTEMPTS = 10;

/** 95 → "01:35" */
export function formatCountdown(totalSeconds) {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}