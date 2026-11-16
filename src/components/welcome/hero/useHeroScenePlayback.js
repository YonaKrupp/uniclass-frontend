import { useEffect, useRef } from "react";

/**
 * Runs the hero demo timeline only while the scene is in view, and pauses it
 * while the tab is hidden. Reduced motion never starts it, so the scene keeps
 * its finished static state.
 */
export default function useHeroScenePlayback() {
  const ref = useRef(null);
  const playRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        playRef.current = entry.isIntersecting;
        el.classList.toggle("hs-play", entry.isIntersecting);
        if (!entry.isIntersecting) el.classList.remove("hs-paused");
      },
      { threshold: 0.25 }
    );
    observer.observe(el);

    const onVisibility = () => {
      if (!playRef.current) return;
      el.classList.toggle("hs-paused", document.visibilityState === "hidden");
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return ref;
}