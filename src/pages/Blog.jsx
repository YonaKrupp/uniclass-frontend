import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Loader2, ArrowLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import BlogShell from "@/components/blog/BlogShell";
import Seo from "@/components/blog/Seo";
import { publishedArticleFilter } from "@/lib/blogDates";

const CANONICAL = "https://www.uniclass.co.il/blog";
const DESCRIPTION = "מאמרים ומדריכים על שיעורים פרטיים, בחירת מורה, למידה לבגרות וללימודים אקדמיים — מבית Uniclass.";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
}

export default function Blog() {
  const [articles, setArticles] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    base44.entities.Article.filter(publishedArticleFilter(), { sort: "-published_at", limit: 50 })
      .then((page) => {
        if (active) setArticles(page?.items ?? []);
      })
      .catch((err) => {
        console.error("[Blog] load error:", err);
        if (active) {
          setArticles([]);
          setError("אירעה שגיאה בטעינת המאמרים. נסו לרענן את העמוד.");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <BlogShell>
      <Seo
        title="בלוג | Uniclass"
        description={DESCRIPTION}
        canonical={CANONICAL}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "הבלוג של Uniclass",
          url: CANONICAL,
        }}
      />

      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-3">בלוג</h1>
        <p className="text-base font-body leading-[1.8] text-muted-foreground max-w-[640px]">
          מדריכים, טיפים ותשובות לשאלות הנפוצות על שיעורים פרטיים, בחירת מורה ולמידה יעילה.
        </p>
      </header>

      {articles === null ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-primary" aria-hidden="true" />
          <span className="sr-only">טוען מאמרים</span>
        </div>
      ) : error ? (
        <p role="alert" className="text-sm font-body text-destructive">{error}</p>
      ) : articles.length === 0 ? (
        <p className="text-sm font-body text-muted-foreground">עדיין אין מאמרים מפורסמים.</p>
      ) : (
        <ul className="space-y-4">
          {articles.map((article) => (
            <li key={article.id}>
              <Link
                to={`/blog/${article.slug}`}
                className="group block bg-card border border-border rounded-2xl p-5 sm:p-6 transition-all hover:border-primary/40 hover:shadow-md hover:shadow-primary/5"
              >
                <h2 className="text-lg sm:text-xl font-heading font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h2>
                {article.meta_description && (
                  <p className="text-sm sm:text-base font-body leading-[1.8] text-muted-foreground mb-3">
                    {article.meta_description}
                  </p>
                )}
                <div className="flex items-center justify-between gap-3">
                  {article.published_at && (
                    <span className="inline-flex items-center gap-2 text-xs sm:text-sm font-body text-muted-foreground">
                      <CalendarDays className="w-4 h-4" aria-hidden="true" />
                      {formatDate(article.published_at)}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-sm font-body font-medium text-primary">
                    לקריאה
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </BlogShell>
  );
}