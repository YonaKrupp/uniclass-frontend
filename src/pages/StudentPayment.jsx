import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CreditCard, Loader2, Calendar, Wallet, RotateCcw, ArrowRight, Timer } from "lucide-react";
import { base44 } from "@/api/base44Client";

const FUNCTIONS_BASE = "https://learn-le-connect.base44.app/api/apps/6a37f1517bf59551c5f4b6f9/functions";

const lessonsColumns = {
  dayInTheWeek: "יום",
  dateInTheMonth: "תאריך",
  startEndHoure: "שעה",
  subjectName: "מקצוע",
  techerName: "שם המורה",
  hourlyPayment: "תשלום לפי שעה",
};

const groupedColumns = {
  subjectName: "מקצוע",
  techerName: "שם המורה",
  lessonCount: "מספר שיעורים",
  unitPrice: "תשלום לפי שעה",
  totalPayment: "סה\"כ",
};

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function random6() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

const scrollHint = "\u2190 \u05d2\u05dc\u05d5\u05dc \u05dc\u05e8\u05d5\u05d7\u05d1 \u05dc\u05e6\u05e4\u05d9\u05d9\u05d4 \u05d1\u05db\u05dc \u05d4\u05e2\u05de\u05d5\u05d3\u05d5\u05ea \u2192";

