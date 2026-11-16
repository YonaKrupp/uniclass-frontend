import React, { useEffect, useRef, useState } from "react";
import { Users, CalendarClock, Video, UserPlus, GraduationCap } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import WSection from "./ui/WSection";
import WelcomeStepMock from "./WelcomeStepMock";
import { ROLE_TEACHER, useRole } from "./WelcomeRoleContext";
import { trackEvent } from "./useWelcomeAnalytics";

const CONTENT = {
  students: [
    { icon: Users, title: "מצאו מורה", text: "חיפוש לפי מקצוע, מחיר וזמינות." },
    { icon: CalendarClock, title: "קבעו שיעור", text: "בחירת מועד פנוי מהיומן בלחיצה." },
    { icon: Video, title: "למדו והתקדמו", text: "שיעור בכיתה הווירטואלית, וסיכום אוטומטי בסיומו." },
  ],
  teachers: [
    { icon: UserPlus, title: "צרו פרופיל", text: "מקצועות, ניסיון ופרטים בכמה דקות." },
    { icon: CalendarClock, title: "הגדירו זמינות ומחיר", text: "אתם קובעים מתי וכמה." },
    { icon: GraduationCap, title: "קבלו תלמידים", text: "הזמנות, יומן ותשלום מאובטח במקום אחד." },
  ],
};

const TABS = [
  { key: "students", label: "לתלמידים" },
  { key: "teachers", label: "למורים" },
];

export default function WelcomeHowItWorks() {
  const { role, setRole } = useRole();
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);

  const tab = role === ROLE_TEACHER ? "teachers" : "students";
  const steps = CONTENT[tab];
  const activeIndex = progress < 0.32 ? 0 : progress < 0.64 ? 1 : 2;

  useEffect(() => {
    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const el = sectionRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const viewport = window.innerHeight;
        const start = rect.top - viewport * 0.85;
        const end = rect.top + rect.height - viewport * 0.45;
        const ratio = end - start <= 0 ? 1 : -start / (end - start);
        setProgress(Math.min(1, Math.max(0, ratio)));
      });
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={sectionRef}>
      <WSection
        id="how-it-works"
        tone="tint"
        eyebrow="התהליך"
        title="איך זה עובד"
        titleId="welcome-how-title"
        subtitle="שלושה צעדים לכל צד."
      >
        <Reveal delay={60} className="mt-8 flex justify-center">
          <div
            role="tablist"
            aria-label="איך זה עובד — למי"
            className="inline-flex rounded-full border border-[hsl(var(--wl-hair))] bg-card/80 p-1 backdrop-blur"
          >
            {TABS.map((item) => (
              <button
                key={item.key}
                role="tab"
                aria-selected={tab === item.key}
                onClick={() => {
                  setRole(item.key === "teachers" ? "teacher" : "student");
                  trackEvent("role_toggle", {
                    role: item.key === "teachers" ? "teacher" : "student",
                    source: "how_it_works",
                  });
                }}
                className={`welcome-role-ring rounded-full px-5 py-2 text-sm font-body font-semibold transition-all duration-200 ${
                  tab === item.key
                    ? item.key === "teachers"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-mint text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="relative mt-14">
          <div
            aria-hidden="true"
            className="absolute inset-x-[16%] top-0 hidden h-px bg-[hsl(var(--wl-hair))] md:block"
          >
            <div
              className="h-full w-full origin-right welcome-role-grad-bg transition-transform duration-300 ease-out"
              style={{ transform: `scaleX(${progress})` }}
            />
          </div>

          <div key={tab} className="welcome-step-in relative grid gap-6 md:grid-cols-3 md:gap-5">
            {steps.map((step, index) => {
              const isActive = index === activeIndex;
              return (
                <div
                  key={step.title}
                  className={`relative rounded-3xl border p-5 pt-8 transition-all duration-500 md:p-6 md:pt-9 ${
                    isActive ? "wl-step-active md:-translate-y-1.5" : "wl-step-idle"
                  }`}
                >
                  <span
                    className={`absolute -top-4 right-5 flex h-9 w-9 items-center justify-center rounded-full font-heading text-sm font-bold transition-all duration-500 ${
                      isActive
                        ? "welcome-role-grad-bg text-white shadow-lg ring-4 ring-background"
                        : "border border-[hsl(var(--wl-hair))] bg-background text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </span>

                  <WelcomeStepMock tab={tab} index={index} />

                  <div className="mt-4 flex items-center gap-2">
                    <step.icon
                      className={`h-4 w-4 shrink-0 ${isActive ? "welcome-role-text" : "text-muted-foreground"}`}
                      aria-hidden="true"
                    />
                    <h3 className="text-base font-heading font-semibold text-foreground md:text-lg">{step.title}</h3>
                  </div>
                  <p className="mt-1.5 text-sm font-body font-light leading-relaxed text-muted-foreground">{step.text}</p>
                </div>
              );
            })}
          </div>

          <div aria-hidden="true" className="mt-5 h-1 overflow-hidden rounded-full bg-[hsl(var(--wl-hair))] md:hidden">
            <div
              className="h-full w-full origin-right welcome-role-grad-bg transition-transform duration-300 ease-out"
              style={{ transform: `scaleX(${progress})` }}
            />
          </div>
        </div>
      </WSection>
    </div>
  );
}