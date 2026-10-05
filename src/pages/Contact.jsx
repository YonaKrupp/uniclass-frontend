import React, { useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  Mail, Send, Loader2, CheckCircle2, AlertCircle, Clock,
  Headphones, MessageSquare, ShieldCheck, Sparkles, HelpCircle } from
"lucide-react";
import PageLogo from "@/components/PageLogo";
import Reveal from "@/components/landing/Reveal";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent } from
"@/components/ui/accordion";

const API_BASE = "https://learn-le-connect.base44.app/api/apps/6a37f1517bf59551c5f4b6f9/functions";

// Truthful, non-fabricated contact-method cards (no real phone/email exists yet).
const CONTACT_METHODS = [
{ icon: Clock, tint: "bg-primary/10 text-primary", title: "זמן תגובה", desc: "\u05E0\u05D7\u05D6\u05D5\u05E8 \u05D0\u05DC\u05D9\u05DB\u05DD \u05E2\u05D3 2 \u05D9\u05DE\u05D9 \u05E2\u05E1\u05E7\u05D9\u05DD" },
{ icon: Headphones, tint: "bg-mint/10 text-mint", title: "תמיכה אנושית", desc: "צוות אמיתי, לא בוט אוטומטי" },
{ icon: MessageSquare, tint: "bg-chart-2/10 text-chart-2", title: "פניות ומשוב", desc: "כל הודעה נקראת בעיון" },
{ icon: ShieldCheck, tint: "bg-primary/10 text-primary", title: "פרטיות מלאה", desc: "הפרטים שלכם נשמרים אצלנו" }];


