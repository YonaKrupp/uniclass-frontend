import React from "react";
import { Timer, ShieldAlert } from "lucide-react";
import { formatCountdown, MAX_LOGIN_ATTEMPTS } from "@/lib/loginAttempts";

/**
 * מציג שעון ספירה לאחור כשההתחברות נעולה, ואת מספר הניסיונות שנותרו לאחר כישלון.
 */
export default function LoginAttemptsNotice({ lockSeconds = 0, remainingAttempts = null }) {
  if (lockSeconds > 0) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-center space-y-1"
      >
        <p className="flex items-center justify-center gap-1.5 text-sm font-heading font-medium text-destructive">
          <Timer className="w-4 h-4" aria-hidden="true" />
          ניתן לנסות שוב בעוד
        </p>
        <p dir="ltr" className="text-2xl font-mono font-bold tabular-nums text-destructive">
          {formatCountdown(lockSeconds)}
        </p>
      </div>
    );
  }

  if (remainingAttempts === null || remainingAttempts === undefined) return null;

  const used = Math.max(0, MAX_LOGIN_ATTEMPTS - remainingAttempts);

  return (
    <div role="status" aria-live="polite" className="rounded-xl border border-border bg-muted/50 p-3 space-y-2">
      <p className="flex items-center justify-center gap-1.5 text-sm font-body text-foreground">
        <ShieldAlert className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        נותרו <span className="font-heading font-semibold">{remainingAttempts}</span> מתוך {MAX_LOGIN_ATTEMPTS} ניסיונות התחברות
      </p>
      <div className="flex gap-1" aria-hidden="true">
        {Array.from({ length: MAX_LOGIN_ATTEMPTS }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < used ? "bg-destructive/60" : "bg-muted-foreground/25"}`}
          />
        ))}
      </div>
    </div>
  );
}