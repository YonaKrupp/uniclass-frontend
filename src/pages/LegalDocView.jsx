import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import MarkdownContent from "@/components/blog/MarkdownContent";
import PageLogo from "@/components/PageLogo";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}.${m}.${date.getFullYear()}`;
}

/**
 * עמוד ציבורי לכל מסמך משפטי, לפי ה-slug בנתיב.
 * מציג רק מסמך מפורסם עם תוכן; אחרת "המסמך יפורסם בקרוב".
 */
export default function LegalDocView() {
  const location = useLocation();
  const navigate = useNavigate();
  const slug = location.pathname.replace(/^\/+|\/+$/g, "");

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    base44.entities.LegalDocument
      .filter({ slug }, { limit: 1 })
      .then((page) => {
        if (alive) setDoc((page?.items || [])[0] || null);
      })
      .catch((err) => {
        console.error("[legal] failed to load document:", err);
        if (alive) setDoc(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  // מסמכים ארוכים נשמרים בשני שדות (גוף + המשך) בגלל מגבלת אורך השדה
  const content = [doc?.body, doc?.body_continuation].filter(Boolean).join("\n\n");
  const hasContent = Boolean(doc && doc.is_published && content.trim());

  return (
    <div dir="rtl" className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-heading font-medium text-foreground transition-colors hover:bg-muted min-h-[44px]"
        >
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
          חזרה
        </button>

        <PageLogo />

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="טוען מסמך" />
          </div>
        ) : (
          <article className="mx-auto mt-6 max-w-2xl">
            <header className="mb-8 space-y-2 border-b border-border pb-5">
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground leading-snug">
                {hasContent ? doc.title : "המסמך יפורסם בקרוב"}
              </h1>
              {hasContent && (
                <p className="text-sm font-body text-muted-foreground">
                  {doc.version ? `גרסה ${doc.version}` : ""}
                  {doc.version && doc.effective_date ? " · " : ""}
                  {doc.effective_date ? `בתוקף מתאריך ${formatDate(doc.effective_date)}` : ""}
                </p>
              )}
            </header>

            {hasContent && <MarkdownContent content={content} />}
          </article>
        )}
      </div>
    </div>
  );
}