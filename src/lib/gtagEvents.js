// GA4 event tracking — the Google tag itself is loaded in index.html;
// an event is sent only when that tag is actually present on the page.
export function trackGaEvent(name, params = {}) {
  if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
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