import React from "react";
import { Quote } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import { SOCIAL_PROOF } from "./welcomeConfig";

/**
 * Social proof — intentionally empty until real content exists.
 * Fill `SOCIAL_PROOF` in welcomeConfig.js and flip `enabled` to true.
 */
export default function WelcomeSocialProof() {
  const { quote, partners } = SOCIAL_PROOF;
  const hasQuote = quote.enabled && quote.text;
  const hasPartners = partners.enabled && partners.items.length > 0;
  if (!hasQuote && !hasPartners) return null;

  return (
    <section aria-labelledby="welcome-proof-title" className="relative py-14 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h2 id="welcome-proof-title" className="sr-only">
          המלצות ושותפים
        </h2>

        {hasQuote && (
          <Reveal>
            <figure className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-sm">
              <Quote className="w-7 h-7 welcome-role-text" aria-hidden="true" />
              <blockquote className="mt-3 text-base md:text-lg font-body text-foreground leading-relaxed">
                {quote.text}
              </blockquote>
              <figcaption className="mt-4 text-sm font-body text-muted-foreground">
                {quote.author}
                {quote.role ? ` · ${quote.role}` : ""}
              </figcaption>
            </figure>
          </Reveal>
        )}

        {hasPartners && (
          <Reveal delay={80}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
              {partners.items.map((partner) => (
                <div key={partner.name} className="flex items-center justify-center rounded-xl border border-border bg-card px-5 py-3">
                  {partner.logo ? (
                    <img src={partner.logo} alt={partner.name} className="h-7 w-auto" loading="lazy" />
                  ) : (
                    <span className="text-sm font-body font-semibold text-muted-foreground">{partner.name}</span>
                  )}
                </div>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}