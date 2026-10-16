import { useCallback, useEffect, useRef, useState } from "react";
import { ACCESSIBILITY_CSS } from "./accessibilityStyles";

const STORAGE_KEY = "uniclass_a11y_settings";

export const DEFAULT_SETTINGS = {
  colorMode: "none", // none | contrast | invert | grayscale | bw
  fontScale: 100,
  wordSpacing: 0,
  letterSpacing: 0,
  readableFont: false,
  highlightLinks: false,
  highlightHeadings: false,
  readingGuide: false,
  screenReader: false,
  hideImages: false,
  cursor: "none", // none | dark | light
  stopMotion: false,
};

const ROOT_CLASSES = [
  "uc-contrast",
  "uc-invert",
  "uc-grayscale",
  "uc-bw",
  "uc-font",
  "uc-links",
  "uc-headings",
  "uc-hide-img",
  "uc-cursor-dark",
  "uc-cursor-light",
  "uc-nomotion",
  "uc-sr",
  "uc-ws",
  "uc-ls",
];

/* The stylesheet lives in <head>, so it survives client-side navigation away
   from the page that hosts the toolbar. */
let stylesInjected = false;
function ensureStyles() {
  if (stylesInjected || typeof document === "undefined") return;
  stylesInjected = true;
  if (document.getElementById("uc-a11y-styles")) return;
  const style = document.createElement("style");
  style.id = "uc-a11y-styles";
  style.textContent = ACCESSIBILITY_CSS;
  document.head.appendChild(style);
}
ensureStyles();

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export default function useAccessibility() {
  const [settings, setSettings] = useState(readStored);
  const guideRef = useRef(null);

  /* ------------------------------------------------ apply + persist */
  useEffect(() => {
    const root = document.documentElement;
    ROOT_CLASSES.forEach((c) => root.classList.remove(c));

    if (settings.colorMode === "contrast") root.classList.add("uc-contrast");
    if (settings.colorMode === "invert") root.classList.add("uc-invert");
    if (settings.colorMode === "grayscale") root.classList.add("uc-grayscale");
    if (settings.colorMode === "bw") root.classList.add("uc-bw");
    if (settings.readableFont) root.classList.add("uc-font");
    if (settings.highlightLinks) root.classList.add("uc-links");
    if (settings.highlightHeadings) root.classList.add("uc-headings");
    if (settings.hideImages) root.classList.add("uc-hide-img");
    if (settings.cursor === "dark") root.classList.add("uc-cursor-dark");
    if (settings.cursor === "light") root.classList.add("uc-cursor-light");
    if (settings.stopMotion) root.classList.add("uc-nomotion");
    if (settings.screenReader) root.classList.add("uc-sr");

    if (settings.wordSpacing !== DEFAULT_SETTINGS.wordSpacing) {
      root.classList.add("uc-ws");
      root.style.setProperty("--uc-ws", `${settings.wordSpacing}px`);
    } else {
      root.style.removeProperty("--uc-ws");
    }

    if (settings.letterSpacing !== DEFAULT_SETTINGS.letterSpacing) {
      root.classList.add("uc-ls");
      root.style.setProperty("--uc-ls", `${settings.letterSpacing}px`);
    } else {
      root.style.removeProperty("--uc-ls");
    }

    if (settings.fontScale === DEFAULT_SETTINGS.fontScale) {
      root.style.removeProperty("font-size");
    } else {
      root.style.fontSize = `${settings.fontScale}%`;
    }

    try {
      if (JSON.stringify(settings) === JSON.stringify(DEFAULT_SETTINGS)) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      }
    } catch {
      /* storage unavailable — settings simply stay for this visit */
    }
  }, [settings]);

  /* ------------------------------------------------ screen-reader helpers */
  useEffect(() => {
    const existing = document.getElementById("uc-skip-link");

    if (!settings.screenReader) {
      if (existing) existing.remove();
      document.querySelectorAll("[data-uc-a11y]").forEach((el) => {
        const added = (el.getAttribute("data-uc-a11y") || "").split(",");
        if (added.includes("role")) el.removeAttribute("role");
        if (added.includes("label")) el.removeAttribute("aria-label");
        if (added.includes("id")) el.removeAttribute("id");
        el.removeAttribute("data-uc-a11y");
      });
      return;
    }

    if (!existing) {
      const link = document.createElement("a");
      link.id = "uc-skip-link";
      link.className = "uc-skip-link";
      link.href = "#main-content";
      link.textContent = "דלג לתוכן הראשי";
      document.body.insertBefore(link, document.body.firstChild);
    }

    const mark = (el, key, attr, value) => {
      if (el.hasAttribute(attr)) return;
      el.setAttribute(attr, value);
      const current = el.getAttribute("data-uc-a11y") || "";
      el.setAttribute("data-uc-a11y", current ? `${current},${key}` : key);
    };

    document.querySelectorAll("header").forEach((el) => mark(el, "role", "role", "banner"));
    document.querySelectorAll("nav").forEach((el) => mark(el, "label", "aria-label", "ניווט ראשי"));
    document.querySelectorAll("main").forEach((el) => {
      mark(el, "id", "id", "main-content");
      mark(el, "label", "aria-label", "תוכן ראשי");
    });
    document.querySelectorAll("footer").forEach((el) => mark(el, "role", "role", "contentinfo"));
  }, [settings.screenReader]);

  /* ------------------------------------------------ reading guide */
  useEffect(() => {
    const guide = guideRef.current;
    if (!settings.readingGuide || !guide) return undefined;
    guide.style.display = "block";
    const place = (y) => {
      guide.style.top = `${y - 17}px`;
    };
    const onMove = (e) => place(e.clientY);
    const onTouch = (e) => {
      const touch = e.touches && e.touches[0];
      if (touch) place(touch.clientY);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
      guide.style.display = "none";
    };
  }, [settings.readingGuide]);

  /* ------------------------------------------------ actions */
  const update = useCallback((patch) => setSettings((s) => ({ ...s, ...patch })), []);

  const toggle = useCallback((key) => setSettings((s) => ({ ...s, [key]: !s[key] })), []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setSettings({ ...DEFAULT_SETTINGS });
  }, []);

  return {
    settings,
    update,
    toggle,
    reset,
    guideRef,
  };
}