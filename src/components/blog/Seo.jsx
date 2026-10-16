import { useEffect } from "react";

const MARKER = "data-blog-seo";

function clearManaged() {
  document.head.querySelectorAll(`[${MARKER}="1"]`).forEach((el) => el.remove());
}

export default function Seo({ title, description, canonical, image, ogType = "website", noindex = false, jsonLd = null }) {
  const jsonLdString = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    const previousTitle = document.title;
    clearManaged();

    const addTag = (tagName, attrs) => {
      const el = document.createElement(tagName);
      Object.entries(attrs).forEach(([name, value]) => el.setAttribute(name, value));
      el.setAttribute(MARKER, "1");
      document.head.appendChild(el);
    };

    if (title) document.title = title;
    if (description) addTag("meta", { name: "description", content: description });
    if (canonical) addTag("link", { rel: "canonical", href: canonical });
    if (noindex) addTag("meta", { name: "robots", content: "noindex, nofollow" });

    addTag("meta", { property: "og:type", content: ogType });
    addTag("meta", { property: "og:site_name", content: "Uniclass" });
    if (title) addTag("meta", { property: "og:title", content: title });
    if (description) addTag("meta", { property: "og:description", content: description });
    if (canonical) addTag("meta", { property: "og:url", content: canonical });
    if (image) addTag("meta", { property: "og:image", content: image });

    addTag("meta", { name: "twitter:card", content: image ? "summary_large_image" : "summary" });
    if (title) addTag("meta", { name: "twitter:title", content: title });
    if (description) addTag("meta", { name: "twitter:description", content: description });
    if (image) addTag("meta", { name: "twitter:image", content: image });

    if (jsonLdString) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute(MARKER, "1");
      script.textContent = jsonLdString;
      document.head.appendChild(script);
    }

    return () => {
      clearManaged();
      document.title = previousTitle;
    };
  }, [title, description, canonical, image, ogType, noindex, jsonLdString]);

  return null;
}