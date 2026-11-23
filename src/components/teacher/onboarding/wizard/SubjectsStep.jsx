import React from "react";
import { Check } from "lucide-react";
import SubjectsFreeAllList from "@/components/SubjectsFreeAllList";

export default function SubjectsStep({ subjects, freeSubjects, onAdd, saving, error }) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-body text-muted-foreground">
        בלי מקצועות תלמידים לא ימצאו אתכם בחיפוש. הוסיפו לפחות מקצוע אחד — אפשר להוסיף עוד בכל רגע דרך פרופיל המורה.
      </p>

      {subjects.length > 0 && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-1.5">
          <p className="text-xs font-heading font-semibold text-primary">
            המקצועות שלך ({subjects.length})
          </p>
          <ul className="space-y-1">
            {subjects.map((subject, i) => (
              <li
                key={`${subject.gn05_subject_id ?? i}`}
                className="flex items-start gap-1.5 text-sm font-body text-foreground"
              >
                <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <span className="break-words">
                  {[subject.gn03_subjectName, subject.gn04_levelName].filter(Boolean).join(" - ")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <SubjectsFreeAllList items={freeSubjects} onSelect={onAdd} saving={saving} />

      {error && (
        <p className="text-xs font-body text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}