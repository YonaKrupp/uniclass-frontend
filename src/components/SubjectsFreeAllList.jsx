import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search, X, Plus, Loader2 } from "lucide-react";

export default function SubjectsFreeAllList({ items, onSelect, saving }) {
  const [query, setQuery] = useState("");
  const prevSaving = useRef(saving);

  // Clear search after saving completes (not synchronously, to avoid iOS click cancellation)
  useEffect(() => {
    if (prevSaving.current && !saving) {
      setQuery("");
    }
    prevSaving.current = saving;
  }, [saving]);

  const normalizeForSearch = (str) => (str ?? "")
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060\uFEFF\u00A0]/g, " ")
    .toLowerCase()
    .trim();

  const options = useMemo(() => {
    const seen = new Set();
    return (items || [])
      .map((s) => {
        const name = (s.gn03_subjectName ?? "").replace(/\u00a0/g, " ").trim();
        const level = (s.gn04_levelName ?? "").replace(/\u00a0/g, " ").trim();
        const label = level ? `${name} - ${level}` : name;
        return { ...s, _label: label };
      })
      .filter((s) => {
        if (seen.has(s._label)) return false;
        seen.add(s._label);
        return true;
      });
  }, [items]);

  const filtered = useMemo(() => {
    const q = normalizeForSearch(query);
    if (!q) return options;
    const words = q.split(/\s+/).filter(Boolean);
    return options.filter((s) => {
      const label = normalizeForSearch(s._label);
      return words.every((w) => label.includes(w));
    });
  }, [options, query]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          dir="rtl"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חיפוש מקצוע..."
          className="w-full text-right rounded-lg border border-border bg-background pr-10 pl-10 py-2 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[44px]"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-4 h-4 pointer-events-none" />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="px-3 py-4 text-center text-sm text-muted-foreground font-body">לא נמצאו תוצאות</div>
      ) : (
        <ul className="space-y-1 max-h-80 overflow-y-auto">
          {filtered.slice(0, 50).map((s, i) => (
            <li key={`${s.gn03_id ?? ""}-${i}`} className="text-sm font-body text-foreground flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors">
              <span className="flex items-center gap-2 flex-1">
                <span className="text-primary">•</span>
                {s._label}
              </span>
              <button
                type="button"
                onClick={() => onSelect?.(s)}
                disabled={saving}
                className="flex items-center gap-1 px-3 py-2 bg-primary/10 text-primary rounded-lg text-xs font-heading font-medium hover:bg-primary/20 transition-colors disabled:opacity-60 min-h-[44px] min-w-[44px] cursor-pointer"
                title="הוספת מקצוע"
              >
                {saving
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin pointer-events-none" />
                  : <Plus className="w-3.5 h-3.5 pointer-events-none" />}
                <span className="pointer-events-none">הוסף</span>
              </button>
            </li>
          ))}
          {filtered.length > 50 && (
            <li className="px-3 py-2 text-center text-xs text-muted-foreground font-body">
              מציג 50 מתוך {filtered.length} — המשיכו להקליד לסינון
            </li>
          )}
        </ul>
      )}
    </div>
  );
}