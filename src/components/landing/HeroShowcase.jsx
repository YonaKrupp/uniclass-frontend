import React from "react";
import { Mic, Video, Users, Star } from "lucide-react";

/**
 * HeroShowcase — a Stripe-style floating composition of three realistic
 * product cards: a weekly calendar (graphic UI), a live video-lesson card
 * (real photo), and a teacher profile card (real photo). Overlapping +
 * staggered for depth; gently floating.
 */
const TEACHER_PORTRAIT = "https://media.base44.com/images/public/6a37f1517bf59551c5f4b6f9/92da16e4b_generated_image.png";
const VIDEO_TEACHER = "https://media.base44.com/images/public/6a37f1517bf59551c5f4b6f9/9ac5c08b9_generated_image.png";

const days = ["א", "ב", "ג", "ד", "ה"];
const lessons = [
  { day: "ראשון", time: "16:00" },
  { day: "שלישי", time: "18:30" },
  { day: "חמישי", time: "10:00" },
];

export default function HeroShowcase() {
  return (
    <div className="relative mx-auto max-w-[440px] h-[440px] sm:h-[500px]">
      {/* Calendar card — top right */}
      <div className="absolute top-0 right-0 w-[180px] sm:w-[210px] animate-hero-float">
        <div className="bg-card rounded-2xl border border-border shadow-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-heading font-semibold text-foreground">יומן שבועי</span>
            <span className="text-[10px] text-muted-foreground font-body">אוג׳ 26</span>
          </div>
          <div className="grid grid-cols-5 gap-1 mb-3">
            {days.map((d) => (
              <div key={d} className="text-center text-[10px] text-muted-foreground font-body py-1">{d}</div>
            ))}
          </div>
          <div className="space-y-1.5">
            {lessons.map((l, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-primary/10 px-2 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[10px] font-body text-foreground flex-1">{l.day}</span>
                <span className="text-[10px] font-body font-medium text-primary">{l.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Video lesson card — main, center-left */}
      <div className="absolute top-20 left-0 w-[230px] sm:w-[280px] animate-badge-float" style={{ animationDelay: "-2s" }}>
        <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden">
          <div className="relative">
            <img src={VIDEO_TEACHER} alt="שיעור וידאו חי" className="w-full h-36 sm:h-40 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-500/90 text-white text-[9px] font-body font-semibold px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
            </div>
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur flex items-center justify-center"><Mic className="w-3.5 h-3.5 text-white" /></div>
                <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur flex items-center justify-center"><Video className="w-3.5 h-3.5 text-white" /></div>
              </div>
              <span className="text-[10px] text-white font-body font-medium bg-black/40 backdrop-blur px-2 py-0.5 rounded-full">42:18</span>
            </div>
          </div>
          <div className="p-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-heading font-semibold text-foreground">שיעור חי · מתמטיקה</p>
              <p className="text-[10px] text-muted-foreground font-body">עם יואב כהן</p>
            </div>
            <span className="w-8 h-8 rounded-full bg-mint/10 flex items-center justify-center"><Users className="w-4 h-4 text-mint" /></span>
          </div>
        </div>
      </div>

      {/* Teacher profile card — bottom right */}
      <div className="absolute bottom-0 right-4 w-[190px] sm:w-[220px] animate-hero-float" style={{ animationDelay: "-3s" }}>
        <div className="bg-card rounded-2xl border border-border shadow-xl p-4 text-center">
          <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-2 ring-2 ring-primary/20">
            <img src={TEACHER_PORTRAIT} alt="פרופיל מורה" className="w-full h-full object-cover" />
          </div>
          <div className="flex items-center justify-center gap-0.5 mb-1">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 text-mint fill-mint" />)}
          </div>
          <p className="text-sm font-heading font-semibold text-foreground">דנה לוי</p>
          <p className="text-[11px] text-muted-foreground font-body mb-3">מתמטיקה · תואר ראשון</p>
          <button className="w-full py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-body font-medium">הזמנת שיעור</button>
        </div>
      </div>
    </div>
  );
}