import React, { useEffect, useRef } from "react";
import { useRole } from "./WelcomeRoleContext";

/**
 * Hero background: a field of dots, like graph paper.
 * Teachers (violet) and students (green) arrive from opposite edges as two
 * waves and meet on the centre line; afterwards the field reacts to the
 * pointer, lighting dots in the colour of the role being explored.
 * Canvas only, no dependencies. Static under prefers-reduced-motion.
 */

const GAP = 28;
const REACH = 130;
const TRAVEL = 1.8;
const INTRO_DELAY = 300;

const INK = { light: "222 47% 11%", dark: "220 40% 96%" };
const VIOLET = { light: "266 64% 40%", dark: "266 70% 72%" };
const GREEN = { light: "160 84% 30%", dark: "160 70% 55%" };

export default function WelcomeGrid() {
  const canvasRef = useRef(null);
  const { role } = useRole();
  const roleRef = useRef(role);
  roleRef.current = role;

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas ? canvas.parentElement : null;
    const ctx = canvas ? canvas.getContext("2d") : null;
    if (!canvas || !host || !ctx) return undefined;

    const root = document.documentElement;
    const isStatic = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      root.classList.contains("a11y-stop-animations");

    let w = 0;
    let h = 0;
    let raf = 0;
    let alive = true;
    let introStart = 0;
    let introTimer = 0;
    let pointer = null;
    let pFade = 0;
    let lastPointerAt = 0;

    const palette = () => {
      const k = root.classList.contains("dark") ? "dark" : "light";
      return { ink: INK[k], violet: VIOLET[k], green: GREEN[k] };
    };

    const draw = (now) => {
      const pal = palette();
      ctx.clearRect(0, 0, w, h);

      const half = Math.ceil(w / 2 / GAP);
      const rows = Math.ceil(h / GAP) + 1;
      const mid = w / 2;
      const t = introStart ? (now - introStart) / 1000 : -1;
      const currentRole = roleRef.current;

      for (let i = -half; i <= half; i += 1) {
        const x = mid + i * GAP;
        const edgeDist = Math.abs(i);
        for (let j = 0; j < rows; j += 1) {
          const y = j * GAP + GAP / 2;

          let wave = 0;
          let waveColor = pal.violet;
          if (t >= 0) {
            const fromEdge = half - edgeDist;
            const arrival = (fromEdge / half) * TRAVEL;
            const age = t - arrival;
            if (age >= 0) {
              const meeting = edgeDist <= 1;
              wave = Math.exp(-age * (meeting ? 1.3 : 2.4)) * (meeting ? 1.25 : 1);
              waveColor = meeting
                ? (i + j) % 2 === 0
                  ? pal.violet
                  : pal.green
                : i > 0
                  ? pal.violet
                  : pal.green;
            }
          }

          let near = 0;
          let nearColor = pal.violet;
          if (pointer && pFade > 0) {
            const dx = x - pointer.x;
            const dy = y - pointer.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < REACH) {
              const k = 1 - d / REACH;
              near = k * k * pFade;
              if (currentRole === "student") nearColor = pal.green;
              else if (currentRole === "teacher") nearColor = pal.violet;
              else nearColor = dx > 0 ? pal.violet : pal.green;
            }
          }

          const lit = Math.min(1, Math.max(wave, near));
          if (lit > 0.02) {
            const color = near >= wave ? nearColor : waveColor;
            ctx.fillStyle = `hsl(${color} / ${0.2 + 0.75 * lit})`;
            ctx.beginPath();
            ctx.arc(x, y, 1.5 + 2.7 * lit, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = `hsl(${pal.ink} / 0.16)`;
            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    const frame = (now) => {
      raf = 0;
      if (!alive) return;
      pFade += ((pointer ? 1 : 0) - pFade) * 0.14;
      if (!pointer && pFade < 0.01) pFade = 0;
      draw(now);

      const introRunning = introStart && (now - introStart) / 1000 < TRAVEL + 2.5;
      const pointerBusy = pFade > 0 && (!pointer || pFade < 0.99 || now - lastPointerAt < 140);
      if (introRunning || pointerBusy) schedule();
    };

    function schedule() {
      if (!raf && alive) raf = requestAnimationFrame(frame);
    }

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      schedule();
    };

    const onMove = (event) => {
      if (isStatic() || event.pointerType === "touch") return;
      const rect = canvas.getBoundingClientRect();
      pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      lastPointerAt = performance.now();
      schedule();
    };
    const onLeave = () => {
      pointer = null;
      schedule();
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    const themeObserver = new MutationObserver(schedule);
    themeObserver.observe(root, { attributes: true, attributeFilter: ["class"] });
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);

    if (!isStatic()) {
      introTimer = window.setTimeout(() => {
        introStart = performance.now();
        schedule();
      }, INTRO_DELAY);
    }

    return () => {
      alive = false;
      window.clearTimeout(introTimer);
      if (raf) cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const fade = "linear-gradient(to bottom, #000 55%, transparent 100%)";

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ maskImage: fade, WebkitMaskImage: fade }}
    />
  );
}