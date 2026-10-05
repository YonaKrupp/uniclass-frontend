import React, { useRef, useEffect } from "react";
import { Calendar, CalendarPlus, ChevronLeft, Loader2, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import Reveal from "@/components/landing/Reveal";

const lessonColumnLabels = {
  dayInTheWeek: "יום",
  dateInTheMonth: "תאריך",
  startEndHoure: "שעה",
  subjectName: "מקצוע",
  techerName: "שם המורה",
  cancel: "ביטול",
};

/**
 * StudentLessonsBoard — structural twin of TeacherLessonsBoard (same card,
 * header icon-box, table styling and empty-state pattern), adapted to the
 * student: "שם המורה" column + a cancel flow (toggle / row buttons). Today's
 * row is highlighted in brand indigo (matching the teacher board).
 */
export default function StudentLessonsBoard({
  loading,
  lessons,
  todayDate,
  showCancel,
  setShowCancel,
  cancellingId,
  onConfirmCancel,
  cancelError,
}) {
  const [y, m, d] = todayDate.split("-");
  const todayDDMMYYYY = `${d}/${m}/${y}`;
  const isToday = (val) => val === todayDate || val === todayDDMMYYYY;
  const cancelColRef = useRef(null);

  const baseColumns = Object.keys(lessonColumnLabels).filter((k) => k !== "cancel");
  const columns = showCancel ? [...baseColumns, "cancel"] : baseColumns;

  useEffect(() => {
    if (showCancel && cancelColRef.current) {
      cancelColRef.current.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [showCancel]);

  return (
    <Reveal>
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-mint/10 text-mint flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-heading font-semibold text-foreground">השיעורים הבאים</h2>
            <p className="text-xs text-muted-foreground font-body">נהלו את לוח השיעורים שלכם</p>
          </div>
          <label className="mr-auto flex items-center gap-2 text-sm font-body text-destructive font-semibold cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showCancel}
              onChange={(e) => setShowCancel(e.target.checked)}
              className="w-4 h-4 accent-destructive"
            />
            הצג אפשרות ביטול
          </label>
        </div>

        {cancelError && (
          <div className="bg-destructive/10 border-b border-destructive/20 px-5 py-3 text-destructive text-sm font-body text-center">
            {cancelError}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-14">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : lessons.length === 0 ? (
          <div className="px-5 py-14 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <CalendarPlus className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-foreground font-heading font-semibold">אין שיעורים קרובים כרגע</p>
              <p className="text-muted-foreground font-body text-sm">
                עיינו במורים הזמינים כדי לקבוע שיעור חדש
              </p>
            </div>
            <Link
              to="/student-teachers"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-heading font-semibold hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all"
            >
              עיינו במורים זמינים <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="bg-muted/40 text-xs font-heading font-semibold text-muted-foreground">
                    {columns.map((k) => (
                      <th
                        key={k}
                        ref={k === "cancel" ? cancelColRef : undefined}
                        className={`px-4 py-3 text-center border-b border-border whitespace-nowrap ${k === "cancel" ? "text-destructive bg-destructive/10" : ""}`}
                      >
                        {lessonColumnLabels[k] || k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lessons.map((lesson, i) => {
                    const isPast = lesson.orderis === 0;
                    const isCancelled = lesson.orderis === 2;
                    return (
                      <tr
                        key={i}
                        className={`hover:bg-muted/30 transition-colors ${isCancelled ? "bg-destructive/5" : ""}`}
                      >
                        {columns.map((k) => {
                          if (k === "cancel") {
                            return (
                              <td key={k} className="px-4 py-3 whitespace-nowrap text-center text-destructive font-medium bg-destructive/10">
                                {isPast ? (
                                  <span className="text-muted-foreground font-medium text-xs">השיעור חלף</span>
                                ) : isCancelled ? (
                                  <span className="text-destructive font-medium text-xs">{lesson.cancel || "בוטל"}</span>
                                ) : (
                                  <button
                                    onClick={() => onConfirmCancel(lesson.gn06_id)}
                                    disabled={cancellingId === String(lesson.gn06_id)}
                                    className="inline-flex items-center gap-1.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-destructive/20 transition-colors disabled:opacity-50"
                                  >
                                    {cancellingId === String(lesson.gn06_id) ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <XCircle className="w-3.5 h-3.5" />
                                    )}
                                    {lesson.cancel || "ביטול שיעור"}
                                  </button>
                                )}
                              </td>
                            );
                          }
                          const v = lesson[k];
                          const today = k === "dateInTheMonth" && isToday(v);
                          return (
                            <td
                              key={k}
                              className={`px-4 py-3 whitespace-nowrap text-center ${
                                isCancelled
                                  ? "text-destructive font-medium"
                                  : today
                                  ? "text-primary font-semibold"
                                  : "text-foreground"
                              }`}
                            >
                              {String(v ?? "—")}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="md:hidden px-4 py-2 bg-muted/40 border-t border-border text-xs text-muted-foreground font-body text-center">
              ← גלול לרוחב לצפייה בכל העמודות →
            </div>
          </>
        )}
      </div>
    </Reveal>
  );
}