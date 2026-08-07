import React, { useState } from "react";
import { Star } from "lucide-react";

export default function StarRating({ value = 0, onChange, readOnly = false, size = 32 }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className="flex items-center gap-1" dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange?.(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          className={`transition-transform ${readOnly ? "cursor-default" : "cursor-pointer"} min-w-[44px] min-h-[44px] flex items-center justify-center`}
        >
          <Star
            className={star <= display ? "text-amber-400" : "text-muted-foreground/30"}
            style={{
              width: size,
              height: size,
              fill: star <= display ? "#fbbf24" : "transparent",
            }}
          />
        </button>
      ))}
    </div>
  );
}