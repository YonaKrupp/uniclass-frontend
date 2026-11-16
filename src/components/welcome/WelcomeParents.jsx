import React from "react";
import { ArrowLeft, CalendarX, Receipt, ShieldCheck } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import WSection from "./ui/WSection";
import WButton from "./ui/WButton";
import { trackEvent, withAttribution } from "./useWelcomeAnalytics";

const LINES = [
  { icon: ShieldCheck, title: "תשלום מאובטח", text: "בכרטיס אשראי דרך הפלטפורמה, בלי העברות למורה." },
  { icon: Receipt, title: "חשבונית על כל שיעור", text: "מונפקת על ידי המורה או ספק חיצוני, בהתאם לדין." },
  { icon: CalendarX, title: "ביטול נוח עד 24 שעות לפני", text: "ביטול עד 24 שעות לפני השיעור — ללא חיוב והחזר מלא." },
];

export default function WelcomeParents() {
  return (
    <WSection id="parents" tone="tint" eyebrow="להורים" title="הורים? הכל שקוף ובטח" titleId="welcome-parents-title">
      <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
        {LINES.map(({ icon: Icon, title, text }, index) => (
          <Reveal key={title} delay={index * 70}>
            <div className="h-full rounded-3xl border border-[hsl(var(--wl-hair))] bg-card/60 p-5 transition-colors hover:border-mint/35 md:p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-mint/10 text-mint">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-base font-heading font-semibold text-foreground md:text-lg">{title}</h3>
              <p className="mt-1.5 text-sm font-body font-light leading-relaxed text-muted-foreground">{text}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <WButton
          to={withAttribution("/register-student")}
          variant="student"
          onClick={() => trackEvent("signup_student_click", { location: "parents" })}
        >
          הרשמה כתלמיד או להורה
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </WButton>
      </div>
    </WSection>
  );
}