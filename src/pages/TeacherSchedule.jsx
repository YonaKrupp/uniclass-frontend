import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import SlotCell from "@/components/schedule/SlotCell";
import ScheduleAlert from "@/components/schedule/ScheduleAlert";

const API_BASE = "https://learn-le-connect.base44.app/api/apps/6a37f1517bf59551c5f4b6f9/functions";

const invokeWeekSlots = async (payload) => {
  const res = await fetch(`${API_BASE}/weekSlotsProxy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return await res.json();
};
const invokeProfile = async (payload) => {
  const res = await fetch(`${API_BASE}/teacherProfileProxy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return await res.json();
};

const START_HOUR = 7;
const END_HOUR = 21;
const DAYS_COUNT = 6;
const DAY_NAMES = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'"];

const ACTION_MODES = [
{ value: "markAvailable", label: "סימון/ביטול פנויים ללמד", help: "סימון/ביטול פנויים ללמד: לחצו על משבצת פנויה כדי לסמן או לבטל זמינות ללמד." },
{ value: "cancelLesson", label: "ביטול שיעור לתלמיד/ה", help: "ביטול שיעור לתלמיד/ה: לחצו על משבצת משובצת כדי לבטל את השיעור של התלמיד/ה." },
{ value: "rescheduleLesson", label: "לשינוי מועד שיעור של תלמיד/ה", help: "שינוי מועד שיעור של תלמיד/ה: בחרו משבצת מקור ולאחר מכן משבצת יעד כדי להעביר את המועד." }];


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
  if (fmt === "dd/MM") return `${dd}/${MM}`;
  if (fmt === "yyyy-MM-dd") return `${yyyy}-${MM}-${dd}`;
  if (fmt === "dd/MM/yyyy") return `${dd}/${MM}/${yyyy}`;
  return `${dd}/${MM}`;
}

function getSlotEndTime(hour, duration) {
  let endHour = hour;
  let endMinutes = duration;
  if (endMinutes >= 60) {
    endHour += Math.floor(endMinutes / 60);
    endMinutes = endMinutes % 60;
  }
  return { endHour, endMinutes };
}

function isSlotPast(date, hour, duration = 45) {
  const { endHour, endMinutes } = getSlotEndTime(hour, duration);
  const slotEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), endHour, endMinutes, 0);
  return slotEnd < new Date();
}

function getCurrentWeekSunday() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeek = today.getDay();
  // Friday after 14:15 — skip to next Sunday
  if (dayOfWeek === 5 && (now.getHours() > 14 || now.getHours() === 14 && now.getMinutes() >= 15)) {
    today.setDate(today.getDate() + 2);
    return today;
  }
  let daysToSubtract;
  if (dayOfWeek === 0) daysToSubtract = 0;else
  if (dayOfWeek === 6) daysToSubtract = -1;else
  daysToSubtract = dayOfWeek;
  today.setDate(today.getDate() - daysToSubtract);
  return today;
}

