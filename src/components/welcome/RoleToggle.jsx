import React from "react";
import { GraduationCap, BookOpen } from "lucide-react";
import { ROLE_BOTH, useRole } from "./WelcomeRoleContext";
import { trackEvent } from "./useWelcomeAnalytics";

const OPTIONS = [
  { key: "student", label: "תלמיד/ה", Icon: GraduationCap, pill: "welcome-pill-student" },
  { key: "teacher", label: "מורה", Icon: BookOpen, pill: "welcome-pill-teacher" },
];

/** Split-role pill toggle. Neutral by default (both roles shown). */
export default function RoleToggle({ className = "" }) {
  const { role, setRole } = useRole();

  const choose = (key) => {
    const next = role === key ? ROLE_BOTH : key;
    setRole(next);
    trackEvent("role_toggle", { role: next });
  };

  return (
    <div
      role="group"
      aria-label="בחירת תצוגה לפי תפקיד"
      className={`inline-flex items-center gap-1 rounded-full border border-border bg-card/90 p-1 shadow-sm backdrop-blur ${className}`}
    >
      {OPTIONS.map(({ key, label, Icon, pill }) => (
        <button
          key={key}
          type="button"
          aria-pressed={role === key}
          onClick={() => choose(key)}
          className={`welcome-role-ring ${pill} inline-flex items-center gap-1.5 rounded-full border border-transparent px-3 py-1.5 text-xs md:text-sm font-body font-semibold text-muted-foreground transition-all duration-200 hover:text-foreground ${
            role === key ? "is-on" : ""
          }`}
        >
          <Icon className="w-4 h-4" aria-hidden="true" />
          {label}
        </button>
      ))}

      {role !== ROLE_BOTH && (
        <button
          type="button"
          onClick={() => {
            setRole(ROLE_BOTH);
            trackEvent("role_toggle", { role: ROLE_BOTH });
          }}
          className="welcome-role-ring rounded-full px-2.5 py-1.5 text-[11px] font-body font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          הצגת שניהם
        </button>
      )}
    </div>
  );
}