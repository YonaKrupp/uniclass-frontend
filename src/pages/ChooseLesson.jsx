import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Loader2, Search, GraduationCap, School, X, ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageLogo from "@/components/PageLogo";

const SEARCH_MODES = [
  { value: "1", label: "חיפוש מלא", icon: Search },
  { value: "3", label: "חיפוש בהקלדה", icon: BookOpen },
  { value: "2", label: "חיפוש מורים מתוך שיעורים שכבר לקחתם", icon: GraduationCap },
];

const UNIVERSITY_MODES = [
  { value: "1", label: "אוניברסיטה", icon: School },
  { value: "2", label: "האוניברסיטה הפתוחה", icon: BookOpen },
  { value: "3", label: "בית ספר", icon: GraduationCap },
];

// Module-level: prevents concurrent fetch calls across component remounts within the same page load
let _fetchInProgress = false;

export default function ChooseLesson() {
  const [studentEmail, setStudentEmail] = useState("");
  const [authToken, setAuthToken] = useState("");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchMode, setSearchMode] = useState("1");
  const [universityMode, setUniversityMode] = useState("1");

  const [selectedDegree, setSelectedDegree] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const [typedQuery, setTypedQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showSubjectList, setShowSubjectList] = useState(false);
  const [activeOnly, setActiveOnly] = useState(true);
  const subjectListRef = useRef(null);
  const typedInputRef = useRef(null);
  const typedSearchSectionRef = useRef(null);

  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const navigate = useNavigate();

  const fetchData = async (email, token) => {
    if (!email) { setLoading(false); return; }
    if (_fetchInProgress) { setLoading(false); return; }
    _fetchInProgress = true;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        'https://learn-le-connect.base44.app/api/apps/6a37f1517bf59551c5f4b6f9/functions/getAllStudentDataProxy',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentEmail: email, token }),
        }
      ).then((r) => r.json());
      if (res?.error) {
        setError(res.error);
      } else {
        if (Number(res?.cleanPrePaid?.resultCodeCountUnPaidLessons) > 0) {
          navigate("/student-payment");
          return;
        }
        setData(res);
      }
    } catch (err) {
      setError(err.message || "שגיאה בטעינת נתונים");
    } finally {
      _fetchInProgress = false;
      setLoading(false);
    }
  };

  // Read credentials AND fetch on mount. _fetchInProgress prevents concurrent duplicate calls.
  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const email = userData.studentEmail || userData.email || "";
      const token = localStorage.getItem("authToken") || "";
      setStudentEmail(email);
      setAuthToken(token);
      fetchData(email, token);
    } catch {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isOpenUniversity = universityMode === "2";

  // Reset selections when university mode or search mode changes
  useEffect(() => {
    setSelectedDegree("");
    setSelectedYear("0");
    setSelectedCourse("");
  }, [universityMode, searchMode]);

  // Reset year and course when degree changes
  useEffect(() => {
    setSelectedYear("0");
    setSelectedCourse("");
  }, [selectedDegree]);

  // Reset course when year changes
  useEffect(() => {
    setSelectedCourse("");
  }, [selectedYear]);

  // Reset typed search when leaving that mode
  useEffect(() => {
    if (searchMode !== "3") {
      setTypedQuery("");
      setSelectedSubject(null);
      setShowSubjectList(false);
    }
    if (searchMode !== "2") {
      setSelectedTeacherId("");
    }
    if (searchMode === "3") {
      setTimeout(() => {
        typedSearchSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        typedInputRef.current?.focus();
      }, 50);
    }
  }, [searchMode]);

  // Close subject list on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (subjectListRef.current && !subjectListRef.current.contains(e.target)) {
        setShowSubjectList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allDegrees = data?.degrees ?? [];
  const allYears = data?.years ?? [];
  const courses = data?.courses ?? [];
  const subjects = data?.subjects ?? [];
  const degrees = allDegrees.filter((d) => {
    if (Number(d.gn20_uni_type) !== Number(universityMode)) return false;
    if (activeOnly) {
      const v = d.Active ?? d.active ?? d.gn20_Active ?? d.gn20_active ?? d.IsActive ?? d.gn20_IsActive;
      return Number(v) === 1 || v === true || v === "1" || v === "true";
    }
    return true;
  });
  const years = selectedDegree
    ? allYears.filter((y) => String(y.gn22_subject_id) === String(selectedDegree))
    : allYears;

  // Filter courses by selected degree via subjects' gn22_subject_id mapping
  const filteredCourses = (() => {
    if (!selectedDegree) return [];
    const matchingSubjectIds = subjects
      .filter((s) => String(s.gn22_subject_id ?? s.Gn22_subject_id ?? "") === String(selectedDegree))
      .map((s) => s.gn03_id);
    const seen = new Set();
    return courses.filter((c) => {
      if (!matchingSubjectIds.includes(c.course_id)) return false;
      if (activeOnly) {
        const v = c.Active ?? c.active ?? c.gn03_Active ?? c.gn03_active ?? c.IsActive ?? c.gn03_IsActive;
        if (!(Number(v) === 1 || v === true || v === "1" || v === "true")) return false;
      }
      const key = String(c.course_id);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  })();

  const canSelectYear = selectedDegree !== "";
  const canSelectCourse = selectedDegree !== "";

  const showUniversitySection = searchMode === "1";
  const showDropdowns = showUniversitySection;
  const showTypedSearch = searchMode === "3";
  const showTeachersList = searchMode === "2";

  const teachers = data?.teachers ?? [];
  const teacherIdOf = (t, i) => {
    const id = String(t.gn06_Email ?? t.teacherId ?? t.teacher_id ?? t.id ?? t.techerId ?? "");
    const subject = String(t.subject ?? "");
    return id && subject ? `${id}__${subject}` : `idx_${i}`;
  };

  // Build subject display strings: gn03_subjectName + ' ' + gn04_levelName
  const subjectOptions = useMemo(() => {
    const seen = new Set();
    return subjects
      .map((s) => {
        const name = (s.gn03_subjectName ?? "").replace(/\u00a0/g, " ").trim();
        const level = (s.gn04_levelName ?? "").replace(/\u00a0/g, " ").trim();
        const label = level ? `${name} ${level}` : name;
        return { ...s, _label: label };
      })
      .filter((s) => {
        if (seen.has(s._label)) return false;
        seen.add(s._label);
        return true;
      });
  }, [subjects]);

  const normalizeForSearch = (str) => (str ?? "")
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060\uFEFF\u00A0]/g, "")
    .toLowerCase()
    .trim();

  // Debug: log the first subject's keys to identify the Active field name
  useEffect(() => {
    if (subjects.length > 0) {
      console.log("[ChooseLesson] first subject keys:", Object.keys(subjects[0]), "values:", subjects[0]);
    }
  }, [subjects]);

  const filteredSubjects = useMemo(() => {
    let list = subjectOptions;
    if (activeOnly) {
      list = list.filter((s) => {
        const v = s.Active ?? s.active ?? s.gn03_Active ?? s.gn03_active ?? s.IsActive ?? s.IsActiveSubject ?? s.gn03_isActive ?? s.gn03_IsActive;
        return Number(v) === 1 || v === true || v === "1" || v === "true";
      });
    }
    const q = normalizeForSearch(typedQuery);
    if (!q) return list;
    const words = q.split(/\s+/).filter(Boolean);
    return list.filter((s) => {
      const label = normalizeForSearch(s._label);
      return words.every((w) => label.includes(w));
    });
  }, [subjectOptions, typedQuery, activeOnly]);

  const displayedSubjects = useMemo(() => filteredSubjects.slice(0, 50), [filteredSubjects]);

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <PageLogo />
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-primary" />
          בחרו שיעור
        </h1>
        <p className="text-muted-foreground font-body">בחרו את שיטת החיפוש הרצויה</p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-destructive text-sm font-body">
          {error}
        </div>
      )}