export default function TeacherSchedule() {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}");
  const teacherEmail = userData.teacherEmail || userData.email || "";
  const authToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken") || "";

  const [actionMode, setActionMode] = useState("markAvailable");
  const [weekStart, setWeekStart] = useState(getCurrentWeekSunday());
  const [weekSlots, setWeekSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rescheduleSource, setRescheduleSource] = useState(null);
  const [alert, setAlert] = useState(null);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [slotDuration, setSlotDuration] = useState(45);
  const [authError, setAuthError] = useState(false);

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
    if (!teacherEmail) {
      setInitialLoaded(true);
      return;
    }
    setLoading(true);
    try {
      const [slotsData, profileData] = await Promise.all([
      invokeWeekSlots({
        action: "get",
        teacherEmail,
        token: authToken,
        firstDayOfWeek: formatDate(weekStart, "yyyy-MM-dd")
      }),
      invokeProfile({
        email: teacherEmail,
        token: authToken,
        todayDate: formatDate(weekStart, "yyyy-MM-dd")
      })]
      );
      if (slotsData._status === 401 || profileData?._status === 401) {
        setAuthError(true);
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        setTimeout(() => navigate("/teacher-login"), 2000);
        return;
      }
      if (slotsData.error) {
        setWeekSlots([]);
      } else {
        setWeekSlots(slotsData.data || []);
      }
      const details = profileData?.details || profileData?.Details || profileData || {};
      const duration = parseInt(details.gn02_lessonDurationMin || profileData?.gn02_lessonDurationMin) || 45;
      setSlotDuration(duration);
    } catch (err) {
      setWeekSlots([]);
    } finally {
      setLoading(false);
      setInitialLoaded(true);
    }
  }, [teacherEmail, authToken, weekStart]);

  useEffect(() => {
    loadWeekSlots();
  }, [loadWeekSlots]);

  const updateSlotByDateHour = (date, hour, update) => {
    setWeekSlots((prev) =>
    prev.map((s) => {
      const slotDate = parseApiDate(s.gn06_date);
      return slotDate && slotDate.getTime() === date.getTime() && s.gn06_startEndHoures === hour ?
      { ...s, ...update } :
      s;
    })
    );
  };

  const handleActionModeChange = (mode) => {
    if (rescheduleSource) {
      const sourceDate = parseApiDate(rescheduleSource.slot.gn06_date);
      updateSlotByDateHour(sourceDate, rescheduleSource.slot.gn06_startEndHoures, {
        gn06_CssClass: rescheduleSource.originalCssClass
      });
    }
    setRescheduleSource(null);
    setActionMode(mode);
    if (mode !== "rescheduleLesson") {
      invokeWeekSlots({
        action: "moveLesson",
        teacherEmail,
        token: authToken,
        gn06Id: 0,
        studentEmail: "empty@gmail.com",
        slotDate: formatDate(new Date(), "yyyy-MM-dd"),
        startHours: 7,
        cssClass: "CssClass",
        step: 3
      }).catch(() => {});
    }
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

  const handleSlotTap = (date, hour) => {
    const slot = getSlotForCell(date, hour);
    const { endHour, endMinutes } = getSlotEndTime(hour, slotDuration);
    const startTime = `${String(hour).padStart(2, "0")}:00`;
    const endTime = `${String(endHour).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
    if (slot?.gn06_CssClass === "selected" && actionMode === "markAvailable") {
      const dayName = DAY_NAMES[Math.round((date - weekStart) / (1000 * 60 * 60 * 24))];
      const studentInfo = slot.gn06_tooltip ? slot.gn06_tooltip.replace(/;/g, "\n") : slot.gn06_studentRegisteredEmail || "—";
      setAlert({
        title: "פרטי משבצת",
        message: `יום: ${dayName}\nתאריך: ${formatDate(date, "dd/MM/yyyy")}\nשעה: ${startTime} - ${endTime}\n\nתלמיד/ה:\n${studentInfo}`,
        type: "ok",
        onConfirm: () => setAlert(null)
      });
      return;
    }
    if (actionMode === "markAvailable") handleMarkAvailable(slot, date, hour, startTime, endTime);else
    if (actionMode === "cancelLesson") handleCancelLesson(slot, date, hour, startTime, endTime);else
    if (actionMode === "rescheduleLesson") handleRescheduleLesson(slot, date, hour, startTime, endTime);
  };

  const handleMarkAvailable = async (slot, date, hour) => {
    try {
      const data = await invokeWeekSlots({
        action: "markAvailable",
        teacherEmail,
        token: authToken,
        slotDate: formatDate(date, "yyyy-MM-dd"),
        startHours: hour,
        cssClass: slot?.gn06_CssClass || "default"
      });
      const responseStr = JSON.stringify(data);
      if (data._status >= 200 && data._status < 300) {
        if (responseStr.includes("refresh") || !slot) {
          await loadWeekSlots();
        } else {
          const newClass = slot.gn06_CssClass === "tentative" ? "available" : "tentative";
          updateSlotByDateHour(date, hour, { gn06_CssClass: newClass });
        }
      } else {
        setAlert({
          title: "שגיאה",
          message: data.message || "המשבצת תפוסה או בשלב של תשלום או הזמנה!",
          type: "ok",
          onConfirm: () => {
            setAlert(null);
            loadWeekSlots();
          }
        });
      }
    } catch (err) {
      setAlert({ title: "שגיאה", message: err.message, type: "ok", onConfirm: () => setAlert(null) });
    }
  };

  const handleCancelLesson = (slot, date, hour, startTime, endTime) => {
    if (!slot || !slot.gn06_studentRegisteredEmail) {
      setAlert({ title: "שגיאה", message: "אין תלמיד רשום במשבצת זו", type: "ok", onConfirm: () => setAlert(null) });
      return;
    }
    if (!slot.gn06_id || slot.gn06_id <= 0) {
      setAlert({ title: "שגיאה", message: "לא ניתן לבטל - חסר מזהה רשומה", type: "ok", onConfirm: () => setAlert(null) });
      return;
    }
    const dayName = DAY_NAMES[Math.round((date - weekStart) / (1000 * 60 * 60 * 24))];
    const studentInfo = slot.gn06_tooltip ? slot.gn06_tooltip.replace(/;/g, "\n") : slot.gn06_studentRegisteredEmail;
    const message = `ביטול שיעור:\n\nיום: ${dayName}\nשעה: ${startTime} - ${endTime}\nתאריך: ${formatDate(date, "dd/MM/yyyy")}\n\nתלמיד:\n${studentInfo}\n\nהאם אתה בטוח שברצונך לבטל את השיעור?`;
    setAlert({
      title: "אישור ביטול שיעור",
      message,
      type: "confirm",
      confirmText: "כן, בטל את השיעור",
      onConfirm: () => doCancelLesson(slot, date, hour),
      onCancel: () => setAlert(null)
    });
  };

  const doCancelLesson = async (slot, date, hour) => {
    setAlert(null);
    try {
      const data = await invokeWeekSlots({
        action: "cancelLesson",
        teacherEmail,
        token: authToken,
        gn06Id: slot.gn06_id,
        studentEmail: slot.gn06_studentRegisteredEmail,
        slotDate: formatDate(date, "yyyy-MM-dd"),
        startHours: hour,
        cssClass: slot.gn06_CssClass
      });
      if (data._status >= 200 && data._status < 300) {
        updateSlotByDateHour(date, hour, { gn06_CssClass: "tentative", gn06_studentRegisteredEmail: null, gn06_tooltip: null });
        setActionMode("markAvailable");
        setAlert({
          title: "הצלחה",
          message: "השיעור בוטל בהצלחה",
          type: "ok",
          onConfirm: () => {
            setAlert(null);
            loadWeekSlots();
          }
        });
      } else {
        setAlert({
          title: "שגיאה",
          message: "לא הצלחנו לבטל את השיעור. " + (data.message || ""),
          type: "ok",
          onConfirm: () => {
            setAlert(null);
            loadWeekSlots();
          }
        });
      }
    } catch (err) {
      setAlert({
        title: "שגיאה",
        message: "שגיאה בביטול השיעור: " + err.message,
        type: "ok",
        onConfirm: () => {
          setAlert(null);
          loadWeekSlots();
        }
      });
    }
  };

  const cancelReschedule = async () => {
    if (!rescheduleSource) return;
    const sourceDate = parseApiDate(rescheduleSource.slot.gn06_date);
    const sourceHour = rescheduleSource.slot.gn06_startEndHoures;
    try {
      await invokeWeekSlots({
        action: "moveLesson",
        teacherEmail,
        token: authToken,
        gn06Id: rescheduleSource.slot.gn06_id,
        studentEmail: rescheduleSource.slot.gn06_studentRegisteredEmail,
        slotDate: formatDate(sourceDate, "yyyy-MM-dd"),
        startHours: sourceHour,
        cssClass: rescheduleSource.slot.gn06_CssClass,
        step: 2
      });
    } catch (err) {

      /* ignore */}
    updateSlotByDateHour(sourceDate, sourceHour, { gn06_CssClass: rescheduleSource.originalCssClass });
    setRescheduleSource(null);
  };

  const handleRescheduleLesson = async (slot, date, hour, startTime, endTime) => {
    if (!rescheduleSource) {
      if (!slot || !slot.gn06_studentRegisteredEmail) {
        setAlert({ title: "שגיאה", message: "אין תלמיד רשום במשבצת זו. בחרו משבצת עם תלמיד רשום.", type: "ok", onConfirm: () => setAlert(null) });
        return;
      }
      try {
        const data = await invokeWeekSlots({
          action: "moveLesson",
          teacherEmail,
          token: authToken,
          gn06Id: slot.gn06_id,
          studentEmail: slot.gn06_studentRegisteredEmail,
          slotDate: formatDate(date, "yyyy-MM-dd"),
          startHours: hour,
          cssClass: slot.gn06_CssClass,
          step: 1
        });
        if (data._status >= 200 && data._status < 300) {
          const originalCssClass = slot.gn06_CssClass;
          setRescheduleSource({ slot, originalCssClass });
          updateSlotByDateHour(date, hour, { gn06_CssClass: "occupiedMove" });
          const dayName = DAY_NAMES[Math.round((date - weekStart) / (1000 * 60 * 60 * 24))];
          const studentInfo = slot.gn06_tooltip ? slot.gn06_tooltip.replace(/;/g, "\n") : slot.gn06_studentRegisteredEmail;
          setAlert({
            title: "שלב 1: משבצת מקור נבחרה",
            message: `נבחרה משבצת מקור:\n\nיום: ${dayName}\nשעה: ${startTime} - ${endTime}\nתלמיד:\n${studentInfo}\n\nכעת לחצו על משבצת יעד פנויה להעברת השיעור.`,
            type: "ok",
            onConfirm: () => setAlert(null)
          });
        } else {
          setAlert({ title: "שגיאה", message: "לא הצלחנו לסמן את המשבצת המקורית. " + (data.message || ""), type: "ok", onConfirm: () => setAlert(null) });
        }
      } catch (err) {
        setAlert({ title: "שגיאה", message: "שגיאה בבחירת משבצת מקור: " + err.message, type: "ok", onConfirm: () => setAlert(null) });
      }
      return;
    }

    const sourceDate = parseApiDate(rescheduleSource.slot.gn06_date);
    const sourceHour = rescheduleSource.slot.gn06_startEndHoures;

    if (sourceDate.getTime() === date.getTime() && sourceHour === hour) {
      await cancelReschedule();
      return;
    }

    if (!slot || slot.gn06_CssClass !== "tentative" && slot.gn06_CssClass !== "available") {
      setAlert({ title: "שגיאה", message: "המשבצת היעד חייבת להיות פנויה (צהוב או ירוק). בחרו משבצת אחרת או בטלו את הפעולה.", type: "ok", onConfirm: () => setAlert(null) });
      return;
    }

    const sourceDayIndex = Math.round((sourceDate - weekStart) / (1000 * 60 * 60 * 24));
    const sourceDayName = sourceDayIndex >= 0 && sourceDayIndex < DAYS_COUNT ? DAY_NAMES[sourceDayIndex] : formatDate(sourceDate, "dd/MM/yyyy");
    const targetDayName = DAY_NAMES[Math.round((date - weekStart) / (1000 * 60 * 60 * 24))];
    const sourceTime = `${String(sourceHour).padStart(2, "0")}:00`;
    const studentInfo = rescheduleSource.slot.gn06_tooltip ? rescheduleSource.slot.gn06_tooltip.replace(/;/g, "\n") : rescheduleSource.slot.gn06_studentRegisteredEmail;

    setAlert({
      title: "אישור העברת מועד",
      message: `להעביר את השיעור?\n\nממשבצת מקור:\nיום ${sourceDayName}, שעה ${sourceTime}\n\nלמשבצת יעד:\nיום ${targetDayName}, שעה ${startTime}\n\nתלמיד:\n${studentInfo}`,
      type: "confirm",
      confirmText: "כן, העבר",
      onConfirm: () => doRescheduleMove(slot, date, hour),
      onCancel: () => cancelReschedule()
    });
  };

  const doRescheduleMove = async (targetSlot, date, hour) => {
    setAlert(null);
    try {
      const data = await invokeWeekSlots({
        action: "moveLesson",
        teacherEmail,
        token: authToken,
        gn06Id: targetSlot.gn06_id,
        studentEmail: rescheduleSource.slot.gn06_studentRegisteredEmail,
        slotDate: formatDate(date, "yyyy-MM-dd"),
        startHours: hour,
        cssClass: targetSlot.gn06_CssClass,
        step: 2
      });
      if (data._status >= 200 && data._status < 300) {
        setRescheduleSource(null);
        await loadWeekSlots();
        setActionMode("markAvailable");
        setAlert({ title: "הצלחה", message: "השיעור הועבר בהצלחה למועד החדש!", type: "ok", onConfirm: () => setAlert(null) });
      } else {
        const sourceDate = parseApiDate(rescheduleSource.slot.gn06_date);
        updateSlotByDateHour(sourceDate, rescheduleSource.slot.gn06_startEndHoures, { gn06_CssClass: rescheduleSource.originalCssClass });
        setRescheduleSource(null);
        setAlert({ title: "שגיאה", message: "לא הצלחנו להעביר את השיעור. " + (data.message || ""), type: "ok", onConfirm: () => {setAlert(null);loadWeekSlots();} });
      }
    } catch (err) {
      const sourceDate = parseApiDate(rescheduleSource.slot.gn06_date);
      updateSlotByDateHour(sourceDate, rescheduleSource.slot.gn06_startEndHoures, { gn06_CssClass: rescheduleSource.originalCssClass });
      setRescheduleSource(null);
      setAlert({ title: "שגיאה", message: "שגיאה בהעברת השיעור: " + err.message, type: "ok", onConfirm: () => {setAlert(null);loadWeekSlots();} });
    }
  };

  const helpText = ACTION_MODES.find((m) => m.value === actionMode)?.help || "";
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 5);
  const weekRange = `${formatDate(weekStart, "dd/MM")} - ${formatDate(weekEnd, "dd/MM")}`;
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  let rescheduleInfo = null;
  if (rescheduleSource && actionMode === "rescheduleLesson") {
    const sourceDate = parseApiDate(rescheduleSource.slot.gn06_date);
    const dayIndex = Math.round((sourceDate - weekStart) / (1000 * 60 * 60 * 24));
    const dayName = dayIndex >= 0 && dayIndex < DAYS_COUNT ? DAY_NAMES[dayIndex] : "?";
    const dateStr = formatDate(sourceDate, "dd/MM/yyyy");
    const time = `${String(rescheduleSource.slot.gn06_startEndHoures).padStart(2, "0")}:00`;
    const studentInfo = rescheduleSource.slot.gn06_tooltip ? rescheduleSource.slot.gn06_tooltip.replace(/;/g, " | ") : rescheduleSource.slot.gn06_studentRegisteredEmail || "לא ידוע";
    rescheduleInfo = `שיעור מקור: ${studentInfo}\nתאריך: ${dateStr} (יום ${dayName}), שעה: ${time}`;
  }

  if (authError) {
    return (
      <div dir="rtl" className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <div className="space-y-1">
          <h2 className="text-xl font-heading font-bold text-foreground">פג תוקף החיבור</h2>
          <p className="text-muted-foreground font-body text-sm">מיד תועברו למסך ההתחברות...</p>
        </div>
      </div>);

  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 flex flex-col items-center">
        


        
        
        <div className="space-y-1 w-full text-right">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">ניהול שיעורים</h1>
          <p className="text-muted-foreground font-body text-sm">סמנו זמינות, בטלו או העבירו שיעורים</p>
        </div>
      </div>

      <div className="bg-card rounded-3xl border border-border/70 shadow-sm p-5 space-y-3">
        <div className="space-y-2.5">
          {ACTION_MODES.map((opt) =>
          <label
            key={opt.value}
            className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all ${
            actionMode === opt.value ?
            "border-primary bg-primary/5 shadow-sm shadow-primary/10" :
            "border-border hover:bg-muted/60 hover:border-primary/30"}`
            }>
            
              <input
              type="radio"
              name="actionMode"
              checked={actionMode === opt.value}
              onChange={() => handleActionModeChange(opt.value)}
              className="w-4 h-4 accent-primary" />
            
              <span className="text-sm font-heading font-medium text-foreground">{opt.label}</span>
            </label>
          )}
        </div>
        <p className="text-sm text-muted-foreground font-body">{helpText}</p>
        {rescheduleInfo &&
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3">
            <p className="text-sm text-primary font-body whitespace-pre-line">{rescheduleInfo}</p>
          </div>
        }
      </div>

      {/* LEGEND */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 bg-card border border-border/70 rounded-2xl px-4 py-3 shadow-sm" role="region" aria-label="מקרא צבעים">
        <span className="flex items-center gap-1.5 text-xs font-body text-foreground" role="listitem">
          <span className="w-3.5 h-3.5 rounded-md shrink-0" style={{ background: "#d8f5e6", border: "1px solid #34a86b" }} aria-hidden="true" />
          פנויים ללמד
        </span>
        <span className="flex items-center gap-1.5 text-xs font-body text-foreground" role="listitem">
          <span className="w-3.5 h-3.5 rounded-md shrink-0" style={{ background: "#e3e7ff", border: "1px solid #6366f1" }} aria-hidden="true" />
          שיעור עם תלמיד/ה
        </span>
        <span className="flex items-center gap-1.5 text-xs font-body text-foreground" role="listitem">
          <span className="w-3.5 h-3.5 rounded-md shrink-0" style={{ background: "#f1f2f4", border: "1px solid #d7dade" }} aria-hidden="true" />
          עבר / לא זמין
        </span>
      </div>

      <div className="flex items-center justify-between bg-card rounded-3xl border border-border/70 shadow-sm p-3">
        <button onClick={handlePrevWeek} className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors" aria-label="שבוע קודם">
          <ChevronRight className="w-5 h-5" />
        </button>
        <span className="font-heading font-semibold text-foreground text-sm sm:text-base">{weekRange}</span>
        <button onClick={handleNextWeek} className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors" aria-label="שבוע הבא">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={loadWeekSlots} className="p-2 rounded-xl text-primary hover:bg-primary/5 transition-colors" aria-label="רענן">
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {!initialLoaded ?
      <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div> :

      <>
          <div className="sticky top-16 z-20 grid grid-cols-6 gap-1.5 bg-background/95 backdrop-blur-sm py-2 -mx-4 px-4 border-b border-border">
            {Array.from({ length: DAYS_COUNT }, (_, day) => {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + day);
            return (
              <div key={day} className="text-center py-1">
                  <div className="font-heading font-bold text-sm sm:text-base text-foreground">{DAY_NAMES[day]}</div>
                  <div className="text-xs text-muted-foreground font-body">{formatDate(date, "dd/MM")}</div>
                </div>);

          })}
          </div>

          <div className="grid grid-cols-6 gap-1.5">
            {hours.map((hour) =>
          Array.from({ length: DAYS_COUNT }, (_, day) => {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + day);
            const slot = getSlotForCell(date, hour);
            const past = isSlotPast(date, hour, slotDuration);
            const { endHour, endMinutes } = getSlotEndTime(hour, slotDuration);
            const startTime = `${String(hour).padStart(2, "0")}:00`;
            const endTime = `${String(endHour).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
            const dayName = DAY_NAMES[day];
            if (!slot) return <div key={`${hour}-${day}`} />;
            return (
              <SlotCell
                key={`${hour}-${day}`}
                slot={slot}
                isPast={past}
                startTime={startTime}
                endTime={endTime}
                tooltip={`יום ${dayName} - שעה ${startTime} עד ${endTime}`}
                onClick={() => handleSlotTap(date, hour)} />);


          })
          )}
          </div>
        </>
      }

      <ScheduleAlert alert={alert} />
    </div>);

}