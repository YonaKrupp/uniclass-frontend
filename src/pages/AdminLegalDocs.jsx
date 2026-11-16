import React, { useEffect, useState } from "react";
import { Loader2, Save, Lock } from "lucide-react";
import { base44 } from "@/api/base44Client";

const EMPTY_FORM = {
  title: "",
  slug: "",
  version: "1.0",
  effective_date: "",
  body: "",
  body_continuation: "",
  is_published: false,
};

function toForm(doc) {
  return {
    title: doc.title || "",
    slug: doc.slug || "",
    version: doc.version || "",
    effective_date: doc.effective_date ? String(doc.effective_date).slice(0, 10) : "",
    body: doc.body || "",
    body_continuation: doc.body_continuation || "",
    is_published: doc.is_published === true,
  };
}

/**
 * מסך ניהול מסמכים משפטיים — מנהל מדביק את גוף המסמך, מעדכן גרסה ותאריך
 * ומסמן פרסום, וכן מעדכן את גרסאות חבילות המסמכים (מורים / תלמידים).
 */
export default function AdminLegalDocs() {
  const [allowed, setAllowed] = useState(null);
  const [docs, setDocs] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [docStatus, setDocStatus] = useState("");
  const [savingDoc, setSavingDoc] = useState(false);

  const [settingsId, setSettingsId] = useState("");
  const [versions, setVersions] = useState({ teacher_docs_version: "1.0", student_docs_version: "1.0" });
  const [versionStatus, setVersionStatus] = useState("");
  const [savingVersions, setSavingVersions] = useState(false);

  useEffect(() => {
    base44.auth
      .me()
      .then((user) => setAllowed(user?.role === "admin"))
      .catch(() => setAllowed(false));
  }, []);

  useEffect(() => {
    if (!allowed) return;

    base44.entities.LegalDocument
      .list({ sort: "slug", limit: 100 })
      .then((page) => {
        const items = page?.items || [];
        setDocs(items);
        if (items[0]) {
          setSelectedId(items[0].id);
          setForm(toForm(items[0]));
        }
      })
      .catch((err) => setDocStatus(err.message || "טעינת המסמכים נכשלה"));

    base44.entities.Settings
      .list({ limit: 1 })
      .then((page) => {
        const record = (page?.items || [])[0];
        if (record) {
          setSettingsId(record.id);
          setVersions({
            teacher_docs_version: record.teacher_docs_version || "1.0",
            student_docs_version: record.student_docs_version || "1.0",
          });
        }
      })
      .catch((err) => setVersionStatus(err.message || "טעינת הגרסאות נכשלה"));
  }, [allowed]);

  const selectDoc = (doc) => {
    setSelectedId(doc.id);
    setForm(toForm(doc));
    setDocStatus("");
  };

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const saveDoc = async () => {
    if (!selectedId) return;
    setSavingDoc(true);
    setDocStatus("");
    try {
      await base44.entities.LegalDocument.update(selectedId, {
        title: form.title,
        version: form.version,
        effective_date: form.effective_date || null,
        body: form.body,
        body_continuation: form.body_continuation,
        is_published: form.is_published,
      });
      setDocs((prev) =>
        prev.map((doc) => (doc.id === selectedId ? { ...doc, ...form, effective_date: form.effective_date || null } : doc)),
      );
      setDocStatus("המסמך נשמר");
    } catch (err) {
      setDocStatus("שמירה נכשלה: " + (err.message || "נסו שוב"));
    } finally {
      setSavingDoc(false);
    }
  };

  const saveVersions = async () => {
    setSavingVersions(true);
    setVersionStatus("");
    try {
      if (settingsId) {
        await base44.entities.Settings.update(settingsId, versions);
      } else {
        const created = await base44.entities.Settings.create(versions);
        setSettingsId(created.id);
      }
      setVersionStatus("הגרסאות נשמרו");
    } catch (err) {
      setVersionStatus("שמירה נכשלה: " + (err.message || "נסו שוב"));
    } finally {
      setSavingVersions(false);
    }
  };

  if (allowed === null) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="טוען" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div dir="rtl" className="max-w-lg mx-auto py-16 text-center space-y-3">
        <Lock className="w-8 h-8 mx-auto text-muted-foreground" aria-hidden="true" />
        <h1 className="text-xl font-heading font-bold text-foreground">אין הרשאה</h1>
        <p className="text-sm font-body text-muted-foreground">המסך הזה זמין למנהלי המערכת בלבד.</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">מסמכים משפטיים</h1>
        <p className="text-sm font-body text-muted-foreground">
          הדביקו את גוף המסמך, עדכנו גרסה ותאריך וסמנו פרסום. מסמך לא מפורסם או ריק מציג "המסמך יפורסם בקרוב".
        </p>
      </div>

      {/* גרסאות חבילות המסמכים */}
      <section className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <h2 className="text-base font-heading font-semibold text-foreground">גרסאות חבילות המסמכים</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 block">
            <span className="text-sm font-heading font-medium text-foreground">גרסת מסמכי מורים</span>
            <input
              type="text"
              value={versions.teacher_docs_version}
              onChange={(e) => setVersions((prev) => ({ ...prev, teacher_docs_version: e.target.value }))}
              className="w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm font-body min-h-[44px]"
            />
          </label>
          <label className="space-y-1 block">
            <span className="text-sm font-heading font-medium text-foreground">גרסת מסמכי תלמידים</span>
            <input
              type="text"
              value={versions.student_docs_version}
              onChange={(e) => setVersions((prev) => ({ ...prev, student_docs_version: e.target.value }))}
              className="w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm font-body min-h-[44px]"
            />
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={saveVersions}
            disabled={savingVersions}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-heading font-semibold text-primary-foreground disabled:opacity-60 min-h-[44px]"
          >
            {savingVersions ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            שמירת גרסאות
          </button>
          {versionStatus && <span className="text-xs font-body text-muted-foreground">{versionStatus}</span>}
        </div>
      </section>

      {/* עריכת מסמך */}
      <section className="grid gap-4 lg:grid-cols-[260px_1fr]">
        <nav aria-label="רשימת המסמכים" className="bg-card border border-border rounded-2xl p-2 space-y-1">
          {docs.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => selectDoc(doc)}
              className={`w-full text-right rounded-xl px-3 py-2.5 text-sm font-body min-h-[44px] transition-colors ${
                doc.id === selectedId ? "bg-primary/10 text-primary font-semibold" : "text-foreground hover:bg-muted"
              }`}
            >
              <span className="block">{doc.title}</span>
              <span className="block text-xs text-muted-foreground">/{doc.slug}</span>
            </button>
          ))}
        </nav>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-1 block sm:col-span-2">
              <span className="text-sm font-heading font-medium text-foreground">כותרת</span>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                className="w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm font-body min-h-[44px]"
              />
            </label>
            <label className="space-y-1 block">
              <span className="text-sm font-heading font-medium text-foreground">גרסה</span>
              <input
                type="text"
                value={form.version}
                onChange={(e) => updateField("version", e.target.value)}
                className="w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm font-body min-h-[44px]"
              />
            </label>
            <label className="space-y-1 block">
              <span className="text-sm font-heading font-medium text-foreground">תאריך תוקף</span>
              <input
                type="date"
                value={form.effective_date}
                onChange={(e) => updateField("effective_date", e.target.value)}
                className="w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm font-body min-h-[44px]"
              />
            </label>
            <label className="flex items-center gap-3 sm:col-span-2 self-end pb-2">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => updateField("is_published", e.target.checked)}
                className="w-5 h-5 rounded border-border text-primary accent-primary"
              />
              <span className="text-sm font-body text-foreground">מפורסם</span>
            </label>
          </div>

          <label className="space-y-1 block">
            <span className="text-sm font-heading font-medium text-foreground">גוף המסמך (Markdown)</span>
            <textarea
              value={form.body}
              onChange={(e) => updateField("body", e.target.value)}
              rows={18}
              dir="rtl"
              className="w-full rounded-xl border border-border bg-muted px-3 py-3 text-sm font-body leading-relaxed"
            />
          </label>

          <label className="space-y-1 block">
            <span className="text-sm font-heading font-medium text-foreground">המשך גוף המסמך (Markdown)</span>
            <textarea
              value={form.body_continuation}
              onChange={(e) => updateField("body_continuation", e.target.value)}
              rows={10}
              dir="rtl"
              className="w-full rounded-xl border border-border bg-muted px-3 py-3 text-sm font-body leading-relaxed"
            />
          </label>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={saveDoc}
              disabled={savingDoc || !selectedId}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-heading font-semibold text-primary-foreground disabled:opacity-60 min-h-[44px]"
            >
              {savingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              שמירת המסמך
            </button>
            {docStatus && <span className="text-xs font-body text-muted-foreground">{docStatus}</span>}
          </div>
        </div>
      </section>
    </div>
  );
}