import React, { useState } from "react";
import { ChevronRight, ChevronLeft, Star } from "lucide-react";

export default function TeacherRatings({ ratings }) {
  const [index, setIndex] = useState(0);
  if (!ratings || ratings.length === 0) return null;

  const r = ratings[index];
  const desc = (r.rating_description ?? r.Rating_description ?? "").trim();
  const subj = (r.subjectName ?? "").trim();
  const ratingValue = r.Rating ?? r.rating ?? r.gn10_rating ?? r.gn10_Rating ?? r.score;
  const hasRating = ratingValue !== undefined && ratingValue !== null && ratingValue !== "";

  const goPrev = () => setIndex((i) => (i === 0 ? ratings.length - 1 : i - 1));
  const goNext = () => setIndex((i) => (i === ratings.length - 1 ? 0 : i + 1));
  const hasMultiple = ratings.length > 1;

  return (
    <div className="space-y-2 pt-2 border-t border-border">
      <h3 className="text-sm font-heading font-semibold text-foreground text-right">דירוגים</h3>
      <div className="flex items-center gap-2">
        {hasMultiple && (
          <button
            type="button"
            onClick={goPrev}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
        <div className="flex-1 flex flex-col gap-1 px-3 py-2 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between gap-2">
            {subj && (
              <span className="text-xs font-body text-muted-foreground">{subj}</span>
            )}
            {hasRating && (
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`w-4 h-4 ${
                      n <= Math.round(Number(ratingValue))
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-muted-foreground/30 fill-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          {desc && (
            <p className="text-sm text-foreground font-body text-right whitespace-pre-line">{desc}</p>
          )}
        </div>
        {hasMultiple && (
          <button
            type="button"
            onClick={goNext}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>
      {hasMultiple && (
        <p className="text-xs text-muted-foreground text-center font-body">
          {index + 1} / {ratings.length}
        </p>
      )}
    </div>
  );
}