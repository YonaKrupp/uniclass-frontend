import React, { useState, useEffect, useCallback } from "react";
import { Shield, Loader2, Calendar, Users, MessageSquare, ChevronDown, ChevronUp, RefreshCw, Banknote } from "lucide-react";
import PageLogo from "@/components/PageLogo";
import { base44 } from "@/api/base44Client";

const API_BASE = "https://learn-le-connect.base44.app/api/apps/6a37f1517bf59551c5f4b6f9/functions";

const smsColumnLabels = {
  gn14_Source_System: "מערכת מקור",
  gn14_Sms_Msg_Text: "נוסח ההודעה שנשלחה",
  gn14_Sms_Msg_Time: "תאריך שעה",
};

const traceColumnLabels = {
  dateTimeIs: "תאריך שעה",
  trace_Description: "תאור התהליך",
};

const incomeColumnLabels = {
  heb_month: "חודש",
  lessonsCount: "כמות שיעורים",
  payment: "תשלום",
  verify: "סטטוס",
  yyyyMM: "חודש שנה",
  teacher_name: "מורה",
};

const contactColumnLabels = {
  gn11_Msg_Id: "מספר",
  emailIs: "מייל",
  gn11_Subject_Text: "נושא",
  gn11_Msg_Text: "תוכן ההודעה",
  gn11_Msg_Time: "תאריך שעה",
  gn11_Handel_Flag: "טופל",
  gn11_Handel_Datetime: "תאריך טיפול",
  gn11_Handel_Description: "תאור טיפול",
  nameIs: "שם",
  phoneNumberIs: "טלפון",
};

