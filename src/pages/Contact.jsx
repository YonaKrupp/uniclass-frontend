import React, { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Mail, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import PageLogo from "@/components/PageLogo";

const API_BASE = "https://learn-le-connect.base44.app/api/apps/6a37f1517bf59551c5f4b6f9/functions";

export default function Contact() {
  const location = useLocation();
  const isStudent = location.pathname.startsWith("/student");
  const p_nCase = isStudent ? 1 : 2;

  const userData = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}");
    } catch {
      return {};
    }
  }, []);

  const contactEmail = userData.teacherEmail || userData.studentEmail || userData.email || "";

  const [subjectText, setSubjectText] = useState("");
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const canSend = subjectText.trim() && messageText.trim() && !sending;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSend) return;
    setSending(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch(`${API_BASE}/adminInterfaceProxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "insertContactMessage",
          p_1Student_2Teacher: p_nCase,
          p_mail: contactEmail,
          SubjectText: subjectText.trim(),
          MessageText: messageText.trim(),
          token: localStorage.getItem("authToken") || sessionStorage.getItem("authToken") || "",
        }),
      }).then((r) => r.json());

      if (res?._status && res._status !== 200) {
        const backendMsg = res?.message || res?.error || "";
        setError(backendMsg ? `שגיאה מהשרת: ${backendMsg}` : "שליחת ההודעה נכשלה");
        return;
      }
      setSuccess(true);
      setSubjectText("");
      setMessageText("");
    } catch (err) {
      setError(err.message || "שליחת ההודעה נכשלה");
    } finally {
      setSending(false);
    }
  };

  return (
    <div dir="rtl" className="space-y-6 max-w-2xl mx-auto">
      <PageLogo />
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground flex items-center gap-2">
          <Mail className="w-7 h-7 text-primary" />
          צור קשר
        </h1>
        <p className="text-muted-foreground font-body">
          שלחו לנו הודעה ונחזור אליכם בהקדם
        </p>
      </div>

      {success && (
        <div className="bg-chart-2/10 border border-chart-2/20 rounded-xl p-4 flex items-center gap-2 text-chart-2 text-sm font-body">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          ההודעה נשלחה בהצלחה, תודה!
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-2 text-destructive text-sm font-body">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-5 sm:p-6 space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-heading font-semibold text-foreground block">
            נושא: <span className="text-muted-foreground font-body font-normal">({subjectText.length}/65)</span>
          </label>
          <input
            type="text"
            value={subjectText}
            onChange={(e) => setSubjectText(e.target.value.slice(0, 65))}
            maxLength={65}
            placeholder="הקלידו נושא הפנייה"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm shadow-sm outline-none focus:ring-1 focus:ring-ring"
            disabled={sending}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-heading font-semibold text-foreground block">הודעה:</label>
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            rows={6}
            placeholder="הקלידו את תוכן ההודעה"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm shadow-sm outline-none focus:ring-1 focus:ring-ring resize-y"
            disabled={sending}
          />
        </div>

        <button
          type="submit"
          disabled={!canSend}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-heading font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          שלח הודעה
        </button>
      </form>
    </div>
  );
}