import React from "react";

const COLOR_MAP = {
  available: { bg: "#d1edd8", border: "#4caf73", text: "#1a5c30" },
  booked: { bg: "#fde0e3", border: "#e05470", text: "#7a1c2c" },
  bookedAtherteacher: { bg: "#dce8fa", border: "#4a7fc1", text: "#1a3a6e" },
  occupiedMove: { bg: "#ffe2bf", border: "#f0a24a", text: "#8a4b00" },
  past: { bg: "#edeef0", border: "#d0d3d8", text: "#9aa0aa" },
  pastDark: { bg: "#dcdde0", border: "#bbbfc6", text: "#7a7f8a" },
  tentative: { bg: "#fef9e6", border: "#c8a84b", text: "#7a5c00" },
  selected: { bg: "#cce5ff", border: "#c8a84b", text: "#004085" },
  disabled: { bg: "#edeef0", border: "#d0d3d8", text: "#9aa0aa" },
};

export function getSlotColors(cssClass) {
  if (!cssClass) return { bg: "#512BD4", border: "#512BD4", text: "#ffffff" };
  return COLOR_MAP[cssClass] || { bg: "#512BD4", border: "#512BD4", text: "#ffffff" };
}

export default function SlotCell({ slot, isPast, startTime, endTime, onClick, tooltip }) {
  const colors = getSlotColors(slot?.gn06_CssClass);

  return (
    <button
      onClick={onClick}
      disabled={isPast}
      title={tooltip}
      className="rounded-lg border p-1 text-center transition-all min-h-[48px] flex flex-col items-center justify-center w-full"
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
      <span className="text-[10px] font-medium leading-tight">{startTime}</span>
      <span className="text-[10px] leading-tight">{endTime}</span>
    </button>
  );
}