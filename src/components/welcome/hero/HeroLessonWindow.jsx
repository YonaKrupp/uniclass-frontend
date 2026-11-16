import React from "react";
import { Mic, MonitorPlay, Video } from "lucide-react";

const CONTROLS = [Mic, Video, MonitorPlay];
const WAVE = ["h-2", "h-3.5", "h-4", "h-3", "h-2.5"];

/**
 * The anchor of the scene: a one-on-one lesson window. It connects during the
 * timeline — the status turns green, LIVE appears, the waveform and the
 * speaking ring start and the lesson timer begins counting.
 */
export default function HeroLessonWindow() {
  return (
    <div className="wl-glass wl-scene-shadow relative w-full rounded-[24px] p-2.5">
      {/* window chrome */}
      <div className="flex items-center gap-2 px-1.5 pt-1 pb-2.5">
        <span className="flex shrink-0 gap-1" aria-hidden="true">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400/70" />
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400/70" />
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
        </span>
        <span className="truncate font-body text-[14px] font-medium text-foreground/80">
          כיתה וירטואלית · מתמטיקה
        </span>
        <span className="relative mr-auto h-6 w-[78px] shrink-0">
          <span className="hs-status-waiting absolute inset-0 flex items-center justify-center gap-1.5 rounded-full bg-muted font-body text-[14px] font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
            ממתין
          </span>
          <span className="hs-status-live absolute inset-0 flex items-center justify-center gap-1.5 rounded-full bg-mint/12 font-body text-[14px] font-semibold text-mint">
            <span className="h-1.5 w-1.5 rounded-full bg-mint" />
            מחובר
          </span>
        </span>
      </div>

      {/* video tile */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-[18px]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(148deg, hsl(266 62% 42%) 0%, hsl(266 58% 32%) 44%, hsl(258 46% 12%) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(115% 85% at 76% 4%, hsl(0 0% 100% / 0.22), transparent 58%)",
          }}
        />
        <div className="wl-dots absolute inset-0 opacity-25" />

        {/* avatar */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="hs-speak-ring absolute h-[88px] w-[88px] rounded-full border border-white/45">
            <span className="hs-ring-pulse block h-full w-full rounded-full border border-white/25" />
          </span>
          <span className="relative flex h-[68px] w-[68px] items-center justify-center rounded-full bg-white/15 font-heading text-[22px] font-bold text-white ring-1 ring-inset ring-white/35 backdrop-blur-sm">
            מ׳
          </span>
        </div>

        {/* live badge + lesson timer */}
        <span className="hs-live absolute right-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-black/35 px-2 py-1 font-body text-[14px] font-semibold leading-none text-white backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
          LIVE
        </span>
        <span className="hs-timer absolute left-2.5 top-2.5 rounded-full bg-black/30 px-2 py-1 font-body text-[14px] font-medium leading-none text-white tabular-nums backdrop-blur">
          <span className="hs-count" />
        </span>

        {/* lesson label + audio waveform, student tile in the corner */}
        <div className="absolute inset-x-2.5 bottom-2.5 flex items-end justify-between gap-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-black/30 px-2.5 py-1 font-body text-[14px] leading-none text-white backdrop-blur">
            שיעור 1:1 · 45 דק׳
            <span className="hs-wave flex h-4 items-end gap-[3px]" aria-hidden="true">
              {WAVE.map((height, i) => (
                <span
                  key={i}
                  className={`hs-wave-bar w-[3px] origin-bottom rounded-full bg-white/85 ${height}`}
                  style={{ animationDelay: `${i * 0.14}s` }}
                />
              ))}
            </span>
          </span>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-white/15 font-heading text-[15px] font-bold text-white ring-1 ring-inset ring-white/30 backdrop-blur-sm">
            ת׳
          </span>
        </div>
      </div>

      {/* call controls */}
      <div className="mt-2.5 grid grid-cols-3 gap-2">
        {CONTROLS.map((Icon, i) => (
          <span
            key={i}
            className={`wl-hairline flex items-center justify-center rounded-[14px] border py-2 ${
              i === 2 ? "bg-mint/10 text-mint" : "bg-muted/50 text-muted-foreground"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
        ))}
      </div>
    </div>
  );
}