import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ArticleForm from "@/components/blog/ArticleForm";
import Seo from "@/components/blog/Seo";

const ADMIN_EMAIL = "idanmichaly@gmail.com";

function getStoredEmail() {
  try {
    const raw = localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}";
    const data = JSON.parse(raw);
    return String(data.teacherEmail || data.email || "").toLowerCase();
  } catch {
    return "";
  }
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
}

export default function AdminBlog() {
  const [isAdmin, setIsAdmin] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(undefined); // undefined = closed, null = new, object = edit

  useEffect(() => {
    setIsAdmin(getStoredEmail() === ADMIN_EMAIL);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const page = await base44.entities.Article.filter({}, { sort: "-created_date", limit: 100 });
      setArticles(page?.items ?? []);
    } catch (err) {
      console.error("[AdminBlog] load error:", err);
      setError("אירעה שגיאה בטעינת המאמרים.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const handleDelete = async (article) => {
    if (!window.confirm(`למחוק את המאמר "${article.title}"?`)) return;
    try {
      await base44.entities.Article.delete(article.id);
      await load();
    } catch (err) {
      console.error("[AdminBlog] delete error:", err);
      setError("מחיקת המאמר נכשלה.");
    }
  };

  const handleSaved = async () => {
    setEditing(undefined);
    await load();
  };

  if (isAdmin === null) {
    return (
      <div dir="rtl" className="landing min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" aria-hidden="true" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div dir="rtl" className="landing min-h-screen bg-background flex items-center justify-center p-6">
        <Seo title="אין הרשאה | Uniclass" noindex />
        <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-heading font-bold text-foreground mb-3">אין הרשאה</h1>
          <p className="text-sm font-body text-muted-foreground mb-6">
            העמוד הזה זמין למנהלי המערכת בלבד.
          </p>
          <Link to="/" className="text-sm font-body font-medium text-primary hover:underline">
            חזרה לדף הראשי
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="landing min-h-screen bg-background">
      <Seo title="ניהול בלוג | Uniclass" noindex />
      <div className="max-w-[820px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-body font-medium text-primary hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          חזרה לדף הראשי
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">ניהול בלוג</h1>
          <button
            onClick={() => setEditing(null)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-heading font-semibold shadow-sm hover:shadow-md hover:shadow-primary/20 transition-all"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            מאמר חדש
          </button>
        </div>

        {error && (
          <div role="alert" className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-sm font-body text-destructive mb-6">
            {error}
          </div>
        )}

        {editing !== undefined && (
          <div className="mb-8">
            <ArticleForm article={editing} onSaved={handleSaved} onCancel={() => setEditing(undefined)} />
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" aria-hidden="true" />
          </div>
        ) : articles.length === 0 ? (
          <p className="text-sm font-body text-muted-foreground">עדיין אין מאמרים.</p>
        ) : (
          <ul className="space-y-3">
            {articles.map((article) => (
              <li
                key={article.id}
                className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex flex-wrap items-center gap-3 justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h2 className="text-base font-heading font-semibold text-foreground break-words">
                      {article.title}
                    </h2>
                    <span
                      className={`text-xs font-body px-2 py-0.5 rounded-full ${
                        article.status === "published"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {article.status === "published" ? "מפורסם" : "טיוטה"}
                    </span>
                  </div>
                  <p className="text-xs font-body text-muted-foreground" dir="ltr">
                    /blog/{article.slug}
                  </p>
                  <p className="text-xs font-body text-muted-foreground">
                    תאריך פרסום: {formatDate(article.published_at)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/blog/${article.slug}`}
                    className="px-3 py-2 rounded-lg text-xs font-body text-muted-foreground hover:bg-muted transition-colors"
                  >
                    צפייה
                  </Link>
                  <button
                    onClick={() => setEditing(article)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-heading font-medium hover:bg-primary/20 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                    עריכה
                  </button>
                  <button
                    onClick={() => handleDelete(article)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-heading font-medium text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    מחיקה
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}