import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import WSection from "./ui/WSection";
import { FAQ } from "./welcomeConfig";
import { trackEvent } from "./useWelcomeAnalytics";

export default function WelcomeFAQ() {
  const [openIndex, setOpenIndex] = useState(-1);

  const toggle = (index) => {
    const next = openIndex === index ? -1 : index;
    setOpenIndex(next);
    if (next !== -1) trackEvent("faq_open", { question: FAQ[index].q });
  };

  return (
    <WSection id="faq">
      <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <p className="wl-eyebrow">לפני שמתחילים</p>
          <h2
            id="welcome-faq-title"
            className="mt-3 text-[28px] font-heading font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-4xl"
          >
            שאלות נפוצות
          </h2>
          <p className="mt-3 max-w-xs text-base font-body font-light leading-relaxed text-muted-foreground">
            למי זה מתאים, איך בוחרים מורה, בטיחות, ביטולים והצטרפות — בשקיפות מלאה, לפני שמתחילים.
          </p>
        </Reveal>

        <div className="space-y-2.5">
          {FAQ.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <Reveal key={item.q} delay={index * 50}>
                <div
                  className={`overflow-hidden rounded-2xl border bg-card/70 backdrop-blur transition-colors duration-300 ${
                    isOpen ? "border-primary/35" : "border-[hsl(var(--wl-hair))] hover:border-primary/25"
                  }`}
                >
                  <h3>
                    <button
                      type="button"
                      id={`faq-button-${index}`}
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${index}`}
                      onClick={() => toggle(index)}
                      className="welcome-role-ring flex w-full items-center justify-between gap-4 px-5 py-4 text-right"
                    >
                      <span className="text-sm font-heading font-semibold text-foreground md:text-base">{item.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </h3>
                  <div
                    id={`faq-panel-${index}`}
                    role="region"
                    aria-labelledby={`faq-button-${index}`}
                    aria-hidden={!isOpen}
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden px-5 pb-4">
                      {Array.isArray(item.a) ? (
                        <ul className="space-y-1.5 text-sm font-body leading-relaxed text-muted-foreground">
                          {item.a.map((line) => (
                            <li key={line} className="flex gap-2">
                              <span
                                aria-hidden="true"
                                className="mt-[0.6em] h-1 w-1 shrink-0 rounded-full bg-primary/60"
                              />
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm font-body leading-relaxed text-muted-foreground">{item.a}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </WSection>
  );
}