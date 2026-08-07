import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Loader2 } from "lucide-react";

export default function StudentTest() {
  const authToken = localStorage.getItem("authToken") || "";
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("SprintIt");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleSend = async () => {
    if (!message || !phone || !company) {
      setStatus("אנא מלא את כל השדות");
      return;
    }

    setLoading(true);
    setStatus("");
    try {
      const res = await base44.functions.invoke("smsProxy", {
        message, phone, company, token: authToken,
      });
      const data = res.data;
      if (data?.error) {
        setStatus("שגיאה בשליחה: " + data.error);
        return;
      }
      setStatus("הודעה נשלחה בהצלחה");
      setMessage("");
      setPhone("");
      setCompany("SprintIt");
    } catch (err) {
      setStatus("שגיאה בשליחה: " + (err.message || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="space-y-6 select-none max-w-md mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
          טסט
        </h1>
        <p className="text-muted-foreground font-body text-sm">בדיקת שליחת הודעה SMS</p>
      </div>

      {/* Form */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-heading font-semibold text-foreground">שם חברה</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="הכנס שם חברה"
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-heading font-semibold text-foreground">נייד</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="הכנס מספר נייד"
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-heading font-semibold text-foreground">הודעה</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="הכנס את ההודעה"
            className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none h-24"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={loading}
          className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-heading font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          שלח
        </button>
      </div>

      {status && (
        <div className={`p-3 rounded-lg text-sm font-body text-center ${
          status.includes("הצלחה")
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {status}
        </div>
      )}
    </div>
  );
}