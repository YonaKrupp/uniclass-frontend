import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Save, Star, User } from "lucide-react";
import { base44 } from "@/api/base44Client";
import StarRating from "@/components/StarRating";
import toast from "react-hot-toast";

// Deep recursive case-insensitive field lookup — searches all nested objects and arrays
function findRatingField(data, names) {
  if (data == null) return null;
  const lower = names.map(n => n.toLowerCase());
  const search = (o) => {
    if (o == null || typeof o !== 'object') return null;
    if (Array.isArray(o)) {
      for (const item of o) {
        const found = search(item);
        if (found != null) return found;
      }
      return null;
    }
    for (const k of Object.keys(o)) {
      const kl = k.toLowerCase();
      if (lower.includes(kl) && o[k] != null && o[k] !== '') return o[k];
    }
    for (const k of Object.keys(o)) {
      if (typeof o[k] === 'object' && o[k] !== null) {
        const found = search(o[k]);
        if (found != null) return found;
      }
    }
    return null;
  };
  return search(data);
}

export default function RateTeacher() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const teacherEmail = searchParams.get("teacherEmail") || "";
  const teacherName = searchParams.get("teacherName") || "";
  const subjectName = searchParams.get("subjectName") || "";
  const levelName = searchParams.get("levelName") || "";
  const subjectId = searchParams.get("subjectId") || "";

  const subjectDisplay = levelName ? `${subjectName} - ${levelName}` : subjectName;

  const userData = JSON.parse(localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}");
  const authToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken") || "";
  const studentEmail = userData.studentEmail || userData.email || "";

  const now = new Date();
  const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [existingRating, setExistingRating] = useState(null);
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!teacherEmail || !studentEmail || !subjectId) {
      setError("חסרים פרטים לדירוג");
      setLoading(false);
      return;
    }
    const fetchRating = async () => {
      setLoading(true);
      try {
        const res = await base44.functions.invoke("teacherProfileProxy", {
          action: "getRating",
          teacherEmail,
          studentEmail,
          subject: Number(subjectId),
          todayDate,
          token: authToken,
        });
        const data = res.data || {};
        console.log("[RateTeacher] getRating response:", data);
        if (data._status === 401) {
          setError("פג תוקף החיבור. התנתקו והתחברו מחדש.");
          return;
        }
        if (data.error) {
          setError(data.error);
          return;
        }
        const ratingValue = findRatingField(data, ['p_gn10_rating', 'gn10_rating', 'rating', 'score']);
        const descValue = findRatingField(data, ['p_gn10_rating_description', 'gn10_rating_description', 'ratingDescription', 'rating_description', 'description']);
        if (ratingValue != null && Number(ratingValue) > 0) {
          setExistingRating({ rating: Number(ratingValue), description: String(descValue ?? "") });
        }
      } catch (err) {
        setError("שגיאה בטעינת הדירוג: " + (err.message || ""));
      } finally {
        setLoading(false);
      }
    };
    fetchRating();
  }, []);

  const handleSave = async () => {
    if (rating === 0) {
      toast.error("נא לבחור דירוג");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await base44.functions.invoke("teacherProfileProxy", {
        action: "setRating",
        teacherEmail,
        studentEmail,
        subject: Number(subjectId),
        rating,
        description,
        todayDate,
        token: authToken,
      });
      const data = res.data || {};
      console.log("[RateTeacher] setRating response:", data);
      if (data._status === 401) {
        setError("פג תוקף החיבור. התנתקו והתחברו מחדש.");
        return;
      }
      if (data.error) {
        setError(data.error);
        return;
      }
      toast.success("הדירוג נשמר בהצלחה");
      setExistingRating({ rating, description });
    } catch (err) {
      setError("שגיאה בשמירת הדירוג: " + (err.message || ""));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <button
          onClick={() => navigate("/student-teachers")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          חזרה לרשימת מורים
        </button>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground flex items-center gap-2">
          <Star className="w-7 h-7 text-primary" />
          דירוג מורה
        </h1>
      </div>

      {/* Teacher info */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-2">
        <div className="flex items-center gap-2 text-sm font-body text-foreground">
          <User className="w-4 h-4 text-primary/70" />
          <span className="font-semibold">מורה:</span>
          <span>{teacherName || "—"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-body text-foreground">
          <Star className="w-4 h-4 text-primary/70" />
          <span className="font-semibold">מקצוע:</span>
          <span>{subjectDisplay || "—"}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-sm font-body">{error}</div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Existing rating */}
      {!loading && !error && existingRating && (
        <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
          <h2 className="text-base font-heading font-semibold text-foreground">הדירוג שלך</h2>
          <div className="flex justify-center py-2">
            <StarRating value={existingRating.rating} readOnly size={40} />
          </div>
          {existingRating.description && (
            <p className="text-sm font-body text-foreground whitespace-pre-wrap bg-muted/40 rounded-xl p-3">
              {existingRating.description}
            </p>
          )}
        </div>
      )}

      {/* Rating form */}
      {!loading && !error && !existingRating && (
        <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
          <h2 className="text-base font-heading font-semibold text-foreground">דרגו את המורה</h2>
          <div className="flex flex-col items-center gap-2 py-4">
            <StarRating value={rating} onChange={setRating} size={48} />
            <span className="text-sm text-muted-foreground font-body">
              {rating > 0 ? `${rating} מתוך 5 כוכבים` : "בחרו דירוג"}
            </span>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-heading font-semibold text-foreground">תיאור (אופציונלי)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-body text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="ספרו על החוויה שלכם עם המורה..."
            />
          </div>
          <button
            onClick={handleSave}
            disabled={saving || rating === 0}
            className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-heading font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 min-h-[48px]"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            שמירת דירוג
          </button>
        </div>
      )}
    </div>
  );
}