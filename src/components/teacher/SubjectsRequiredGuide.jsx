import React from "react";
import { BookOpen, ChevronLeft, CheckCircle2 } from "lucide-react";

const STEPS = [
  "לחצו על הכפתור ופתחו את רשימת המקצועות הזמינים.",
  "בחרו מקצוע ורמת לימוד ולחצו להוספה.",
  "המקצוע יופיע ברשימה, וזה מה שתלמידים יראו ויוכלו להזמין.",
];

export default function SubjectsRequiredGuide({ open, onShow }) {
  return (
    <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-4 space-y-3">
      <div className="flex items-start gap-2">
        <BookOpen className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-sm font-heading font-bold text-foreground">
            אין עדיין מקצועות — בלי מקצוע לא ניתן להתחיל ללמד
          </p>
          <p className="text-xs font-body text-muted-foreground">
            הוסיפו לפחות מקצוע לימוד אחד כדי שתלמידים יוכלו למצוא אתכם ולהזמין שיעור.
          </p>
        </div>
      </div>

      <ol className="space-y-2">
        {STEPS.map((step, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-heading font-bold flex items-center justify-center shrink-0">
              {i + 1}
            </span>
            <span className="text-sm font-body text-foreground leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>

      {!open ? (
        <button
          type="button"
          onClick={onShow}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-heading font-semibold shadow-md shadow-primary/25 hover:bg-primary/90 transition-colors min-h-[44px] cursor-pointer"
        >
          בחרו מקצוע להוספה
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </button>
      ) : (
        <p className="flex items-center gap-1.5 text-xs font-body text-primary">
          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
          הרשימה פתוחה למטה — בחרו מקצוע כדי להוסיף אותו
        </p>
      )}
    </div>
  );
}