{/* Active lessons filter */}
      <div className="flex items-center gap-2 cursor-pointer select-none bg-card rounded-2xl border border-border p-4" dir="rtl">
        <input
          type="checkbox"
          checked={activeOnly}
          onChange={(e) => {
            setActiveOnly(e.target.checked);
            setSelectedDegree("");
            setSelectedYear("0");
            setSelectedCourse("");
            setTypedQuery("");
            setSelectedSubject(null);
            setShowSubjectList(false);
          }}
          className="w-4 h-4 accent-primary cursor-pointer shrink-0"
        />
        <span className="text-sm font-body text-foreground">הצג רק קורסים שקיים עבורם מורה</span>
      </div>

      {/* Search Mode Radio Buttons */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <h2 className="text-base font-heading font-semibold text-foreground">אופן החיפוש</h2>
        <div className="space-y-2">
          {SEARCH_MODES.map((mode) => {
            const Icon = mode.icon;
            const isSelected = searchMode === mode.value;
            return (
              <label
                key={mode.value}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <input
                  type="radio"
                  name="searchMode"
                  value={mode.value}
                  checked={isSelected}
                  onChange={(e) => setSearchMode(e.target.value)}
                  className="w-4 h-4 accent-primary"
                />
                <Icon className={`w-5 h-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                <span className={`font-body text-sm ${isSelected ? "text-primary font-semibold" : "text-foreground"}`}>
                  {mode.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* University Selection (only when searchMode = 1) */}
      {showUniversitySection && !loading && (
        <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
          <h2 className="w-full text-right text-base font-heading font-semibold text-foreground">סוג אוניברסיטה</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {UNIVERSITY_MODES.map((mode) => {
              const Icon = mode.icon;
              const isSelected = universityMode === mode.value;
              return (
                <label
                  key={mode.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="universityMode"
                    value={mode.value}
                    checked={isSelected}
                    onChange={(e) => setUniversityMode(e.target.value)}
                    className="w-4 h-4 accent-primary"
                  />
                  <Icon className={`w-5 h-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  <span className={`font-body text-sm ${isSelected ? "text-primary font-semibold" : "text-foreground"}`}>
                    {mode.label}
                  </span>
                </label>
              );
            })}
          </div>

          {/* Dropdowns */}
          {showDropdowns && (
            <div className="space-y-4 pt-2">
              {/* Degrees */}
              <div className="space-y-2" dir="rtl">
              <label className="w-full text-right text-sm font-heading font-semibold text-foreground block">
                תואר אקדמי
              </label>
              <Select value={selectedDegree} onValueChange={setSelectedDegree}>
                <SelectTrigger className="w-full text-right flex flex-row-reverse justify-between items-center">
                  <SelectValue placeholder="בחרו תואר" />
                </SelectTrigger>
                <SelectContent className="min-w-[16rem] max-w-[90vw] text-right" align="end">
                  {degrees.map((d, i) => (
                    <SelectItem
                      key={d.degree_id ?? d.id ?? i}
                      value={String(d.degree_id ?? d.id ?? i)}
                      className="whitespace-normal break-words leading-snug py-2 text-right justify-start flex-row-reverse"
                    >
                      {d.degree_name ?? d.name ?? `תואר ${i + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

              {/* Year of study — only for school mode */}
              {universityMode === "3" && (
                <div className="space-y-2" dir="rtl">
                  <label className={`w-full text-right text-sm font-heading font-semibold block ${canSelectYear ? "text-foreground" : "text-muted-foreground/50"}`}>
                    שנת לימוד
                  </label>
                  <Select value={selectedYear} onValueChange={setSelectedYear} disabled={!canSelectYear}>
                    <SelectTrigger className="w-full text-right flex flex-row-reverse justify-between items-center">
                      <SelectValue placeholder={canSelectYear ? "בחרו שנת לימוד" : "בחרו תואר קודם"} />
                    </SelectTrigger>
                    <SelectContent className="min-w-[16rem] max-w-[90vw] text-right" align="end">
                      {years.map((y, i) => (
                        <SelectItem
                          key={y.year_id ?? y.gn22_id ?? y.id ?? i}
                          value={String(y.year_id ?? y.gn22_id ?? y.id ?? i)}
                          className="whitespace-normal break-words leading-snug py-2 text-right justify-start flex-row-reverse"
                        >
                          {y.degree_years ?? y.Degree_years ?? y.year_name ?? y.gn22_yearName ?? y.name ?? `שנה ${i + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Courses */}
              <div className="space-y-2" dir="rtl">
                <label className={`w-full text-right text-sm font-heading font-semibold block ${canSelectCourse ? "text-foreground" : "text-muted-foreground/50"}`}>
                  קורס
                </label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse} disabled={!canSelectCourse}>
                  <SelectTrigger className="w-full text-right flex flex-row-reverse justify-between items-center">
                    <SelectValue placeholder={canSelectCourse ? "בחרו קורס" : "בחרו תואר קודם"} />
                  </SelectTrigger>
                  <SelectContent className="min-w-[16rem] max-w-[90vw] text-right" align="end">
                    {filteredCourses.map((c, i) => (
                      <SelectItem
                        key={c.course_id ?? i}
                        value={String(c.course_id ?? i)}
                        className="whitespace-normal break-words leading-snug py-2 text-right justify-start flex-row-reverse"
                      >
                        {c.course_name ?? `קורס ${i + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search Teachers Button */}
              {selectedCourse && (
                <button
                  type="button"
                  onClick={() => {
                    const course = filteredCourses.find((c) => String(c.course_id) === String(selectedCourse));
                    const subjectId = course?.course_id ?? selectedCourse;
                    const subjectName = course?.course_name ?? "";
                    const params = new URLSearchParams({ subjectId: String(subjectId), subjectName });
                    navigate(`/teacher-results?${params.toString()}`);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-heading font-semibold text-sm hover:bg-primary/90 transition-colors"
                >
                  חיפוש מורים
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Teachers List (searchMode = 2) */}
      {showTeachersList && !loading && (
        <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
          <h2 className="w-full text-right text-base font-heading font-semibold text-foreground">מורים מתוך שיעורים שכבר לקחתם</h2>
          {teachers.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground font-body">לא נמצאו מורים</div>
          ) : (
            <div className="space-y-2">
              {teachers.filter((t) => {
                const lesson = (t.lesson ?? "").trim();
                const teacherEmail = String(t.gn06_Email ?? "");
                const subjectId = String(t.subject ?? "");
                return lesson && teacherEmail && subjectId;
              }).map((t, i) => {
                const lesson = (t.lesson ?? "").trim();
                const tid = teacherIdOf(t, i);
                const teacherEmail = String(t.gn06_Email ?? "");
                const subjectId = String(t.subject ?? "");
                const subjectName = lesson;
                return (
                  <button
                    key={tid}
                    type="button"
                    onClick={() => {
                      const params = new URLSearchParams({ teacherEmail, subjectId, subjectName, studentEmail });
                      navigate(`/student-schedule?${params.toString()}`);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:bg-muted/50 hover:border-primary text-right transition-colors group"
                  >
                    <GraduationCap className="w-5 h-5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="font-body text-sm text-foreground flex-1">
                      {lesson || `שיעור ${i + 1}`}
                    </span>
                    <ArrowLeft className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Typed Search (searchMode = 3) */}
      {showTypedSearch && !loading && (
        <div ref={typedSearchSectionRef} className="bg-card rounded-2xl border border-border p-5 space-y-4 scroll-mt-20">
          <h2 className="w-full text-right text-base font-heading font-semibold text-foreground">חיפוש מקצוע</h2>
          <div ref={subjectListRef} className="space-y-2">
            <label className="w-full text-right text-sm font-heading font-semibold text-foreground">הקלידו שם מקצוע או רמה</label>
            <div className="relative">
              <input
                ref={typedInputRef}
                type="text"
                dir="rtl"
                value={typedQuery}
                onChange={(e) => { setTypedQuery(e.target.value); setShowSubjectList(true); }}
                onFocus={() => setShowSubjectList(true)}
                placeholder="התחילו להקליד..."
                className="w-full text-right rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus:ring-1 focus:ring-ring"
              />
              {typedQuery && (
                <button
                  type="button"
                  onClick={() => { setTypedQuery(""); setSelectedSubject(null); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Selected subject chip */}
            {selectedSubject && (
              <div className="flex items-center justify-between gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
                <span className="text-sm font-body text-primary font-semibold text-right">{selectedSubject._label}</span>
                <button
                  type="button"
                  onClick={() => setSelectedSubject(null)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Search Teachers Button */}
            {selectedSubject && (
              <button
                type="button"
                onClick={() => {
                  const subjectId = String(selectedSubject.gn03_id ?? "");
                  const subjectName = (selectedSubject.gn03_subjectName ?? "").trim();
                  const params = new URLSearchParams({ subjectId, subjectName });
                  navigate(`/teacher-results?${params.toString()}`);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-heading font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                חיפוש מורים
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}

            {/* Dropdown list */}
            {showSubjectList && (
              <div className="max-h-60 overflow-y-auto rounded-md border border-border bg-popover shadow-md divide-y divide-border">
                {filteredSubjects.length === 0 ? (
                  <div className="px-3 py-4 text-center text-sm text-muted-foreground font-body">לא נמצאו תוצאות</div>
                ) : (
                  <>
                    {displayedSubjects.map((s, i) => {
                      const isSelected = selectedSubject?.gn03_id === s.gn03_id;
                      return (
                        <button
                          key={`${s.gn03_id ?? ""}-${i}`}
                          type="button"
                          onClick={() => { setSelectedSubject(s); setShowSubjectList(false); setTypedQuery(""); }}
                          className={`w-full text-right px-3 py-2 text-sm font-body transition-colors ${
                            isSelected ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted text-foreground"
                          }`}
                        >
                          {s._label}
                        </button>
                      );
                    })}
                    {filteredSubjects.length > 50 && (
                      <div className="px-3 py-2 text-center text-xs text-muted-foreground font-body">
                        מציג 50 מתוך {filteredSubjects.length} — המשיכו להקליד לסינון
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

    </div>
  );
}