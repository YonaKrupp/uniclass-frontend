import React from "react";
import { UserPlus, Search, Video } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import WSection from "@/components/welcome/ui/WSection";
import { STEPS } from "./englishLandingContent";

const ICONS = [UserPlus, Search, Video];

/** שלושת השלבים מההרשמה ועד השיעור האונליין. */
export default function EnglishHowItWorks() {
  return (
    <WSection
      id="how-it-works"
      tone="tint"
      eyebrow="שלושה שלבים"
      title="איך זה עובד"
      subtitle="מהרישום ועד השיעור הראשון — הכול בתוך הפלטפורמה."
    >
      <ol className="mt-12 grid gap-5 md:grid-cols-3">
        {STEPS.map((step, index) => {
          const Icon = ICONS[index];
          return (
            <Reveal key={step.title} delay={index * 80} as="li">
              <div className="wl-glass h-full rounded-3xl p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mint/10 text-mint">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="font-heading text-xs font-bold tracking-widest text-muted-foreground">
                    שלב {index + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-heading text-lg font-bold text-foreground">{step.title}</h3>
                <p className="mt-2 font-body text-sm font-light leading-relaxed text-muted-foreground">{step.text}</p>
              </div>
            </Reveal>
          );
        })}
      </ol>
    </WSection>
  );
}