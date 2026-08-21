import React from "react";

/**
 * SectionGlow — a decorative blurred indigo seam placed between sections.
 * The blob straddles the boundary (extends above and below) so it visually
 * bridges the two sections and softens the transition instead of a hard line.
 */
export default function SectionGlow({ align = "center", color = "hsl(262 67% 35%)", className = "" }) {
  const pos =
    align === "left" ? "left-[16%]" :
    align === "right" ? "right-[16%]" :
    "left-1/2 -translate-x-1/2";
  return (
    <div className={`relative pointer-events-none ${className}`} aria-hidden="true">
      <div
        className={`absolute -top-[120px] ${pos} w-[820px] h-[320px] rounded-full blur-[150px] opacity-[0.09] dark:opacity-[0.18]`}
        style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }}
      />
    </div>
  );
}