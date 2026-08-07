import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Loader2, RefreshCw, MessageCircle } from "lucide-react";
import PageLogo from "@/components/PageLogo";

const API_BASE = "https://learn-le-connect.base44.app/api/apps/6a37f1517bf59551c5f4b6f9/functions";

const COLUMNS = [
  { key: "studentName", label: "שם התלמיד" },
  { key: "gn03_subjectName", label: "מקצוע" },
  { key: "gn04_levelName", label: "רמת לימוד" },
  { key: "pastlessonsCount", label: "שיעורים\nשנלמדו" },
  { key: "futurelessonsCount", label: "שיעורים\nמתוכננים" },
  { key: "gn01_PhoneNumber", label: "טלפון" },
];

export default function StudentsList() {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}");
  const authToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken") || "";
  const teacherEmail = userData.teacherEmail || userData.email || "";

  const now = new Date();
  const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadStudents = async () => {
    if (!teacherEmail) { setError("לא נמצא אימייל מורה"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/studentsListProxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: teacherEmail, todayDate, token: authToken }),
      });
      const data = await res.json();
      if (data._status === 401) {
        localStorage.removeItem("authToken");
        sessionStorage.removeItem("authToken");
        navigate("/teacher-login");
        return;
      }
      if (data.error) { setError(data.error); return; }
      const list = Array.isArray(data) ? data : (data.Data || data.data || []);
      setStudents(list);
    } catch (err) {
      setError("שגיאה בטעינת הרשימה: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStudents(); }, []);

  return (
    <div dir="rtl" className="space-y-6 select-none">
      {/* Header */}
      <div className="space-y-4">
        <PageLogo />
        <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground flex items-center gap-2">
            <Users className="w-7 h-7 text-primary" />
            רשימת תלמידים
          </h1>
          <p className="text-muted-foreground font-body text-sm">תאריך: {todayDate}</p>
        </div>
        <button
          onClick={loadStudents}
          disabled={loading}
          className="px-4 py-2.5 bg-muted text-foreground rounded-xl text-sm font-heading font-medium hover:bg-accent transition-colors flex items-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          רענון
        </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-sm font-body">{error}</div>
      )}

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {loading && students.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
            <Users className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-sm font-body">אין תלמידים להצגה</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="bg-muted/50 text-xs font-heading font-semibold text-muted-foreground">
                  {COLUMNS.map((col) => (
                    <th key={col.key} className="px-3 py-2.5 text-center border-b border-border whitespace-pre-line leading-tight">{col.label}</th>
                  ))}
                  <th className="px-3 py-2.5 text-center border-b border-border">צ'אט</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((student, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    {COLUMNS.map((col) => (
                    <td key={col.key} className="px-3 py-2 text-foreground whitespace-nowrap text-center">
                      {String(student[col.key] ?? "—")}
                    </td>
                    ))}
                    <td className="px-3 py-2 text-center whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/teacher-chat?student=${encodeURIComponent(student.gn01_Email || "")}&name=${encodeURIComponent(student.studentName || "")}`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-heading font-medium hover:bg-primary/20 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        צ'אט
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {students.length > 0 && (
          <div className="md:hidden px-4 py-2 bg-muted/40 border-t border-border text-xs text-muted-foreground font-body text-center">
            ← גלול לרוחב לצפייה בכל העמודות →
          </div>
        )}
      </div>
    </div>
  );
}