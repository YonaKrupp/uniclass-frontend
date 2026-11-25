import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

const REDIRECT_SECONDS = 3;

export default function StudentWelcome() {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    const timeout = setTimeout(() => {
      navigate("/student-home", { replace: true });
    }, REDIRECT_SECONDS * 1000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div dir="rtl" className="relative min-h-screen bg-background flex items-center justify-center px-4 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-app-halo" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-mint/10 rounded-full blur-3xl animate-app-halo-slow" />
      </div>

      <div className="relative z-10 w-full max-w-md text-center app-fade-up">
        <div className="mx-auto mb-6 w-24 h-24 rounded-full bg-mint/15 flex items-center justify-center">
          <CheckCircle2 className="w-14 h-14 text-mint" aria-hidden="true" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
          תודה שנרשמת!
        </h1>
        <p className="mt-3 text-base font-body text-muted-foreground leading-relaxed">
          החשבון שלך נוצר בהצלחה. אפשר להתחיל לבחור מורים ולקבוע שיעורים.
        </p>

        <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-card border border-border px-5 py-2.5 text-sm font-body text-muted-foreground shadow-sm">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" aria-hidden="true" />
          מעבירים אותך לדף הבית בעוד {secondsLeft} שניות
        </div>
      </div>
    </div>
  );
}