import React from "react";
import HeroChatCard from "./hero/HeroChatCard";
import HeroBookingCard from "./hero/HeroBookingCard";
import HeroSummaryCard from "./hero/HeroSummaryCard";
import HeroLessonWindow from "./hero/HeroLessonWindow";
import useHeroScenePlayback from "./hero/useHeroScenePlayback";
import "./hero/heroScene.css";

const PARALLAX = {
  transform: "translate3d(calc(var(--wx, 0) * 8px), calc(var(--wy, 0) * 8px), 0)",
  transition: "transform 0.5s ease-out",
};

const PARALLAX_SOFT = {
  transform: "translate3d(calc(var(--wx, 0) * 5px), calc(var(--wy, 0) * 5px), 0)",
  transition: "transform 0.5s ease-out",
};

/**
 * Hero visual: one composed scene — the lesson window as the anchor, with the
 * ask → book → learn → summary flow attached around it on a shared grid.
 * Decorative only (aria-hidden); the timeline lives in heroScene.css.
 */
export default function HeroScene() {
  const stageRef = useHeroScenePlayback();

  return (
    <div ref={stageRef} className="hs-stage relative mx-auto w-full max-w-[560px]" aria-hidden="true">
      <div className="hs-dots" />

      <div className="relative grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* 1 · chat */}
        <div className="hidden lg:col-span-7 lg:col-start-1 lg:row-start-1 lg:block">
          <div style={PARALLAX}>
            <HeroChatCard />
          </div>
        </div>

        {/* anchor · lesson window */}
        <div className="relative mx-auto w-full max-w-[420px] lg:col-span-8 lg:col-start-1 lg:row-start-2 lg:mx-0 lg:max-w-none">
          <div className="hs-glow" />
          <div className="relative">
            <HeroLessonWindow />
          </div>
        </div>

        {/* 2 · booking, 3 · summary — left column on desktop, summary only on mobile */}
        <div className="flex w-full flex-col items-center gap-4 lg:col-span-4 lg:col-start-9 lg:row-start-2 lg:items-stretch">
          <div className="hidden w-full lg:block" style={PARALLAX}>
            <HeroBookingCard />
          </div>
          <div className="w-full max-w-[360px] lg:max-w-none" style={PARALLAX_SOFT}>
            <HeroSummaryCard />
          </div>
        </div>
      </div>
    </div>
  );
}