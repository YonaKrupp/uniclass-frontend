import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Loader2, RefreshCw, Pencil, Save, X, AlertCircle, FileText, ChevronDown, ChevronUp } from "lucide-react";
import PageLogo from "@/components/PageLogo";

const API_BASE = "https://learn-le-connect.base44.app/api/apps/6a37f1517bf59551c5f4b6f9/functions";

export default function LessonSummary() {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}");
  const authToken = localStorage.getItem("authToken") || sessionStorage.getItem("authToken") || "";
  const teacherEmail = userData.teacherEmail || userData.email || "";

  const now = new Date();
  const todayDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [authError, setAuthError] = useState(false);
  const [showTreated, setShowTreated] = useState(false);
  const [transcriptList, setTranscriptList] = useState([]);
  const [expandedTranscripts, setExpandedTranscripts] = useState({});
  const editingRef = useRef(false);

  const loadSummary = async () => {
    if (!teacherEmail) { setError("לא נמצא אימייל מורה"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/lessonSummaryProxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "getSummary",
          email: teacherEmail,
          date: todayDate,
          show: showTreated ? 1 : 0,
          token: authToken,
        }),
      });
      const data = await res.json();
      if (data._status === 401) {
        setAuthError(true);
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("userData");
        setTimeout(() => navigate("/teacher-login"), 2000);
        return;
      }
      if (data.error) { setError(data.error); return; }
      const list = Array.isArray(data) ? data : (data.feedbackList || data.Data || data.data || []);
      setFeedbackList(list);
      const transcripts = data.transcriptList || data.TranscriptList || [];
      setTranscriptList(transcripts);
    } catch (err) {
      setError("שגיאה בטעינת הנתונים: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSummary(); }, [showTreated]);

  // Auto-refresh every 120 seconds, but not while editing
  useEffect(() => {
    const interval = setInterval(() => {
      if (!editingRef.current) {
        loadSummary();
      }
    }, 120000);
    return () => clearInterval(interval);
  }, [showTreated]);

  const startEdit = (item) => {
    editingRef.current = true;
    setEditingId(item.gn06_id);
    setEditText(item.gn06_feedback_text || "");
  };

  const cancelEdit = () => {
    editingRef.current = false;
    setEditingId(null);
    setEditText("");
  };

  const saveFeedback = async (item) => {
    if (!editText.trim()) { setError("נא למלא טקסט משוב לפני שמירה"); return; }
    setSavingId(item.gn06_id);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/lessonSummaryProxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "setFeedback",
          gn06Id: item.gn06_id,
          description: editText.trim(),
          token: authToken,
        }),
      });
      const data = await res.json();
      if (data._status === 401) {
        setAuthError(true);
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("userData");
        setTimeout(() => navigate("/teacher-login"), 2000);
        return;
      }
      if (data.error) { setError(data.error); return; }
      editingRef.current = false;
      setEditingId(null);
      setEditText("");
      await loadSummary();
    } catch (err) {
      setError("שגיאה בשמירת המשוב: " + (err.message || ""));
    } finally {
      setSavingId(null);
    }
  };

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
        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showTreated}
              onChange={(e) => setShowTreated(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50 cursor-pointer"
            />
            <span className="text-sm font-body text-foreground">הצג שיעורים שכבר הוזן עבורם משוב</span>
          </label>
          <button
            onClick={loadSummary}
            disabled={loading}
            className="px-4 py-2.5 bg-muted text-foreground rounded-xl text-sm font-heading font-medium hover:bg-accent transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            רענון
          </button>
        </div>
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
            const isEditing = editingId === item.gn06_id;
            const isSaving = savingId === item.gn06_id;
            const hasFeedback = item.gn06_feedback_text && item.gn06_feedback_text.trim() !== "";
            return (
              <div key={item.gn06_id} className="bg-card rounded-2xl border border-border p-4 sm:p-5 space-y-3">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-heading font-semibold text-muted-foreground shrink-0 mt-0.5">שם התלמיד/ה:</span>
                    <span className="text-sm font-body text-foreground font-medium">{item.studentName || "—"}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-heading font-semibold text-muted-foreground shrink-0 mt-0.5">שיבוץ ומקצוע:</span>
                    <span className="text-sm font-body text-foreground">{item.gName || "—"}</span>
                  </div>
                </div>

                {/* Feedback */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-heading font-semibold text-muted-foreground">משוב שיעור:</span>
                    {!isEditing && (
                      <button
                        onClick={() => startEdit(item)}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors disabled:opacity-60"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        {hasFeedback ? "עריכה" : "הוספת משוב"}
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        autoFocus
                        rows={3}
                        placeholder="הקלידו משוב על השיעור..."
                        className="w-full px-3 py-2.5 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm font-body resize-none"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => saveFeedback(item)}
                          disabled={isSaving}
                          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-heading font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                        >
                          {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          {isSaving ? "שומר..." : "שמירה"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={isSaving}
                          className="flex items-center gap-1.5 px-4 py-2 bg-muted text-foreground rounded-lg text-xs font-heading font-medium hover:bg-accent transition-colors disabled:opacity-60"
                        >
                          <X className="w-3.5 h-3.5" />
                          ביטול
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className={`text-sm font-body rounded-xl p-3 whitespace-pre-wrap break-words ${hasFeedback ? "bg-muted text-foreground" : "bg-muted/40 text-muted-foreground italic"}`}>
                      {hasFeedback ? item.gn06_feedback_text : "טרם הוזן משוב"}
                    </p>
                  )}
                </div>

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