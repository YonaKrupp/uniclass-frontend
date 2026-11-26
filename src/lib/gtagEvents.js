// GA4 event tracking — the Google tag itself is loaded in index.html;
// an event is sent only when that tag is actually present on the page.
export function trackGaEvent(name, params = {}) {
  if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }
}

// Google Ads conversion for a completed student signup. Fired once per registration:
// an in-memory flag plus a session flag keep it from repeating on refresh or re-navigation.
const STUDENT_SIGNUP_CONVERSION_KEY = "uniclass_student_signup_conversion_sent";
let studentSignupConversionSent = false;

export function trackStudentSignupConversion() {
  if (studentSignupConversionSent) return;
  try {
    if (sessionStorage.getItem(STUDENT_SIGNUP_CONVERSION_KEY) === "true") return;
  } catch {
    /* storage blocked — the in-memory flag still prevents a repeat */
  }
  if (typeof window.gtag !== "function") return;

  studentSignupConversionSent = true;
  try {
    sessionStorage.setItem(STUDENT_SIGNUP_CONVERSION_KEY, "true");
  } catch {
    /* ignore */
  }
  try {
    window.gtag("event", "conversion", {
      send_to: "AW-18595376927/VH2_CJfRh8AdEJ_e-6JF",
    });
  } catch {
    /* never let tracking break the registration flow */
  }
}

// Stable, non-reversible id for values that are personal data (e.g. a teacher email),
// so no name, email or phone number is ever sent to Google.
export function anonymizeId(value) {
  const str = String(value || "").trim().toLowerCase();
  if (!str) return "";
  let hash = 5381;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return `t_${(hash >>> 0).toString(36)}`;
}