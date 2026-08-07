import React from "react";
import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";
// No Base44 auth calls on this page - fully static

export default function PaymentFailed() {
  const params = new URLSearchParams(window.location.search);
  const hypParams = {};
  params.forEach((v, k) => { hypParams[k] = v; });

  const action = hypParams.Action || hypParams.action || "";
  const isCancelled = action.toLowerCase().includes("cancel");
  const errorMessage = hypParams.ErrorMessage || hypParams.error || "";

  return (
    <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border p-8 max-w-md w-full text-center space-y-4">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-foreground">
          {isCancelled ? "התשלום בוטל" : "התשלום נכשל"}
        </h1>
        <p className="text-muted-foreground font-body">
          {isCancelled ? "ביטלת את העסקה." : "העסקה לא הושלמה. ניתן לנסות שוב."}
        </p>
        {errorMessage && (
          <p className="text-sm text-destructive font-body bg-destructive/5 rounded-lg p-2">
            {errorMessage}
          </p>
        )}
        <Link to="/student-home" className="inline-block bg-primary text-primary-foreground font-heading font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors">
          חזרה לאזור התלמיד
        </Link>
      </div>
    </div>
  );
}