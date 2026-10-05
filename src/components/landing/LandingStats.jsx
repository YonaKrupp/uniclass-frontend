import React from "react";

const stats = [
  { value: "100%", label: "גמישות בזמנים — אתם קובעים" },
  { value: "0₪", label: "עלות הרשמה לפיילוט", accent: true },
  { value: "24/7", label: "זמינות מערכתית מלאה" },
  { value: "AI", label: "סיכום שיעור אוטומטי" },
];

/**
 * LandingStats — the dark "loud" moment of the page. Deep near-black background
 * with a brand glow + an abstract SVG data visualization (flowing wave + dot
 * scatter) sitting behind the metrics, so the numbers read as a live data
 * display rather than a flat list.
 */
export default function LandingStats() {
  return (
    <section aria-label="נתונים מרכזיים" className="relative py-24 sm:py-32 overflow-hidden" style={{ background: "hsl(240 10% 6%)" }}>
      {/* brand glow */}
      <div
        className="absolute top-1/2 right-[8%] -translate-y-1/2 w-[520px] h-[520px] rounded-full blur-[150px] opacity-30 pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(266, 64%, 38%), transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 left-[14%] w-[360px] h-[360px] rounded-full blur-[130px] opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(32, 85%, 52%), transparent 70%)" }}
      />

      {/* data viz behind the numbers */}
      <svg
        className="absolute inset-0 w-full h-full opacity-50 pointer-events-none"
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="stat-wave" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(266, 64%, 55%)" stopOpacity="0" />
            <stop offset="30%" stopColor="hsl(266, 64%, 60%)" stopOpacity="0.55" />
            <stop offset="70%" stopColor="hsl(296, 60%, 62%)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="hsl(32, 85%, 62%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="stat-wave-2" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(32, 85%, 62%)" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(32, 85%, 62%)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(266, 64%, 60%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="stat-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(266, 64%, 70%)" />
            <stop offset="100%" stopColor="hsl(32, 85%, 65%)" />
          </linearGradient>
        </defs>
        <path d="M0 270 C 200 190, 360 320, 600 230 S 960 170, 1200 250 L 1200 400 L 0 400 Z" fill="url(#stat-wave)" />
        <path d="M0 320 C 250 260, 410 360, 660 300 S 980 250, 1200 320 L 1200 400 L 0 400 Z" fill="url(#stat-wave-2)" opacity="0.6" />
        <path
          d="M0 270 C 200 190, 360 320, 600 230 S 960 170, 1200 250"
          fill="none"
          stroke="url(#stat-line)"
          strokeWidth="2"
          opacity="0.7"
        />
        {Array.from({ length: 46 }).map((_, i) => {
          const x = (i * 113) % 1200;
          const y = 70 + ((i * 67) % 250);
          const big = i % 6 === 0;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={big ? 2.6 : 1.4}
              fill={i % 8 === 0 ? "hsl(32, 85%, 64%)" : "hsl(266, 64%, 72%)"}
              opacity={big ? 0.7 : 0.4}
            />
          );
        })}
      </svg>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-4 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p
                className="text-4xl sm:text-5xl font-heading font-extrabold mb-3 text-white"
                style={s.accent ? { color: "hsl(32, 85%, 62%)" } : undefined}
              >
                {s.value}
              </p>
              <p className="text-sm text-white/80 font-body font-light leading-snug">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}