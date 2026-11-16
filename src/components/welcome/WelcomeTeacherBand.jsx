import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CalendarClock, Check, CreditCard, Wallet } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import WButton from "./ui/WButton";
import { trackEvent, withAttribution } from "./useWelcomeAnalytics";

const POINTS = [
  { icon: Wallet, label: "אתם קובעים מחיר" },
  { icon: CalendarClock, label: "אתם קובעים שעות" },
  { icon: CreditCard, label: "תשלום דרך הפלטפורמה" },
];

/** Dark contrast band: the teacher recruiting message, with its own CTA. */
export default function WelcomeTeacherBand() {
  return (
    <section aria-labelledby="welcome-band-title" className="wl-band relative overflow-hidden">
      <div aria-hidden="true" className="wl-band-lines" />
      <div
        aria-hidden="true"
        className="wl-aurora pointer-events-none absolute -left-24 -top-24 h-[380px] w-[380px] rounded-full blur-[100px]"
        style={{ background: "hsl(276 85% 65% / 0.35)" }}
      />

      <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 px-5 py-16 sm:px-8 md:py-24 lg:grid-cols-[1.08fr_0.92fr]">
        <Reveal>
          <p className="wl-eyebrow" style={{ color: "hsl(268 92% 84%)" }}>
            למורים
          </p>
          <h2
            id="welcome-band-title"
            className="mt-3 text-[30px] font-heading font-extrabold leading-[1.08] tracking-tight text-white sm:text-4xl md:text-[46px]"
          >
            אפס עלות עד שמרוויחים
          </h2>
          <p className="mt-3 max-w-md text-base font-body font-light leading-relaxed text-white/70 md:text-lg">
            אתם קובעים מחיר ושעות, לבד. פרופיל, זמינות ותשלום מאובטח במקום אחד, בלי בירוקרטיה.
          </p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {POINTS.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-[11px] font-body font-medium text-white/85 backdrop-blur md:text-xs"
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-white/70" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <WButton
              to={withAttribution("/register-teacher")}
              variant="white"
              onClick={() => trackEvent("signup_teacher_click", { location: "teacher_band" })}
            >
              הרשמה כמורה
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </WButton>
            <Link
              to={withAttribution("/teacher-login")}
              onClick={() => trackEvent("login_click", { location: "teacher_band" })}
              className="text-sm font-body text-white/75 underline decoration-white/30 underline-offset-4 transition-colors hover:text-white hover:decoration-white/70"
            >
              כבר רשום? התחברות
            </Link>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="relative mx-auto w-full max-w-[330px]">
            <div
              aria-hidden="true"
              className="absolute inset-6 rounded-full blur-2xl"
              style={{ background: "hsl(276 85% 65% / 0.35)" }}
            />
            <div className="wl-float relative rounded-3xl border border-white/15 bg-white/[0.07] p-4 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between text-[11px] font-body text-white/60">
                <span>תשלום על שיעור</span>
                <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 font-semibold text-emerald-300">מאובטח</span>
              </div>

              <div className="mt-3 space-y-2">
                {[
                  ["שיעור", "מתמטיקה · 45 דק׳"],
                  ["אמצעי תשלום", "כרטיס אשראי, דרך הפלטפורמה"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-xl bg-white/[0.06] px-3 py-2">
                    <span className="text-[10px] font-body text-white/55">{label}</span>
                    <span className="text-[11px] font-body font-medium text-white/90">{value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-2xl bg-white/10 p-3">
                <p className="text-[10px] font-body text-white/60">סטטוס התשלום</p>
                <p className="mt-1 flex items-center gap-1.5 font-heading text-lg font-bold text-white">
                  <Check className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                  אושר
                </p>
                <p className="mt-1 text-[10px] font-body text-white/55">הקבלה נשלחת למייל</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}