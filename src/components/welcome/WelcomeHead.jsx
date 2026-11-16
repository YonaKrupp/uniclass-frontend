import { useEffect } from "react";
import {
  FAQ,
  LOGO_URL,
  OG_IMAGE,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  PAGE_DESCRIPTION,
  PAGE_TITLE,
  SITE_URL,
} from "./welcomeConfig";

const CANONICAL = `${SITE_URL}/welcome`;

const META = [
  ["description", PAGE_DESCRIPTION],
  ["og:type", "website"],
  ["og:site_name", "UniClass"],
  ["og:locale", "he_IL"],
  ["og:title", PAGE_TITLE],
  ["og:description", PAGE_DESCRIPTION],
  ["og:url", CANONICAL],
  ["og:image", OG_IMAGE],
  ["og:image:width", OG_IMAGE_WIDTH],
  ["og:image:height", OG_IMAGE_HEIGHT],
  ["og:image:alt", "UniClass — שיעורים אונליין עם סטודנטים"],
  ["twitter:card", "summary_large_image"],
  ["twitter:title", PAGE_TITLE],
  ["twitter:description", PAGE_DESCRIPTION],
  ["twitter:image", OG_IMAGE],
];

const JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "UniClass",
    url: SITE_URL,
    logo: LOGO_URL,
    description: PAGE_DESCRIPTION,
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  },
];

function setMeta(key, content) {
  const attr = key.startsWith("og:") ? "property" : "name";
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  const existed = Boolean(el);
  const previous = existed ? el.getAttribute("content") : null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
  return () => {
    if (existed) el.setAttribute("content", previous || "");
    else el.remove();
  };
}

/** Page-level title, meta, canonical, social tags and JSON-LD for /welcome only. */
export default function WelcomeHead() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = PAGE_TITLE;

    const cleanups = META.map(([key, content]) => setMeta(key, content));

    let canonical = document.head.querySelector('link[rel="canonical"]');
    const hadCanonical = Boolean(canonical);
    const previousHref = hadCanonical ? canonical.getAttribute("href") : null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", CANONICAL);

    const scripts = JSON_LD.map((schema) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
      return script;
    });

    return () => {
      document.title = previousTitle;
      cleanups.forEach((fn) => fn());
      scripts.forEach((script) => script.remove());
      if (hadCanonical) canonical.setAttribute("href", previousHref || "");
      else canonical.remove();
    };
  }, []);

  return null;
}