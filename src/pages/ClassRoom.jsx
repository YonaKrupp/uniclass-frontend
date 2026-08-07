import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Video, RefreshCw, Maximize2, Minimize2, LogOut, Loader2, Play, Clock, User, BookOpen, VideoOff } from "lucide-react";
import { setVideoActive } from "@/lib/useSessionRenewal";
import PageLogo from "@/components/PageLogo";

const API_BASE = "https://learn-le-connect.base44.app/api/apps/6a37f1517bf59551c5f4b6f9/functions";

// Module-level guard: ensures only one polling interval exists across all ClassRoom instances
let lessonsIntervalId = null;
// Prevents rapid duplicate loadLessons() calls across remounts (within 5 seconds)
let lastLessonsLoadTime = 0;

export default function ClassRoom() {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const authToken = localStorage.getItem("authToken") || "";
  const userRole = localStorage.getItem("userRole") || "student";
  const isTeacher = userRole === "teacher";
  const userEmail = userData.teacherEmail || userData.studentEmail || userData.email || "";

  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roomUrl, setRoomUrl] = useState(null);
  const [info, setInfo] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const placeholderRef = useRef(null);
  const [videoPos, setVideoPos] = useState(null);

  const now = new Date();
  const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const todayDisplay = now.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" });

  const renewToken = async () => {
    try {
      const credsStr = sessionStorage.getItem("sessionCredentials") || "{}";
      const credentials = JSON.parse(credsStr);
      if (!credentials.email || !credentials.password) return null;
      const res = await fetch(`${API_BASE}/authProxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userType: credentials.userType || (isTeacher ? "teacher" : "student"),
          email: credentials.email,
          password: credentials.password,
        }),
      });
      const data = await res.json();
      if (data.error || data.success === false) return null;
      const newToken = data.accessToken || data.AccessToken || data.token || "";
      if (!newToken) return null;
      localStorage.setItem("authToken", newToken);
      localStorage.setItem("userData", JSON.stringify(data));
      sessionStorage.setItem("authToken", newToken);
      sessionStorage.setItem("userData", JSON.stringify(data));
      return newToken;
    } catch {
      return null;
    }
  };

  const loadLessons = async (isRetry = false) => {
    if (!userEmail) {
      setError("נדרש להיות מחובר");
      return;
    }
    // Prevent rapid duplicate calls across remounts (HMR, double-mount, etc.)
    if (!isRetry) {
      const now = Date.now();
      if (now - lastLessonsLoadTime < 5000) return;
      lastLessonsLoadTime = now;
    }
    setLoading(true);
    setError("");
    setInfo("טוען שיעורים...");
    try {
      const currentToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken") || "";
      const res = await fetch(`${API_BASE}/classRoomProxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getLessons",
          userType: isTeacher ? "teacher" : "student",
          email: userEmail,
          todayDate,
          token: currentToken,
        }),
      });
      const data = await res.json();
      if (data._status === 401) {
        if (!isRetry) {
          const newToken = await renewToken();
          if (newToken) return loadLessons(true);
        }
        setError("פג תוקף החיבור. התנתקו והתחברו מחדש, ואז חזרו לדף הוידאו.");
        setLessons([]);
        setInfo("");
        return;
      }
      if (data.error) {
        setError(data.error);
        setLessons([]);
        setInfo("");
        return;
      }
      const rawLessons = data.Data || data.data || data.lessonsList || [];
      const items = rawLessons.map((lesson, idx) => ({
        gn06_id: lesson.gn06_id ?? lesson.Gn06_id ?? idx,
        timeslot: lesson.Timeslot || lesson.timeslot,
        gname: lesson.GName || lesson.gName || lesson.gname,
        participantName: isTeacher
          ? (lesson.StudentName || lesson.studentName)
          : (lesson.TeacherName || lesson.teacherName),
        dailyRoom: lesson.DailyRoom || lesson.dailyRoom,
      }));
      setLessons(items);
      setInfo(`נמצאו ${items.length} שיעורים זמינים לעכשיו`);
    } catch (err) {
      setError("שגיאה בטעינת השיעורים: " + (err.message || ""));
      setLessons([]);
      setInfo("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Clear any stale interval from a previous mount (HMR, remount, etc.)
    if (lessonsIntervalId) {
      clearInterval(lessonsIntervalId);
      lessonsIntervalId = null;
    }
    loadLessons();
    lessonsIntervalId = setInterval(() => loadLessons(), 60000);
    return () => {
      if (lessonsIntervalId) {
        clearInterval(lessonsIntervalId);
        lessonsIntervalId = null;
      }
    };
  }, []);

  const resolveRoomUrl = async (dailyRoom) => {
    if (dailyRoom.startsWith("http://") || dailyRoom.startsWith("https://")) {
      return dailyRoom;
    }
    if (dailyRoom.includes(".daily.co")) {
      return `https://${dailyRoom}`;
    }
    // Call API to get or create room
    setInfo("יוצר חדר וידאו...");
    const res = await fetch(`${API_BASE}/classRoomProxy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getRoom",
        roomName: dailyRoom,
        userName: userEmail,
        token: localStorage.getItem("authToken") || sessionStorage.getItem("authToken") || "",
      }),
    });
    const data = await res.json();
    const success = data.Success ?? data.success;
    if (data.error || success === false) {
      throw new Error(data.error || data.message || "לא הצלחנו ליצור את החדר");
    }
    const roomData = data.Data || data.data || {};
    let url = roomData.Url || roomData.url || "";
    const token = data.Token || data.token || roomData.Token || roomData.token;
    if (token) {
      url = `${url}${url.includes("?") ? "&" : "?"}t=${token}`;
    }
    return url;
  };

  const handleStartRoom = async (lesson) => {
    if (!lesson.dailyRoom) {
      setError("לא נמצא שם חדר לשיעור זה");
      return;
    }
    setError("");
    setInfo("מתחבר לחדר...");
    try {
      const url = await resolveRoomUrl(lesson.dailyRoom);
      setRoomUrl(url);
      setInfo(`מתחבר לחדר: ${lesson.participantName || ""}`);
    } catch (err) {
      setError("שגיאה בפתיחת החדר: " + (err.message || ""));
      setInfo("");
    }
  };

  const handleLeaveRoom = () => {
    setRoomUrl(null);
    setInfo("חדר לא מחובר");
    setIsFullscreen(false);
  };

  // Keep the global video-active flag in sync so session renewal won't
  // force-logout in the middle of a live lesson.
  useEffect(() => {
    setVideoActive(!!roomUrl);
    return () => setVideoActive(false);
  }, [roomUrl]);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      // Native Fullscreen API — works on desktop & Android, silently fails on iOS Safari
      const el = wrapperRef.current;
      if (el && el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if (el && el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
    } else {
      setIsFullscreen(false);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
    };
  }, []);

  // Always render video room on document.body (via portal) to avoid iframe remounting.
  // In non-fullscreen, position it over a placeholder in the page flow.
  useLayoutEffect(() => {
    if (!roomUrl || isFullscreen || !placeholderRef.current) return;
    const measure = () => {
      if (!placeholderRef.current) return;
      const rect = placeholderRef.current.getBoundingClientRect();
      setVideoPos({ top: rect.top + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
    };
    measure();
    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(placeholderRef.current);
    if (placeholderRef.current.parentElement) ro.observe(placeholderRef.current.parentElement);
    return () => {
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, [roomUrl, isFullscreen, lessons]);

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <PageLogo />
        <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground flex items-center gap-2">
            <Video className="w-7 h-7 text-primary" />
            וידאו
          </h1>
          <p className="text-muted-foreground font-body text-sm">תאריך: {todayDisplay}</p>
        </div>
        <button
          onClick={loadLessons}
          disabled={loading}
          className="px-4 py-2.5 bg-muted text-foreground rounded-xl text-sm font-heading font-medium hover:bg-accent transition-colors flex items-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          רענון
        </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-sm font-body">
          {error}
        </div>
      )}

      {/* Lessons List */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-muted/50 text-xs font-heading font-semibold text-muted-foreground border-b border-border">
          <div className="col-span-3 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />שעה</div>
          <div className="col-span-4 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" />שיעור</div>
          <div className="col-span-3 flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{isTeacher ? "תלמיד" : "מורה"}</div>
          <div className="col-span-2 text-center">כניסה</div>
        </div>

        {loading && lessons.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : lessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
            <VideoOff className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-sm font-body">אין שיעורים זמינים כעת</p>
            <p className="text-xs font-body text-muted-foreground/70">השיעורים ניפתחים 10 דקות לפני תחילת השיעור</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {lessons.map((lesson) => (
              <div key={lesson.gn06_id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center text-sm hover:bg-muted/30 transition-colors">
                <div className="col-span-3 font-body text-foreground">{lesson.timeslot || "—"}</div>
                <div className="col-span-4 font-body text-foreground truncate">{lesson.gname || "—"}</div>
                <div className="col-span-3 font-body text-muted-foreground truncate">{lesson.participantName || "—"}</div>
                <div className="col-span-2 flex justify-center">
                  <button
                    onClick={() => handleStartRoom(lesson)}
                    className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-heading font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    כניסה
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {info && !roomUrl && (
        <p className="text-sm text-muted-foreground font-body text-center">{info}</p>
      )}

      {/* Video Room — always portaled to document.body to avoid iframe remounting */}
      {roomUrl && (
        <>
          <div ref={placeholderRef} style={{ height: isFullscreen ? 0 : 500 }} />
          {createPortal(
            <div
              ref={wrapperRef}
              className={isFullscreen
                ? "fixed inset-0 z-[9999] bg-black flex flex-col"
                : "absolute bg-card rounded-2xl border border-border overflow-hidden"
              }
              style={isFullscreen
                ? { width: "100%", height: "100%" }
                : videoPos
                  ? { top: videoPos.top, left: videoPos.left, width: videoPos.width }
                  : { visibility: "hidden" }
              }
            >
              <div className={isFullscreen
                ? "flex items-center justify-between px-3 py-2 bg-black/90 text-white shrink-0"
                : "flex items-center justify-between px-4 py-3 border-b border-border bg-muted/50"
              }>
                <p className={isFullscreen
                  ? "text-sm font-body truncate max-w-[60%] text-white"
                  : "text-sm font-body text-muted-foreground truncate"
                }>{info || "מחובר לחדר הוידאו"}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleFullscreen}
                    className={isFullscreen
                      ? "p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                      : "p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    }
                    title={isFullscreen ? "יציאה ממסך מלא" : "מסך מלא"}
                  >
                    {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={handleLeaveRoom}
                    className={isFullscreen
                      ? "px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-heading font-medium hover:bg-red-700 transition-colors flex items-center gap-1.5"
                      : "px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg text-sm font-heading font-medium hover:bg-destructive/20 transition-colors flex items-center gap-1.5"
                    }
                  >
                    <LogOut className="w-4 h-4" />
                    יציאה
                  </button>
                </div>
              </div>
              <div ref={containerRef} className={isFullscreen ? "flex-1 relative" : "relative w-full"} style={isFullscreen ? undefined : { height: "450px" }}>
                <iframe
                  src={roomUrl}
                  allow="camera; microphone; fullscreen; display-capture; autoplay"
                  className={isFullscreen ? "absolute inset-0 w-full h-full border-0" : "w-full h-full border-0"}
                  title="חדר וידאו"
                />
              </div>
            </div>,
            document.body
          )}
        </>
      )}
    </div>
  );
}