import React from "react";

/**
 * WelcomeBanner — image-led greeting banner that fills the top of dashboard
 * pages with character. Image sits behind a gradient scrim so the RTL text on
 * the right stays readable while the photo peeks through on the left.
 */
export default function WelcomeBanner({ image, badge, title, subtitle, children }) {
  return (
    <div className="app-fade-up relative overflow-hidden rounded-2xl border border-border">
      <img
        src={image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      {/* Scrim: solid on the right (text side), fading left so the photo shows */}
      <div className="absolute inset-0 bg-gradient-to-l from-background via-background/85 to-background/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />

      <div className="relative z-10 p-6 sm:p-8 min-h-[176px] flex flex-col justify-center max-w-xl">
        {badge && (
          <span className="inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-heading font-semibold mb-3 backdrop-blur-sm">
            {badge}
          </span>
        )}
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">{title}</h1>
        {subtitle && <p className="text-muted-foreground font-body mt-1.5">{subtitle}</p>}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}