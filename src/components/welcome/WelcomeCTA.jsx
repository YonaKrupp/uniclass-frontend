import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, BookOpen } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import MagneticLink from "./MagneticLink";
import { usePointerParallax } from "./usePointerParallax";
import { trackEvent, withAttribution } from "./useWelcomeAnalytics";

const SHAPES = [
  { className: "top-[10%] right-[7%] w-20 h-20 rounded-[26px]", depth: 26 },
  { className: "bottom-[16%] right-[20%] w-10 h-10 rounded-full", depth: 40 },
  { className: "top-[16%] left-[9%] w-14 h-14 rounded-full", depth: 32 },
  { className: "bottom-[8%] left-[22%] w-24 h-24 rounded-[30px]", depth: 18 },
];

function RoleColumn({ role }) {
  const isStudent = role === "student";
  return (
    <div className="flex flex-col items-center gap-2.5">
      <MagneticLink
        to={withAttribution(isStudent ? "/register-student" : "/register-teacher")}
        onClick={() =>
          trackEvent(isStudent ? "signup_student_click" : "signup_teacher_click", { location: "final_cta" })
        }
        className={`wl-btn ${isStudent ? "wl-btn-student" : "wl-btn-teacher"} w-full px-7 py-3.5 text-sm ring-1 ring-white/40 sm:w-auto md:text-base`}
      >
        {isStudent ? <GraduationCap className="w-5 h-5" aria-hidden="true" /> : <BookOpen className="w-5 h-5" aria-hidden="true" />}
        {isStudent ? "הרשמה כתלמיד/ה" : "הרשמה כמורה"}
      </MagneticLink>
      <Link
        to={isStudent ? "/student-login" : "/teacher-login"}
        onClick={() => trackEvent("login_click", { location: "final_cta" })}
        className="text-xs font-body text-white/80 underline underline-offset-4 transition-colors hover:text-white md:text-sm"
      >
        כבר רשום? התחברות
      </Link>
    </div>
  );
}

export default function WelcomeCTA() {
  const bandRef = usePointerParallax();

  return (
    <section aria-labelledby="welcome-cta-title" className="relative px-5 py-16 sm:px-8 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <div
            ref={bandRef}
            className="relative overflow-hidden rounded-[32px] px-6 py-14 text-center shadow-2xl shadow-primary/25 md:rounded-[40px] md:px-14 md:py-20"
            style={{
              background:
                "linear-gradient(135deg, hsl(262 66% 24%) 0%, hsl(268 72% 40%) 48%, hsl(276 80% 54%) 100%)",
            }}
          >
            <div aria-hidden="true" className="wl-band-lines" />

            {SHAPES.map((shape, index) => (
              <div
                key={index}
                aria-hidden="true"
                className={`absolute bg-white/10 ${shape.className}`}
                style={{
                  transform: `translate3d(calc(var(--wx, 0) * ${shape.depth}px), calc(var(--wy, 0) * ${shape.depth}px), 0)`,
                  transition: "transform 0.5s ease-out",
                }}
              />
            ))}

            <div className="relative">
              <h2
                id="welcome-cta-title"
                className="text-[30px] font-heading font-extrabold leading-tight tracking-tight text-white sm:text-5xl md:text-[54px]"
              >
                מוכנים להתחיל?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm font-body font-light text-white/75 md:text-base">
                בחרו את הצד שלכם — ההרשמה בחינם.
              </p>

              <div className="mx-auto mt-8 grid max-w-lg gap-6 sm:grid-cols-2 sm:gap-8">
                <RoleColumn role="student" />
                <RoleColumn role="teacher" />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}