export default function StudentPayment() {
  const [searchParams] = useSearchParams();
  const [authToken, setAuthToken] = useState(() => {
    const urlToken = searchParams.get("authToken") || "";
    if (urlToken) {
      localStorage.setItem("authToken", urlToken);
      sessionStorage.setItem("authToken", urlToken);
      return urlToken;
    }
    return localStorage.getItem("authToken") || sessionStorage.getItem("authToken") || "";
  });
  const userData = JSON.parse(localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}");
  const studentEmail = searchParams.get("studentEmail") || userData.studentEmail || userData.email || "";

  const [data, setData] = useState(null);
  const [orderNum] = useState(random6());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [backLoading, setBackLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(900);

  const navigate = useNavigate();

  const today = formatDate(new Date());

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    if (!studentEmail) { setLoading(false); return; }

    // Re-auth if token is missing (e.g., after HYP redirect cleared storage)
    let currentToken = authToken;
    if (!currentToken) {
      try {
        const creds = JSON.parse(sessionStorage.getItem("sessionCredentials") || "{}");
        if (creds.email && creds.password) {
          const res = await fetch(`${FUNCTIONS_BASE}/authProxy`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userType: creds.userType || "student", email: creds.email, password: creds.password }),
          }).then((r) => r.json());
          currentToken = res.accessToken || res.AccessToken || res.token || "";
          if (currentToken) {
            localStorage.setItem("authToken", currentToken);
            sessionStorage.setItem("authToken", currentToken);
            localStorage.setItem("userData", JSON.stringify(res));
            sessionStorage.setItem("userData", JSON.stringify(res));
            setAuthToken(currentToken);
          }
        }
      } catch (e) { /* ignore re-auth errors */ }
    }

    fetch(`${FUNCTIONS_BASE}/studentPaymentProxy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentEmail,
        random6: orderNum,
        date: today,
        token: currentToken,
      }),
    }).then(res => res.json())
      .then((res) => {
        setData(res);
      }).catch((err) => {
        setError(err.message || "שגיאה בטעינת נתונים");
      }).finally(() => {
        if (isRefresh) setRefreshing(false); else setLoading(false);
      });
  };

  useEffect(() => {
    const savedSp = JSON.parse(localStorage.getItem("scheduleParams") || "{}");
    const sp = {
      teacherEmail: searchParams.get("teacherEmail") || savedSp.teacherEmail || "",
      subjectId: searchParams.get("subjectId") || savedSp.subjectId || "",
      subjectName: searchParams.get("subjectName") || savedSp.subjectName || "",
      studentEmail: searchParams.get("studentEmail") || studentEmail || savedSp.studentEmail || "",
      firstDayOfWeek: searchParams.get("firstDayOfWeek") || savedSp.firstDayOfWeek || "",
    };
    if (sp.teacherEmail || sp.subjectId) {
      localStorage.setItem("scheduleParams", JSON.stringify(sp));
    }
    fetchData(false);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleBackToSchedule(1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  const lessonsList = data?.lessonsList ?? [];
  const lessonsGrouped = data?.lessonsGrouped ?? [];
  const totalRow = lessonsGrouped.find((g) => g.subjectName === 'סה"כ כללי');
  const totalAmount = totalRow?.totalPayment ?? 0;

  const handlePay = async () => {
    setPaying(true);
    setError("");
    try {
      if (!authToken) {
        setError("שגיאה: אין זהות משתמש. אנא התחברו מחדש.");
        setPaying(false);
        return;
      }

      localStorage.setItem("authToken", authToken);
      localStorage.setItem("userData", JSON.stringify(userData));

      // Build description and heshDesc from grouped lessons (excluding the total row)
      const groups = lessonsGrouped.filter((g) => g.subjectName !== 'סה"כ כללי');
      //const descriptionLAST = groups.map((g) => `${g.subjectName} - ${g.techerName} (${g.lessonCount} שיעורים)`).join(", ") || "תשלום שיעורים";
      const description = "תשלום שיעורים";
      const heshDesc = groups.map((g) => g.heshDesc).filter(Boolean).join("");

      const savedSp = JSON.parse(localStorage.getItem("scheduleParams") || "{}");
      const scheduleParams = {
        teacherEmail: searchParams.get("teacherEmail") || savedSp.teacherEmail || "",
        subjectId: searchParams.get("subjectId") || savedSp.subjectId || "",
        subjectName: searchParams.get("subjectName") || savedSp.subjectName || "",
        studentEmail: searchParams.get("studentEmail") || studentEmail || savedSp.studentEmail || "",
        firstDayOfWeek: searchParams.get("firstDayOfWeek") || savedSp.firstDayOfWeek || "",
      };
      const response = await base44.functions.invoke('hypPaymentProxy', {
        action: 'createPayment',
        token: authToken,
        amount: Number(totalAmount),
        order: orderNum,
        description,
        studentEmail,
        heshDesc,
        // Required by server model validation; C# fetches real values from DB by studentEmail
        clientName: studentEmail,
        clientLName: studentEmail,
        cell: studentEmail,
        studentMobile: studentEmail,
        scheduleParams,
      });

      if (response.data?._status === 401) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        setError("פג תוקף החיבור. אנא התחברו מחדש.");
        return;
      }

      if (response.data?.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        console.error("HYP payment response:", response.data);
        const rawError = response.data?.raw ? ` (תגובת HYP: ${response.data.raw})` : "";
        setError(response.data?.error ? `${response.data.error}${rawError}` : response.data?.raw || "שגיאה ביצירת קישור התשלום");
      }
    } catch (err) {
      setError(err.message || "שגיאה בתהליך התשלום");
    } finally {
      setPaying(false);
    }
  };

  const handleBackToSchedule = async (isTimerExpiredCancel = 0) => {
    setBackLoading(true);
    setError("");
    try {
      const res = await fetch(`${FUNCTIONS_BASE}/weekSlotsProxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "backToSchedule",
          token: authToken,
          studentEmail,
          isTimerExpiredCancel,
        }),
      }).then((r) => r.json());
    } catch (err) {
    } finally {
      setBackLoading(false);
      const savedSp = JSON.parse(localStorage.getItem("scheduleParams") || "{}");
      const teacherEmail = searchParams.get("teacherEmail") || savedSp.teacherEmail || "";
      const subjectId = searchParams.get("subjectId") || savedSp.subjectId || "";
      const subjectName = searchParams.get("subjectName") || savedSp.subjectName || "";
      const firstDayOfWeek = searchParams.get("firstDayOfWeek") || savedSp.firstDayOfWeek || "";
      const studentEmailVal = searchParams.get("studentEmail") || studentEmail || savedSp.studentEmail || "";
      const params = new URLSearchParams();
      if (teacherEmail) params.set("teacherEmail", teacherEmail);
      if (subjectId) params.set("subjectId", subjectId);
      if (subjectName) params.set("subjectName", subjectName);
      if (studentEmailVal) params.set("studentEmail", studentEmailVal);
      if (firstDayOfWeek) params.set("firstDayOfWeek", firstDayOfWeek);
      navigate(`/student-schedule?${params.toString()}`);
    }
  };

  return (
    <div dir="rtl" className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground flex items-center gap-2">
            <Wallet className="w-7 h-7 text-primary" />
            מעבר לתשלום
          </h1>
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
            title="רענן נתונים"
          >
            <RotateCcw className={`w-5 h-5 text-muted-foreground ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-muted-foreground font-body">סיכום שיעורים ותשלום</p>
        <div className={`flex items-center gap-2 text-sm font-heading font-semibold ${timeLeft <= 10 ? 'text-destructive' : 'text-primary'}`}>
          <Timer className="w-4 h-4" />
          <span>זמן לסיום הזמנה: {minutes}:{seconds}</span>
        </div>
        <button
          onClick={() => handleBackToSchedule(0)}
          disabled={backLoading}
          className="flex items-center gap-2 text-base text-primary hover:text-primary/80 font-heading font-semibold transition-colors disabled:opacity-50"
        >
          {backLoading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> טוען...</>
          ) : (
            <><ArrowRight className="w-5 h-5" /> חיזרו למסך שיעורים</>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-destructive text-sm font-body">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Lessons list */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-base font-heading font-semibold text-foreground">פרטי הזמנה</h2>
            </div>
            {lessonsList.length === 0 ? (
              <div className="px-5 py-10 text-center text-muted-foreground font-body text-sm">אין שיעורים לתשלום</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-body">
                    <thead>
                      <tr className="bg-muted/50 text-xs font-heading font-semibold text-muted-foreground">
                        {Object.keys(lessonsColumns).map((k) => (
                          <th key={k} className="px-4 py-2.5 text-center border-b border-border">{lessonsColumns[k]}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {lessonsList.map((lesson, i) => {
                        const isTotal = lesson.dayInTheWeek === 'סה"כ';
                        return (
                          <tr key={i} className={`hover:bg-muted/30 transition-colors ${isTotal ? "bg-primary/5 font-bold" : ""}`}>
                            {Object.keys(lessonsColumns).map((k) => (
                              <td key={k} className={`px-4 py-2.5 whitespace-nowrap text-center ${isTotal ? "text-primary" : "text-foreground"}`}>
                                {String(lesson[k] ?? "—")}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="md:hidden px-4 py-2 bg-muted/40 border-t border-border text-xs text-muted-foreground font-body text-center">
                  {scrollHint}
                </div>
              </>
            )}
          </div>

          {/* Grouped summary */}
          {lessonsGrouped.length > 0 && (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="text-base font-heading font-semibold text-foreground">סיכום הזמנה לפני תשלום</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-body">
                  <thead>
                    <tr className="bg-muted/50 text-xs font-heading font-semibold text-muted-foreground">
                      {Object.keys(groupedColumns).map((k) => (
                        <th key={k} className="px-4 py-2.5 text-center border-b border-border">{groupedColumns[k]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {lessonsGrouped.map((g, i) => {
                      const isTotal = g.subjectName === 'סה"כ כללי';
                      return (
                        <tr key={i} className={`hover:bg-muted/30 transition-colors ${isTotal ? "bg-primary/5 font-bold" : ""}`}>
                          {Object.keys(groupedColumns).map((k) => (
                            <td key={k} className={`px-4 py-2.5 whitespace-nowrap text-center ${isTotal ? "text-primary" : "text-foreground"}`}>
                              {String(g[k] ?? "—")}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden px-4 py-2 bg-muted/40 border-t border-border text-xs text-muted-foreground font-body text-center">
                {scrollHint}
              </div>
            </div>
          )}

          {/* Pay button */}
          {totalAmount > 0 && (
            <div className="flex justify-end">
              <button
                onClick={handlePay}
                disabled={paying}
                className="flex items-center gap-2 bg-primary text-primary-foreground font-heading font-semibold px-8 py-3 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {paying ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> מכין תשלום...</>
                ) : (
                  <><CreditCard className="w-5 h-5" /> שלם ₪{totalAmount}</>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}