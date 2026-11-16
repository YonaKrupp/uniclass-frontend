import React from "react";
import { GraduationCap, BookOpen, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import MagneticLink from "./MagneticLink";
import { useRole, ROLE_TEACHER, ROLE_STUDENT } from "./WelcomeRoleContext";
import { trackEvent, withAttribution } from "./useWelcomeAnalytics";

/**
 * The page's two entry paths — students and teachers — always shown together,
 * whether or not the visitor is already signed in.
 */
export default function WelcomeHeroActions() {
  const { role } = useRole();

  const showStudent = role !== ROLE_TEACHER;
  const showTeacher = role !== ROLE_STUDENT;

  return (
    <div className="wl-rise wl-rise-3 relative mt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {showStudent && (
          <MagneticLink
            to={withAttribution("/student-login")}
            strength={5}
            onClick={() => trackEvent("login_click", { location: "hero" })}
            className="wl-btn wl-btn-student justify-center px-7 py-3.5 text-sm md:text-base"
          >
            <GraduationCap className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
            התחברות כתלמיד/ה
          </MagneticLink>
        )}
        {showTeacher && (
          <MagneticLink
            to={withAttribution("/teacher-login")}
            strength={5}
            onClick={() => trackEvent("login_click", { location: "hero" })}
            className="wl-btn wl-btn-teacher justify-center px-7 py-3.5 text-sm md:text-base"
          >
            <BookOpen className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
            התחברות כמורה
          </MagneticLink>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
        <span className="text-xs font-body text-muted-foreground md:text-sm">אין לכם חשבון?</span>
        {showStudent && (
          <Link
            to={withAttribution("/register-student")}
            onClick={() => trackEvent("signup_student_click", { location: "hero_bottom" })}
            className="inline-flex items-center gap-1 text-sm font-body font-semibold text-mint underline decoration-mint/40 underline-offset-4 transition-colors hover:decoration-mint"
          >
            הרשמה כתלמיד/ה
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
        {showTeacher && (
          <Link
            to={withAttribution("/register-teacher")}
            onClick={() => trackEvent("signup_teacher_click", { location: "hero_bottom" })}
            className="inline-flex items-center gap-1 text-sm font-body font-semibold text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary"
          >
            הרשמה כמורה
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}