import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, HelpCircle } from "lucide-react";
import toast from "react-hot-toast";
import SlotCell from "@/components/schedule/SlotCell";
import ScheduleAlert from "@/components/schedule/ScheduleAlert";
import ScheduleTabs from "@/components/schedule/ScheduleTabs";
import ScheduleHint from "@/components/schedule/ScheduleHint";
import WeekNavigator from "@/components/schedule/WeekNavigator";
import ScheduleLegend from "@/components/schedule/ScheduleLegend";
import AvailabilityEmptyBanner from "@/components/schedule/AvailabilityEmptyBanner";
import ScheduleQuickActions from "@/components/schedule/ScheduleQuickActions";
import BoardDayHeader from "@/components/schedule/BoardDayHeader";
import ScheduleTour from "@/components/schedule/ScheduleTour";
import { ensureOnboarding, markScheduleTourCompleted } from "@/lib/teacherOnboarding";
import { formatHebrewWeekRange, isBookedSlot, isFreeSlot, slotsOpenedMessage } from "@/lib/scheduleWeek";

const API_BASE = "https://learn-le-connect.base44.app/api/apps/6a37f1517bf59551c5f4b6f9/functions";

const invokeWeekSlots = async (payload) => {
  const res = await fetch(`${API_BASE}/weekSlotsProxy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return await res.json();
};
const invokeProfile = async (payload) => {
  const res = await fetch(`${API_BASE}/teacherProfileProxy`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return await res.json();
};

const START_HOUR = 7;
const END_HOUR = 21;
const DAYS_COUNT = 6;
const DAY_NAMES = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'"];
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

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

const keyFor = (date, hour) => `${formatDate(date, "yyyy-MM-dd")}_${hour}`;

export default function TeacherSchedule() {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}");
  const teacherEmail = userData.teacherEmail || userData.email || "";
  const authToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken") || "";

  const [actionMode, setActionMode] = useState("markAvailable");
  const [weekStart, setWeekStart] = useState(getCurrentWeekSunday());
  const [weekSlots, setWeekSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [rescheduleSource, setRescheduleSource] = useState(null);
  const [alert, setAlert] = useState(null);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [slotDuration, setSlotDuration] = useState(45);
  const [authError, setAuthError] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [tourStep, setTourStep] = useState(null);
  const [dayMenu, setDayMenu] = useState(null);
  const [selection, setSelection] = useState([]);
  const [flashKey, setFlashKey] = useState(null);

  const hasProfileRef = useRef(false);
  const draggingRef = useRef(false);
  const selectionRef = useRef([]);
  const suppressClickRef = useRef(false);
  const commitRef = useRef(null);

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
          firstDayOfWeek: formatDate(weekStart, "yyyy-MM-dd"),
        }),
        invokeProfile({
          email: teacherEmail,
          token: authToken,
          todayDate: formatDate(weekStart, "yyyy-MM-dd"),
        }),
      ]);
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
      const about = String(details.gn02_presentYourSelf || "").trim();
      hasProfileRef.current = about.length > 0;
      setHasProfile(about.length > 0);
    } catch (err) {
      setWeekSlots([]);
    } finally {
      setLoading(false);
      setInitialLoaded(true);
    }
  }, [teacherEmail, authToken, weekStart, navigate]);

  useEffect(() => {
    loadWeekSlots();
  }, [loadWeekSlots]);

  // Auto-start the schedule guide the first time a teacher opens this page.
  useEffect(() => {
    if (!initialLoaded || !teacherEmail) return undefined;
    let alive = true;
    (async () => {
      try {
        const record = await ensureOnboarding(teacherEmail, hasProfileRef.current);
        if (!alive || !record) return;
        if (!record.scheduleTourCompleted && hasProfileRef.current) setTourStep(0);
      } catch (err) {
        console.error("[schedule] failed to load guide state:", err);
      }
    })();
    return () => {
      alive = false;
    };
  }, [initialLoaded, teacherEmail]);

  const days = useMemo(
    () =>
      Array.from({ length: DAYS_COUNT }, (_, i) => {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + i);
        return date;
      }),
    [weekStart]
  );

  const cellFor = useCallback(
    (date, hour) => {
      const slot = getSlotForCell(date, hour);
      const past = isSlotPast(date, hour, slotDuration);
      return {
        key: keyFor(date, hour),
        date,
        hour,
        slot,
        past,
        free: !past && isFreeSlot(slot),
        booked: !past && isBookedSlot(slot),
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [slotLookup, slotDuration]
  );

  const freeCount = useMemo(() => weekSlots.filter((slot) => isFreeSlot(slot)).length, [weekSlots]);

  const tourTargetKey = useMemo(() => {
    for (const hour of HOURS) {
      for (const date of days) {
        const cell = cellFor(date, hour);
        if (!cell.past && !cell.free && !cell.booked) return cell.key;
      }
    }
    return null;
  }, [days, cellFor]);

  const isCurrentWeek = weekStart.getTime() === getCurrentWeekSunday().getTime();

  const updateSlotByDateHour = (date, hour, update) => {
    setWeekSlots((prev) =>
      prev.map((s) => {
        const slotDate = parseApiDate(s.gn06_date);
        return slotDate && slotDate.getTime() === date.getTime() && s.gn06_startEndHoures === hour
          ? { ...s, ...update }
          : s;
      })
    );
  };

  const handleActionModeChange = (mode) => {
    if (mode === actionMode) return;
    if (rescheduleSource) {
      const sourceDate = parseApiDate(rescheduleSource.slot.gn06_date);
      updateSlotByDateHour(sourceDate, rescheduleSource.slot.gn06_startEndHoures, {
        gn06_CssClass: rescheduleSource.originalCssClass,
      });
    }
    setRescheduleSource(null);
    setDayMenu(null);
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
        step: 3,
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

  const handleToday = () => setWeekStart(getCurrentWeekSunday());

  const handleSlotTap = (date, hour) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
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
        onConfirm: () => setAlert(null),
      });
      return;
    }
    if (actionMode === "markAvailable") handleMarkAvailable(slot, date, hour);
    else if (actionMode === "cancelLesson") handleCancelLesson(slot, date, hour, startTime, endTime);
    else if (actionMode === "rescheduleLesson") handleRescheduleLesson(slot, date, hour, startTime, endTime);
  };

  const handleMarkAvailable = async (slot, date, hour) => {
    const cellKey = keyFor(date, hour);
    const opening = !isFreeSlot(slot);
    try {
      const data = await invokeWeekSlots({
        action: "markAvailable",
        teacherEmail,
        token: authToken,
        slotDate: formatDate(date, "yyyy-MM-dd"),
        startHours: hour,
        cssClass: slot?.gn06_CssClass || "default",
      });
      const responseStr = JSON.stringify(data);
      if (data._status >= 200 && data._status < 300) {
        if (responseStr.includes("refresh") || !slot) {
          await loadWeekSlots();
        } else {
          const newClass = slot.gn06_CssClass === "tentative" ? "available" : "tentative";
          updateSlotByDateHour(date, hour, { gn06_CssClass: newClass });
        }
        if (opening) {
          setFlashKey(cellKey);
          window.setTimeout(() => setFlashKey(null), 900);
        }
        if (tourStep === 5) {
          toast.success("מעולה! כך פותחים שעה.");
          setTourStep(6);
        } else {
          toast.success(opening ? slotsOpenedMessage(1) : "הזמינות בוטלה");
        }
      } else {
        setAlert({
          title: "שגיאה",
          message: data.message || "המשבצת תפוסה או בשלב של תשלום או הזמנה!",
          type: "ok",
          onConfirm: () => {
            setAlert(null);
            loadWeekSlots();
          },
        });
      }
    } catch (err) {
      setAlert({ title: "שגיאה", message: err.message, type: "ok", onConfirm: () => setAlert(null) });
    }
  };

  const markSlots = async (targets) => {
    for (let i = 0; i < targets.length; i += 6) {
      const chunk = targets.slice(i, i + 6);
      await Promise.all(
        chunk.map((cell) =>
          invokeWeekSlots({
            action: "markAvailable",
            teacherEmail,
            token: authToken,
            slotDate: formatDate(cell.date, "yyyy-MM-dd"),
            startHours: cell.hour,
            cssClass: cell.slot?.gn06_CssClass || "default",
          }).catch(() => null)
        )
      );
    }
    await loadWeekSlots();
  };

  const runBulk = async (targets, message) => {
    if (!targets.length) return;
    setBusy(true);
    try {
      await markSlots(targets);
      toast.success(message);
    } catch (err) {
      toast.error("הפעולה נכשלה. נסו שוב.");
    } finally {
      setBusy(false);
    }
  };

  const commitSelection = async (keys) => {
    const targets = keys
      .map((key) => {
        const [datePart, hourPart] = key.split("_");
        const [y, m, d] = datePart.split("-").map(Number);
        return cellFor(new Date(y, m - 1, d), Number(hourPart));
      })
      .filter((cell) => cell && !cell.past && !cell.booked && !cell.free);
    if (!targets.length) return;
    await runBulk(targets, slotsOpenedMessage(targets.length));
  };
  commitRef.current = commitSelection;

  useEffect(() => {
    const finish = () => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      const keys = selectionRef.current;
      setSelection([]);
      if (keys.length > 1) {
        suppressClickRef.current = true;
        commitRef.current?.(keys);
      }
    };
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    return () => {
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
    };
  }, []);

  const beginDrag = (key) => {
    draggingRef.current = true;
    selectionRef.current = [key];
    setSelection([key]);
  };

  const extendDrag = (key) => {
    if (!draggingRef.current) return;
    if (selectionRef.current.includes(key)) return;
    selectionRef.current = [...selectionRef.current, key];
    setSelection(selectionRef.current);
  };

  const markWholeDay = async (dayIndex) => {
    setDayMenu(null);
    const date = days[dayIndex];
    const targets = HOURS.map((hour) => cellFor(date, hour)).filter((cell) => !cell.past && !cell.booked && !cell.free);
    if (!targets.length) {
      toast("כל השעות ביום הזה כבר פתוחות או תפוסות");
      return;
    }
    await runBulk(targets, slotsOpenedMessage(targets.length));
  };

  const clearWholeDay = async (dayIndex) => {
    setDayMenu(null);
    const date = days[dayIndex];
    const markedCells = HOURS.map((hour) => cellFor(date, hour)).filter(
      (cell) => !cell.past && isFreeSlot(cell.slot)
    );
    if (!markedCells.length) {
      toast("אין שעות מסומנות לנקות ביום הזה");
      return;
    }
    // Unmark the whole day in one go: every marked slot switches to "לא מסומן"
    // at once, without showing the step-by-step process.
    setWeekSlots((prev) =>
      prev.map((slot) => {
        const slotDate = parseApiDate(slot.gn06_date);
        return slotDate && slotDate.getTime() === date.getTime() && isFreeSlot(slot)
          ? { ...slot, gn06_CssClass: "tentative" }
          : slot;
      })
    );
    setBusy(true);
    try {
      await Promise.all(
        markedCells.map((cell) =>
          invokeWeekSlots({
            action: "markAvailable",
            teacherEmail,
            token: authToken,
            slotDate: formatDate(cell.date, "yyyy-MM-dd"),
            startHours: cell.hour,
            cssClass: cell.slot?.gn06_CssClass || "default",
          }).catch(() => null)
        )
      );
      await loadWeekSlots();
      toast.success(`בוטל הסימון ב-${markedCells.length} שעות`);
    } catch (err) {
      toast.error("הפעולה נכשלה. נסו שוב.");
    } finally {
      setBusy(false);
    }
  };

  const fetchWeekSlots = async (startDate) => {
    const data = await invokeWeekSlots({
      action: "get",
      teacherEmail,
      token: authToken,
      firstDayOfWeek: formatDate(startDate, "yyyy-MM-dd"),
    });
    return Array.isArray(data?.data) ? data.data : [];
  };

  const copyPreviousWeek = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const previousStart = new Date(weekStart);
      previousStart.setDate(previousStart.getDate() - 7);
      const previousSlots = await fetchWeekSlots(previousStart);
      const targets = [];
      previousSlots
        .filter((slot) => isFreeSlot(slot))
        .forEach((slot) => {
          const slotDate = parseApiDate(slot.gn06_date);
          const dayIndex = Math.round((slotDate - previousStart) / (1000 * 60 * 60 * 24));
          if (dayIndex < 0 || dayIndex >= DAYS_COUNT) return;
          const targetDate = new Date(weekStart);
          targetDate.setDate(targetDate.getDate() + dayIndex);
          const cell = cellFor(targetDate, slot.gn06_startEndHoures);
          if (cell.past || cell.booked || cell.free) return;
          targets.push(cell);
        });
      if (!targets.length) {
        toast("אין שעות פנויות להעתקה מהשבוע הקודם");
        return;
      }
      await markSlots(targets);
      toast.success(slotsOpenedMessage(targets.length));
    } catch (err) {
      toast.error("ההעתקה נכשלה. נסו שוב.");
    } finally {
      setBusy(false);
    }
  };

  const repeatNextWeeks = async () => {
    if (busy) return;
    const freeCells = [];
    days.forEach((date) =>
      HOURS.forEach((hour) => {
        const cell = cellFor(date, hour);
        if (cell.free) freeCells.push(cell);
      })
    );
    if (!freeCells.length) {
      toast("אין שעות פנויות לחזור עליהן");
      return;
    }
    setBusy(true);
    try {
      let opened = 0;
      const targetStart = new Date(weekStart);
      targetStart.setDate(targetStart.getDate() + 7);
      const existingSlots = await fetchWeekSlots(targetStart);
      const existingByKey = {};
      existingSlots.forEach((slot) => {
        existingByKey[keyFor(parseApiDate(slot.gn06_date), slot.gn06_startEndHoures)] = slot;
      });
      const targets = [];
      freeCells.forEach((cell) => {
        const targetDate = new Date(cell.date);
        targetDate.setDate(targetDate.getDate() + 7);
        if (isSlotPast(targetDate, cell.hour, slotDuration)) return;
        const existing = existingByKey[keyFor(targetDate, cell.hour)];
        if (isFreeSlot(existing) || isBookedSlot(existing)) return;
        targets.push({ date: targetDate, hour: cell.hour, slot: existing });
      });
      for (let i = 0; i < targets.length; i += 6) {
        const chunk = targets.slice(i, i + 6);
        await Promise.all(
          chunk.map((target) =>
            invokeWeekSlots({
              action: "markAvailable",
              teacherEmail,
              token: authToken,
              slotDate: formatDate(target.date, "yyyy-MM-dd"),
              startHours: target.hour,
              cssClass: target.slot?.gn06_CssClass || "default",
            }).catch(() => null)
          )
        );
        opened += chunk.length;
      }
      await loadWeekSlots();
      toast.success(opened ? slotsOpenedMessage(opened) : "אין שעות חדשות להעתיק");
    } catch (err) {
      toast.error("הפעולה נכשלה. נסו שוב.");
    } finally {
      setBusy(false);
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
      onCancel: () => setAlert(null),
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
        cssClass: slot.gn06_CssClass,
      });
      if (data._status >= 200 && data._status < 300) {
        updateSlotByDateHour(date, hour, {
          gn06_CssClass: "tentative",
          gn06_studentRegisteredEmail: null,
          gn06_tooltip: null,
        });
        setActionMode("markAvailable");
        setAlert({
          title: "הצלחה",
          message: "השיעור בוטל בהצלחה",
          type: "ok",
          onConfirm: () => {
            setAlert(null);
            loadWeekSlots();
          },
        });
      } else {
        setAlert({
          title: "שגיאה",
          message: "לא הצלחנו לבטל את השיעור. " + (data.message || ""),
          type: "ok",
          onConfirm: () => {
            setAlert(null);
            loadWeekSlots();
          },
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
        },
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
        step: 2,
      });
    } catch (err) {
      /* ignore */
    }
    updateSlotByDateHour(sourceDate, sourceHour, { gn06_CssClass: rescheduleSource.originalCssClass });
    setRescheduleSource(null);
  };

  const handleRescheduleLesson = async (slot, date, hour, startTime, endTime) => {
    if (!rescheduleSource) {
      if (!slot || !slot.gn06_studentRegisteredEmail) {
        setAlert({
          title: "שגיאה",
          message: "אין תלמיד רשום במשבצת זו. בחרו משבצת עם תלמיד רשום.",
          type: "ok",
          onConfirm: () => setAlert(null),
        });
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
          step: 1,
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
            onConfirm: () => setAlert(null),
          });
        } else {
          setAlert({
            title: "שגיאה",
            message: "לא הצלחנו לסמן את המשבצת המקורית. " + (data.message || ""),
            type: "ok",
            onConfirm: () => setAlert(null),
          });
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

    if (!slot || (slot.gn06_CssClass !== "tentative" && slot.gn06_CssClass !== "available")) {
      setAlert({
        title: "שגיאה",
        message: "המשבצת היעד חייבת להיות פנויה (צהוב או ירוק). בחרו משבצת אחרת או בטלו את הפעולה.",
        type: "ok",
        onConfirm: () => setAlert(null),
      });
      return;
    }

    const sourceDayIndex = Math.round((sourceDate - weekStart) / (1000 * 60 * 60 * 24));
    const sourceDayName = sourceDayIndex >= 0 && sourceDayIndex < DAYS_COUNT ? DAY_NAMES[sourceDayIndex] : formatDate(sourceDate, "dd/MM/yyyy");
    const targetDayName = DAY_NAMES[Math.round((date - weekStart) / (1000 * 60 * 60 * 24))];
    const sourceTime = `${String(sourceHour).padStart(2, "0")}:00`;
    const studentInfo = rescheduleSource.slot.gn06_tooltip
      ? rescheduleSource.slot.gn06_tooltip.replace(/;/g, "\n")
      : rescheduleSource.slot.gn06_studentRegisteredEmail;

    setAlert({
      title: "אישור העברת מועד",
      message: `להעביר את השיעור?\n\nממשבצת מקור:\nיום ${sourceDayName}, שעה ${sourceTime}\n\nלמשבצת יעד:\nיום ${targetDayName}, שעה ${startTime}\n\nתלמיד:\n${studentInfo}`,
      type: "confirm",
      confirmText: "כן, העבר",
      onConfirm: () => doRescheduleMove(slot, date, hour),
      onCancel: () => cancelReschedule(),
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
        step: 2,
      });
      if (data._status >= 200 && data._status < 300) {
        setRescheduleSource(null);
        await loadWeekSlots();
        setActionMode("markAvailable");
        setAlert({ title: "הצלחה", message: "השיעור הועבר בהצלחה למועד החדש!", type: "ok", onConfirm: () => setAlert(null) });
      } else {
        const sourceDate = parseApiDate(rescheduleSource.slot.gn06_date);
        updateSlotByDateHour(sourceDate, rescheduleSource.slot.gn06_startEndHoures, {
          gn06_CssClass: rescheduleSource.originalCssClass,
        });
        setRescheduleSource(null);
        setAlert({
          title: "שגיאה",
          message: "לא הצלחנו להעביר את השיעור. " + (data.message || ""),
          type: "ok",
          onConfirm: () => {
            setAlert(null);
            loadWeekSlots();
          },
        });
      }
    } catch (err) {
      const sourceDate = parseApiDate(rescheduleSource.slot.gn06_date);
      updateSlotByDateHour(sourceDate, rescheduleSource.slot.gn06_startEndHoures, {
        gn06_CssClass: rescheduleSource.originalCssClass,
      });
      setRescheduleSource(null);
      setAlert({
        title: "שגיאה",
        message: "שגיאה בהעברת השיעור: " + err.message,
        type: "ok",
        onConfirm: () => {
          setAlert(null);
          loadWeekSlots();
        },
      });
    }
  };

  const startTour = () => {
    if (actionMode !== "markAvailable") handleActionModeChange("markAvailable");
    setTourStep(0);
  };

  const persistTourSeen = async () => {
    setTourStep(null);
    try {
      await markScheduleTourCompleted(teacherEmail, hasProfileRef.current || hasProfile);
    } catch (err) {
      console.error("[schedule] failed to save guide completion:", err);
    }
  };

  // המשך הסיור שהתחיל בדף הבית: /teacher-schedule?tour=1 פותח את הסיור מיד
  // לאחר שהלוח נטען, ואז מנקה את הפרמטר מהכתובת.
  useEffect(() => {
    if (!initialLoaded) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("tour") !== "1") return;
    params.delete("tour");
    const qs = params.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
    startTour();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLoaded]);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 5);
  const weekRange = formatHebrewWeekRange(weekStart, weekEnd);

  let rescheduleInfo = null;
  if (rescheduleSource && actionMode === "rescheduleLesson") {
    const sourceDate = parseApiDate(rescheduleSource.slot.gn06_date);
    const dayIndex = Math.round((sourceDate - weekStart) / (1000 * 60 * 60 * 24));
    const dayName = dayIndex >= 0 && dayIndex < DAYS_COUNT ? DAY_NAMES[dayIndex] : "?";
    const dateStr = formatDate(sourceDate, "dd/MM/yyyy");
    const time = `${String(rescheduleSource.slot.gn06_startEndHoures).padStart(2, "0")}:00`;
    const studentInfo = rescheduleSource.slot.gn06_tooltip
      ? rescheduleSource.slot.gn06_tooltip.replace(/;/g, " | ")
      : rescheduleSource.slot.gn06_studentRegisteredEmail || "לא ידוע";
    rescheduleInfo = `שיעור מקור: ${studentInfo}\nתאריך: ${dateStr} (יום ${dayName}), שעה: ${time}`;
  }

  const tooltipFor = (cell, dayName) => {
    const { endHour, endMinutes } = getSlotEndTime(cell.hour, slotDuration);
    const range = `${formatDate(cell.date, "dd/MM")} · ${String(cell.hour).padStart(2, "0")}:00–${String(endHour).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
    if (cell.past) return `${dayName} ${range} · שעה שעברה`;
    if (actionMode === "markAvailable") {
      if (cell.free) return `${dayName} ${range} · פתוח להזמנות · לחיצה תסגור את הזמינות`;
      if (cell.booked) return `${dayName} ${range} · שיעור עם תלמיד/ה`;
      return `${dayName} ${range} · לחיצה תפתח את השעה להזמנות`;
    }
    if (actionMode === "cancelLesson") {
      if (cell.booked) return `${dayName} ${range} · לחיצה לביטול השיעור`;
      return `${dayName} ${range} · אין שיעור לביטול`;
    }
    if (rescheduleSource) return `${dayName} ${range} · לחיצה לבחירת יעד פנוי להעברה`;
    if (cell.booked) return `${dayName} ${range} · לחיצה לבחירת השיעור להעברה`;
    return `${dayName} ${range} · אין שיעור להעברה`;
  };

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
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 w-full text-right">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">ניהול שיעורים</h1>
          <p className="text-muted-foreground font-body text-sm">סמנו זמינות, בטלו או העבירו שיעורים</p>
        </div>
        <button
          type="button"
          onClick={startTour}
          data-tour="tour-help"
          title="מדריך שימוש"
          aria-label="מדריך שימוש בלוח השיעורים"
          className="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-full border border-border bg-card text-primary hover:bg-primary/5 hover:border-primary/40 transition-colors"
        >
          <HelpCircle className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-3">
        <ScheduleTabs mode={actionMode} onChange={handleActionModeChange} />
        <ScheduleHint mode={actionMode} />
        {rescheduleInfo && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-3">
            <p className="text-sm text-primary font-body whitespace-pre-line">{rescheduleInfo}</p>
          </div>
        )}
        {actionMode === "markAvailable" && (
          <ScheduleQuickActions busy={busy} onCopyPreviousWeek={copyPreviousWeek} onRepeatNextWeeks={repeatNextWeeks} />
        )}
      </div>

      <WeekNavigator
        rangeLabel={weekRange}
        isCurrentWeek={isCurrentWeek}
        loading={loading}
        onPrev={handlePrevWeek}
        onNext={handleNextWeek}
        onToday={handleToday}
        onRefresh={loadWeekSlots}
      />

      {initialLoaded && !loading && freeCount === 0 && <AvailabilityEmptyBanner onStartTour={startTour} />}

      <ScheduleLegend />

      {!initialLoaded ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="sticky top-16 z-20 grid grid-cols-6 gap-1.5 bg-background/95 backdrop-blur-sm py-2 -mx-4 px-4 border-b border-border">
            {days.map((date, day) => (
              <BoardDayHeader
                key={day}
                dayName={DAY_NAMES[day]}
                dateLabel={formatDate(date, "dd/MM")}
                manage={actionMode === "markAvailable"}
                open={dayMenu === day}
                onOpenChange={(next) => setDayMenu(next ? day : null)}
                onMarkAll={() => markWholeDay(day)}
                onClearAll={() => clearWholeDay(day)}
              />
            ))}
          </div>

          <div className="grid grid-cols-6 gap-1.5">
            {HOURS.map((hour) =>
              days.map((date, day) => {
                const cell = cellFor(date, hour);
                const { endHour, endMinutes } = getSlotEndTime(hour, slotDuration);
                const selectable = actionMode === "markAvailable" && !cell.past && !cell.booked && !cell.free;
                return (
                  <SlotCell
                    key={cell.key}
                    cellKey={cell.key}
                    slot={cell.slot}
                    isPast={cell.past}
                    startTime={`${String(hour).padStart(2, "0")}:00`}
                    endTime={`${String(endHour).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`}
                    tooltip={tooltipFor(cell, DAY_NAMES[day])}
                    flash={flashKey === cell.key}
                    highlight={tourStep === 5 && tourTargetKey === cell.key}
                    selected={selection.includes(cell.key)}
                    onClick={() => handleSlotTap(date, hour)}
                    onPointerDown={selectable ? () => beginDrag(cell.key) : undefined}
                    onPointerEnter={selectable ? () => extendDrag(cell.key) : undefined}
                  />
                );
              })
            )}
          </div>
        </>
      )}

      <ScheduleAlert alert={alert} />

      {tourStep !== null && (
        <ScheduleTour
          step={tourStep}
          onNext={() => setTourStep(Math.min(tourStep + 1, 6))}
          onPrev={() => setTourStep(Math.max(tourStep - 1, 0))}
          onSkip={persistTourSeen}
          onFinish={persistTourSeen}
        />
      )}
    </div>
  );
}