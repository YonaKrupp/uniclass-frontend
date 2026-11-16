import React from "react";

/** Numbered flow marker (1 → 2 → 3) shown on each satellite card. */
export function HeroBadge({ children }) {
  return (
    <span className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-primary font-body text-[13px] font-bold leading-none text-primary-foreground">
      {children}
    </span>
  );
}

/** Thin dotted connector between a satellite card and the lesson window. */
export function HeroStem({ className = "" }) {
  return <span aria-hidden="true" className={`hs-stem ${className}`} />;
}