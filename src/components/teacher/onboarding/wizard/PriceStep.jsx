import React from "react";

export default function PriceStep({ value, onChange }) {
  return (
    <div className="space-y-4">
      <label htmlFor="onboarding-price" className="block text-sm font-heading font-semibold text-foreground">
        כמה תקבל על כל שיעור?
      </label>

      <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-body text-muted-foreground">80 ₪</span>
          <span className="text-2xl font-heading font-bold text-primary">{value} ₪</span>
          <span className="text-xs font-body text-muted-foreground">150 ₪</span>
        </div>
        <input
          id="onboarding-price"
          type="range"
          min={80}
          max={150}
          step={10}
          value={value}
          onChange={(event) => onChange(parseInt(event.target.value, 10))}
          className="w-full accent-primary cursor-pointer"
          style={{ touchAction: "none" }}
        />
      </div>

      <p className="text-xs font-body text-muted-foreground">
        אפשר לשנות את המחיר בכל רגע בפרופיל המורה.
      </p>
    </div>
  );
}