import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import BlogShell from "@/components/blog/BlogShell";
import MarkdownContent from "@/components/blog/MarkdownContent";
import Seo from "@/components/blog/Seo";
import { publishedArticleFilter } from "@/lib/blogDates";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
}

function NotFound() {
  return (
    <>
      <Seo title="המאמר לא נמצא | Uniclass" noindex />
      <div className="text-center py-10">
        <p className="text-6xl font-heading font-bold text-primary/20 mb-4">404</p>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-3">המאמר לא נמצא</h1>
        <p className="text-base font-body text-muted-foreground mb-8">
          ייתכן שהקישור שגוי, או שהמאמר הוסר מהאתר.
        </p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-heading font-semibold shadow-sm hover:shadow-md hover:shadow-primary/20 transition-all"
        >
          לכל המאמרים בבלוג
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </>
  );
}

export default function BlogPost() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setArticle(null);
    base44.entities.Article.filter(publishedArticleFilter({ slug }), { limit: 1 })
      .then((page) => {
        if (!active) return;
        setArticle((page?.items ?? [])[0] ?? null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("[BlogPost] load error:", err);
        if (active) {
          setArticle(null);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <BlogShell width="max-w-[780px]">
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin text-primary" aria-hidden="true" />
          <span className="sr-only">טוען מאמר</span>
        </div>
      </BlogShell>
    );
  }

  if (!article) {
    return (
      <BlogShell width="max-w-[780px]">
        <NotFound />
      </BlogShell>
    );
  }

  const canonical = `https://www.uniclass.co.il/blog/${article.slug}`;
  const seoTitle = article.seo_title || article.title;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.meta_description || "",
    datePublished: article.published_at || undefined,
    author: { "@type": "Organization", name: "Uniclass" },
    mainEntityOfPage: canonical,
    ...(article.cover_image ? { image: [article.cover_image] } : {}),
  };

  return (
    <BlogShell width="max-w-[780px]">
      <Seo
        title={seoTitle}
        description={article.meta_description}
        canonical={canonical}
        image={article.cover_image || undefined}
        ogType="article"
        jsonLd={jsonLd}
      />

      <article>
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">{article.title}</h1>
        {article.published_at && (
          <p className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground mb-8">
            <CalendarDays className="w-4 h-4" aria-hidden="true" />
            {formatDate(article.published_at)}
          </p>
        )}

        {article.cover_image && (
          <img
            src={article.cover_image}
            alt={article.cover_image_alt || article.title || ""}
            className="w-full rounded-2xl border border-border mb-8"
          />
        )}

        <div className="max-w-[720px] mx-auto">
          <MarkdownContent content={article.content} />
        </div>

        <div className="max-w-[720px] mx-auto mt-12 pt-8 border-t border-border">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-primary text-primary-foreground text-base font-heading font-semibold shadow-sm hover:shadow-md hover:shadow-primary/20 hover:-translate-y-0.5 transition-all"
          >
            מצאו את המורה המתאים לכם
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>
      </article>
    </BlogShell>
  );
}