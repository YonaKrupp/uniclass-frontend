import React, { useRef, useState, useEffect } from "react";

/**
 * CountUp — animates the leading number of `value` from 0 up when scrolled
 * into view. Non-numeric values (e.g. "AI") are shown as-is.
 * Examples: "100%" → 0…100 + "%", "24/7" → 0…24 + "/7", "0₪" → 0 + "₪".
 */
export default function CountUp({ value, duration = 1600, className = "" }) {
  const ref = useRef(null);
  const match = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
  const target = match ? parseFloat(match[1]) : null;
  const suffix = match ? match[2] : "";
  const [display, setDisplay] = useState(target === null ? value : `0${suffix}`);

  useEffect(() => {
    if (target === null) return;
    const el = ref.current;
    if (!el) return;
    let raf;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.unobserve(el);
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setDisplay(`${Math.round(target * eased)}${suffix}`);
            if (p < 1) raf = requestAnimationFrame(tick);
            else setDisplay(`${target}${suffix}`);
          };
          raf = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => { observer.disconnect(); if (raf) cancelAnimationFrame(raf); };
  }, [target, suffix, duration]);

  return <span ref={ref} className={className}>{display}</span>;
}