const TODAY = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function AdminInterface() {
  const [authToken, setAuthToken] = useState(() =>
    (typeof window !== "undefined" && (localStorage.getItem("authToken") || sessionStorage.getItem("authToken"))) || ""
  );

  const [selectedDate, setSelectedDate] = useState(TODAY());
  const [personType, setPersonType] = useState("2"); // 2=מורה, 1=תלמיד
  const [mails, setMails] = useState([]);
  const [selectedMail, setSelectedMail] = useState("");

  const [traceList, setTraceList] = useState(null);
  const [smsList, setSmsList] = useState(null);
  const [contactList, setContactList] = useState(null);
  const [showHandled, setShowHandled] = useState(false);
  const [showTrace, setShowTrace] = useState(true);
  const [showSms, setShowSms] = useState(true);
  const [showContact, setShowContact] = useState(true);
  const [showIncome, setShowIncome] = useState(true);
  const [incomeDate, setIncomeDate] = useState(TODAY());
  const [incomeList, setIncomeList] = useState(null);
  const [loadingIncome, setLoadingIncome] = useState(false);
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editDesc, setEditDesc] = useState("");
  const [savingContact, setSavingContact] = useState(false);
  const [loadingMails, setLoadingMails] = useState(false);
  const [loadingTrace, setLoadingTrace] = useState(false);
  const [loadingSms, setLoadingSms] = useState(false);
  const [loadingContact, setLoadingContact] = useState(false);
  const [error, setError] = useState("");

  // Fetch mail dropdown
  const fetchMails = useCallback(async (pType, token) => {
    setLoadingMails(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/adminInterfaceProxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mails', p_1Student_2Teacher: pType, token }),
      }).then(r => r.json());
      // Filter client-side by the selected person type (API returns all)
      const all = res?.data ?? [];
      const list = all.filter((m) => String(m.p_1Student_2Teacher) === String(pType));
      setMails(list);
      if (list.length > 0) {
        setSelectedMail(list[0].mailIs || "");
      } else {
        setSelectedMail("");
      }
    } catch (err) {
      setError(err.message || "שגיאה בטעינת רשימת מיילים");
    } finally {
      setLoadingMails(false);
    }
  }, []);

  // Fetch trace list
  const fetchTrace = useCallback(async (date, pType, mail, token) => {
    if (!mail) { setLoadingTrace(false); return; }
    setLoadingTrace(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/adminInterfaceProxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'trace',
          p_Today_yyyyMMdd: date,
          p_1Student_2Teacher: pType,
          p_mail: mail,
          token,
        }),
      }).then(r => r.json());
      setTraceList(res?.data ?? []);
    } catch (err) {
      setError(err.message || "שגיאה בטעינת רשימת מעקב");
    } finally {
      setLoadingTrace(false);
    }
  }, []);

  // Fetch SMS list
  const fetchSms = useCallback(async (date, mail, token) => {
    if (!mail) { setLoadingSms(false); return; }
    setLoadingSms(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/adminInterfaceProxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sms',
          p_Today_yyyyMMdd: date,
          p_mail: mail,
          token,
        }),
      }).then(r => r.json());
      if (res?.success === false || (res?._status && res._status !== 200)) {
        const backendMsg = res?.message || res?.error || "";
        setError(backendMsg ? `שגיאה מהשרת: ${backendMsg}` : "שגיאה בטעינת רשימת SMS");
        setSmsList([]);
      } else {
        setSmsList(res?.data ?? []);
      }
    } catch (err) {
      console.error("[AdminInterface] SMS fetch error:", err);
      setError(err.message || "שגיאה בטעינת רשימת SMS");
    } finally {
      setLoadingSms(false);
    }
  }, []);

  // Fetch mails when token ready or personType changes (default 2 = מורה)
  useEffect(() => {
    if (authToken) {
      fetchMails(personType, authToken);
    }
  }, [authToken, personType]);

  // When mails/date/personType/selectedMail change, refetch trace
  useEffect(() => {
    if (authToken && selectedMail) {
      fetchTrace(selectedDate, personType, selectedMail, authToken);
    }
  }, [selectedDate, personType, selectedMail, authToken]);

  // Refetch SMS list when date or mail changes
  useEffect(() => {
    if (authToken && selectedMail) {
      fetchSms(selectedDate, selectedMail, authToken);
    }
  }, [selectedDate, selectedMail, authToken]);

  // Fetch contact messages list
  const fetchContact = useCallback(async (date, pType, show, token) => {
    setLoadingContact(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/adminInterfaceProxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'contactMessages',
          p_Today_yyyyMMdd: date,
          p_1Student_2Teacher: pType,
          p_show_0New_1handeld: show ? 1 : 0,
          token,
        }),
      }).then(r => r.json());
      if (res?.success === false || (res?._status && res._status !== 200)) {
        const backendMsg = res?.message || res?.error || "";
        setError(backendMsg ? `שגיאה מהשרת: ${backendMsg}` : "שגיאה בטעינת רשימת הודעות קשר");
        setContactList([]);
      } else {
        setContactList(res?.data ?? []);
      }
    } catch (err) {
      console.error("[AdminInterface] Contact fetch error:", err);
      setError(err.message || "שגיאה בטעינת רשימת הודעות קשר");
    } finally {
      setLoadingContact(false);
    }
  }, []);

  // Refetch contact messages when date / personType / showHandled change (no mail dependency)
  useEffect(() => {
    if (authToken) {
      fetchContact(selectedDate, personType, showHandled, authToken);
    }
  }, [selectedDate, personType, showHandled, authToken]);

  // Fetch teacher income (full month) — uses base44.functions.invoke so it hits
  // the latest deployed code (raw fetch to the function URL serves a stale version).
  const fetchIncome = useCallback(async (date, token) => {
    setLoadingIncome(true);
    setError("");
    try {
      const response = await base44.functions.invoke('adminInterfaceProxy', {
        action: 'teacherIncome',
        p_Today_yyyyMMdd: date,
        token,
      });
      const res = response?.data ?? response;
      if (res?.success === false || (res?._status && res._status !== 200)) {
        const backendMsg = res?.message || res?.error || "";
        setError(backendMsg ? `שגיאה מהשרת: ${backendMsg}` : "שגיאה בטעינת רשימת הכנסות");
        setIncomeList([]);
      } else {
        setIncomeList(res?.data ?? []);
      }
    } catch (err) {
      console.error("[AdminInterface] Income fetch error:", err);
      setError(err.message || "שגיאה בטעינת רשימת הכנסות");
    } finally {
      setLoadingIncome(false);
    }
  }, []);

  // Refetch teacher income when incomeDate changes
  useEffect(() => {
    console.log("[AdminInterface] income useEffect fired", { hasToken: !!authToken, incomeDate });
    if (authToken) {
      fetchIncome(incomeDate, authToken);
    }
  }, [incomeDate, authToken, fetchIncome]);

  // Refresh all lists at once
  const handleRefresh = useCallback(() => {
    if (!authToken) return;
    fetchMails(personType, authToken);
    if (selectedMail) {
      fetchTrace(selectedDate, personType, selectedMail, authToken);
      fetchSms(selectedDate, selectedMail, authToken);
    }
    fetchContact(selectedDate, personType, showHandled, authToken);
    fetchIncome(incomeDate, authToken);
  }, [authToken, personType, selectedMail, selectedDate, showHandled, incomeDate, fetchMails, fetchTrace, fetchSms, fetchContact, fetchIncome]);

  // Save handling description for a contact message
  const handleSaveContact = useCallback(async (msgId, desc) => {
    if (!msgId) return;
    if (!desc || !desc.trim()) {
      setError("נא להקליד תאור טיפול לפני השמירה");
      return;
    }
    setSavingContact(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/adminInterfaceProxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'setContactMessage',
          p_msgId: msgId,
          p_handelDescription: desc,
          token: authToken,
        }),
      }).then(r => r.json());
      if (res?.success === false || (res?._status && res._status !== 200)) {
        const backendMsg = res?.message || res?.error || "";
        setError(backendMsg ? `שגיאה מהשרת: ${backendMsg}` : "שגיאה בשמירת הטיפול");
      } else {
        setEditingMsgId(null);
        setEditDesc("");
        // Refresh the contact list to reflect the updated description
        await fetchContact(selectedDate, personType, showHandled, authToken);
      }
    } catch (err) {
      console.error("[AdminInterface] save contact error:", err);
      setError(err.message || "שגיאה בשמירת הטיפול");
    } finally {
      setSavingContact(false);
    }
  }, [authToken, selectedDate, personType, showHandled, fetchContact]);

  return (
    <div dir="rtl" className="space-y-6">
      {/* Header */}
      <PageLogo />
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary" />
            ממשק ניהול
          </h1>
          <p className="text-muted-foreground font-body">מעקב פעילות יומי</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loadingMails || loadingTrace || loadingSms || loadingContact}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-heading font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${(loadingMails || loadingTrace || loadingSms || loadingContact) ? "animate-spin" : ""}`} />
          רענון
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-destructive text-sm font-body">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        {/* Date */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-heading font-semibold text-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            תאריך
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full sm:w-auto rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Person Type */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-heading font-semibold text-foreground">
            <Users className="w-4 h-4 text-primary" />
            סוג משתמש
          </label>
          <select
            value={personType}
            onChange={(e) => setPersonType(e.target.value)}
            className="w-full sm:w-auto rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="2">מורה</option>
            <option value="1">תלמיד</option>
          </select>
        </div>

        {/* Mail Dropdown */}
        <div className="space-y-2">
          <label className="text-sm font-heading font-semibold text-foreground block">מייל</label>
          {loadingMails ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              טוען רשימה...
            </div>
          ) : (
            <select
              value={selectedMail}
              onChange={(e) => setSelectedMail(e.target.value)}
              className="w-full sm:w-auto rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">— בחרו מייל —</option>
              {mails.map((m, i) => (
                <option key={`${m.mailIs}-${i}`} value={m.mailIs || ""}>
                  {m.nameMailIs || `${m.nameIs} (${m.mailIs})` || m.mailIs || `פריט ${i + 1}`}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Trace List */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <button
          onClick={() => setShowTrace(!showTrace)}
          className="w-full px-5 py-4 border-b border-border flex items-center gap-2 hover:bg-muted/30 transition-colors"
        >
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-base font-heading font-semibold text-foreground flex-1 text-right">רשימת מעקב יומית</h2>
          {!loadingTrace && traceList != null && (
            <span className="text-sm font-body text-muted-foreground bg-muted/60 rounded-full px-2.5 py-0.5">{traceList.length}</span>
          )}
          {showTrace ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </button>

        {showTrace && (loadingTrace ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : !traceList || traceList.length === 0 ? (
          <div className="px-5 py-10 text-center text-muted-foreground font-body text-sm">
            אין נתונים לתצוגה
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="bg-muted/50 text-xs font-heading font-semibold text-muted-foreground">
                  {Object.keys(traceList[0]).filter((k) => k.toLowerCase() !== "gn28_seq").map((k) => (
                    <th key={k} className="px-4 py-2.5 text-right border-b border-border whitespace-nowrap">{traceColumnLabels[k] || k}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {traceList.map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    {Object.keys(traceList[0]).filter((k) => k.toLowerCase() !== "gn28_seq").map((k) => (
                      <td key={k} className="px-4 py-2.5 whitespace-nowrap text-foreground text-right">
                        {String(row[k] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* SMS List */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <button
          onClick={() => setShowSms(!showSms)}
          className="w-full px-5 py-4 border-b border-border flex items-center gap-2 hover:bg-muted/30 transition-colors"
        >
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="text-base font-heading font-semibold text-foreground flex-1 text-right">רשימת SMS</h2>
          {!loadingSms && smsList != null && (
            <span className="text-sm font-body text-muted-foreground bg-muted/60 rounded-full px-2.5 py-0.5">{smsList.length}</span>
          )}
          {showSms ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </button>

        {showSms && (loadingSms ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : !smsList || smsList.length === 0 ? (
          <div className="px-5 py-10 text-center text-muted-foreground font-body text-sm">
            אין נתונים לתצוגה
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="bg-muted/50 text-xs font-heading font-semibold text-muted-foreground">
                  {Object.keys(smsList[0]).filter((k) => k.toLowerCase() !== "gn28_seq").map((k) => (
                    <th key={k} className="px-4 py-2.5 text-right border-b border-border whitespace-nowrap">{smsColumnLabels[k] || k}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {smsList.map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    {Object.keys(smsList[0]).filter((k) => k.toLowerCase() !== "gn28_seq").map((k) => {
                      const val = String(row[k] ?? "—");
                      const hasNewlines = val.includes("\n");
                      return (
                        <td key={k} className={`px-4 py-2.5 text-foreground text-right ${hasNewlines ? "whitespace-pre-wrap" : "whitespace-nowrap"}`}>
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Contact Messages List */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showHandled}
              onChange={(e) => setShowHandled(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/50 cursor-pointer"
            />
            <span className="text-sm font-body text-foreground">הצג טופלו</span>
          </label>
        </div>
        <button
          onClick={() => setShowContact(!showContact)}
          className="w-full px-5 py-4 border-b border-border flex items-center gap-2 hover:bg-muted/30 transition-colors"
        >
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="text-base font-heading font-semibold text-foreground flex-1 text-right">רשימת הודעות קשר {showHandled ? "(טופלו)" : "(חדשות)"}</h2>
          {!loadingContact && contactList != null && (
            <span className="text-sm font-body text-muted-foreground bg-muted/60 rounded-full px-2.5 py-0.5">{contactList.length}</span>
          )}
          {showContact ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </button>

        {showContact && (loadingContact ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : !contactList || contactList.length === 0 ? (
          <div className="px-5 py-10 text-center text-muted-foreground font-body text-sm">
            אין נתונים לתצוגה
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="bg-muted/50 text-xs font-heading font-semibold text-muted-foreground">
                  {Object.keys(contactList[0]).filter((k) => k.toLowerCase() !== "gn28_seq" && k !== "gn11_Msg_Id").map((k) => (
                    <th key={k} className="px-4 py-2.5 text-right border-b border-border whitespace-nowrap">{contactColumnLabels[k] || k}</th>
                  ))}
                  <th className="px-4 py-2.5 text-right border-b border-border whitespace-nowrap">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contactList.map((row, i) => {
                  const msgId = row.gn11_Msg_Id;
                  const isEditing = String(editingMsgId) === String(msgId);
                  return (
                    <tr key={i} className="hover:bg-muted/30 transition-colors align-top">
                      {Object.keys(contactList[0]).filter((k) => k.toLowerCase() !== "gn28_seq" && k !== "gn11_Msg_Id").map((k) => {
                        const val = String(row[k] ?? "—");
                        const hasNewlines = val.includes("\n");
                        const isLongText = ["gn11_Msg_Text", "gn11_Handel_Description", "gn11_Subject_Text"].includes(k);
                        const isDesc = k === "gn11_Handel_Description";
                        return (
                          <td key={k} className={`px-4 py-2.5 text-foreground text-right align-top ${isLongText ? "w-80 min-w-80 whitespace-pre-wrap break-words" : hasNewlines ? "whitespace-pre-wrap" : "whitespace-nowrap"}`}>
                            {isEditing && isDesc ? (
                              <textarea
                                value={editDesc}
                                onChange={(e) => setEditDesc(e.target.value)}
                                rows={3}
                                className="w-full rounded-lg border border-input bg-background px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring resize-y"
                                placeholder="הקלידו תאור טיפול..."
                                dir="rtl"
                              />
                            ) : (
                              val
                            )}
                          </td>
                        );
                      })}
                      <td className="px-4 py-2.5 text-right align-top whitespace-nowrap">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSaveContact(msgId, editDesc)}
                              disabled={savingContact}
                              className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-heading font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
                            >
                              {savingContact ? "שומר..." : "שמור"}
                            </button>
                            <button
                              onClick={() => { setEditingMsgId(null); setEditDesc(""); }}
                              disabled={savingContact}
                              className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-heading font-medium hover:bg-muted/70 disabled:opacity-50 transition-colors"
                            >
                              ביטול
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingMsgId(msgId);
                              setEditDesc(String(row.gn11_Handel_Description ?? ""));
                            }}
                            className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-heading font-medium hover:bg-primary/20 transition-colors"
                          >
                            עריכה
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {/* Teacher Income (Full Month) */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <button
          onClick={() => setShowIncome(!showIncome)}
          className="w-full px-5 py-4 border-b border-border flex items-center gap-2 hover:bg-muted/30 transition-colors"
        >
          <Banknote className="w-5 h-5 text-primary" />
          <h2 className="text-base font-heading font-semibold text-foreground flex-1 text-right">הכנסות מורים (חודש מלא)</h2>
          {!loadingIncome && incomeList != null && (
            <span className="text-sm font-body text-muted-foreground bg-muted/60 rounded-full px-2.5 py-0.5">{incomeList.length}</span>
          )}
          {showIncome ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </button>

        {showIncome && (
          <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="flex items-center gap-2 text-sm font-heading font-semibold text-foreground shrink-0">
              <Calendar className="w-4 h-4 text-primary" />
              תאריך לבחירה
            </label>
            <input
              type="date"
              value={incomeDate}
              onChange={(e) => setIncomeDate(e.target.value)}
              className="w-full sm:w-auto rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        )}

        {showIncome && (loadingIncome ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : !incomeList || incomeList.length === 0 ? (
          <div className="px-5 py-10 text-center text-muted-foreground font-body text-sm">
            אין נתונים לתצוגה
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="bg-muted/50 text-xs font-heading font-semibold text-muted-foreground">
                  {Object.keys(incomeList[0]).filter((k) => k.toLowerCase() !== "gn28_seq" && k !== "sort_order").map((k) => (
                    <th key={k} className="px-4 py-2.5 text-right border-b border-border whitespace-nowrap">{incomeColumnLabels[k] || k}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {incomeList.map((row, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    {Object.keys(incomeList[0]).filter((k) => k.toLowerCase() !== "gn28_seq" && k !== "sort_order").map((k) => (
                      <td key={k} className="px-4 py-2.5 whitespace-nowrap text-foreground text-right">
                        {String(row[k] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}