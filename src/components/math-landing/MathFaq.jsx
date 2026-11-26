import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import WSection from "@/components/welcome/ui/WSection";
import { FAQ } from "./mathLandingContent";

/** ארבע שאלות נפוצות על הרשמה, קביעת שיעור, ביטולים והתאמה. */
export default function MathFaq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <WSection
      id="faq"
      eyebrow="לפני שמתחילים"
      title="שאלות נפוצות"
      subtitle="התשובות הקצרות על הרשמה, קביעת שיעור וביטולים."
    >
      <div className="mx-auto mt-12 max-w-3xl space-y-2.5">
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
                    id={`math-faq-button-${index}`}
                    aria-expanded={isOpen}
                    aria-controls={`math-faq-panel-${index}`}
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-right"
                  >
                    <span className="font-heading text-sm font-semibold text-foreground md:text-base">{item.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                <div
                  id={`math-faq-panel-${index}`}
                  role="region"
                  aria-labelledby={`math-faq-button-${index}`}
                  hidden={!isOpen}
                  className="px-5 pb-4"
                >
                  <p className="font-body text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </WSection>
  );
}