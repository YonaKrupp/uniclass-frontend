import React, { useMemo } from "react";
import { BarChart3 } from "lucide-react";
import Reveal from "@/components/landing/Reveal";

const DAY_LABELS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

function parseLessonDate(raw) {
  if (!raw || typeof raw !== "string") return null;
  if (raw.includes("/")) {
    const [dd, mm, yyyy] = raw.split("/");
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return isNaN(d.getTime()) ? null : d;
  }
  if (raw.includes("-")) {
    const [yyyy, mm, dd] = raw.split("-");
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * TeacherActivityChart — a teacher-only element: a mini bar chart of upcoming
 * lessons across the next 7 days, derived from the real lessonsList. Indigo
 * bars with a mint accent for the peak day. No equivalent on the student side.
 */
export default function TeacherActivityChart({ lessons }) {
  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const arr = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const count = lessons.filter((l) => {
        const ld = parseLessonDate(l?.dateInTheMonth);
        return ld && sameDay(ld, d);
      }).length;
      arr.push({ date: d, count, label: DAY_LABELS[d.getDay()] });
    }
    return arr;
  }, [lessons]);

  const max = Math.max(1, ...days.map((d) => d.count));
  const total = days.reduce((s, d) => s + d.count, 0);

  return (
    <Reveal>
      <div className="bg-card rounded-2xl border border-border p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-heading font-semibold text-foreground">פעילות שיעורים</h2>
              <p className="text-xs text-muted-foreground font-body">7 הימים הקרובים</p>
            </div>
          </div>
          <span className="text-sm font-heading font-bold text-foreground">
            {total} <span className="text-muted-foreground font-body font-normal text-xs">שיעורים</span>
          </span>
        </div>

        <div className="flex items-end justify-between gap-2 h-40">
          {days.map((d, i) => {
            const h = d.count === 0 ? 4 : Math.max(8, (d.count / max) * 100);
            const isMax = d.count === max && d.count > 0;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full">
                <span className={`text-xs font-heading font-semibold h-4 ${d.count > 0 ? "text-foreground" : "text-transparent"}`}>
                  {d.count > 0 ? d.count : "0"}
                </span>
                <div className="w-full flex items-end justify-center h-28">
                  <div
                    className={`w-full max-w-[34px] rounded-t-lg transition-all duration-500 ${
                      isMax ? "bg-mint" : "bg-primary/70 group-hover:bg-primary"
                    }`}
                    style={{ height: `${h}%` }}
                  />
                </div>
                <span
                  className={`text-xs font-heading font-medium ${i === 0 ? "text-primary" : "text-muted-foreground"}`}
                >
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Reveal>
  );
}