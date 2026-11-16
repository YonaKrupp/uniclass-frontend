import React from "react";
import Reveal from "@/components/landing/Reveal";

const TONE = {
  light: "",
  tint: "wl-tint",
  dark: "wl-band",
};

/**
 * A landing-page section: consistent vertical rhythm, max width 1200px,
 * an optional eyebrow / title / subtitle block and one of three surfaces.
 */
export default function WSection({
  id,
  tone = "light",
  eyebrow,
  title,
  titleId,
  subtitle,
  align = "center",
  width = "wide",
  className = "",
  children,
}) {
  const dark = tone === "dark";
  const maxWidth = width === "narrow" ? "max-w-4xl" : "max-w-[1200px]";

  return (
    <section id={id} className={`relative scroll-mt-24 ${TONE[tone]} ${dark ? "text-white" : ""} ${className}`}>
      {dark && <div aria-hidden="true" className="wl-band-lines" />}
      <div className={`relative mx-auto ${maxWidth} px-5 sm:px-8 py-16 md:py-24`}>
        {(eyebrow || title) && (
          <Reveal className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
            {eyebrow && <p className="wl-eyebrow">{eyebrow}</p>}
            {title && (
              <h2
                id={titleId}
                className={`mt-3 text-[28px] leading-[1.12] sm:text-4xl md:text-[42px] font-heading font-extrabold tracking-tight ${
                  dark ? "text-white" : "text-foreground"
                }`}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={`mt-3 text-base md:text-lg font-body font-light ${dark ? "text-white/70" : "text-muted-foreground"}`}>
                {subtitle}
              </p>
            )}
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}