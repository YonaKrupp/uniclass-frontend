import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import SubjectsRequiredGuide from "@/components/teacher/SubjectsRequiredGuide";

/**
 * Banner for the teacher home page, shown only while the teacher has no subjects.
 * Emphasised version of the profile-page guide; the CTA opens the subject list
 * on the profile page.
 */
export default function HomeSubjectsBanner() {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border-2 border-primary/60 bg-gradient-to-bl from-primary/10 via-primary/5 to-transparent p-5 shadow-lg shadow-primary/10 space-y-4">
      <div className="flex items-start gap-3">
        <span className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-md shadow-primary/30">
          <BookOpen className="w-5 h-5" aria-hidden="true" />
        </span>
        <div className="space-y-1">
          <h2 className="text-base sm:text-lg font-heading font-bold text-foreground">בחירת מקצועות לימוד</h2>
          <p className="text-xs sm:text-sm font-body text-muted-foreground">
            זה השלב הראשון — בלי מקצוע לא ניתן להתחיל ללמד או לקבל פניות מתלמידים.
          </p>
        </div>
      </div>

      <SubjectsRequiredGuide bare open={false} onShow={() => navigate("/teacher-profile?subjects=1")} />
    </div>
  );
}