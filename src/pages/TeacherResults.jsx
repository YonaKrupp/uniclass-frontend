import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Loader2, GraduationCap, Users, AlertCircle, Star, Clock, Mail, CreditCard, Calendar, MessageCircle, ArrowUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import TeacherRatings from "@/components/TeacherRatings";
import TeacherAvatar from "@/components/TeacherAvatar";
import { Checkbox } from "@/components/ui/checkbox";

export default function TeacherResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subjectId = searchParams.get("subjectId") || "";
  const subjectName = searchParams.get("subjectName") || "";

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const studentEmail = userData.studentEmail || userData.email || "";
  const authToken = localStorage.getItem("authToken") || "";

  const [teachers, setTeachers] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRatings, setShowRatings] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [waitingListLoading, setWaitingListLoading] = useState(false);
  const [waitingListMsg, setWaitingListMsg] = useState("");
  const [waitingListError, setWaitingListError] = useState("");

  useEffect(() => {
    if (!studentEmail || !subjectId) {
      setLoading(false);
      setError("חסרים נתונים לחיפוש");
      return;
    }
    const fetchTeachers = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          'https://learn-le-connect.base44.app/api/apps/6a37f1517bf59551c5f4b6f9/functions/searchTeachersBySubjectProxy',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentEmail, subjectId, token: authToken }),
          }
        ).then((r) => r.json());
        if (res?.error) {
          setError(res.error);
        } else {
          const list = Array.isArray(res) ? res : (res.teachers ?? res.data ?? []);
          setTeachers(list);
          const ratingList = Array.isArray(res?.ratings) ? res.ratings : (res.ratings ?? []);
          setRatings(ratingList);
        }
      } catch (err) {
        setError(err.message || "שגיאה בטעינת נתונים");
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, [studentEmail, subjectId, authToken]);

  const getTeacherEmailFromRating = (r) => {
    return String(
      r.teacherEmail ?? r.TeacherEmail ?? r.gn10_teacher_email ?? r.gn10_Teacher_Email ??
      r.teacher_email ?? r.Teacher_Email ?? r.gn06_Email ?? r.email ?? ""
    ).trim().toLowerCase();
  };

  const getRatingValue = (r) => {
    const v = r.Rating ?? r.rating ?? r.gn10_rating ?? r.gn10_Rating ?? r.score ?? r.avGrating ?? r.avgRating;
    return Number(v);
  };

  const getRatingsForTeacher = (teacherEmail) => {
    if (!teacherEmail || !Array.isArray(ratings)) return [];
    const target = String(teacherEmail).trim().toLowerCase();
    return ratings.filter((r) => getTeacherEmailFromRating(r) === target);
  };

  const getSalaryNumber = (t) => {
    const raw = (t.teacher_salary_requirement ?? "").toString().replace(/₪/g, "").replace(/[^\d.]/g, "").trim();
    return raw ? Number(raw) : null;
  };

  const getAvgRatingForTeacher = (teacherEmail) => {
    const teacherRatings = getRatingsForTeacher(teacherEmail);
    const valid = teacherRatings.filter((r) => Number.isFinite(getRatingValue(r)));
    if (valid.length === 0) return null;
    const sum = valid.reduce((acc, r) => acc + getRatingValue(r), 0);
    return sum / valid.length;
  };

  const sortedTeachers = useMemo(() => {
    if (sortBy === "rating_desc") {
      return [...teachers].sort((a, b) => {
        const ra = getAvgRatingForTeacher(a.gn02_Email ?? "");
        const rb = getAvgRatingForTeacher(b.gn02_Email ?? "");
        if (ra === null && rb === null) return 0;
        if (ra === null) return 1;
        if (rb === null) return -1;
        return rb - ra;
      });
    }
    if (sortBy === "salary_asc") {
      return [...teachers].sort((a, b) => {
        const sa = getSalaryNumber(a);
        const sb = getSalaryNumber(b);
        if (sa === null && sb === null) return 0;
        if (sa === null) return 1;
        if (sb === null) return -1;
        return sa - sb;
      });
    }
    return teachers;
  }, [teachers, sortBy, ratings]);

  const handleJoinWaitingList = async () => {
    setWaitingListError("");
    setWaitingListLoading(true);
    try {
      const res = await fetch(
        'https://learn-le-connect.base44.app/api/apps/6a37f1517bf59551c5f4b6f9/functions/weekSlotsProxy',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'joinWaitingList',
            studentEmail,
            courseId: subjectId,
            token: authToken,
          }),
        }
      ).then((r) => r.json());
      if (res?.error || res?._status >= 400) {
        setWaitingListError(res?.error || res?.message || "שגיאה בהצטרפות לרשימת המתנה");
      } else {
        const count = res.WaitingListCourseCount ?? res.waitingListCourseCount ?? res.waitingListCourseCount ?? "";
        setWaitingListMsg(`סה"כ יש ${count} שממתינים ברשימה, ברגע שיצורף מורה למקצוע תקבלו הודעה במסרון`);
      }
    } catch (err) {
      setWaitingListError(err.message || "שגיאה בהצטרפות לרשימת המתנה");
    } finally {
      setWaitingListLoading(false);
    }
  };

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <button
          onClick={() => navigate("/choose-lesson")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          חזרה לבחירת שיעור
        </button>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground flex items-center gap-2">
          <Users className="w-7 h-7 text-primary" />
          מורים למקצוע
        </h1>
        {subjectName && (
          <p className="text-muted-foreground font-body">{subjectName}</p>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-destructive text-sm font-body flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {/* Teachers List */}
      {!loading && !error && (
        <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-right text-base font-heading font-semibold text-foreground">
              נמצאו {teachers.length} מורים
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-44 h-9 text-sm">
                    <SelectValue placeholder="מיון" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">ברירת מחדל</SelectItem>
                    <SelectItem value="rating_desc">דירוג: גבוה לנמוך</SelectItem>
                    <SelectItem value="salary_asc">מחיר: נמוך לגבוה</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-sm font-body text-muted-foreground select-none">
                <Checkbox
                  checked={showRatings}
                  onCheckedChange={(checked) => setShowRatings(checked === true)}
                />
                הצג דירוגים
              </label>
            </div>
          </div>
          {teachers.length === 0 ? (
            <div className="px-3 py-8 text-center space-y-4">
              <p className="text-sm text-muted-foreground font-body">לא נמצאו מורים</p>
              {!waitingListMsg && (
                <button
                  onClick={handleJoinWaitingList}
                  disabled={waitingListLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-heading font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {waitingListLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  ברצוני להצטרף לרשימת המתנה למקצוע {subjectName}
                </button>
              )}
              {waitingListError && (
                <p className="text-sm text-destructive font-body">{waitingListError}</p>
              )}
              {waitingListMsg && (
                <p className="text-sm text-primary font-body font-medium leading-relaxed">{waitingListMsg}</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {sortedTeachers.map((t, i) => {
                const name = (t.teacherName ?? "").trim();
                const email = (t.gn02_Email ?? "").trim();
                const presentYourself = (t.gn02_presentYourSelf ?? "").trim();
                const salary = (t.teacher_salary_requirement ?? "").toString().trim();
                const duration = (t.lesson_duration ?? "").toString().trim();
                const teacherRatings = getRatingsForTeacher(email);
                const hasRatings = teacherRatings.length > 0;
                const pictureData = (t.techer_pic ?? "").trim();
                const validRatings = hasRatings
                  ? teacherRatings.filter((r) => Number.isFinite(getRatingValue(r)))
                  : [];
                const ratingsCount = validRatings.length;
                const ratingsSum = validRatings.reduce((sum, r) => sum + getRatingValue(r), 0);
                const avgRating = ratingsCount > 0 ? ratingsSum / ratingsCount : null;

                return (
                  <div
                    key={`${email}-${i}`}
                    className="w-full px-4 py-4 rounded-xl border border-border bg-background space-y-3 relative"
                  >
                    {/* Rating badge - top-left corner */}
                    {avgRating !== null && Number.isFinite(avgRating) && (
                      <div
                        className="absolute top-2 left-2 flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-2.5 py-1"
                        title={`חישוב: סכום ${ratingsSum.toFixed(2)} ÷ ${ratingsCount} דירוגים = ${avgRating.toFixed(2)}`}
                      >
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-heading font-semibold text-foreground">{avgRating.toFixed(2)}</span>
                        <span className="text-xs font-body text-muted-foreground">({ratingsCount})</span>
                      </div>
                    )}

                    {/* Header row: avatar + name */}
                    <div className="flex items-center gap-3">
                      <TeacherAvatar pictureData={pictureData} />
                      <div className="flex-1 text-right">
                        <span className="block font-body text-base font-semibold text-foreground">
                          {name || `מורה ${i + 1}`}
                        </span>
                      </div>
                    </div>

                    {/* Present yourself */}
                    {presentYourself && (
                      <p className="text-sm text-muted-foreground font-body text-right leading-relaxed whitespace-pre-line">
                        {presentYourself}
                      </p>
                    )}

                    {/* Details grid */}
                    <div className="flex flex-col gap-2 pt-1">
                      {salary && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                          <CreditCard className="w-4 h-4 shrink-0 text-primary/70" />
                          <span>{salary.replace(/₪/g, "").trim()} ₪</span>
                        </div>
                      )}
                      {duration && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                          <Clock className="w-4 h-4 shrink-0 text-primary/70" />
                          <span>{duration} דקות</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="pt-1 flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => navigate(`/student-schedule?teacherEmail=${encodeURIComponent(email)}&subjectId=${encodeURIComponent(subjectId)}&subjectName=${encodeURIComponent(subjectName)}&studentEmail=${encodeURIComponent(studentEmail)}`)}
                        className="flex-1"
                        size="sm"
                      >
                        <Calendar className="w-4 h-4 ml-2" />
                        הזמנת שיעור
                      </Button>
                      <Button
                        onClick={() => navigate(`/student-chat?student=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`)}
                        variant="outline"
                        className="flex-1"
                        size="sm"
                      >
                        <MessageCircle className="w-4 h-4 ml-2" />
                        צ'אט
                      </Button>
                    </div>

                    {/* Ratings */}
                    {showRatings && (
                      hasRatings ? (
                        <TeacherRatings ratings={teacherRatings} />
                      ) : (
                        <p className="text-sm text-muted-foreground font-body text-right pt-2 border-t border-border">
                          דירוגים עדיין לא פורסמו
                        </p>
                      )
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}