const FAQ_ITEMS = [
{
  q: "תוך כמה זמן אקבל תגובה?",
  a: "אנחנו מתחייבים לחזור אליכם תוך 24 שעות מרגע שליחת ההודעה. בדרך כלל התגובה מגיעה מהר יותר."
},
{
  q: "מה כדאי לכלול בהודעה כדי שנוכל לעזור מהר?",
  a: "כתבו נושא ברור, תארו את השאלה או הבקשה בפירוט, וצרפו פרטים רלוונטיים כמו סוג משתמש (תלמיד/מורה) ומספר הזמנה אם יש."
},
{
  q: "האם אפשר לפנות גם בנושאים טכניים או רק תוכן?",
  a: "בוודאי. צוות התמיכה של UniClass מטפל גם בתקלות טכניות, שאלות על חשבונות, תשלומים ותזמון שיעורים — ולא רק בנושאי תוכן לימודי."
}];


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
          token: localStorage.getItem("authToken") || sessionStorage.getItem("authToken") || ""
        })
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
    <div dir="rtl" className="relative max-w-6xl mx-auto px-1">
      {/* Decorative blurred brand shapes — sit at the header→form transition */}
      <div className="pointer-events-none absolute inset-x-0 -top-10 h-[420px] overflow-hidden">
        <div className="absolute -top-24 right-1/4 w-[340px] h-[340px] rounded-full bg-primary/15 blur-[120px] animate-app-halo" />
        <div className="absolute top-10 left-1/4 w-[300px] h-[300px] rounded-full bg-mint/15 blur-[120px] animate-app-halo-slow" />
      </div>

      <div className="relative z-10">
        <PageLogo />

        {/* Header — eyebrow + big title + subtitle */}
        <Reveal className="mt-8 text-center space-y-3">
          


          
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground tracking-tight">
            בואו נדבר
          </h1>
          <p className="text-muted-foreground font-body text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            שאלה, בקשה או הערה — שלחו לנו הודעה ונחזור אליכם בהקדם האפשרי.
          </p>
        </Reveal>

        {/* Unique element — service promise badge */}
        <Reveal className="mt-6 flex justify-center" delay={80}>
          <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-card border border-border/70 shadow-sm">
            <span className="w-8 h-8 rounded-xl bg-mint/15 text-mint flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4.5 h-4.5" />
            </span>
            <span className="text-sm font-heading font-semibold text-foreground">
              הבטחת שירות: <span className="text-mint">נחזור אליכם תוך בהקדם.</span>
            </span>
          </div>
        </Reveal>

        {/* Two-column — form + contact methods */}
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-6 mt-10 items-start">
          {/* Form column */}
          <Reveal>
            <form
              onSubmit={handleSubmit}
              className="bg-card rounded-3xl border border-border/70 shadow-sm p-6 sm:p-7 space-y-5">
              
              <div className="space-y-1.5">
                <h2 className="text-xl font-heading font-bold text-foreground">שלחו לנו הודעה</h2>
                <p className="text-sm text-muted-foreground font-body">נשמח לעזור ולחזור אליכם בהקדם.</p>
              </div>

              {/* Sender (read-only — derived from the logged-in account, sent as p_mail) */}
              <div className="space-y-2">
                <label className="text-sm font-heading font-semibold text-foreground block">נשלח מ</label>
                <div className="w-full flex items-center gap-2.5 rounded-xl border border-primary/15 bg-primary/5 px-3.5 py-3 text-sm text-muted-foreground font-body">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span className="truncate">{contactEmail || "החשבון שלכם"}</span>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label className="text-sm font-heading font-semibold text-foreground block">
                  נושא <span className="text-muted-foreground font-body font-normal">({subjectText.length}/65)</span>
                </label>
                <input
                  type="text"
                  value={subjectText}
                  onChange={(e) => setSubjectText(e.target.value.slice(0, 65))}
                  maxLength={65}
                  placeholder="הקלידו נושא הפנייה"
                  disabled={sending}
                  className="w-full rounded-xl border border-primary/15 bg-primary/5 px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:bg-card focus:border-primary focus:ring-2 focus:ring-primary/40 focus:shadow-md focus:shadow-primary/10 transition-all font-body disabled:opacity-60" />
                
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-sm font-heading font-semibold text-foreground block">הודעה</label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={6}
                  placeholder="הקלידו את תוכן ההודעה"
                  disabled={sending}
                  className="w-full rounded-xl border border-primary/15 bg-primary/5 px-3.5 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:bg-card focus:border-primary focus:ring-2 focus:ring-primary/40 focus:shadow-md focus:shadow-primary/10 transition-all font-body resize-y disabled:opacity-60" />
                
              </div>

              {/* Alerts */}
              {success &&
              <div className="bg-chart-2/10 border border-chart-2/20 rounded-2xl p-3.5 flex items-center gap-2.5 text-chart-2 text-sm font-body">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  ההודעה נשלחה בהצלחה, תודה!
                </div>
              }
              {error &&
              <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-3.5 flex items-center gap-2.5 text-destructive text-sm font-body">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              }

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSend}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-primary text-primary-foreground text-sm font-heading font-semibold shadow-md shadow-primary/25 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all">
                
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                שלח הודעה
              </button>
            </form>
          </Reveal>

          {/* Contact methods column */}
          <Reveal delay={100}>
            <div className="space-y-4">
              <div className="space-y-1.5 px-1">
                <h2 className="text-xl font-heading font-bold text-foreground">דרכים נוספות</h2>
                <p className="text-sm text-muted-foreground font-body">מה חשוב לדעת לפני שפונים אלינו.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {CONTACT_METHODS.map((m) => {
                  const Icon = m.icon;
                  return (
                    <div
                      key={m.title}
                      className="group bg-card rounded-2xl border border-border/70 shadow-sm p-5 space-y-3 hover:shadow-md hover:border-primary/30 hover:-translate-y-1 transition-all duration-300">
                      
                      <span className={`inline-flex w-11 h-11 rounded-2xl items-center justify-center ${m.tint}`}>
                        <Icon className="w-5 h-5" />
                      </span>
                      <div className="space-y-1">
                        <p className="text-sm font-heading font-bold text-foreground">{m.title}</p>
                        <p className="text-xs text-muted-foreground font-body leading-relaxed">{m.desc}</p>
                      </div>
                    </div>);

                })}
              </div>

              {/* Inner promise card — reinforces response time */}
              <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-primary/8 to-mint/8 p-5 space-y-2">
                <div className="absolute -left-8 -bottom-8 w-28 h-28 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
                <div className="relative flex items-start gap-3">
                  <span className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </span>
                  <div>
                    <p className="text-sm font-heading font-bold text-foreground">מחויבים לזמן תגובה</p>
                    <p className="text-xs text-muted-foreground font-body leading-relaxed">
                      כל פנייה מטופלת בעדיפות — אם דחוף, ציינו זאת בנושא ההודעה.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Mini-FAQ accordion */}
        <Reveal className="mt-14">
          <div className="max-w-3xl mx-auto space-y-5">
            <div className="text-center space-y-2">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-muted border border-border text-foreground text-xs font-heading font-semibold tracking-wide">
                <HelpCircle className="w-3.5 h-3.5 text-primary" />
                שאלות נפוצות
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground tracking-tight">לפני שפונים אלינו</h2>
            </div>

            <div className="bg-card rounded-3xl border border-border/70 shadow-sm px-4 sm:px-6 py-2">
              <Accordion type="single" collapsible className="w-full">
                {FAQ_ITEMS.map((item, i) =>
                <AccordionItem key={i} value={`item-${i}`} className="border-border/60">
                    <AccordionTrigger className="text-right font-heading font-semibold text-foreground hover:no-underline py-5 text-base">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground font-body leading-relaxed pb-5">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>
          </div>
        </Reveal>
      </div>
    </div>);

}