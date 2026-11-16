import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ORIGIN = "https://www.uniclass.co.il";

/**
 * קישור קנוני לכל עמוד לפי הנתיב הנוכחי.
 * רץ לפני אפקטי העמודים, כך שעמוד שמגדיר קנוני משלו (בלוג, דף הבית) עדיין גובר.
 */
export default function CanonicalUrl() {
  const { pathname } = useLocation();

  useEffect(() => {
    let link = document.head.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    const path = pathname === "/" ? "/" : pathname.replace(/\/+$/, "");
    link.setAttribute("href", `${ORIGIN}${path}`);
  }, [pathname]);

  return null;
}