import React from "react";
import { CalendarX, ShieldCheck, GraduationCap } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import WSection from "@/components/welcome/ui/WSection";
import { WHY } from "./mathLandingContent";

const ICONS = [CalendarX, ShieldCheck, GraduationCap];

/** שלוש הסיבות שמצוינות באתר — ביטול, תשלום ומורים סטודנטים. */
export default function MathWhy() {
  return (
    <WSection
      id="why"
      tone="tint"
      eyebrow="למה UniClass"
      title="שיעור פרטי בלי סיבוכים"
      subtitle="כל מה שצריך כדי לקבוע שיעור מתמטיקה אחד, בלי התחייבות ארוכה."
    >
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {WHY.map((item, index) => {
          const Icon = ICONS[index];
          return (
            <Reveal key={item.title} delay={index * 80}>
              <div className="wl-glass h-full rounded-3xl p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mint/10 text-mint">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-heading text-lg font-bold text-foreground">{item.title}</h3>
                <p className="mt-2 font-body text-sm font-light leading-relaxed text-muted-foreground">{item.text}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </WSection>
  );
}