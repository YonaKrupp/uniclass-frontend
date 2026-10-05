import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import TeacherBanner from "@/components/teacher/TeacherBanner";
import TeacherStats from "@/components/teacher/TeacherStats";
import TeacherActivityChart from "@/components/teacher/TeacherActivityChart";
import TeacherLessonsBoard from "@/components/teacher/TeacherLessonsBoard";

// Module-level in-flight promise store — prevents duplicate concurrent fetches
// for the same email when TeacherHome mounts multiple times in quick succession
// (e.g., immediately after Google login redirect). Survives HMR via globalThis.
if (!globalThis._teacherHomeInflight) globalThis._teacherHomeInflight = {};

export default function TeacherHome() {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}");
  const [name, setName] = useState("");
  const teacherEmail = userData.teacherEmail || userData.email || "";
  const authToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken") || "";

  const now = new Date();
  const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    console.log("[TeacherHome] mount effect, email:", teacherEmail, "hasToken:", !!authToken);
    if (!teacherEmail) { setLoading(false); return; }

    // Diagnostic: list all _teacherHome_ keys in localStorage
    const allKeys = Object.keys(localStorage).filter(k => k.startsWith("_teacherHome_"));
    console.log("[TeacherHome] existing _teacherHome_ keys in localStorage:", allKeys);

    const cacheKey = `_teacherHome_${teacherEmail}`;
    const CACHE_TTL = 30000; // 30 seconds — blocks refetch on remount/reload within this window

    // Check cache first — if data was fetched recently, reuse it (no API call)
    try {
      const cachedRaw = localStorage.getItem(cacheKey);
      console.log("[TeacherHome] cacheKey:", cacheKey, "found:", !!cachedRaw);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        const age = cached?._cachedAt ? Date.now() - cached._cachedAt : null;
        console.log("[TeacherHome] cache age:", age, "ms, hasData:", !!cached?.data);
        if (cached?._cachedAt && age < CACHE_TTL) {
          console.log("[TeacherHome] ✅ Using cached data — no API call");
          setData(cached.data);
          if (cached.data?.homeVariables?.teacherName) setName(cached.data.homeVariables.teacherName);
          setLoading(false);
          return;
        }
        console.log("[TeacherHome] ❌ Cache stale or invalid — will refetch");
      } else {
        console.log("[TeacherHome] ❌ No cache — will fetch");
      }
    } catch (e) { console.log("[TeacherHome] cache read error:", e.message); }

    // Check if a fetch is already in-flight for this email — if so, await it
    // instead of starting a duplicate fetch (prevents race condition on rapid remounts)
    if (globalThis._teacherHomeInflight[teacherEmail]) {
      console.log("[TeacherHome] ⏳ Fetch already in-flight — awaiting existing promise");
      globalThis._teacherHomeInflight[teacherEmail].then((data) => {
        setData(data);
        if (data?.homeVariables?.teacherName) setName(data.homeVariables.teacherName);
        setLoading(false);
      }).catch(() => setLoading(false));
      return;
    }

    console.log("[TeacherHome] 🔄 Starting API fetch...");
    const fetchPromise = fetch('https://learn-le-connect.base44.app/api/apps/6a37f1517bf59551c5f4b6f9/functions/teacherHomeProxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: teacherEmail, token: authToken, todayDate }),
    }).then(r => r.json()).then((data) => {
      console.log("teacherHomeProxy full response:", JSON.stringify(data));
      if (data?._status === 401) {
        setAuthError(true);
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        setTimeout(() => navigate("/teacher-login"), 2000);
        return data;
      }
      setData(data);
      if (data?.homeVariables?.teacherName) setName(data.homeVariables.teacherName);
      try {
        localStorage.setItem(cacheKey, JSON.stringify({ data, _cachedAt: Date.now() }));
        console.log("[TeacherHome] ✅ Cache written to localStorage, key:", cacheKey);
      } catch (e) { console.log("[TeacherHome] ❌ localStorage.setItem failed:", e.message); }
      return data;
    }).catch((err) => { console.error("teacherHomeProxy error:", err); throw err; })
      .finally(() => { setLoading(false); globalThis._teacherHomeInflight[teacherEmail] = null; });

    globalThis._teacherHomeInflight[teacherEmail] = fetchPromise;
  }, []);

  const hv = data?.homeVariables ?? {};
  const todayLessons = hv.todayLesonCount ?? "—";
  const students = hv.studentCount ?? "—";
  const scheduledLessons = hv.scheduledLessons ?? "—";
  const avgRating = hv.teacherAvgRating;
  const reviewsCount = hv.ratingReviewsCount;
  const ratingLabel = avgRating != null
    ? `${avgRating} מתוך ${reviewsCount ?? "?"} דירוגים`
    : "—";

  const lessonsList = data?.lessonsList ?? [];

  if (authError) {
    return (
      <div dir="rtl" className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <div className="space-y-1">
          <h2 className="text-xl font-heading font-bold text-foreground">פג תוקף החיבור</h2>
          <p className="text-muted-foreground font-body text-sm">מיד תועברו למסך ההתחברות...</p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="relative">
      {/* Ambient dashboard gradient — consistent with the landing design language */}
      <div
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[80%] h-64 rounded-full blur-[130px] opacity-[0.05] pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(243 75% 59%), transparent 70%)" }}
      />
      <div className="relative z-10 space-y-6">
        <TeacherBanner name={name} />
        <TeacherStats
          loading={loading}
          todayLessons={todayLessons}
          students={students}
          scheduledLessons={scheduledLessons}
          ratingLabel={ratingLabel}
        />
        <TeacherActivityChart lessons={lessonsList} />
        <TeacherLessonsBoard loading={loading} lessons={lessonsList} todayDate={todayDate} />
      </div>
    </div>
  );
}