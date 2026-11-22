import React from "react";
import { School, GraduationCap, BookOpen } from "lucide-react";

const CATEGORIES = [
  { value: "school", label: "בית ספר", icon: School },
  { value: "university", label: "אוניברסיטה", icon: GraduationCap },
  { value: "openUniversity", label: "אוניברסיטה פתוחה", icon: BookOpen },
];

export default function SubjectCategoryTabs({ value, onChange, counts }) {
  return (
    <div role="tablist" aria-label="סוג המקצועות" className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
      {CATEGORIES.map(({ value: categoryValue, label, icon: Icon }) => {
        const isActive = value === categoryValue;
        return (
          <button
            key={categoryValue}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(categoryValue)}
            className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs sm:text-sm font-heading font-medium transition-colors min-h-[44px] ${
              isActive
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{label}</span>
            {typeof counts?.[categoryValue] === "number" && (
              <span className="text-xs text-muted-foreground">({counts[categoryValue]})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}