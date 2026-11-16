import React from "react";
import { BookMarked, CalendarClock, ClipboardCheck, MessagesSquare, Star } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import WSection from "./ui/WSection";
import WCard from "./ui/WCard";
import { usePointerParallax } from "./usePointerParallax";

const POINTS = [
  { icon: BookMarked, text: "מכירים את החומר מבפנים" },
  { icon: ClipboardCheck, text: "עברו את הקורסים והמבחנים" },
  { icon: MessagesSquare, text: "מדברים בגובה העיניים" },
];

// Clearly generic sample cards — initials only, no real names, no real photos.
const SAMPLES = [
  { initial: "מ׳", subject: "מתמטיקה", detail: "שנה ג׳ · מדעים מדויקים" },
  { initial: "נ׳", subject: "פיזיקה", detail: "שנה ב׳ · הנדסה" },
  { initial: "א׳", subject: "מדעי המחשב", detail: "בוגר/ת · מדעי המחשב" },
  { initial: "ש׳", subject: "אנגלית", detail: "שנה ד׳ · מדעי הרוח" },
  { initial: "ד׳", subject: "כימיה", detail: "שנה ג׳ · מדעי הטבע" },
];

function TeacherCard({ sample }) {
  return (
    <WCard className="wl-accent-teacher min-w-[228px] shrink-0 p-4 sm:min-w-0 md:p-5">
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-heading text-base font-bold text-white"
          style={{ background: "linear-gradient(140deg, hsl(266 64% 42%), hsl(276 78% 60%))" }}
        >
          {sample.initial}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-heading font-bold text-foreground">{sample.subject}</p>
          <p className="mt-0.5 text-[11px] font-body text-muted-foreground">{sample.detail}</p>
        </div>
        <span className="mr-auto shrink-0 rounded-full border border-dashed border-[hsl(var(--wl-hair))] px-1.5 py-0.5 text-[9px] font-body text-muted-foreground">
          כרטיס לדוגמה
        </span>
      </div>

      <div className="mt-3 flex items-center gap-0.5 text-muted-foreground/50">
        {[0, 1, 2, 3, 4].map((star) => (
          <Star key={star} className="h-3 w-3" aria-hidden="true" />
        ))}
        <span className="mr-1.5 text-[10px] font-body text-muted-foreground">דירוג אחרי השיעור הראשון</span>
      </div>

      <div className="mt-2.5 flex items-center gap-1.5 rounded-xl bg-muted/50 px-2 py-1.5 text-[10px] font-body text-muted-foreground">
        <CalendarClock className="h-3 w-3 shrink-0" aria-hidden="true" />
        זמינות הבאה: לפי היומן של המורה
      </div>
    </WCard>
  );
}

export default function WelcomeTeachers() {
  const sectionRef = usePointerParallax();

  return (
    <div ref={sectionRef}>
      <WSection id="teachers">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:gap-14">
          <Reveal>
            <p className="wl-eyebrow">המורים שלנו</p>
            <h2
              id="welcome-teachers-title"
              className="mt-3 text-[28px] font-heading font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-4xl md:text-[42px]"
            >
              סטודנטים <span className="wl-grad-teacher">מהאוניברסיטאות</span>
            </h2>
            <p className="mt-3 max-w-sm text-base font-body font-light leading-relaxed text-muted-foreground">
              מורים שעברו את הקורס והמבחן בעצמם, ומכירים את החומר מבפנים.
            </p>

            <ul className="mt-6 space-y-2.5">
              {POINTS.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-center gap-3 rounded-2xl border border-[hsl(var(--wl-hair))] bg-card/60 px-3.5 py-2.5 text-sm font-body text-foreground md:text-[15px]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={80}>
            <div className="flex gap-3 overflow-x-auto pb-2 wl-scroll-x sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0">
              <div className="flex gap-3 sm:block sm:space-y-3 md:space-y-4">
                {[SAMPLES[0], SAMPLES[2], SAMPLES[4]].map((sample) => (
                  <TeacherCard key={sample.subject} sample={sample} />
                ))}
              </div>
              <div className="flex gap-3 sm:block sm:space-y-3 sm:pt-7 md:space-y-4 md:pt-9">
                {[SAMPLES[1], SAMPLES[3]].map((sample) => (
                  <TeacherCard key={sample.subject} sample={sample} />
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </WSection>
    </div>
  );
}