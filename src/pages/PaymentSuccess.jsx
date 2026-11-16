import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { trackGaEvent } from "@/lib/gtagEvents";

export default function PaymentSuccess() {
  const [verifyState, setVerifyState] = useState("idle"); // idle | verifying | done
  const [verifyResult, setVerifyResult] = useState(null);
  const [urlParams, setUrlParams] = useState({});
  const [scheduleParams, setScheduleParams] = useState({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const all = {};
    for (const [key, value] of params.entries()) {
      all[key] = value;
    }
    setUrlParams(all);
    try {
      setScheduleParams(JSON.parse(localStorage.getItem("scheduleParams") || "{}"));
    } catch {}

    const authToken = localStorage.getItem("authToken") || "";

    // Don't call verify if no HYP params present
    if (!all.Id && !all.Order && !all.Sign) {
      setVerifyState("done");
      return;
    }

    setVerifyState("verifying");
    base44.functions
      .invoke("hypPaymentProxy", {
        action: "verifyPayment",
        token: authToken,
        verifyParams: all,
      })
      .then((res) => {
        setVerifyResult(res.data || {});
      })
      .catch((err) => {
        setVerifyResult({ error: err.message });
      })
      .finally(() => setVerifyState("done"));
  }, []);

  const transactionId = urlParams.Id || urlParams.id || verifyResult?.transactionId || "";
  const orderId = urlParams.Order || urlParams.order || "";
  const ccode = urlParams.CCode || urlParams.ccode || "";
  const isSuccess = ccode === "0" || ccode === "600" || ccode === "700" || ccode === "800";
  const wixOrderId = urlParams.orderId || urlParams.checkoutId || "";

  // GA4 purchase — sent once, only after the payment itself was confirmed.
  // (HYP approval code, or a Wix checkout return with its order/checkout id.)
  const purchaseTracked = useRef(false);
  useEffect(() => {
    if (purchaseTracked.current) return;
    if (!isSuccess && !wixOrderId) return;

    let storedValue;
    try {
      storedValue = JSON.parse(sessionStorage.getItem("lastCheckoutAmount") || "null")?.value;
    } catch {
      storedValue = undefined;
    }
    const amount = Number(urlParams.Amount ?? urlParams.amount ?? storedValue);
    const txId = transactionId || wixOrderId || orderId;

    purchaseTracked.current = true;
    trackGaEvent("purchase", {
      value: Number.isFinite(amount) ? amount : 0,
      currency: "ILS",
      transaction_id: String(txId || ""),
    });
  }, [isSuccess, wixOrderId, transactionId, orderId, urlParams]);

  const scheduleUrl = (() => {
    const p = new URLSearchParams();
    if (scheduleParams.teacherEmail) p.set("teacherEmail", scheduleParams.teacherEmail);
    if (scheduleParams.studentEmail) p.set("studentEmail", scheduleParams.studentEmail);
    if (scheduleParams.firstDayOfWeek) p.set("firstDayOfWeek", scheduleParams.firstDayOfWeek);
    if (scheduleParams.subjectId) p.set("subjectId", scheduleParams.subjectId);
    return `/student-schedule?${p.toString()}`;
  })();

  return (
    <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border p-8 max-w-md w-full text-center space-y-4">
        {isSuccess ? (
          <>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-foreground">התשלום בוצע בהצלחה!</h1>
            <p className="text-muted-foreground font-body">תודה על רכישתכם</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-foreground">שגיאה בתשלום</h1>
            <p className="text-muted-foreground font-body text-sm">התשלום לא הצליח, אנא צרו קשר עם התמיכה.</p>
          </>
        )}

        {transactionId && (
          <p className="text-base font-body text-foreground">
            אסמכתה: <span className="font-bold text-primary">{transactionId}</span>
          </p>
        )}
        {orderId && (
          <p className="text-sm text-muted-foreground font-body">מספר הזמנה: {orderId}</p>
        )}

        {verifyState === "verifying" && (
          <p className="text-xs text-muted-foreground font-body flex items-center justify-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            מאמת עסקה מול HYP...
          </p>
        )}
        {verifyState === "done" && verifyResult?.isValid === false && (
          <p className="text-xs text-muted-foreground font-body">
            אימות HYP: נכשל{verifyResult?.error ? ` — ${verifyResult.error}` : ""}
          </p>
        )}
        {verifyState === "done" && verifyResult?.isValid === true && (
          <p className="text-xs text-green-600 font-body">אימות HYP: אושר ✓</p>
        )}

        {isSuccess && (
          <Link
            to={scheduleUrl}
            className="inline-block bg-primary text-primary-foreground font-heading font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors"
          >
            מעבר ללוח השעות
          </Link>
        )}
      </div>
    </div>
  );
}