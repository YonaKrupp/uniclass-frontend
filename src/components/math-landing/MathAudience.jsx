import React from "react";
import { School, Award, GraduationCap } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import WSection from "@/components/welcome/ui/WSection";
import { AUDIENCE } from "./mathLandingContent";

const ICONS = [School, Award, GraduationCap];

/** למי השיעורים מתאימים — חטיבה ותיכון, בגרות וסטודנטים. */
export default function MathAudience() {
  return (
    <WSection
      id="audience"
      eyebrow="למי זה מתאים"
      title="מתמטיקה בכל הרמות"
      subtitle="משיעור אחד לפני מבחן ועד ליווי לאורך הסמסטר."
    >
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {AUDIENCE.map((item, index) => {
          const Icon = ICONS[index];
          return (
            <Reveal key={item.title} delay={index * 80}>
              <div className="wl-glass h-full rounded-3xl p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
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