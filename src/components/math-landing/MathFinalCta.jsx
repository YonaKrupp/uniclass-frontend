import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import Reveal from "@/components/landing/Reveal";

/** קריאה חוזרת להרשמה בסוף הדף. */
export default function MathFinalCta() {
  return (
    <section aria-labelledby="math-cta-title" className="relative px-5 py-16 sm:px-8 md:py-24">
      <div className="mx-auto max-w-[1200px]">
        <Reveal>
          <div className="wl-band relative overflow-hidden rounded-[32px] px-6 py-14 text-center md:rounded-[40px] md:px-14 md:py-20">
            <div aria-hidden="true" className="wl-band-lines" />
            <div className="relative">
              <h2
                id="math-cta-title"
                className="text-[28px] font-heading font-extrabold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl"
              >
                מוכנים לשיעור מתמטיקה ראשון?
              </h2>
              <p className="mx-auto mt-3 max-w-md font-body text-sm font-light text-white/75 md:text-base">
                ההרשמה בחינם, ובוחרים מועד שנוח לכם.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3">
                <Link
                  to="/register-student"
                  className="wl-btn wl-btn-student w-full px-7 py-3.5 text-sm ring-1 ring-white/40 sm:w-auto md:text-base"
                >
                  <GraduationCap className="h-5 w-5" aria-hidden="true" />
                  הרשמה כתלמיד/ה
                </Link>
                <Link
                  to="/student-login"
                  className="text-xs font-body text-white/80 underline underline-offset-4 transition-colors hover:text-white md:text-sm"
                >
                  כבר רשום? התחברות
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}