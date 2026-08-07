import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { User, Loader2, RefreshCw, ChevronLeft, ChevronRight, BookOpen, Calendar, DollarSign, Star, UserCircle, IdCard, Pencil, ChevronDown, ChevronUp, Trash2, Camera, CheckCircle2, Eye, X } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import SubjectsFreeAllList from "@/components/SubjectsFreeAllList";
import PageLogo from "@/components/PageLogo";

export default function TeacherProfile() {
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const authToken = localStorage.getItem("authToken") || "";
  const teacherEmail = userData.teacherEmail || userData.email || "";

  const now = new Date();
  const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ratingIndex, setRatingIndex] = useState(0);
  const [editingAbout, setEditingAbout] = useState(false);
  const [aboutText, setAboutText] = useState("");
  const [savingAbout, setSavingAbout] = useState(false);
  const [editingHourly, setEditingHourly] = useState(false);
  const [hourlyValue, setHourlyValue] = useState(80);
  const [savingHourly, setSavingHourly] = useState(false);
  const [showSubjectsFreeAll, setShowSubjectsFreeAll] = useState(false);
  const [savingSubject, setSavingSubject] = useState(false);
  const [removingSubjectId, setRemovingSubjectId] = useState("");
  const [scanningSubjectId, setScanningSubjectId] = useState("");
  const [savingDocument, setSavingDocument] = useState(false);
  const [fetchingDocFor, setFetchingDocFor] = useState("");
  const [documentPreview, setDocumentPreview] = useState(null);
  const fileInputRef = useRef(null);
  const aboutTextareaRef = useRef(null);

  const loadProfile = async () => {
    if (!teacherEmail) { setError("לא נמצא אימייל מורה"); return null; }
    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("teacherProfileProxy", {
        email: teacherEmail, token: authToken, todayDate,
      });
      const data = res.data || {};
      if (data._status === 401) {
        setError("פג תוקף החיבור. התנתקו והתחברו מחדש.");
        return null;
      }
      if (data.error) { setError(data.error); return null; }
      setProfile(data); setRatingIndex(0);
      // Auto-open edit mode if "about" field is empty
      const aboutVal = data.details?.gn02_presentYourSelf || data.Details?.gn02_presentYourSelf || "";
      if (!aboutVal || String(aboutVal).trim() === "") {
        setAboutText("");
        setEditingAbout(true);
        setTimeout(() => aboutTextareaRef.current?.focus(), 100);
      }
      return data;
    } catch (err) {
      setError("שגיאה בטעינת הפרופיל: " + (err.message || ""));
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Normalize data fields
  const details = profile?.details || profile?.Details || {};
  const rawPicture = profile?.profilePicture || profile?.ProfilePicture || details?.profilePicture || details?.ProfilePicture || "";
  // Support both base64 string and full data URL
  const profilePictureSrc = rawPicture
    ? (rawPicture.startsWith("data:") ? rawPicture : `data:image/jpeg;base64,${rawPicture}`)
    : null;

  const ratings = profile?.ratings || profile?.Ratings || [];
  const subjects = profile?.subjects || profile?.Subjects || [];
  const subjectsFreeAllRaw = profile?.subjectsFreeAll || profile?.SubjectsFreeAll || [];
  const existingSubjectIds = subjects.map((s) => String(s.gn05_subject_id ?? "")).filter(Boolean);
  const subjectsFreeAll = subjectsFreeAllRaw.filter(
    (s) => !existingSubjectIds.includes(String(s.gn03_id ?? ""))
  );
  const upcomingLessons = profile?.upcomingLessons || profile?.UpcomingLessons || [];
  const income = profile?.income || profile?.Income || null;

  const lessonColumnLabels = {
    dayInTheWeek: "יום",
    dateInTheMonth: "תאריך",
    startEndHoure: "שעה",
    subjectName: "מקצוע",
    studentName: "שם התלמיד/ה",
  };

  const incomeColumnLabels = {
    heb_month: "חודש",
    lessonsCount: "כמות שיעורים",
    payment: "סכום בשקלים",
    verify: "סטטוס",
  };

  const fieldLabels = {
    teacherName: "שם מלא",
    gn02_Email: "אימייל",
    gn02_PhoneNumber: "טלפון",
    gn02_lessonDurationMin: "משך השיעור",
    gn02_hourlyPayment: "שכר לשיעור",
    gn02_presentYourSelf: "אודות",
  };

  // Detail entries excluding picture field
  const detailEntries = Object.entries(details).filter(([k]) =>
    !["profilePicture", "ProfilePicture", "gn02_Seq", "gn02Seq", "gn02_seq"].includes(k)
  );
  // If no nested details, fall back to top-level fields
  const swapFields = (entries, keyA, keyB) => {
    const idxA = entries.findIndex(([k]) => k === keyA);
    const idxB = entries.findIndex(([k]) => k === keyB);
    if (idxA === -1 || idxB === -1) return entries;
    const result = [...entries];
    [result[idxA], result[idxB]] = [result[idxB], result[idxA]];
    return result;
  };

  const fieldOrder = Object.keys(fieldLabels);
  const rawDetails = detailEntries.length > 0
    ? detailEntries
    : Object.entries(profile || {}).filter(([k]) =>
        !["_status", "_foundSeq", "_foundSeqKey", "ratings", "Ratings", "subjects", "Subjects", "upcomingLessons",
          "UpcomingLessons", "income", "Income", "details", "Details",
          "profilePicture", "ProfilePicture", "gn02_Seq", "gn02Seq", "gn02_seq"].includes(k)
      );
  const displayDetails = [
    ...rawDetails.filter(([k]) => fieldOrder.includes(k)).sort(([a], [b]) => fieldOrder.indexOf(a) - fieldOrder.indexOf(b)),
    ...rawDetails.filter(([k]) => !fieldOrder.includes(k)),
  ];

  const currentRating = ratings[ratingIndex];

  const renderStars = (score) => {
    const num = parseFloat(score);
    if (isNaN(num)) return score;
    return "★".repeat(Math.round(num)) + "☆".repeat(5 - Math.round(num));
  };

  const gn02Seq = profile?._foundSeq || details.gn02_seq || details.gn02_Seq || details.gn02Seq || details.Gn02Seq || details.gn02_SEQ || profile?.gn02_seq || profile?.gn02_Seq || profile?.gn02Seq || profile?.Gn02Seq || "";
  const gn02Email = details.gn02_Email || profile?.gn02_Email || teacherEmail;

  const handleAddSubject = async (subject) => {
    setSavingSubject(true);
    setError("");
    try {
      const res = await base44.functions.invoke("teacherProfileProxy", {
        action: "insertNewTeacherSubject",
        teacherEmail: gn02Email,
        subject: subject.gn03_id,
        token: authToken,
      });
      const data = res.data || {};
      if (data._status === 401) {
        setError("פג תוקף החיבור. התנתקו והתחברו מחדש.");
        return;
      }
      if (data.error) {
        setError(data.error);
        return;
      }
      toast.success("המקצוע נוסף בהצלחה");
      // Optimistic update — the API returned success, so keep it in the list.
      // Don't auto-refresh: the external backend is slow to reflect changes and
      // would revert the optimistic state with stale data.
      setProfile((prev) => prev ? {
        ...prev,
        subjects: [...(prev.subjects || prev.Subjects || []), {
          gn05_subject_id: subject.gn03_id,
          gn03_subjectName: subject.gn03_subjectName,
          gn04_levelName: subject.gn04_levelName,
        }],
      } : prev);
    } catch (err) {
      const serverError = err?.response?.data?.error || err?.response?.data?.message;
      setError(serverError ? "שגיאה בהוספת מקצוע: " + serverError : "שגיאה בהוספת מקצוע: " + (err.message || ""));
    } finally {
      setSavingSubject(false);
    }
  };

  const handleRemoveSubject = async (subject) => {
    const removedId = String(subject.gn05_subject_id ?? "");
    setRemovingSubjectId(removedId);
    setError("");
    try {
      const res = await base44.functions.invoke("teacherProfileProxy", {
        action: "removeTeacherSubject",
        teacherEmail: gn02Email,
        subject: subject.gn05_subject_id,
        token: authToken,
      });
      const data = res.data || {};
      if (data._status === 401) {
        setError("פג תוקף החיבור. התנתקו והתחברו מחדש.");
        return;
      }
      if (data.error) {
        setError(data.error);
        return;
      }
      toast.success("המקצוע הוסר בהצלחה");
      // Optimistic update — the API returned success, so keep it removed.
      // Don't auto-refresh: the external backend is slow to reflect changes and
      // would revert the optimistic state with stale data.
      setProfile((prev) => prev ? {
        ...prev,
        subjects: (prev.subjects || prev.Subjects || []).filter(
          (s) => String(s.gn05_subject_id ?? "") !== removedId
        ),
      } : prev);
    } catch (err) {
      const serverError = err?.response?.data?.error || err?.response?.data?.message;
      setError(serverError ? "שגיאה בהסרת מקצוע: " + serverError : "שגיאה בהסרת מקצוע: " + (err.message || ""));
    } finally {
      setRemovingSubjectId("");
    }
  };

  const handleScanClick = (subject) => {
    setScanningSubjectId(String(subject.gn05_subject_id ?? ""));
    fileInputRef.current?.click();
  };

  const handleViewDocument = async (subject) => {
    const subjectId = String(subject.gn05_subject_id ?? "");
    setFetchingDocFor(subjectId);
    setError("");
    try {
      const res = await base44.functions.invoke("teacherProfileProxy", {
        action: "select_Verified_document",
        teacherEmail: gn02Email,
        subject: subjectId,
        token: authToken,
      });
      const data = res.data || {};
      console.log("[TeacherProfile] select_Verified_document response:", { _status: data._status, _documentData: data._documentData ? `(length: ${data._documentData.length})` : null, keys: Object.keys(data) });
      if (data._status === 401) {
        setError("פג תוקף החיבור. התנתקו והתחברו מחדש.");
        return;
      }
      if (data.error) {
        setError(data.error);
        return;
      }
      const docData = data._documentData || data.documentData || data.DocumentData || data.document || data.Document || null;
      if (!docData) {
        setError("לא נמצאה תעודה למקצוע זה");
        return;
      }
      setDocumentPreview(docData);
    } catch (err) {
      setError("שגיאה בשליפת מסמך: " + (err.message || ""));
    } finally {
      setFetchingDocFor("");
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSavingDocument(true);
    setError("");
    try {
      const documentData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            const maxDim = 1200;
            let width = img.width;
            let height = img.height;
            if (width > maxDim || height > maxDim) {
              const ratio = Math.min(maxDim / width, maxDim / height);
              width = Math.round(width * ratio);
              height = Math.round(height * ratio);
            }
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.7));
          };
          img.onerror = reject;
          img.src = reader.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await base44.functions.invoke("teacherProfileProxy", {
        action: "set_Verified_document",
        teacherEmail: gn02Email,
        subject: scanningSubjectId,
        documentData,
        token: authToken,
      });
      const data = res.data || {};
      if (data._status === 401) {
        setError("פג תוקף החיבור. התנתקו והתחברו מחדש.");
        return;
      }
      if (data.error) {
        setError(data.error);
        return;
      }
      toast.success("המסמך נשמר בהצלחה");
      setProfile((prev) => prev ? {
        ...prev,
        subjects: (prev.subjects || prev.Subjects || []).map((s) =>
          String(s.gn05_subject_id ?? "") === scanningSubjectId
            ? { ...s, gn05_Verified: 1 }
            : s
        ),
      } : prev);
    } catch (err) {
      const serverError = err?.response?.data?.error || err?.response?.data?.message;
      setError(serverError ? "שגיאה בשמירת מסמך: " + serverError : "שגיאה בשמירת מסמך: " + (err.message || ""));
    } finally {
      setSavingDocument(false);
      setScanningSubjectId("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveAbout = async () => {
    setSavingAbout(true);
    setError("");
    try {
      if (!gn02Seq) {
        console.log("[TeacherProfile] gn02Seq is empty! profile keys:", Object.keys(profile || {}), "details keys:", Object.keys(details));
        setError("חסר מזהה מורה. אנא רעננו את הדף ונסו שוב.");
        return;
      }
      const res = await base44.functions.invoke("teacherProfileProxy", {
        action: "updateAbout",
        gn02Seq,
        description: aboutText,
        email: teacherEmail,
        todayDate,
        token: authToken,
      });
      const data = res.data || {};
      console.log("[TeacherProfile] updateAbout response:", data);
      if (data._status === 401) {
        setError("פג תוקף החיבור. התנתקו והתחברו מחדש.");
        return;
      }
      if (data.error) {
        setError(data.error);
        return;
      }
      setEditingAbout(false);
      setProfile((prev) => prev ? {
        ...prev,
        details: {
          ...(prev.details || prev.Details || {}),
          gn02_presentYourSelf: aboutText
        }
      } : prev);
    } catch (err) {
      setError("שגיאה בשמירת האודות: " + (err.message || ""));
    } finally {
      setSavingAbout(false);
    }
  };

  const handleSaveHourly = async () => {
    setSavingHourly(true);
    setError("");
    try {
      if (!gn02Seq) {
        setError("חסר מזהה מורה. אנא רעננו את הדף ונסו שוב.");
        return;
      }
      const res = await base44.functions.invoke("teacherProfileProxy", {
        action: "updateHourlyPayment",
        gn02Seq,
        hourlyPayment: hourlyValue,
        email: teacherEmail,
        todayDate,
        token: authToken,
      });
      const data = res.data || {};
      if (data._status === 401) {
        setError("פג תוקף החיבור. התנתקו והתחברו מחדש.");
        return;
      }
      if (data.error) {
        setError(data.error);
        return;
      }
      setEditingHourly(false);
      setProfile((prev) => prev ? {
        ...prev,
        details: {
          ...(prev.details || prev.Details || {}),
          gn02_hourlyPayment: hourlyValue
        }
      } : prev);
    } catch (err) {
      setError("שגיאה בשמירת השכר: " + (err.message || ""));
    } finally {
      setSavingHourly(false);
    }
  };

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <PageLogo />
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground flex items-center gap-2">
            <User className="w-7 h-7 text-primary" />
            פרופיל מורה
          </h1>
          <p className="text-muted-foreground font-body text-sm">תאריך: {todayDate}</p>
        </div>
        <button
          onClick={loadProfile}
          disabled={loading}
          className="px-4 py-2.5 bg-muted text-foreground rounded-xl text-sm font-heading font-medium hover:bg-accent transition-colors flex items-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          רענון
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-sm font-body">{error}</div>
      )}

      {profile && (
        <>
          {/* Details + Picture */}
          <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
            <h2 className="text-base font-heading font-semibold text-foreground flex items-center gap-2">
                <IdCard className="w-5 h-5 text-primary" />
                פרטים אישיים
              </h2>
            {/* Profile picture */}
            <div className="flex flex-col items-center gap-2">
              {profilePictureSrc ? (
                <img
                  src={profilePictureSrc}
                  alt="תמונת פרופיל"
                  className="w-[100px] h-[130px] object-cover rounded-xl border border-border shadow"
                />
              ) : (
                <div className="w-[100px] h-[130px] rounded-xl border border-border bg-muted flex items-center justify-center">
                  <UserCircle className="w-12 h-12 text-muted-foreground/40" />
                </div>
              )}
              <Link
                to="/teacher-picture"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-muted text-foreground rounded-lg text-xs font-heading font-medium hover:bg-accent transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                עריכת תמונה
              </Link>
            </div>

            {/* Details table */}
            <div className="space-y-0 divide-y divide-border">
              {displayDetails.map(([key, value]) => (
                <div key={key} className={`flex gap-3 py-2.5 ${(key === "gn02_presentYourSelf" && editingAbout) || (key === "gn02_hourlyPayment" && editingHourly) ? "items-start" : "items-center"}`}>
                  <span className="text-xs font-heading font-semibold text-muted-foreground w-20 text-right shrink-0">
                    {fieldLabels[key] || key}
                  </span>
                  {key === "gn02_presentYourSelf" && editingAbout ? (
                    <div className="flex-1 space-y-2 select-text">
                      <textarea
                        ref={aboutTextareaRef}
                        value={aboutText}
                        onChange={(e) => setAboutText(e.target.value)}
                        rows={4}
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-body text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="הציגו וספרו על עצמכם כפי שיוצג לתלמידים"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleSaveAbout}
                          disabled={savingAbout}
                          className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-heading font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-1.5"
                        >
                          {savingAbout && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          שמירה
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingAbout(false)}
                          disabled={savingAbout}
                          className="px-3 py-1.5 bg-muted text-foreground rounded-lg text-xs font-heading font-medium hover:bg-accent transition-colors disabled:opacity-60"
                        >
                          ביטול
                        </button>
                      </div>
                    </div>
                  ) : key === "gn02_hourlyPayment" && editingHourly ? (
                    <div className="flex-1 space-y-3 select-text">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-body">80 ₪</span>
                        <span className="text-lg font-heading font-bold text-primary">{hourlyValue} ₪</span>
                        <span className="text-xs text-muted-foreground font-body">200 ₪</span>
                      </div>
                      <input
                        type="range"
                        min={80}
                        max={200}
                        step={10}
                        value={hourlyValue}
                        onChange={(e) => setHourlyValue(parseInt(e.target.value, 10))}
                        className="w-full accent-primary cursor-pointer"
                        style={{ touchAction: 'none' }}
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleSaveHourly}
                          disabled={savingHourly}
                          className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-heading font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-1.5"
                        >
                          {savingHourly && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                          שמירה
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingHourly(false)}
                          disabled={savingHourly}
                          className="px-3 py-1.5 bg-muted text-foreground rounded-lg text-xs font-heading font-medium hover:bg-accent transition-colors disabled:opacity-60"
                        >
                          ביטול
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm font-body text-foreground break-words whitespace-pre-wrap flex-1">
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : `${String(value ?? "—").split("\n").map(line => line.startsWith(" ") ? line.trimStart() : line).join("\n")}${key === "gn02_hourlyPayment" ? " ₪" : ""}${key === "gn02_lessonDurationMin" ? " דקות" : ""}`}
                    </span>
                  )}
                  {key === "gn02_presentYourSelf" && !editingAbout && (
                    <button
                      type="button"
                      onClick={() => { setAboutText(String(value ?? "")); setEditingAbout(true); }}
                      className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                      title="עריכת אודות"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                  )}
                  {key === "gn02_hourlyPayment" && !editingHourly && (
                    <button
                      type="button"
                      onClick={() => {
                        const current = parseInt(String(value ?? "80"), 10);
                        let clamped = isNaN(current) ? 80 : current;
                        clamped = Math.max(80, Math.min(200, Math.round(clamped / 10) * 10));
                        setHourlyValue(clamped);
                        setEditingHourly(true);
                      }}
                      className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                      title="עריכת שכר לשיעור"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Subjects */}
          <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-heading font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                רשימת מקצועות
              </h2>
              <button
                type="button"
                onClick={() => setShowSubjectsFreeAll(!showSubjectsFreeAll)}
                className="flex items-center gap-1.5 px-3 py-2 bg-muted text-foreground rounded-lg text-xs font-heading font-medium hover:bg-accent transition-colors min-h-[44px] cursor-pointer"
              >
                {showSubjectsFreeAll ? (
                  <><ChevronUp className="w-4 h-4" />הסתר מקצועות לימוד נוספים</>
                ) : (
                  <><ChevronDown className="w-4 h-4" />הצג מקצועות לימוד נוספים</>
                )}
              </button>
            </div>
            {subjects.length > 0 && (
              <ul className="space-y-1">
                {subjects.map((subject, i) => (
                  <li key={subject.gn05_subject_id ?? i} className="text-sm font-body text-foreground flex items-center gap-2">
                    <span className="text-primary">•</span>
                    <span className="flex-1">
                      {typeof subject === "object"
                        ? [subject.gn03_subjectName, subject.gn04_levelName].filter(Boolean).join(" - ") || JSON.stringify(subject)
                        : String(subject)}
                    </span>
                    {typeof subject === "object" && subject.gn05_subject_id && Number(subject.gn05_Verified) ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="flex items-center gap-1.5 text-green-600" title="תעודה אומתה">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="text-xs font-heading font-medium">מאומת</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleViewDocument(subject)}
                          disabled={!!fetchingDocFor}
                          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-heading font-medium hover:bg-primary/20 transition-colors disabled:opacity-60"
                          title="הצג תעודה"
                        >
                          {fetchingDocFor === String(subject.gn05_subject_id)
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Eye className="w-4 h-4" />}
                          הצג תעודה
                        </button>
                      </div>
                    ) : typeof subject === "object" && subject.gn05_subject_id && !Number(subject.gn05_Verified) && (
                      <button
                        type="button"
                        onClick={() => handleScanClick(subject)}
                        disabled={savingDocument}
                        className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-heading font-medium hover:bg-primary/20 transition-colors shrink-0 disabled:opacity-60"
                        title="סרקו תעודה"
                      >
                        {savingDocument && scanningSubjectId === String(subject.gn05_subject_id)
                          ? <Loader2 className="w-4 h-4 animate-spin" />
                          : <Camera className="w-4 h-4" />}
                        סרקו תעודה
                      </button>
                    )}
                    {typeof subject === "object" && subject.gn05_subject_id && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(subject)}
                        disabled={!!removingSubjectId}
                        className="p-2.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer disabled:opacity-60"
                        title="הסרת מקצוע"
                      >
                        {removingSubjectId
                          ? <Loader2 className="w-4 h-4 animate-spin pointer-events-none" />
                          : <Trash2 className="w-4 h-4 pointer-events-none" />}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {showSubjectsFreeAll && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs font-heading font-semibold text-muted-foreground mb-3">כל המקצועות הזמינים</p>
                <SubjectsFreeAllList items={subjectsFreeAll} onSelect={handleAddSubject} saving={savingSubject} />
              </div>
            )}
          </div>

         

          {/* Income */}
          {income !== null && income !== undefined && (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                <span className="text-primary font-bold text-base">₪</span>
                <h2 className="text-base font-heading font-semibold text-foreground">הכנסות</h2>
              </div>
              {typeof income === "object" && Array.isArray(income) ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-body">
                    <thead>
                      <tr className="bg-muted/50 text-xs font-heading font-semibold text-muted-foreground">
                        {income[0] && Object.keys(income[0]).slice(0, -1).map((k) => (
                          <th key={k} className="px-4 py-2.5 text-center border-b border-border">{incomeColumnLabels[k] || k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {income.map((row, i) => (
                        <tr key={i} className="hover:bg-muted/30 transition-colors">
                          {Object.values(row).slice(0, -1).map((v, j) => (
                            <td key={j} className="px-4 py-2.5 text-foreground text-center">{String(v ?? "—")}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : typeof income === "object" ? (
                <div className="p-5 space-y-2">
                  {Object.entries(income).map(([k, v]) => (
                    <div key={k} className="flex items-start gap-3">
                      <span className="text-xs font-heading font-semibold text-muted-foreground w-32 text-right">{k}</span>
                      <span className="text-sm font-body text-foreground">{String(v ?? "—")}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-5 py-4 text-2xl font-heading font-bold text-foreground">{String(income)}</p>
              )}
            </div>
          )}

          {/* Ratings */}
          <div className="bg-card rounded-2xl border border-border p-5 space-y-3">
            <h2 className="text-base font-heading font-semibold text-foreground flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              דירוג המורה
            </h2>
            {ratings.length > 0 && (
              <>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setRatingIndex((i) => (i - 1 + ratings.length) % ratings.length)}
                    className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  <div className="flex-1 bg-muted/40 rounded-xl p-4 space-y-2 text-sm font-body min-h-[80px]">
                    {typeof currentRating === "object"
                      ? (() => {
                          const entries = Object.entries(currentRating).filter(([k]) => k !== "subjectId");
                          const sorted = entries.length > 1 ? [entries[entries.length - 1], ...entries.slice(0, -1)] : entries;
                          return sorted.map(([k, v], idx) => (
                            <div key={k} className="flex gap-2 items-start">
                              <span className={`text-amber-500 ${idx === 0 ? "text-base font-semibold" : "text-sm"}`}>{
                                (k.toLowerCase().includes("score") || k.toLowerCase().includes("rating") || k.toLowerCase().includes("דירוג"))
                                  ? renderStars(v)
                                  : String(v ?? "—")
                              }</span>
                            </div>
                          ));
                        })()
                      : <span className="text-foreground">{String(currentRating)}</span>
                    }
                  </div>

                  <button
                    onClick={() => setRatingIndex((i) => (i + 1) % ratings.length)}
                    className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-center text-muted-foreground font-body">{ratingIndex + 1} / {ratings.length}</p>
              </>
            )}
          </div>
          
          {/* Upcoming Lessons */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-base font-heading font-semibold text-foreground">שיעורים עתידיים</h2>
            </div>
            {upcomingLessons.length > 0 && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-body">
                    <thead>
                      <tr className="bg-muted/50 text-xs font-heading font-semibold text-muted-foreground">
                        {upcomingLessons[0] && typeof upcomingLessons[0] === "object" &&
                          Object.keys(upcomingLessons[0]).map((k) => (
                            <th key={k} className="px-4 py-2.5 text-center border-b border-border">{lessonColumnLabels[k] || k}</th>
                          ))
                        }
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {upcomingLessons.map((lesson, i) => {
                        const lessonDate = typeof lesson === "object" ? (lesson.dateInTheMonth || "") : "";
                        // todayDate is YYYY-MM-DD; also support DD/MM/YYYY format
                        const [y, m, d] = todayDate.split("-");
                        const todayDDMMYYYY = `${d}/${m}/${y}`;
                        const isToday = lessonDate === todayDate || lessonDate === todayDDMMYYYY;
                        return (
                          <tr key={i} className="hover:bg-muted/30 transition-colors">
                            {typeof lesson === "object"
                              ? Object.values(lesson).map((v, j) => (
                                  <td key={j} className={`px-4 py-2.5 whitespace-nowrap text-center ${isToday ? "text-orange-500 font-semibold" : "text-foreground"}`}>{String(v ?? "—")}</td>
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

        </>
      )}

      {/* Document preview modal */}
      {documentPreview !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setDocumentPreview(null)}
        >
          <div
            className="bg-card rounded-2xl border border-border max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h3 className="text-base font-heading font-semibold text-foreground">תעודה</h3>
              <button
                type="button"
                onClick={() => setDocumentPreview(null)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
              {typeof documentPreview === "string" && documentPreview.startsWith("data:") ? (
                <img src={documentPreview} alt="תעודה" className="max-w-full max-h-[70vh] object-contain rounded-lg" />
              ) : typeof documentPreview === "string" && documentPreview.startsWith("data:image") ? (
                <img src={documentPreview} alt="תעודה" className="max-w-full max-h-[70vh] object-contain rounded-lg" />
              ) : typeof documentPreview === "string" ? (
                <img src={`data:image/jpeg;base64,${documentPreview}`} alt="תעודה" className="max-w-full max-h-[70vh] object-contain rounded-lg" />
              ) : (
                <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-all">{JSON.stringify(documentPreview, null, 2)}</pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}