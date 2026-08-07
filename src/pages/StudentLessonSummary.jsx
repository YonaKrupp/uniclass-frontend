import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Loader2, RefreshCw, AlertCircle, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useSingleMountEffect } from "@/hooks/useSingleMountEffect";
import { shouldFetch } from "@/lib/fetchGuard";
import PageLogo from "@/components/PageLogo";

export default function StudentLessonSummary() {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}");
  const authToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken") || "";
  const studentEmail = userData.studentEmail || userData.email || "";

  const now = new Date();
  const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authError, setAuthError] = useState(false);
  const [transcriptList, setTranscriptList] = useState([]);
  const [expandedTranscripts, setExpandedTranscripts] = useState({});

  const loadSummary = async (force = false) => {
    if (!studentEmail) { setError("לא נמצא אימייל תלמיד"); return; }
    if (!shouldFetch("studentLessonSummary", force)) return;
    setLoading(true);
    setError("");
    try {
      const res = await base44.functions.invoke("lessonSummaryProxy", {
        action: "loadFeedbackForStudent",
        email: studentEmail,
        date: todayDate,
        token: authToken,
      });
      const data = res.data || {};
      if (data._status === 401) {
        setAuthError(true);
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("userData");
        setTimeout(() => navigate("/student-login"), 2000);
        return;
      }
      if (data.error) { setError(data.error); return; }
      const list = Array.isArray(data) ? data : (data.feedbackList || data.data || data.Data || []);
      setFeedbackList(list);
      const transcripts = data.transcriptList || data.TranscriptList || [];
      setTranscriptList(transcripts);
    } catch (err) {
      setError("שגיאה בטעינת הנתונים: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  useSingleMountEffect("studentLessonSummary", loadSummary);

  if (authError) {
    return (
      <div dir="rtl" className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <div className="space-y-1">
          <h2 className="text-xl font-heading font-bold text-foreground">פג תוקף החיבור</h2>
          <p className="text-muted-foreground font-body text-sm">מיד תועברו למסך ההתחברות...</p>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="space-y-6 select-none">
      {/* Header */}
      <PageLogo />
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur flex items-center justify-between flex-wrap gap-3 -mx-4 px-4 py-3 border-b border-border">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-primary" />
            סיכום שיעור
          </h1>
          <p className="text-muted-foreground font-body text-sm">תאריך: {todayDate}</p>
        </div>
        <button
          onClick={() => loadSummary(true)}
          disabled={loading}
          className="px-4 py-2.5 bg-muted text-foreground rounded-xl text-sm font-heading font-medium hover:bg-accent transition-colors flex items-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          רענון
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-xl p-3 text-sm font-body">{error}</div>
      )}

      {/* List */}
      <div className="space-y-3">
        {loading && feedbackList.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : feedbackList.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
            <ClipboardList className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-sm font-body">אין שיעורים להצגה</p>
          </div>
        ) : (
          feedbackList.map((item) => {
            const hasFeedback = item.gn06_feedback_text && item.gn06_feedback_text.trim() !== "";
            const picSrc = item.teacher_pic
              ? `data:image/jpeg;base64,${item.teacher_pic}`
              : null;
            return (
              <div key={item.gn06_id} className="bg-card rounded-2xl border border-border p-4 sm:p-5 space-y-3">
                {/* Teacher info row */}
                <div className="flex items-center gap-3">
                  {picSrc ? (
                    <img
                      src={picSrc}
                      alt={item.teacherName || "מורה"}
                      className="w-12 h-12 rounded-full object-cover border border-border shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                      <ClipboardList className="w-5 h-5 text-muted-foreground/50" />
                    </div>
                  )}
                  <div className="space-y-0.5">
                    <p className="text-sm font-body text-foreground font-semibold">{item.teacherName || "—"}</p>
                    <p className="text-xs font-body text-muted-foreground">{item.gName || "—"}</p>
                  </div>
                </div>

                {/* Feedback */}
                {hasFeedback && (
                  <div className="space-y-1">
                    <span className="text-xs font-heading font-semibold text-muted-foreground">משוב שיעור:</span>
                    <p className="text-sm font-body rounded-xl p-3 bg-muted text-foreground whitespace-pre-wrap break-words">
                      {item.gn06_feedback_text}
                    </p>
                    {item.gn06_feedback_datetime && (
                      <p className="text-xs font-body text-muted-foreground text-left">
                        {item.gn06_feedback_datetime}
                      </p>
                    )}
                  </div>
                )}

                {/* Transcript Executive Summary */}
                {(() => {
                  const itemRoom = item.Gn06_daily_room || item.gn06_daily_room || "";
                  const matchingTranscripts = transcriptList.filter((t) =>
                    (t.Gn06_daily_room || t.gn06_daily_room || "") === itemRoom && itemRoom !== ""
                  );
                  if (matchingTranscripts.length === 0) return null;
                  const isExpanded = !!expandedTranscripts[item.gn06_id];
                  return (
                    <div className="space-y-2 pt-1">
                      <button
                        onClick={() => setExpandedTranscripts((prev) => ({ ...prev, [item.gn06_id]: !prev[item.gn06_id] }))}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-heading font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        {isExpanded ? "הסתר תקציר שיעור" : "הצג תקציר שיעור"}
                        {matchingTranscripts.length > 1 && ` (${matchingTranscripts.length})`}
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      {isExpanded && (
                        <div className="space-y-2">
                          {matchingTranscripts.map((transcript, idx) => {
                            const summary = transcript.gn30_Transcript_Executive_Summary || transcript.Gn30_Transcript_Executive_Summary || "";
                            let displayText = summary;
                            try {
                              const parsed = JSON.parse(summary);
                              if (typeof parsed === "string") {
                                displayText = parsed;
                              } else {
                                const sections = [];
                                if (parsed.summary) sections.push(`תקציר:\n${parsed.summary}`);
                                if (Array.isArray(parsed.key_points) && parsed.key_points.length) sections.push(`נקודות:\n${parsed.key_points.map((p) => `• ${p}`).join("\n")}`);
                                const actionItems = Array.isArray(parsed.action_items) ? parsed.action_items.filter((a) => typeof a === "string") : [];
                                if (actionItems.length) sections.push(`משימות לביצוע:\n${actionItems.map((a) => `• ${a}`).join("\n")}`);
                                displayText = sections.join("\n\n");
                              }
                            } catch { /* not JSON, use raw text */ }
                            return (
                              <div key={idx} className="bg-muted rounded-xl p-3 text-sm font-body text-foreground whitespace-pre-wrap break-words border border-border">
                                {displayText || "—"}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}