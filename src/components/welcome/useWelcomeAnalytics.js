import { useEffect } from "react";
import { ATTRIBUTION_KEY, CONSENT_KEY, TRACKING, UTM_KEYS } from "./welcomeConfig";

/* ── attribution (UTM / click ids) ───────────────────────────────────────── */

function readAttribution() {
  try {
    const raw = sessionStorage.getItem(ATTRIBUTION_KEY) || localStorage.getItem(ATTRIBUTION_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function captureAttribution() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const found = {};
  UTM_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) found[key] = value.slice(0, 160);
  });
  if (!Object.keys(found).length) return readAttribution();

  const value = { ...found, captured_at: new Date().toISOString() };
  try {
    sessionStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(value));
    localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(value));
  } catch {
    /* storage unavailable — tracking still works without it */
  }
  return value;
}

// Capture on module load so links rendered on the very first paint already carry
// the campaign parameters.
if (typeof window !== "undefined") captureAttribution();

/** Appends the captured UTM / click ids to a link, without touching the target page. */
export function withAttribution(path) {
  const attribution = readAttribution();
  const usable = Object.entries(attribution).filter(([key, value]) => UTM_KEYS.includes(key) && value);
  if (!usable.length) return path;
  const qs = new URLSearchParams(Object.fromEntries(usable)).toString();
  return `${path}${path.includes("?") ? "&" : "?"}${qs}`;
}

/* ── event dispatch ──────────────────────────────────────────────────────── */

export function trackEvent(name, params = {}) {
  if (typeof window === "undefined") return;
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name, ...params });
  } catch {
    /* ignore */
  }
  try {
    if (typeof window.gtag === "function") window.gtag("event", name, params);
  } catch {
    /* ignore */
  }
  try {
    if (typeof window.fbq === "function") window.fbq("trackCustom", name, params);
  } catch {
    /* ignore */
  }
  try {
    if (window.ttq && typeof window.ttq.track === "function") window.ttq.track(name, params);
  } catch {
    /* ignore */
  }
}

/* ── tags (consent aware) ───────────────────────────────────────────────── */

let loaded = false;

function consentGranted() {
  try {
    return localStorage.getItem(CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
}

function injectScript(src) {
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  script.dataset.welcomeTag = "true";
  document.head.appendChild(script);
}

function loadTags() {
  if (loaded) return;
  loaded = true;

  if (TRACKING.GA4_ID) {
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function () {
        window.dataLayer.push(arguments);
      };
    window.gtag("js", new Date());
    window.gtag("consent", "update", {
      analytics_storage: "granted",
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    });
    window.gtag("config", TRACKING.GA4_ID, { send_page_view: true });
    injectScript(`https://www.googletagmanager.com/gtag/js?id=${TRACKING.GA4_ID}`);
  }

  if (TRACKING.META_PIXEL_ID) {
    if (!window.fbq) {
      const fbq = function () {
        fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments);
      };
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = "2.0";
      fbq.queue = [];
      window.fbq = fbq;
    }
    injectScript("https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", TRACKING.META_PIXEL_ID);
    window.fbq("track", "PageView");
  }

  if (TRACKING.TIKTOK_PIXEL_ID) {
    if (!window.ttq) {
      const ttq = { methods: [], queue: [], push() {}, load() {}, page() {}, track() {}, identify() {} };
      window.ttq = ttq;
    }
    injectScript("https://analytics.tiktok.com/i18n/pixel/events.js");
    if (typeof window.ttq.load === "function") window.ttq.load(TRACKING.TIKTOK_PIXEL_ID);
    if (typeof window.ttq.page === "function") window.ttq.page();
  }

  trackEvent("PageView", { page: "welcome" });
}

/** Called when the visitor declines: no tags, and remove what they may have set. */
function unloadTags() {
  document.querySelectorAll('script[data-welcome-tag="true"]').forEach((el) => el.remove());
  ["_fbp", "_fbc", "_tt_enable_cookie", "_ttp", "ttclid"].forEach((name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.uniclass.co.il`;
  });
  loaded = false;
}

/* ── page hook ───────────────────────────────────────────────────────────── */

export function useWelcomeTracking() {
  useEffect(() => {
    captureAttribution();

    const sync = () => {
      if (consentGranted()) loadTags();
    };
    sync();

    const onConsent = (event) => {
      const value = event?.detail;
      if (value === "accepted") loadTags();
      if (value === "declined") unloadTags();
    };
    window.addEventListener("uniclass-consent-change", onConsent);

    // scroll depth: 50% and 90%, once each
    const marks = { 50: false, 90: false };
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = document.documentElement;
        const scrollable = el.scrollHeight - el.clientHeight;
        const percent = scrollable > 0 ? (el.scrollTop / scrollable) * 100 : 100;
        if (percent >= 50 && !marks[50]) {
          marks[50] = true;
          trackEvent("scroll_50", { page: "welcome" });
        }
        if (percent >= 90 && !marks[90]) {
          marks[90] = true;
          trackEvent("scroll_90", { page: "welcome" });
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener("uniclass-consent-change", onConsent);
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}