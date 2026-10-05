import React from "react";

// Brand-aligned palette (indigo / mint / soft gray / amber).
// Visual colors only — the cssClass keys and their meanings are unchanged.
const COLOR_MAP = {
  available:         { bg: "#d8f5e6", border: "#34a86b", text: "#0f5c34" },   // mint — פנויים ללמד
  booked:            { bg: "#e3e7ff", border: "#6366f1", text: "#3730a3" },   // indigo — שיעור עם תלמיד
  bookedAtherteacher:{ bg: "#e8edff", border: "#818cf8", text: "#4334c9" },   // light indigo
  occupiedMove:      { bg: "#fff1d6", border: "#f0a24a", text: "#8a4b00" },  // amber — reschedule source (transient)
  past:              { bg: "#f1f2f4", border: "#d7dade", text: "#9aa0aa" },   // soft gray
  pastDark:          { bg: "#e6e8ec", border: "#c2c6cf", text: "#7a7f8a" },
  tentative:         { bg: "#fff7e0", border: "#d8b94a", text: "#7a5c00" },   // soft amber
  selected:          { bg: "#e3e7ff", border: "#6366f1", text: "#3730a3" },   // indigo — שיעור עם תלמיד
  disabled:          { bg: "#f1f2f4", border: "#d7dade", text: "#9aa0aa" },  // soft gray
};

export function getSlotColors(cssClass) {
  if (!cssClass) return { bg: "#4f46e5", border: "#4f46e5", text: "#ffffff" };
  return COLOR_MAP[cssClass] || { bg: "#4f46e5", border: "#4f46e5", text: "#ffffff" };
}

export default function SlotCell({ slot, isPast, startTime, endTime, onClick, tooltip }) {
  const colors = getSlotColors(slot?.gn06_CssClass);

  return (
    <button
      onClick={onClick}
      disabled={isPast}
      title={tooltip}
      className="rounded-xl border p-1 text-center transition-all duration-200 min-h-[48px] flex flex-col items-center justify-center w-full hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
        color: colors.text,
        opacity: isPast ? 0.5 : 1,
        cursor: isPast ? "default" : "pointer",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <span className="text-[11px] font-semibold leading-tight">{startTime}</span>
      <span className="text-[11px] leading-tight opacity-80">{endTime}</span>
    </button>
  );
}