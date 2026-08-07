import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ChevronRight, ChevronLeft, RefreshCw, Loader2, ArrowRight, Calendar, GraduationCap, Wallet, Eraser } from "lucide-react";
import SlotCell from "@/components/schedule/SlotCell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FUNCTIONS_BASE = "https://learn-le-connect.base44.app/api/apps/6a37f1517bf59551c5f4b6f9/functions";

const START_HOUR = 7;
const END_HOUR = 21;
const DAYS_COUNT = 6;
const DAY_NAMES = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'"];

function parseApiDate(dateStr) {
  if (!dateStr) return null;
  const datePart = String(dateStr).split("T")[0];
  const [y, m, d] = datePart.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date, fmt) {
  const dd = String(date.getDate()).padStart(2, "0");
  const MM = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  if (fmt === "yyyy-MM-dd") return `${yyyy}-${MM}-${dd}`;
  if (fmt === "dd/MM") return `${dd}/${MM}`;
  if (fmt === "dd/MM/yyyy") return `${dd}/${MM}/${yyyy}`;
  return `${dd}/${MM}`;
}

function getCurrentWeekSunday() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeek = today.getDay();
  // Friday after 14:15 — skip to next Sunday
  if (dayOfWeek === 5 && (now.getHours() > 14 || (now.getHours() === 14 && now.getMinutes() >= 15))) {
    today.setDate(today.getDate() + 2);
    return today;
  }
  let daysToSubtract;
  if (dayOfWeek === 0) daysToSubtract = 0;
  else if (dayOfWeek === 6) daysToSubtract = -1;
  else daysToSubtract = dayOfWeek;
  today.setDate(today.getDate() - daysToSubtract);
  return today;
}

