import React, { useState, useEffect, useRef } from "react";
import { GraduationCap, Calendar, BookOpen, Loader2, XCircle } from "lucide-react";
import CountUp from "@/components/landing/CountUp";

// Storage keys — localStorage survives page reloads, tab closes, and sessionStorage clears
const FETCH_TIME_KEY = "_studentHome_lastFetch";
const CACHED_DATA_KEY = "_studentHome_cachedData";
const CACHED_EMAIL_KEY = "_studentHome_cachedEmail";
const FETCH_COOLDOWN_MS = 30000;

// Module-level: prevents concurrent fetch calls within the same page load
let _fetchInProgress = false;

const lessonColumnLabels = {
  dayInTheWeek: "יום",
  dateInTheMonth: "תאריך",
  startEndHoure: "שעה",
  subjectName: "מקצוע",
  techerName: "שם המורה",
  cancel: "ביטול",
};

export default function StudentHome() {
  const [studentEmail, setStudentEmail] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [userData, setUserData] = useState({});

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelError, setCancelError] = useState("");
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const cancelColRef = useRef(null);

  // Fetch home data — _fetchInProgress prevents concurrent duplicate calls
  const fetchHomeData = async (email, token) => {
    if (!email) { setLoading(false); return; }
    if (_fetchInProgress) {
      const cachedEmail = sessionStorage.getItem(CACHED_EMAIL_KEY);
      if (cachedEmail === email) {
        const cached = sessionStorage.getItem(CACHED_DATA_KEY);
        if (cached) { try { setData(JSON.parse(cached)); } catch {} }
      }
      setLoading(false);
      return;
    }

    _fetchInProgress = true;
    setLoading(true);
    try {
      const res = await fetch('https://learn-le-connect.base44.app/api/apps/6a37f1517bf59551c5f4b6f9/functions/studentHomeProxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentEmail: email, token }),
      }).then(r => r.json());
      setData(res);
      sessionStorage.setItem(CACHED_DATA_KEY, JSON.stringify(res));
      sessionStorage.setItem(CACHED_EMAIL_KEY, email);
    } catch (err) {
      console.error("studentHomeProxy error:", err);
    } finally {
      _fetchInProgress = false;
      setLoading(false);
    }
  };

  // Read credentials AND fetch on mount. _fetchInProgress prevents concurrent duplicate calls.
  useEffect(() => {
    try {
      const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken") || "";
      const userDataStr = localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}";
      const parsed = JSON.parse(userDataStr);
      const email = parsed.studentEmail || parsed.email || "";
      setUserData(parsed);
      setStudentEmail(email);
      setAuthToken(token);
      // Show cached data immediately only if it belongs to the same user
      const cachedEmail = sessionStorage.getItem(CACHED_EMAIL_KEY);
      if (cachedEmail === email) {
        const cached = sessionStorage.getItem(CACHED_DATA_KEY);
        if (cached) { try { setData(JSON.parse(cached)); } catch {} }
      }
      if (email && token) {
        fetchHomeData(email, token);
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.error("[StudentHome] Error reading storage:", e);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancelLesson = async (gn06_id) => {
    if (!gn06_id) return;
    setConfirmCancelId(null);
    setCancelError("");
    setCancellingId(gn06_id);
    try {
      const res = await fetch('https://learn-le-connect.base44.app/api/apps/6a37f1517bf59551c5f4b6f9/functions/cancelLessonProxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentEmail, gn06_id: String(gn06_id), token: authToken }),
      }).then(r => r.json());
      if (res?.error || res?._status >= 400) {
        setCancelError(res?.error || res?.message || "שגיאה בביטול השיעור");
      } else {
        // Force reload after cancel
        await fetchHomeData(studentEmail, authToken, true);
      }
    } catch (err) {
      setCancelError(err.message || "שגיאה בביטול השיעור");
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    if (showCancel && cancelColRef.current) {
      cancelColRef.current.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [showCancel]);

  const hd = data?.homeData ?? {};
  const lessonsList = data?.lessonsList ?? [];
  const name = hd.studentName || userData.studentName || userData.fullName || userData.name || "תלמיד";

  // Consistent 2-color mapping across all stat cards: indigo (brand) + mint (accent).
  const stats = [
    { label: "שיעורים היום", value: loading ? null : (hd.todayLesonCount ?? "—"), icon: Calendar, color: "bg-mint/10 text-mint" },
    { label: "מורים", value: loading ? null : (hd.teacherCount ?? "—"), icon: GraduationCap, color: "bg-primary/10 text-primary" },
    { label: "שיעורים מתוכננים", value: loading ? null : (hd.scheduledLessons ?? "—"), icon: BookOpen, color: "bg-mint/5 text-mint" },
    { label: "מקצועות פעילים", value: loading ? null : (hd.activeLessons ?? "—"), icon: BookOpen, color: "bg-primary/5 text-primary" },
  ];

  return (
    <div dir="rtl" className="relative">
      {/* Ambient dashboard gradient — breaks the flat white, like the landing page */}
      <div
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[75%] h-60 rounded-full blur-[130px] opacity-[0.06] pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(243 75% 59%), transparent 70%)" }}
      />
      <div className="relative z-10 space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <img
            src="https://media.base44.com/images/public/6a37f1517bf59551c5f4b6f9/0cf1a42dc_Logo_UNICLASS_2_PNG.png"
            alt="UniClass"
            className="h-12 sm:h-14 w-auto object-contain"
          />
        </div>

        {/* Welcome banner — textual, brand gradient background, no photo */}
        <div className="app-fade-up relative overflow-hidden rounded-2xl border border-border bg-gradient-to-l from-primary/10 via-primary/5 to-mint/5 p-6 sm:p-8 min-h-[140px] flex flex-col justify-center">
          <div
            className="absolute -top-12 -left-12 w-56 h-56 rounded-full blur-[90px] opacity-20 pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(243 75% 59%), transparent 70%)" }}
          />
          <div
            className="absolute -bottom-16 right-10 w-48 h-48 rounded-full blur-[90px] opacity-15 pointer-events-none"
            style={{ background: "radial-gradient(circle, hsl(160 84% 39%), transparent 70%)" }}
          />
          <span className="relative inline-flex items-center gap-1.5 self-start px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-heading font-semibold mb-3">
            פאנל תלמידים
          </span>
          <h1 className="relative text-2xl sm:text-3xl font-heading font-bold text-foreground">{`שלום, ${name} 👋`}</h1>
          <p className="relative text-muted-foreground font-body mt-1.5">ברוכים הבאים — נהלו את השיעורים שלכם בקלות</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="app-fade-up bg-card rounded-2xl border border-border p-4 sm:p-5 space-y-3 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  {stat.value === null ? (
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  ) : (
                    <CountUp value={String(stat.value)} className="text-2xl font-heading font-bold text-foreground" />
                  )}
                  <p className="text-sm text-muted-foreground font-body">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Upcoming lessons */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {cancelError && (
            <div className="bg-red-500/10 border-b border-red-500/20 px-5 py-3 text-red-500 text-sm font-body text-center">
              {cancelError}
            </div>
          )}
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-base font-heading font-semibold text-foreground">השיעורים הבאים</h2>
            <label className="mr-auto flex items-center gap-2 text-sm font-body text-red-500 font-semibold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showCancel}
                onChange={(e) => setShowCancel(e.target.checked)}
                className="w-4 h-4 accent-red-500"
              />
              הצג אפשרות ביטול
            </label>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : lessonsList.length === 0 ? (
            <div className="px-5 py-12 flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                <Calendar className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-body text-sm">אין שיעורים קרובים כרגע</p>
              <p className="text-muted-foreground/70 font-body text-xs">ברגע שיתוכננו שיעורים, הם יופיעו כאן</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-body">
                  <thead>
                    <tr className="bg-muted/50 text-xs font-heading font-semibold text-muted-foreground">
                      {Object.keys(lessonColumnLabels).filter((k) => showCancel || k !== "cancel").map((k) => (
                        <th key={k} ref={k === "cancel" ? cancelColRef : undefined} className={`px-4 py-2.5 text-center border-b border-border ${k === "cancel" ? "text-red-500 bg-red-500/10" : ""}`}>
                          {lessonColumnLabels[k]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {lessonsList.map((lesson, i) => {
                      const today = new Date();
                      const dd = String(today.getDate()).padStart(2, "0");
                      const mm = String(today.getMonth() + 1).padStart(2, "0");
                      const yyyy = today.getFullYear();
                      const todayStr = `${dd}/${mm}/${yyyy}`;
                      const isToday = lesson.dateInTheMonth === todayStr;
                      const isPast = lesson.orderis === 2;
                      return (
                        <tr key={i} className={`hover:bg-muted/30 transition-colors ${isPast ? "bg-red-500/10" : ""}`}>
                          {Object.keys(lessonColumnLabels).filter((k) => showCancel || k !== "cancel").map((k) => (
                            <td key={k} className={`px-4 py-2.5 whitespace-nowrap text-center ${k === "cancel" ? "text-red-500 font-medium bg-red-500/10" : isPast ? "text-red-400 font-medium" : isToday ? "text-orange-500 font-semibold" : "text-foreground"}`}>
                              {k === "cancel" ? (
                                lesson.orderis === 0 ? (
                                  <span className="text-muted-foreground font-medium text-xs">השיעור חלף</span>
                                ) : lesson.orderis === 2 ? (
                                  <span className="text-red-500 font-medium text-xs">{lesson.cancel || "בוטל"}</span>
                                ) : (
                                <button
                                  onClick={() => setConfirmCancelId(lesson.gn06_id)}
                                  disabled={cancellingId === String(lesson.gn06_id)}
                                  className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg px-3 py-1.5 text-xs font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                >
                                  {cancellingId === String(lesson.gn06_id) ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <XCircle className="w-3.5 h-3.5" />
                                  )}
                                  {lesson.cancel || "ביטול שיעור"}
                                </button>
                                )
                              ) : (
                                String(lesson[k] ?? "—")
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden px-4 py-2 bg-muted/40 border-t border-border text-xs text-muted-foreground font-body text-center">
                {"<-- גלול לרוחב לצפייה בכל העמודות -->"}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cancel confirmation dialog */}
      {confirmCancelId && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" onClick={() => setConfirmCancelId(null)}>
          <div className="bg-card rounded-2xl border border-border p-6 max-w-sm w-full space-y-4" onClick={(e) => e.stopPropagation()}>
            <p className="text-center text-base font-body text-foreground">האם אתם בטוחים שברצונכם לבטל את השיעור?</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => handleCancelLesson(confirmCancelId)}
                className="px-5 py-2 bg-red-500 text-white rounded-lg text-sm font-heading font-medium hover:bg-red-600 transition-colors"
              >
                כן, בטל
              </button>
              <button
                onClick={() => setConfirmCancelId(null)}
                className="px-5 py-2 bg-muted text-foreground rounded-lg text-sm font-heading font-medium hover:bg-accent transition-colors"
              >
                לא
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}