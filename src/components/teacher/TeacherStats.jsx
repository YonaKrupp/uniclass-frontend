import React from "react";
import { Users, Calendar, BookOpen, Star, Loader2 } from "lucide-react";
import CountUp from "@/components/landing/CountUp";
import Reveal from "@/components/landing/Reveal";

/**
 * TeacherStats — teacher-specific stat cards in a 4-up row on desktop
 * (distinct from the student's 2x2 grid). Strict 2-color icon system
 * (indigo + mint), count-up animation, hover lift.
 */
export default function TeacherStats({ loading, todayLessons, students, scheduledLessons, ratingLabel }) {
  const stats = [
    { label: "תלמידים פעילים", value: loading ? null : students, icon: Users, tone: "indigo" },
    { label: "שיעורים היום", value: loading ? null : todayLessons, icon: Calendar, tone: "mint" },
    { label: "שיעורים מתוכננים", value: loading ? null : scheduledLessons, icon: BookOpen, tone: "indigo" },
    { label: "דירוג ממוצע", value: loading ? null : ratingLabel, icon: Star, tone: "mint", small: true },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        const indigo = stat.tone === "indigo";
        return (
          <Reveal key={stat.label} delay={i * 60} className="h-full">
            <div className="bg-card rounded-2xl border border-border p-5 space-y-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                  indigo ? "bg-primary/10 text-primary" : "bg-mint/10 text-mint"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                {stat.value === null ? (
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                ) : stat.small ? (
                  <p className="text-lg font-heading font-bold text-foreground leading-tight">{stat.value}</p>
                ) : (
                  <CountUp value={String(stat.value)} className="text-3xl font-heading font-bold text-foreground" />
                )}
                <p className="text-sm text-muted-foreground font-body mt-0.5">{stat.label}</p>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}