export default function StudentSchedule() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Fallback to localStorage scheduleParams when URL params are missing
  // (e.g. after HYP redirect to a bare URL, page refresh, or direct navigation)
  const savedScheduleParams = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("scheduleParams") || "{}");
    } catch {
      return {};
    }
  }, []);

  const teacherEmail = searchParams.get("teacherEmail") || savedScheduleParams.teacherEmail || "";
  const subjectId = searchParams.get("subjectId") || savedScheduleParams.subjectId || "";
  const subjectName = searchParams.get("subjectName") || savedScheduleParams.subjectName || "";
  const firstDayOfWeekParam = searchParams.get("firstDayOfWeek") || "";

  const [studentEmail] = useState(() => {
    // URL param takes priority — after HYP redirect, localStorage may be stale/empty
    const urlEmail = searchParams.get("studentEmail") || "";
    if (urlEmail) return urlEmail;
    try {
      const userDataStr = localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}";
      const userData = JSON.parse(userDataStr);
      return userData.studentEmail || userData.email || savedScheduleParams.studentEmail || "";
    } catch {
      return savedScheduleParams.studentEmail || "";
    }
  });
  const [authToken, setAuthToken] = useState(() => {
    const urlToken = searchParams.get("authToken") || "";
    if (urlToken) {
      localStorage.setItem("authToken", urlToken);
      sessionStorage.setItem("authToken", urlToken);
      return urlToken;
    }
    return localStorage.getItem("authToken") || sessionStorage.getItem("authToken") || "";
  });

  const [weekStart, setWeekStart] = useState(() => {
    if (firstDayOfWeekParam) {
      const parsed = parseApiDate(firstDayOfWeekParam);
      if (parsed && !isNaN(parsed.getTime())) return parsed;
    }
    return getCurrentWeekSunday();
  });
  const [weekSlots, setWeekSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [teacherOptions, setTeacherOptions] = useState([]);
  const [debugKeys, setDebugKeys] = useState([]);
  const [totalFreeSlots, setTotalFreeSlots] = useState(0);
  const [clearLoading, setClearLoading] = useState(false);



  const slotLookup = useMemo(() => {
    const map = {};
    weekSlots.forEach((slot) => {
      if (slot.gn06_date && slot.gn06_startEndHoures != null) {
        const date = parseApiDate(slot.gn06_date);
        const key = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}_${slot.gn06_startEndHoures}`;
        map[key] = slot;
      }
    });
    return map;
  }, [weekSlots]);

  const getSlotForCell = (date, hour) => {
    const key = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}_${hour}`;
    return slotLookup[key];
  };

  const loadWeekSlots = useCallback(async () => {
    // Re-auth if token is missing (e.g., after HYP redirect cleared storage)
    let currentToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken") || "";
    if (!currentToken) {
      try {
        const creds = JSON.parse(sessionStorage.getItem("sessionCredentials") || "{}");
        if (creds.email && creds.password) {
          const res = await fetch(`${FUNCTIONS_BASE}/authProxy`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userType: creds.userType || "student", email: creds.email, password: creds.password }),
          }).then((r) => r.json());
          currentToken = res.accessToken || res.AccessToken || res.token || "";
          if (currentToken) {
            localStorage.setItem("authToken", currentToken);
            sessionStorage.setItem("authToken", currentToken);
            localStorage.setItem("userData", JSON.stringify(res));
            sessionStorage.setItem("userData", JSON.stringify(res));
            setAuthToken(currentToken);
          }
        }
      } catch (e) { /* ignore re-auth errors */ }
    }

    if (!teacherEmail || !studentEmail || !subjectId) {
      setInitialLoaded(true);
      return;
    }
    setLoading(true);
    setLoadError("");
    setTotalFreeSlots(0);
    try {
      const data = await fetch(`${FUNCTIONS_BASE}/weekSlotsProxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getStudent",
          teacherEmail,
          token: currentToken,
          studentEmail,
          firstDayOfWeek: formatDate(weekStart, "yyyy-MM-dd"),
          subjectId,
        }),
      }).then((r) => r.json());
      if (data.error) {
        setWeekSlots([]);
        setLoadError("שגיאת API: " + (data.message || data.error));
      } else {
        const slots = Array.isArray(data) ? data : data.data || data.weekSlots || data.slots || [];
        const teachers = data.teachersNew || data.TeachersNew || (data.data && data.data.teachersNew) || [];
        const freeCount = data.countTotalSlotStateFree ?? (data.data && data.data.countTotalSlotStateFree) ?? 0;
        setWeekSlots(slots);
        setTeacherOptions(teachers);
        setTotalFreeSlots(freeCount);
      }
    } catch (err) {
      setWeekSlots([]);
      setLoadError("שגיאת טעינה: " + (err.message || err));
    } finally {
      setLoading(false);
      setInitialLoaded(true);
    }
  }, [teacherEmail, studentEmail, subjectId, weekStart]);

  useEffect(() => {
    loadWeekSlots();
  }, [loadWeekSlots]);

  // Persist current params to localStorage so other pages can recover them
  useEffect(() => {
    if (teacherEmail || subjectId) {
      const sp = { teacherEmail, subjectId, subjectName, studentEmail, firstDayOfWeek: firstDayOfWeekParam };
      localStorage.setItem("scheduleParams", JSON.stringify(sp));
    }
  }, [teacherEmail, subjectId, subjectName, studentEmail, firstDayOfWeekParam]);

  useEffect(() => {
    setInitialLoaded(false);
  }, [weekStart]);

  const teacherSelectValue = `${teacherEmail}__${subjectId}`;
  const selectedTeacherLesson = teacherOptions.find(
    (t) => String(t.gn06_Email) === String(teacherEmail) && String(t.subject) === String(subjectId)
  )?.lesson || "";

  const handleTeacherChange = (combined) => {
    const [email, subj] = combined.split("__");
    const params = new URLSearchParams(searchParams);
    params.set("teacherEmail", email);
    params.set("subjectId", subj);
    setSearchParams(params);
  };

  const handlePrevWeek = () => {
    const newStart = new Date(weekStart);
    newStart.setDate(newStart.getDate() - 7);
    setWeekStart(newStart);
  };

  const handleNextWeek = () => {
    const newStart = new Date(weekStart);
    newStart.setDate(newStart.getDate() + 7);
    setWeekStart(newStart);
  };

  const handleClearSelections = async () => {
    setClearLoading(true);
    setLoadError("");
    try {
      const res = await fetch(`${FUNCTIONS_BASE}/weekSlotsProxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "backToSchedule",
          token: authToken,
          studentEmail,
          isTimerExpiredCancel: 2,
        }),
      }).then((r) => r.json());
      if (res.error) {
        setLoadError("שגיאת ניקוי: " + (res.message || res.error));
        setClearLoading(false);
        return;
      }
      await loadWeekSlots();
    } catch (err) {
      setLoadError("שגיאת ניקוי: " + (err.message || err));
    } finally {
      setClearLoading(false);
    }
  };

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 5);
  const weekRange = `${formatDate(weekStart, "dd/MM")} - ${formatDate(weekEnd, "dd/MM")}`;
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  const missingParams = !teacherEmail || !studentEmail || !subjectId;

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          חזרה
        </button>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground flex items-center gap-2">
          <Calendar className="w-7 h-7 text-primary" />
          הזמנת שיעור
        </h1>
      </div>

      {missingParams && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-destructive text-sm font-body">
          חסרים נתונים להצגת לוח הזמינות
        </div>
      )}

      {loadError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-destructive text-sm font-body">
          {loadError}
        </div>
      )}

      {/* LEGEND */}
      <div className="space-y-2" role="region" aria-label="מקרא צבעים">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          <span className="flex items-center gap-1.5 text-xs font-body text-foreground" role="listitem">
            <span className="w-3.5 h-3.5 rounded-sm shrink-0" style={{ background: "#d1edd8", border: "1px solid #4caf73" }} aria-hidden="true" />
            שיעור זמין
          </span>
          <span className="flex items-center gap-1.5 text-xs font-body text-foreground" role="listitem">
            <span className="w-3.5 h-3.5 rounded-sm shrink-0" style={{ background: "#cce5ff", border: "1px solid #c8a84b" }} aria-hidden="true" />
            שיעור קיים
          </span>
          <span className="flex items-center gap-1.5 text-xs font-body text-foreground" role="listitem">
            <span className="w-3.5 h-3.5 rounded-sm shrink-0" style={{ background: "#fffde7", border: "1px solid #f9a825" }} aria-hidden="true" />
            ממתין לאישור סופי
          </span>
          <span className="flex items-center gap-1.5 text-xs font-body text-foreground" role="listitem">
            <span className="w-3.5 h-3.5 rounded-sm shrink-0" style={{ background: "#edeef0", border: "1px solid #d0d3d8" }} aria-hidden="true" />
            עבר / לא זמין
          </span>
        </div>
      </div>

      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm -mx-4 px-4 border-b border-border">
        {(selectedTeacherLesson || subjectName) && (
          <p className="text-center text-muted-foreground font-body pt-2 pb-1 text-sm">{selectedTeacherLesson || subjectName}</p>
        )}
        <div className="flex justify-center gap-2 py-2">
          <button
            disabled={totalFreeSlots === 0}
          onClick={() => {
            if (totalFreeSlots === 0) return;
            const params = new URLSearchParams({
              teacherEmail,
              subjectId,
              subjectName,
              studentEmail,
              firstDayOfWeek: formatDate(weekStart, "yyyy-MM-dd"),
              authToken,
            });
            navigate(`/student-payment?${params.toString()}`);
          }}
          className="flex items-center gap-1.5 bg-yellow-500 text-white font-heading font-semibold px-5 py-2 text-sm rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Wallet className="w-4 h-4" />
          אישור ומעבר לתשלום
        </button>
        <button
          onClick={handleClearSelections}
          disabled={clearLoading || totalFreeSlots === 0}
          className="flex items-center gap-1.5 bg-transparent text-red-500 border-2 border-red-400 dark:border-red-400 dark:text-red-400 font-heading font-semibold px-5 py-2 text-sm rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {clearLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eraser className="w-4 h-4" />}
          ניקוי בחירות
        </button>
        </div>
      </div>

      {/* Teacher dropdown */}
      {teacherOptions.length > 0 && (
      <div className="bg-card rounded-2xl border border-border p-4 space-y-2" dir="rtl">
        <label className="block w-full text-right text-sm font-heading font-semibold text-foreground">
          <GraduationCap className="inline w-4 h-4 text-primary ml-1 align-middle" />
          בחירת מורה למקצוע הנבחר
        </label>
        <Select value={teacherSelectValue} onValueChange={handleTeacherChange}>
          <SelectTrigger className="w-full text-right flex-row-reverse">
            <SelectValue placeholder="בחרו מורה" />
          </SelectTrigger>
          <SelectContent dir="rtl" className="min-w-[16rem] max-w-[90vw]">
            {teacherOptions.map((t, i) => (
              <SelectItem 
                key={`${t.gn06_Email}-${t.subject}-${i}`} 
                value={`${t.gn06_Email}__${t.subject}`}
                className="text-right justify-start whitespace-normal break-words leading-snug py-2"
              >
                {t.lesson}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      )}

      {/* Week navigation */}
      <div className="flex items-center justify-between bg-card rounded-2xl border border-border p-3">
        <button onClick={handlePrevWeek} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
        <span className="font-heading font-medium text-foreground text-sm sm:text-base">{weekRange}</span>
        <button onClick={handleNextWeek} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={loadWeekSlots} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {!initialLoaded ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Day headers */}
          <div className="sticky top-[9.75rem] z-20 grid grid-cols-6 gap-1 bg-background/95 backdrop-blur-sm py-2 -mx-4 px-4 border-b border-border">
            {Array.from({ length: DAYS_COUNT }, (_, day) => {
              const date = new Date(weekStart);
              date.setDate(date.getDate() + day);
              return (
                <div key={day} className="text-center py-1">
                  <div className="font-heading font-bold text-sm sm:text-base text-foreground">{DAY_NAMES[day]}</div>
                  <div className="text-xs text-muted-foreground font-body">{formatDate(date, "dd/MM")}</div>
                </div>
              );
            })}
          </div>

          {/* Slots grid */}
          <div className="grid grid-cols-6 gap-1">
            {hours.map((hour) =>
              Array.from({ length: DAYS_COUNT }, (_, day) => {
                const date = new Date(weekStart);
                date.setDate(date.getDate() + day);
                const slot = getSlotForCell(date, hour);
                const startTime = `${String(hour).padStart(2, "0")}:00`;
                const endTime = `${String(hour + 1).padStart(2, "0")}:00`;
                const dayName = DAY_NAMES[day];
                const tooltip = slot?.gn06_tooltip
                  ? slot.gn06_tooltip.replace(/;/g, " | ")
                  : `יום ${dayName} - שעה ${startTime}`;
                if (!slot) return <div key={`${hour}-${day}`} />;
                const disabled = slot.gn06_1Enabled_0disabled === 0;
                return (
                  <SlotCell
                    key={`${hour}-${day}`}
                    slot={slot}
                    isPast={false}
                    startTime={startTime}
                    endTime={endTime}
                    tooltip={tooltip}
                    onClick={disabled ? undefined : async () => {
                      const cssClass = slot?.gn06_CssClass ?? "";
                      if (cssClass === "selected") {
                        const details = slot?.gn06_tooltip
                          ? slot.gn06_tooltip.replace(/;/g, " | ")
                          : `יום ${dayName} - שעה ${startTime}`;
                        toast(details);
                        return;
                      }
                      if (cssClass !== "available" && cssClass !== "tentative") return;
                      try {
                       const reqBody = {
                           action: "studentSelectUnselect",
                           teacherEmail,
                           token: authToken,
                           studentEmail,
                           slotDate: formatDate(date, "yyyy-MM-dd"),
                           startHoures: slot?.gn06_startEndHoures,
                           cssClass,
                           subjectId,
                       };
                        const res = await fetch(`${FUNCTIONS_BASE}/weekSlotsProxy`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(reqBody),
                        }).then((r) => r.json());
                        const resultCode = res.ResultCode ?? res.resultCode ?? res._status;
                        if (resultCode === 200) {
                          const newCssClass = cssClass === "available" ? "tentative" : "available";
                          if (res.resultTotalslotState_1free != null) {
                            setTotalFreeSlots(Number(res.resultTotalslotState_1free) || 0);
                          }
                          setWeekSlots((prev) => prev.map((s) =>
                            s === slot ? { ...s, gn06_CssClass: newCssClass } : s
                          ));
                        } else if (resultCode === 409) {
                          const msg = res.ResultMessage ?? res.resultMessage ?? "שגיאה";
                          await loadWeekSlots();
                          toast.error(msg);
                        } else {
                          const msg = res.ResultMessage ?? res.resultMessage ?? res.message ?? `ResultCode ${resultCode}`;
                          setLoadError("שגיאה: " + msg);
                        }
                      } catch (err) {
                        setLoadError("שגיאת טעינה: " + (err.message || err));
                      }
                    }}
                  />
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}