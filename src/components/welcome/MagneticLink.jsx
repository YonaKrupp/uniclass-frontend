import React, { useRef } from "react";
import { Link } from "react-router-dom";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * MagneticLink — a link that gently follows the cursor and lifts on hover.
 * Pure CSS transitions, transforms only.
 */
export default function MagneticLink({ to, className = "", children, strength = 6, ...rest }) {
  const ref = useRef(null);
  const rafRef = useRef(0);

  const handleMove = (e) => {
    if (prefersReducedMotion() || rafRef.current) return;
    const el = ref.current;
    if (!el) return;
    rafRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2 * strength;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2 * strength;
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(1.02)`;
      rafRef.current = 0;
    });
  };

  const handleLeave = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <Link
      ref={ref}
      to={to}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`inline-flex items-center justify-center gap-2 transition-[transform,box-shadow,background-color] duration-200 ease-out will-change-transform ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}