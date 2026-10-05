import React from "react";
import { Calendar, CalendarPlus, ChevronLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import Reveal from "@/components/landing/Reveal";

const lessonColumnLabels = {
  dayInTheWeek: "יום",
  dateInTheMonth: "תאריך",
  startEndHoure: "שעה",
  subjectName: "מקצוע",
  studentName: "תלמיד/ה",
};

/**
 * TeacherLessonsBoard — upcoming lessons as an interactive table with a
 * teacher-relevant empty state (CTA → open availability). Today's row is
 * highlighted in brand indigo (vs. the student's orange).
 */
export default function TeacherLessonsBoard({ loading, lessons, todayDate }) {
  const [y, m, d] = todayDate.split("-");
  const todayDDMMYYYY = `${d}/${m}/${y}`;
  const isToday = (val) => val === todayDate || val === todayDDMMYYYY;
  const columns = lessons[0] ? Object.keys(lessons[0]) : Object.keys(lessonColumnLabels);

  return (
    <Reveal>
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-mint/10 text-mint flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-heading font-semibold text-foreground">השיעורים הקרובים</h2>
            <p className="text-xs text-muted-foreground font-body">נהלו את לוח הזמנים שלכם</p>
          </div>
        </div>

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
              <p className="text-foreground font-heading font-semibold">אין שיעורים מתוכננים כרגע</p>
              <p className="text-muted-foreground font-body text-sm">
                פתחו זמינות חדשה כדי שתלמידים יוכלו לקבוע שיעורים איתכם
              </p>
            </div>
            <Link
              to="/teacher-schedule"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-heading font-semibold hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all"
            >
              פתחו זמינות חדשה <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="bg-muted/40 text-xs font-heading font-semibold text-muted-foreground">
                    {columns.map((k) => (
                      <th key={k} className="px-4 py-3 text-center border-b border-border whitespace-nowrap">
                        {lessonColumnLabels[k] || k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lessons.map((lesson, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      {columns.map((k, j) => {
                        const v = lesson[k];
                        const today = k === "dateInTheMonth" && isToday(v);
                        return (
                          <td
                            key={j}
                            className={`px-4 py-3 whitespace-nowrap text-center ${
                              today ? "text-primary font-semibold" : "text-foreground"
                            }`}
                          >
                            {String(v ?? "—")}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
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