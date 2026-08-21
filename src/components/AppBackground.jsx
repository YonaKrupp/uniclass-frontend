import React from "react";

/**
 * AppBackground — fixed ambient layer behind every app/auth page.
 * Subtle dot-grid texture + drifting color halos + a soft top glow.
 * Sits at -z-10 with pointer-events disabled, so it never blocks UI.
 * Respects prefers-reduced-motion (animations disabled via CSS).
 */
export default function AppBackground() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none overflow-hidden bg-background">
      {/* Dot-grid texture */}
      <div
        className="absolute inset-0 opacity-80 dark:opacity-70"
        style={{
          backgroundImage: "radial-gradient(hsl(var(--foreground) / 0.085) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage: "radial-gradient(ellipse 85% 75% at 50% 25%, black, transparent 85%)",
          WebkitMaskImage: "radial-gradient(ellipse 85% 75% at 50% 25%, black, transparent 85%)",
        }}
      />

      {/* Soft top glow */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[64rem] h-48 rounded-full blur-3xl opacity-80 dark:opacity-50"
        style={{ background: "radial-gradient(ellipse at center, hsl(var(--primary) / 0.22), transparent 70%)" }}
      />

      {/* Drifting halo — primary */}
      <div
        className="absolute top-1/4 -left-24 w-96 h-96 rounded-full blur-3xl animate-app-halo"
        style={{ background: "radial-gradient(circle at center, hsl(var(--primary) / 0.22), transparent 70%)" }}
      />

      {/* Drifting halo — secondary (cyan) */}
      <div
        className="absolute bottom-10 -right-24 w-[30rem] h-[30rem] rounded-full blur-3xl animate-app-halo-slow"
        style={{
          animationDelay: "-9s",
          background: "radial-gradient(circle at center, hsl(199 89% 48% / 0.18), transparent 70%)",
        }}
      />
    </div>
  );
}