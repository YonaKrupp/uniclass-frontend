import React from "react";
import WCard from "./WCard";
import RoleTag from "../RoleTag";

const ACCENT = {
  teacher: "wl-accent-teacher",
  student: "wl-accent-student",
};

/** Bento tile: role accent, icon, copy and a small illustrative UI fragment. */
export default function WBentoTile({ role, icon: Icon, title, text, fragment, dimmed = false, className = "" }) {
  return (
    <WCard
      className={`${ACCENT[role]} relative overflow-hidden p-6 md:p-7 transition-opacity duration-500 ${
        dimmed ? "opacity-45" : "opacity-100"
      } ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-12 h-44 w-44 rounded-full blur-3xl"
        style={{ background: "hsl(var(--acc) / 0.16)" }}
      />
      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-2xl"
            style={{ background: "hsl(var(--acc) / 0.12)", color: "hsl(var(--acc))" }}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <RoleTag role={role} />
        </div>
        <h3 className="mt-5 text-lg md:text-xl font-heading font-bold leading-snug text-foreground">{title}</h3>
        <p className="mt-1.5 text-sm md:text-[15px] font-body font-light leading-relaxed text-muted-foreground">{text}</p>
        {fragment && <div className="mt-auto pt-5">{fragment}</div>}
      </div>
    </WCard>
  );
}