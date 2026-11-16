import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Compass, Home } from "lucide-react";

export default function PageNotFound() {
  const location = useLocation();

  // דף 404 אמיתי — קרולרים מקבלים סטטוס 404 ולא עמוד עם תוכן.
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "prerender-status-code";
    meta.content = "404";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-background flex items-center justify-center px-4 py-16"
    >
      <div className="relative w-full max-w-lg text-center">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 left-0 w-72 h-72 bg-mint/5 rounded-full blur-3xl" />
        </div>

        <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-2xl flex items-center justify-center">
          <Compass className="w-8 h-8 text-primary" />
        </div>

        <p className="font-heading font-bold text-6xl sm:text-7xl text-muted-foreground/40 leading-none">404</p>
        <h1 className="mt-4 text-2xl sm:text-3xl font-heading font-bold text-foreground">הדף לא נמצא</h1>
        <p className="mt-3 text-muted-foreground font-body leading-relaxed">
          ייתכן שהקישור שגוי או שהדף הועבר למקום אחר.
        </p>
        <p className="mt-1 text-sm text-muted-foreground font-body break-all" dir="ltr">
          {location.pathname}
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 rounded-full bg-primary text-primary-foreground font-heading font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all min-h-[48px]"
          >
            <Home className="w-5 h-5" />
            חזרה לדף הראשי
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 rounded-full bg-card border border-border text-foreground font-heading font-semibold hover:border-primary/40 hover:text-primary transition-all min-h-[48px]"
          >
            חזרה לעמוד הקודם
          </button>
        </div>
      </div>
    </div>
  );
}