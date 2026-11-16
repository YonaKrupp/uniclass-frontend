import React from "react";

/**
 * WelcomeBackground — soft drifting gradient blobs plus a faint light circle
 * that follows the cursor (via --wx / --wy set on the hero section).
 */
export default function WelcomeBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="welcome-blob absolute -top-24 -right-16 w-[340px] h-[340px] md:w-[440px] md:h-[440px] rounded-full blur-[110px] opacity-25"
        style={{ background: "radial-gradient(circle, hsl(266 64% 48%), transparent 70%)" }}
      />
      <div
        className="welcome-blob-slow absolute top-1/3 -left-24 w-[300px] h-[300px] md:w-[380px] md:h-[380px] rounded-full blur-[110px] opacity-20"
        style={{ background: "radial-gradient(circle, hsl(160 70% 45%), transparent 70%)" }}
      />
      <div
        className="welcome-blob absolute -bottom-28 right-1/4 w-[280px] h-[280px] rounded-full blur-[120px] opacity-15"
        style={{ background: "radial-gradient(circle, hsl(266 70% 60%), transparent 70%)" }}
      />
      <div
        className="absolute left-1/2 top-1/2 w-[260px] h-[260px] -ml-[130px] -mt-[130px] rounded-full transition-transform duration-500 ease-out"
        style={{
          transform: "translate3d(calc(var(--wx, 0) * 70px), calc(var(--wy, 0) * 70px), 0)",
          background: "radial-gradient(circle, hsl(266 64% 60% / 0.12), transparent 70%)",
        }}
      />
    </div>
  );
}