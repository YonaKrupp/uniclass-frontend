import React from "react";
import { HelpCircle } from "lucide-react";
import { useTutorial } from "./TutorialContext";

/** כפתור "?" להפעלה מחדש של ההדרכה בכל זמן. */
export default function TutorialHelpButton({ withLabel = false, className = "" }) {
  const { start } = useTutorial();

  if (withLabel) {
    return (
      <button
        type="button"
        onClick={start}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted/60 transition-colors w-full min-h-[48px] ${className}`}
      >
        <HelpCircle className="w-4 h-4" aria-hidden="true" />
        הדרכה
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={start}
      aria-label="הפעלת הדרכה"
      title="הדרכה"
      className={`p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors ${className}`}
    >
      <HelpCircle className="w-4 h-4" aria-hidden="true" />
    </button>
  );
}