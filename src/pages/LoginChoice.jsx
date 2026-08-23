import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, BookOpen, ArrowLeft, ShieldCheck, CalendarClock, BadgeCheck } from "lucide-react";
import MeshGradient from "@/components/landing/MeshGradient";

const trustPills = [
  { icon: ShieldCheck, label: "תשלום מאובטח", tone: "indigo" },
  { icon: CalendarClock, label: "גמישות מלאה", tone: "indigo" },
  { icon: BadgeCheck, label: "ללא התחייבות", tone: "mint" },
];

export default function LoginChoice() {
  return (
    <div dir="rtl" className="landing relative min-h-screen overflow-hidden flex items-center justify-center p-4 sm:p-8">
      {/* Animated mesh gradient (same as Hero) */}
      <MeshGradient className="inset-0" />
      {/* Dot-grid texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black, transparent 80%)",
        }}
      />

      <div className="relative z-10 w-full max-w-3xl">
        {/* Brand mark */}
        <div className="app-fade-up flex flex-col items-center mb-10">
          <img
            src="https://media.base44.com/images/public/6a37f1517bf59551c5f4b6f9/0cf1a42dc_Logo_UNICLASS_2_PNG.png"
            alt="UniClass"
            className="h-12 w-auto mb-5"
          />
          <h1 className="text-3xl sm:text-4xl font-heading font-semibold tracking-tight text-center text-foreground mb-2">
            כניסה ל<span className="land-gradient-text">UniClass</span>
          </h1>
          <p className="text-muted-foreground font-body font-light text-center">בחרו סוג משתמש לכניסה</p>
        </div>

        {/* Two large side-by-side choice cards */}
        <div className="grid sm:grid-cols-2 gap-5 sm:gap-6 app-fade-up-d1">
          {/* Teacher — indigo accent */}
          <Link
            to="/teacher-login"
            className="group relative bg-card rounded-3xl border border-border p-7 sm:p-8 text-center shadow-lg transition-all duration-300 overflow-hidden pointer-events-none opacity-60 cursor-not-allowed"
          >
            <div
              className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-[90px] opacity-[0.13] pointer-events-none"
              style={{ background: "radial-gradient(circle, hsl(262 67% 35%), transparent 70%)" }}
            />
            <div className="relative">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-primary/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-heading font-semibold text-foreground mb-1.5">כניסת מורה</h2>
              <p className="text-sm text-muted-foreground font-body font-light mb-6">נהלו שיעורים, תלמידים והכנסות</p>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-body font-semibold shadow-md shadow-primary/25 group-hover:shadow-lg transition-all">
                התחברו כמורה <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              </span>
            </div>
          </Link>

          {/* Student — mint accent */}
          <Link
            to="/student-login"
            className="group relative bg-card rounded-3xl border border-border p-7 sm:p-8 text-center shadow-lg transition-all duration-300 overflow-hidden pointer-events-none opacity-60 cursor-not-allowed"
          >
            <div
              className="absolute -top-16 -left-16 w-48 h-48 rounded-full blur-[90px] opacity-[0.13] pointer-events-none"
              style={{ background: "radial-gradient(circle, hsl(160 84% 39%), transparent 70%)" }}
            />
            <div className="relative">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-mint/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <GraduationCap className="w-8 h-8 text-mint" />
              </div>
              <h2 className="text-xl font-heading font-semibold text-foreground mb-1.5">כניסת תלמיד</h2>
              <p className="text-sm text-muted-foreground font-body font-light mb-6">מצאו מורים ולמדו בקלות</p>
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-mint text-mint-foreground text-sm font-body font-semibold shadow-md shadow-mint/25 group-hover:shadow-lg transition-all">
                התחברו כתלמיד <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              </span>
            </div>
          </Link>
        </div>

        {/* Trust pills (same component language as Hero) */}
        <div className="app-fade-up-d2 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mt-10">
          {trustPills.map((pill) => (
            <div key={pill.label} className="flex items-center gap-2 text-sm font-body font-medium text-muted-foreground">
              <span className={`flex items-center justify-center w-7 h-7 rounded-full ${pill.tone === "mint" ? "bg-mint/10 text-mint" : "bg-primary/10 text-primary"}`}>
                <pill.icon className="w-4 h-4" />
              </span>
              {pill.label}
            </div>
          ))}
        </div>

        <Link
          to="/"
          className="app-fade-up-d3 block text-center mt-7 text-sm text-muted-foreground hover:text-primary font-body transition-colors"
        >
          חזרה לדף הבית
        </Link>
      </div>
    </div>
  );
}