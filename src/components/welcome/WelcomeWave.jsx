import React from "react";

/** Soft wavy divider. The fill follows `currentColor`; pair it with a text-* class. */
export default function WelcomeWave({ className = "", flip = false }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-x-0 leading-none ${className}`}>
      <svg
        viewBox="0 0 1440 70"
        preserveAspectRatio="none"
        fill="currentColor"
        className={`block w-full h-6 md:h-10 ${flip ? "rotate-180" : ""}`}
      >
        <path d="M0,44 C240,4 420,66 720,38 C1020,10 1200,58 1440,26 L1440,70 L0,70 Z" />
      </svg>
    </div>
  );
}