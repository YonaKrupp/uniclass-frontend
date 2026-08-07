import React, { useState } from "react";
import { Download, Loader2, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";

const COLUMNS = [
  { key: "fullName", label: "שם מלא" },
  { key: "email", label: "אימייל" },
  { key: "phone", label: "טלפון" },
  { key: "role", label: "תפקיד" },
  { key: "institution", label: "מוסד לימודי" },
  { key: "subjects", label: "תואר / מקצועות" },
  { key: "created_date", label: "תאריך הרשמה" },
];

function escapeCsv(value) {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" });
  } catch {
    return String(iso);
  }
}

function downloadCsv(rows) {
  const header = COLUMNS.map((c) => escapeCsv(c.label)).join(",");
  const lines = rows.map((row) =>
    COLUMNS.map((c) => {
      const raw = c.key === "created_date" ? formatDate(row[c.key]) : row[c.key];
      return escapeCsv(raw);
    }).join(",")
  );
  // BOM (\uFEFF) ensures Excel reads Hebrew correctly
  const csv = "\uFEFF" + [header, ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `PilotRegistration_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function PilotRegistrationsExport() {
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(null);
  const [error, setError] = useState(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await base44.entities.PilotRegistration.list("-created_date");
      setCount(rows.length);
      if (rows.length === 0) return;
      downloadCsv(rows);
    } catch (err) {
      console.error("Export error:", err);
      setError("אירעה שגיאה בייצוא הנתונים. נסו שוב.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <div className="bg-card border border-border rounded-2xl p-8 max-w-lg w-full text-center">
        <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-foreground mb-2">ייצוא הרשמות פיילוט</h1>
        <p className="text-muted-foreground font-body mb-6">הורדת כל רשומות ההרשמה לקובץ CSV בעברית, מוכן לפתיחה ב-Excel.</p>
        <button onClick={handleExport} disabled={loading} className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground rounded-xl font-heading font-semibold shadow-lg shadow-primary/25 hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed min-h-[52px]">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> מייצא...</> : <><Download className="w-5 h-5" /> ייצוא ל-CSV</>}
        </button>
        {count === 0 && !loading && <p className="text-muted-foreground text-sm mt-4">אין רשומות לייצוא.</p>}
        {count > 0 && !loading && <p className="text-green-600 text-sm mt-4">יוצאו {count} רשומות בהצלחה.</p>}
        {error && <p className="text-destructive text-sm mt-4">{error}</p>}
      </div>
    </div>
  );
}