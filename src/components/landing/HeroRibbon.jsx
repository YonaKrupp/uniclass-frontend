import React from "react";

/**
 * HeroRibbon — a large, flowing gradient "ribbon" sweeping across one corner
 * of the hero. Brand purple → amber complement. The single most branded visual
 * element on the page. Soft-blurred so it reads as a light-trail, not a box.
 */
export default function HeroRibbon() {
  return (
    <div className="absolute -top-10 -left-24 w-[680px] h-[680px] pointer-events-none" aria-hidden="true">
      <svg viewBox="0 0 680 680" className="w-full h-full">
        <defs>
          <linearGradient id="hero-ribbon" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(266, 64%, 38%)" />
            <stop offset="50%" stopColor="hsl(290, 60%, 46%)" />
            <stop offset="100%" stopColor="hsl(32, 85%, 55%)" />
          </linearGradient>
          <linearGradient id="hero-ribbon-soft" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(266, 64%, 50%)" />
            <stop offset="100%" stopColor="hsl(32, 85%, 60%)" />
          </linearGradient>
          <filter id="ribbon-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="36" />
          </filter>
        </defs>
        <g filter="url(#ribbon-blur)">
          <path
            d="M-120 440 C 160 220, 400 580, 800 200 L 800 340 C 400 720, 160 560, -120 580 Z"
            fill="url(#hero-ribbon)"
            opacity="0.9"
          />
          <path
            d="M-60 520 C 180 360, 420 620, 760 300 L 760 380 C 420 700, 180 620, -60 640 Z"
            fill="url(#hero-ribbon-soft)"
            opacity="0.4"
          />
        </g>
      </svg>
    </div>
  );
}