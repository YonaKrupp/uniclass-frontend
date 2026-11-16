import React from "react";
import { CalendarClock, CreditCard, UserRound } from "lucide-react";

/* Small illustrative UI fragments used inside the "למה UniClass" bento tiles.
   They inherit --acc from the tile, so each one takes the tile's role colour. */

export function EarningsFragment() {
  const bars = [34, 48, 42, 62, 78, 94];
  return (
    <div className="rounded-2xl border border-[hsl(var(--wl-hair))] bg-background/60 p-3">
      <div className="flex items-center justify-between text-[11px] font-body text-muted-foreground">
        <span>הכנסות לפי שבוע</span>
        <span className="text-mint">₪</span>
      </div>
      <div className="mt-2 flex h-16 items-end gap-1.5" aria-hidden="true">
        {bars.map((height, index) => (
          <span
            key={index}
            className="flex-1 rounded-t-md transition-all duration-500"
            style={{
              height: `${height}%`,
              background:
                index === bars.length - 1
                  ? "linear-gradient(180deg, hsl(var(--acc)), hsl(var(--acc) / 0.45))"
                  : "hsl(var(--acc) / 0.2)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function CourseFragment() {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-[hsl(var(--wl-hair))] bg-background/60 p-2.5">
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-heading text-sm font-bold text-white"
        style={{ background: "linear-gradient(140deg, hsl(var(--acc)), hsl(var(--acc) / 0.55))" }}
      >
        מ׳
      </span>
      <div className="min-w-0">
        <p className="text-xs font-heading font-semibold text-foreground">מתמטיקה · שנה ג׳</p>
        <p className="text-[10px] font-body text-muted-foreground">מדעים מדויקים</p>
      </div>
      <span className="mr-auto shrink-0 rounded-full bg-mint/10 px-2 py-0.5 text-[9px] font-body font-semibold text-mint">
        עבר/ה את הקורס
      </span>
    </div>
  );
}

export function CancelFragment() {
  return (
    <div className="rounded-2xl border border-[hsl(var(--wl-hair))] bg-background/60 p-3">
      <div className="relative h-1.5 rounded-full bg-mint/20">
        <span className="absolute inset-y-0 right-0 w-[62%] rounded-full bg-mint" />
        <span className="absolute -top-[3px] right-[62%] h-3 w-3 translate-x-1/2 rounded-full border-2 border-background bg-mint" />
      </div>
      <div className="mt-2 flex justify-between text-[10px] font-body text-muted-foreground">
        <span>עכשיו</span>
        <span className="font-semibold text-mint">24 ש׳ לפני</span>
        <span>השיעור</span>
      </div>
    </div>
  );
}

export function SetupFragment() {
  const rows = [
    { icon: UserRound, label: "פרופיל ומקצועות" },
    { icon: CalendarClock, label: "זמינות ושעות" },
    { icon: CreditCard, label: "תשלום דרך הפלטפורמה" },
  ];
  return (
    <ul className="space-y-1.5">
      {rows.map(({ icon: Icon, label }, index) => (
        <li
          key={label}
          className="flex items-center gap-2 rounded-xl border border-[hsl(var(--wl-hair))] bg-background/60 px-2.5 py-2 text-[11px] font-body text-foreground/85"
        >
          <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: "hsl(var(--acc))" }} aria-hidden="true" />
          {label}
          <span
            className="mr-auto h-1.5 w-1.5 rounded-full"
            style={{ background: index === 2 ? "hsl(160 84% 32%)" : "hsl(var(--acc))" }}
            aria-hidden="true"
          />
        </li>
      ))}
    </ul>
  );
}