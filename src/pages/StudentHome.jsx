import React, { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import StudentBanner from "@/components/student/StudentBanner";
import StudentStats from "@/components/student/StudentStats";
import StudentLessonsBoard from "@/components/student/StudentLessonsBoard";
import TeacherActivityChart from "@/components/teacher/TeacherActivityChart";

// Storage keys — localStorage survives page reloads, tab closes, and sessionStorage clears
const FETCH_TIME_KEY = "_studentHome_lastFetch";
const CACHED_DATA_KEY = "_studentHome_cachedData";
const CACHED_EMAIL_KEY = "_studentHome_cachedEmail";
const FETCH_COOLDOWN_MS = 30000;

// Module-level: prevents concurrent fetch calls within the same page load
let _fetchInProgress = false;

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

  const now = new Date();
  const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

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
        await fetchHomeData(studentEmail, authToken, true);
      }
    } catch (err) {
      setCancelError(err.message || "שגיאה בביטול השיעור");
    } finally {
      setCancellingId(null);
    }
  };

  const hd = data?.homeData ?? {};
  const lessonsList = data?.lessonsList ?? [];
  const name = hd.studentName || userData.studentName || userData.fullName || userData.name || "תלמיד";

  return (
    <div dir="rtl" className="relative">
      {/* Ambient dashboard gradient — consistent with the landing design language */}
      <div
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[80%] h-64 rounded-full blur-[130px] opacity-[0.05] pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(243 75% 59%), transparent 70%)" }}
      />
      <div className="relative z-10 space-y-6">
        <StudentBanner name={name} />
        <StudentStats
          loading={loading}
          todayLessons={hd.todayLesonCount ?? "—"}
          teachers={hd.teacherCount ?? "—"}
          scheduledLessons={hd.scheduledLessons ?? "—"}
          activeSubjects={hd.activeLessons ?? "—"}
        />
        <TeacherActivityChart lessons={lessonsList} />
        <StudentLessonsBoard
          loading={loading}
          lessons={lessonsList}
          todayDate={todayDate}
          showCancel={showCancel}
          setShowCancel={setShowCancel}
          cancellingId={cancellingId}
          onConfirmCancel={setConfirmCancelId}
          cancelError={cancelError}
        />
      </div>

      {/* Cancel confirmation dialog — matches the site alert style */}
      {confirmCancelId && (
        <div
          className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 app-fade-up"
          onClick={() => setConfirmCancelId(null)}
        >
          <div
            className="bg-card rounded-3xl border border-border/70 shadow-2xl max-w-sm w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center">
              <span className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </span>
            </div>
            <p className="text-center text-base font-heading font-semibold text-foreground">
              האם אתם בטוחים שברצונכם לבטל את השיעור?
            </p>
            <div className="flex gap-2 justify-center pt-1">
              <button
                onClick={() => setConfirmCancelId(null)}
                className="px-5 py-2.5 rounded-full border border-border text-sm font-heading font-medium text-foreground hover:bg-muted transition-colors"
              >
                לא
              </button>
              <button
                onClick={() => handleCancelLesson(confirmCancelId)}
                className="px-5 py-2.5 rounded-full bg-destructive text-destructive-foreground text-sm font-heading font-semibold shadow-md shadow-destructive/25 hover:bg-destructive/90 hover:shadow-lg transition-all"
              >
                כן, בטל
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}