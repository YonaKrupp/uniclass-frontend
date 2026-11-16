import { useEffect, useRef } from "react";

/**
 * Writes --wx / --wy (normalized -0.5…0.5) and --mx / --my (pixels) on the
 * returned element so children can build parallax layers and a cursor glow.
 * Silent when the visitor prefers reduced motion or has no hover input.
 */
export function usePointerParallax() {
  const ref = useRef(null);
  const frame = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(hover: none)").matches) return;

    const onMove = (event) => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--wx", (event.clientX / window.innerWidth - 0.5).toFixed(3));
        el.style.setProperty("--wy", ((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5).toFixed(3));
        el.style.setProperty("--mx", `${Math.round(event.clientX - rect.left)}px`);
        el.style.setProperty("--my", `${Math.round(event.clientY - rect.top)}px`);
        frame.current = 0;
      });
    };

    el.addEventListener("pointermove", onMove);
    return () => {
      el.removeEventListener("pointermove", onMove);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  return ref;
}