import React from "react";
import { BookOpen, Pencil, Lightbulb, GraduationCap, Star, Sigma } from "lucide-react";

const ICONS = [
  { Icon: BookOpen, pos: "top-[2%] right-[8%]", size: "w-10 h-10 md:w-12 md:h-12", depth: 18, dur: "9s", delay: "0s", tone: "accent" },
  { Icon: Pencil, pos: "top-[16%] left-[3%]", size: "w-9 h-9 md:w-11 md:h-11", depth: 26, dur: "11s", delay: "0.8s", tone: "green", mobile: false },
  { Icon: Lightbulb, pos: "top-[50%] right-[1%]", size: "w-9 h-9 md:w-11 md:h-11", depth: 34, dur: "8.5s", delay: "0.4s", tone: "green" },
  { Icon: GraduationCap, pos: "bottom-[8%] right-[14%]", size: "w-11 h-11 md:w-14 md:h-14", depth: 20, dur: "10.5s", delay: "1.2s", tone: "accent", mobile: false },
  { Icon: Star, pos: "top-[6%] left-[26%]", size: "w-7 h-7", depth: 40, dur: "7.5s", delay: "1.6s", tone: "accent" },
  { Icon: Sigma, pos: "bottom-[18%] left-[4%]", size: "w-9 h-9 md:w-10 md:h-10", depth: 22, dur: "10s", delay: "1s", tone: "accent" },
];

const TONES = {
  accent: "welcome-role-soft welcome-role-text border-border",
  green: "bg-mint/10 text-mint border-mint/20",
};

/**
 * FloatingIcons — learning icons drifting slowly around the lesson card, each on
 * its own parallax depth. Cursor parallax comes from the parent's --wx / --wy.
 */
export default function FloatingIcons() {
  return (
    <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
      {ICONS.map(({ Icon, pos, size, depth, dur, delay, tone, mobile = true }, index) => (
        <div
          key={index}
          className={`absolute ${pos} ${mobile ? "" : "hidden sm:block"}`}
          style={{
            transform: `translate3d(calc(var(--wx, 0) * ${depth}px), calc(var(--wy, 0) * ${depth}px), 0)`,
            transition: "transform 0.4s ease-out",
          }}
        >
          <div
            className={`welcome-float flex items-center justify-center rounded-2xl border shadow-sm backdrop-blur-sm ${size} ${TONES[tone]}`}
            style={{ "--float-dur": dur, "--float-delay": delay }}
          >
            <Icon className="w-1/2 h-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}