import React from "react";
import { Sparkles } from "lucide-react";

/**
 * TeacherBanner — personal welcome hero for the teacher dashboard.
 * Distinct from the student banner: horizontal layout with an initials-avatar,
 * a "פאנל מורים" chip, and a diagonal indigo→mint gradient band with dot-grid
 * + floating blobs (no generic lifestyle photo).
 */
export default function TeacherBanner({ name }) {
  const safeName = (name || "מורה").trim() || "מורה";
  const parts = safeName.split(/\s+/);
  const initials = (parts[0]?.[0] || "") + (parts[1]?.[0] || "");

  return (
    <div className="app-fade-up relative overflow-hidden rounded-3xl border border-border bg-card min-h-[168px]">
      {/* diagonal gradient band */}
      <div className="absolute inset-0 bg-gradient-to-bl from-primary/12 via-primary/3 to-mint/8" />
      {/* dot grid */}
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      {/* floating blobs */}
      <div
        className="absolute -top-12 -left-12 w-56 h-56 rounded-full blur-[90px] opacity-25 pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(243 75% 59%), transparent 70%)" }}
      />
      <div
        className="absolute -bottom-16 right-20 w-48 h-48 rounded-full blur-[80px] opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(160 84% 39%), transparent 70%)" }}
      />

      <div className="relative p-6 sm:p-8 flex items-center gap-5">
        {/* avatar */}
        <div className="relative shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary to-mint flex items-center justify-center text-white text-2xl font-heading font-bold shadow-lg shadow-primary/20">
            {initials || "מ"}
          </div>
          <span className="absolute -bottom-0.5 -left-0.5 w-6 h-6 rounded-full bg-mint border-[3px] border-card flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </span>
        </div>

        <div className="space-y-2 min-w-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-heading font-semibold">
            פאנל מורים
          </span>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground leading-tight truncate">
            {`שלום, ${safeName} 👋`}
          </h1>
          <p className="text-muted-foreground font-body">נהלו את השיעורים, התלמידים והזמינות שלכם — הכל במקום אחד</p>
        </div>
      </div>
    </div>
  );
}