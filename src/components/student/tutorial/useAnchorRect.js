import { useEffect, useState } from "react";

const MISSING_AFTER_MS = 1600;
const POLL_MS = 300;

function findVisible(selector) {
  const nodes = Array.from(document.querySelectorAll(selector));
  return (
    nodes.find((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    }) || null
  );
}

/**
 * מודד את המלבן של האלמנט הנוכחי, גולל אליו אם הוא מחוץ למסך,
 * ומתעדכן בגלילה/שינוי גודל. מחזיר missing=true אם האלמנט לא קיים/לא נראה.
 */
export default function useAnchorRect(selector) {
  const [rect, setRect] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    setRect(null);
    setMissing(false);
    if (!selector) return undefined;

    const startedAt = Date.now();
    let scrolled = false;

    const measure = () => {
      const el = findVisible(selector);
      if (!el) {
        setRect(null);
        if (Date.now() - startedAt > MISSING_AFTER_MS) setMissing(true);
        return;
      }

      const r = el.getBoundingClientRect();
      const offscreen =
        r.top < 0 || r.bottom > window.innerHeight || r.left < 0 || r.right > window.innerWidth;
      if (!scrolled && offscreen) {
        scrolled = true;
        el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      }

      setMissing(false);
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };

    measure();
    const interval = window.setInterval(measure, POLL_MS);
    const stopPolling = window.setTimeout(() => window.clearInterval(interval), 15000);
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(stopPolling);
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [selector]);

  return { rect, missing };
}