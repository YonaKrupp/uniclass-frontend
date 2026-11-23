import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import SkipConfirmDialog from "./SkipConfirmDialog";
import AboutStep from "./wizard/AboutStep";
import PriceStep from "./wizard/PriceStep";
import PictureStep from "./wizard/PictureStep";
import SubjectsStep from "./wizard/SubjectsStep";
import { todayDateString } from "@/lib/teacherOnboarding";

const STEPS = [
  { key: "about", title: "אודות", hint: "משפט או שניים עליך — זה מה שהתלמידים קוראים קודם." },
  { key: "price", title: "מחיר לשיעור", hint: "בחרו כמה תקבלו על כל שיעור." },
  { key: "picture", title: "תמונת פרופיל", hint: "תמונה ברורה מעלה את הסיכוי לפנייה." },
  { key: "subjects", title: "רשימת מקצועות", hint: "בלי מקצועות תלמידים לא ימצאו אתכם — הוסיפו לפחות מקצוע אחד." },
];

const failIfError = (response) => {
  const data = response?.data || {};
  if (data._status === 401) throw new Error("פג תוקף החיבור. התנתקו והתחברו מחדש.");
  if (data.error) throw new Error(data.error);
};

export default function ProfileWizard({ email, token, record, onStepChange, onDone, onSkip }) {
  const [index, setIndex] = useState(Math.min(Math.max(record.profileStep || 0, 0), STEPS.length - 1));
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [about, setAbout] = useState("");
  const [price, setPrice] = useState(100);
  const [picturePreview, setPicturePreview] = useState("");
  const [pictureBase64, setPictureBase64] = useState("");
  const [mySubjects, setMySubjects] = useState([]);
  const [freeSubjects, setFreeSubjects] = useState([]);
  const [savingSubject, setSavingSubject] = useState(false);
  const [subjectError, setSubjectError] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [askSkip, setAskSkip] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await base44.functions.invoke("teacherProfileProxy", {
          email,
          token,
          todayDate: todayDateString(),
        });
        const data = res.data || {};
        if (!alive) return;
        const details = data.details || data.Details || {};
        setAbout(String(details.gn02_presentYourSelf || ""));
        const fetchedPrice = parseInt(details.gn02_hourlyPayment ?? data.gn02_hourlyPayment, 10);
        if (!isNaN(fetchedPrice)) {
          setPrice(Math.max(80, Math.min(150, Math.round(fetchedPrice / 10) * 10)));
        }
        const picture = data.profilePicture || data.ProfilePicture || details.profilePicture || "";
        if (picture) setPicturePreview(picture.startsWith("data:") ? picture : `data:image/jpeg;base64,${picture}`);
        const ownSubjects = data.subjects || data.Subjects || [];
        setMySubjects(ownSubjects);
        const ownSubjectIds = ownSubjects.map((item) => String(item?.gn05_subject_id ?? "")).filter(Boolean);
        setFreeSubjects(
          (data.subjectsFreeAll || data.SubjectsFreeAll || []).filter(
            (item) => !ownSubjectIds.includes(String(item?.gn03_id ?? ""))
          )
        );
      } catch {
        // Profile prefill is best-effort — the wizard stays usable and saves surface their own errors.
      } finally {
        if (alive) setLoadingProfile(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") setAskSkip(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const step = STEPS[index];
  const canAdvance = step.key === "about" ? about.trim().length >= 10 : true;

  const saveCurrentStep = async () => {
    if (step.key === "about") {
      const res = await base44.functions.invoke("teacherProfileProxy", {
        action: "updateAbout",
        description: about,
        email,
        todayDate: todayDateString(),
        token,
      });
      failIfError(res);
    }
    if (step.key === "price") {
      const res = await base44.functions.invoke("teacherProfileProxy", {
        action: "updateHourlyPayment",
        hourlyPayment: price,
        email,
        todayDate: todayDateString(),
        token,
      });
      failIfError(res);
    }
    if (step.key === "picture" && pictureBase64) {
      const res = await base44.functions.invoke("teacherPictureProxy", {
        action: "upload",
        email,
        token,
        pictureData: pictureBase64,
      });
      failIfError(res);
      setPictureBase64("");
    }
  };

  const handleNext = async () => {
    if (!canAdvance || saving) return;
    setError("");
    setSaving(true);
    try {
      await saveCurrentStep();
      if (index + 1 >= STEPS.length) {
        onDone();
        return;
      }
      setIndex(index + 1);
      onStepChange(index + 1);
    } catch (err) {
      setError(err.message || "שמירה נכשלה. נסו שוב.");
    } finally {
      setSaving(false);
    }
  };

  const handlePrev = () => {
    if (index === 0) return;
    setError("");
    setIndex(index - 1);
    onStepChange(index - 1);
  };

  const handleAddSubject = async (subject) => {
    if (!subject || savingSubject) return;
    setSubjectError("");
    setSavingSubject(true);
    try {
      const res = await base44.functions.invoke("teacherProfileProxy", {
        action: "insertNewTeacherSubject",
        teacherEmail: email,
        subject: subject.gn03_id,
        token,
      });
      failIfError(res);
      setMySubjects((prev) => [...prev, subject]);
      setFreeSubjects((prev) => prev.filter((item) => String(item?.gn03_id) !== String(subject.gn03_id)));
      // מאפס את בדיקת המקצועות של דף הבית כדי שהבאנר ייעלם מיד
      try { localStorage.removeItem(`_teacherSubjects_${email}`); } catch { /* ignore */ }
    } catch (err) {
      setSubjectError(err.message || "הוספת המקצוע נכשלה. נסו שוב.");
    } finally {
      setSavingSubject(false);
    }
  };

  const stepContent = {
    about: <AboutStep value={about} onChange={setAbout} />,
    price: <PriceStep value={price} onChange={setPrice} />,
    picture: (
      <PictureStep
        preview={picturePreview}
        onChange={({ preview, base64 }) => {
          setPicturePreview(preview);
          setPictureBase64(base64);
        }}
      />
    ),
    subjects: (
      <SubjectsStep
        subjects={mySubjects}
        freeSubjects={freeSubjects}
        onAdd={handleAddSubject}
        saving={savingSubject}
        error={subjectError}
      />
    ),
  }[step.key];

  return (
    <div
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-wizard-title"
      className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
    >
      <div className="w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto bg-card border border-border rounded-t-3xl sm:rounded-2xl shadow-2xl app-fade-up">
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur px-5 pt-4 pb-3 border-b border-border space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-[11px] font-heading font-semibold text-muted-foreground">
                מילוי פרופיל · שלב {index + 1} מתוך {STEPS.length}
              </p>
              <h2 id="onboarding-wizard-title" className="text-lg font-heading font-bold text-foreground">
                {step.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setAskSkip(true)}
              className="shrink-0 text-xs font-body text-muted-foreground hover:text-foreground underline underline-offset-4 px-2 py-1 rounded-md"
            >
              דלג
            </button>
          </div>
          <p className="text-xs font-body text-muted-foreground">{step.hint}</p>
        </div>

        <div className="px-5 py-4">
          {loadingProfile ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            stepContent
          )}

          {error && (
            <p className="mt-3 text-xs font-body text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <div className="px-5 pb-5 space-y-3">
          <div className="flex items-center justify-center gap-1.5" aria-hidden="true">
            {STEPS.map((item, i) => (
              <span
                key={item.key}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-primary" : i < index ? "w-1.5 bg-primary/40" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={index === 0 || saving}
              className="inline-flex items-center justify-center gap-1.5 min-h-[48px] px-4 rounded-xl bg-muted text-foreground text-sm font-heading font-semibold hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-4 h-4" />
              הקודם
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!canAdvance || saving}
              className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-[48px] px-4 rounded-xl bg-primary text-primary-foreground text-sm font-heading font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {index + 1 >= STEPS.length ? "סיום והמשך לסיור" : "הבא"}
              {index + 1 < STEPS.length && <ArrowLeft className="w-4 h-4" />}
            </button>
          </div>

          {!canAdvance && (
            <p className="text-center text-[11px] font-body text-muted-foreground">
              כתבו לפחות משפט קצר (10 תווים) כדי להמשיך.
            </p>
          )}
        </div>
      </div>

      {askSkip && <SkipConfirmDialog onCancel={() => setAskSkip(false)} onConfirm={onSkip} />}
    </div>
  );
}