import React, { useState } from "react";
import { Loader2, Save, X } from "lucide-react";
import { base44 } from "@/api/base44Client";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const today = () => new Date().toISOString().slice(0, 10);

const emptyArticle = () => ({
  title: "",
  slug: "",
  content: "",
  seo_title: "",
  meta_description: "",
  cover_image: "",
  cover_image_alt: "",
  published_at: today(),
  status: "draft",
});

const inputClass =
  "w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm font-body outline-none focus:bg-card focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all";

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-heading font-semibold text-foreground">{label}</label>
      {children}
      {hint && <p className="text-xs font-body text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function ArticleForm({ article, onSaved, onCancel }) {
  const [form, setForm] = useState(() => (article ? { ...emptyArticle(), ...article } : emptyArticle()));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const slug = form.slug.trim();
    if (!form.title.trim() || !slug) {
      setError("יש למלא כותרת וכתובת (slug)");
      return;
    }
    if (!SLUG_RE.test(slug)) {
      setError("הכתובת (slug) יכולה להכיל אותיות לועזיות קטנות, ספרות ומקפים בלבד");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const existing = await base44.entities.Article.filter({ slug }, { limit: 5 });
      if ((existing?.items || []).some((a) => a.id !== article?.id)) {
        setError("הכתובת הזו כבר בשימוש במאמר אחר");
        setSaving(false);
        return;
      }
      const payload = {
        title: form.title.trim(),
        slug,
        content: form.content,
        seo_title: form.seo_title,
        meta_description: form.meta_description,
        cover_image: form.cover_image,
        cover_image_alt: form.cover_image_alt,
        published_at: form.published_at,
        status: form.status,
      };
      if (article?.id) {
        await base44.entities.Article.update(article.id, payload);
      } else {
        await base44.entities.Article.create(payload);
      }
      onSaved();
    } catch (err) {
      console.error("[ArticleForm] save error:", err);
      setError("שמירת המאמר נכשלה. נסו שוב.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-heading font-bold text-foreground">
          {article?.id ? "עריכת מאמר" : "מאמר חדש"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          aria-label="סגירה"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <Field label="כותרת">
        <input className={inputClass} value={form.title} onChange={update("title")} />
      </Field>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="כתובת (slug)" hint="אותיות לועזיות קטנות ומקפים, לדוגמה: how-to-choose-private-tutor">
          <input className={inputClass} dir="ltr" value={form.slug} onChange={update("slug")} />
        </Field>
        <Field label="תאריך פרסום">
          <input type="date" className={inputClass} value={form.published_at || ""} onChange={update("published_at")} />
        </Field>
      </div>

      <Field label="תוכן (Markdown)">
        <textarea rows={16} className={`${inputClass} resize-y font-mono text-xs leading-6`} value={form.content} onChange={update("content")} />
      </Field>

      <Field label="כותרת SEO" hint="אם ריק, תשמש הכותרת הרגילה">
        <input className={inputClass} value={form.seo_title} onChange={update("seo_title")} />
      </Field>

      <Field label="תיאור Meta">
        <textarea rows={3} className={`${inputClass} resize-y`} value={form.meta_description} onChange={update("meta_description")} />
      </Field>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="כתובת תמונת כיסוי (אופציונלי)">
          <input className={inputClass} dir="ltr" value={form.cover_image} onChange={update("cover_image")} />
        </Field>
        <Field label="טקסט חלופי לתמונה (אופציונלי)">
          <input className={inputClass} value={form.cover_image_alt} onChange={update("cover_image_alt")} />
        </Field>
      </div>

      <Field label="סטטוס">
        <select className={inputClass} value={form.status} onChange={update("status")}>
          <option value="draft">טיוטה</option>
          <option value="published">מפורסם</option>
        </select>
      </Field>

      {error && (
        <div role="alert" className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-sm font-body text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-heading font-semibold shadow-sm hover:shadow-md hover:shadow-primary/20 transition-all disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "שומר..." : "שמירה"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-full border border-border text-sm font-heading font-semibold text-foreground hover:bg-muted/50 transition-colors"
        >
          ביטול
        </button>
      </div>
    </form>
  );
}