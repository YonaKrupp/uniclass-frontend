import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Users, Calendar, Star, Loader2, AlertCircle } from "lucide-react";
import WelcomeBanner from "@/components/WelcomeBanner";

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

  const lessonColumnLabels = {
    dayInTheWeek: "יום",
    dateInTheMonth: "תאריך",
    startEndHoure: "שעה",
    subjectName: "מקצוע",
    studentName: "שם התלמיד/ה",
  };

  const stats = [
    { label: "שיעורים היום", value: loading ? null : todayLessons, icon: Calendar, color: "bg-primary/10 text-primary", valueColor: "text-orange-500" },
    { label: "דירוג מורה", value: loading ? null : ratingLabel, icon: Star, color: "bg-chart-4/10 text-chart-4", small: true },
    { label: "שיעורים מתוכננים", value: loading ? null : scheduledLessons, icon: BookOpen, color: "bg-chart-1/10 text-chart-1" },
    { label: "תלמידים", value: loading ? null : students, icon: Users, color: "bg-chart-2/10 text-chart-2" },
  ];

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
    <div dir="rtl" className="space-y-8">
      {/* Logo */}
      <div className="flex justify-center">
        <img
          src="https://media.base44.com/images/public/6a37f1517bf59551c5f4b6f9/0cf1a42dc_Logo_UNICLASS_2_PNG.png"
          alt="UniClass"
          className="h-12 sm:h-14 w-auto object-contain"
        />
      </div>

      {/* Welcome banner */}
      <WelcomeBanner
        image="https://media.base44.com/images/public/6a37f1517bf59551c5f4b6f9/aa21c278c_generated_image.png"
        badge="פאנל מורים"
        title={`שלום, ${name} 👋`}
        subtitle="ברוכים הבאים — נהלו את השיעורים והתלמידים שלכם"
      />

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-card rounded-2xl border border-border p-4 sm:p-5 space-y-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                {stat.value === null ? (
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                ) : (
                  <p className={`font-heading font-bold ${stat.valueColor ?? "text-foreground"} ${stat.small ? "text-lg" : "text-2xl"}`}>{stat.value}</p>
                )}
                <p className="text-sm text-muted-foreground font-body">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming lessons */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          <h2 className="text-base font-heading font-semibold text-foreground">שיעורים מתוכננים</h2>
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
            <p className="text-muted-foreground font-body text-sm">אין שיעורים מתוכננים כרגע</p>
            <p className="text-muted-foreground/70 font-body text-xs">ברגע שיתוכננו שיעורים, הם יופיעו כאן</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="bg-muted/50 text-xs font-heading font-semibold text-muted-foreground">
                    {typeof lessonsList[0] === "object" &&
                      Object.keys(lessonsList[0]).map((k) => (
                        <th key={k} className="px-4 py-2.5 text-center border-b border-border">
                          {lessonColumnLabels[k] || k}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {lessonsList.map((lesson, i) => {
                    const lessonDate = typeof lesson === "object" ? (lesson.dateInTheMonth || "") : "";
                    const [y, m, d] = todayDate.split("-");
                    const todayDDMMYYYY = `${d}/${m}/${y}`;
                    const isToday = lessonDate === todayDate || lessonDate === todayDDMMYYYY;
                    return (
                      <tr key={i} className="hover:bg-muted/30 transition-colors">
                        {typeof lesson === "object"
                          ? Object.values(lesson).map((v, j) => (
                              <td key={j} className={`px-4 py-2.5 whitespace-nowrap text-center ${isToday ? "text-orange-500 font-semibold" : "text-foreground"}`}>
                                {String(v ?? "—")}
                              </td>
                            ))
                          : <td className="px-4 py-2.5 text-foreground text-center">{String(lesson)}</td>
                        }
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
    </div>
  );
}