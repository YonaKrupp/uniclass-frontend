import React, { useRef, useEffect } from "react";

/**
 * MeshGradient — animated, mouse-reactive indigo gradient blobs that fill the
 * hero. Blobs drift slowly (stripe-aurora) and the whole layer parallaxes toward
 * the cursor (rAF-throttled direct DOM mutation, no re-renders).
 */
const DEFAULT_BLOBS = [
  { color: "hsl(262 67% 35%)", anim: "stripe-aurora",      pos: { top: "-12%", left: "-8%",  width: "620px", height: "620px" }, opacity: 0.32, delay: "0s" },
  { color: "hsl(263 70% 45%)", anim: "stripe-aurora-slow", pos: { top: "5%",   left: "28%",  width: "540px", height: "540px" }, opacity: 0.28, delay: "-4s" },
  { color: "hsl(258 90% 58%)", anim: "stripe-aurora",      pos: { top: "38%",  left: "-6%",  width: "500px", height: "500px" }, opacity: 0.2,  delay: "-8s" },
  { color: "hsl(260 80% 52%)", anim: "stripe-aurora-slow", pos: { top: "25%",  left: "42%",  width: "460px", height: "460px" }, opacity: 0.18, delay: "-12s" },
  { color: "hsl(250 70% 64%)", anim: "stripe-aurora",      pos: { top: "-5%",  left: "55%",  width: "420px", height: "420px" }, opacity: 0.18, delay: "-6s" },
];

export default function MeshGradient({ className = "" }) {
  const layerRef = useRef(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    let raf = null;
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const rect = layer.getBoundingClientRect();
        const cx = (e.clientX - rect.left - rect.width / 2) / rect.width;
        const cy = (e.clientY - rect.top - rect.height / 2) / rect.height;
        layer.style.transform = `translate(${cx * 26}px, ${cy * 26}px)`;
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => { window.removeEventListener("mousemove", onMove); if (raf) cancelAnimationFrame(raf); };
  }, []);

  return (
    <div
      ref={layerRef}
      className={`absolute pointer-events-none overflow-hidden ${className}`}
      style={{ top: "-8%", left: "-8%", right: "-8%", bottom: "-8%", willChange: "transform" }}
    >
      {DEFAULT_BLOBS.map((b, i) => (
        <div
          key={i}
          className={`absolute rounded-full blur-[120px] ${b.anim}`}
          style={{
            ...b.pos,
            background: `radial-gradient(circle, ${b.color}, transparent 70%)`,
            opacity: b.opacity,
            animationDelay: b.delay,
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}