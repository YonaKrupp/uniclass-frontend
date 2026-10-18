import React from "react";
import { resolveApiBase } from "@/lib/apiBase";

const PILOT_PATH = "/api/Pilot/insert_pilot";

export default function PilotApiLink() {
  const url = `${resolveApiBase()}${PILOT_PATH}`;

  return (
    <div className="app-fade-up mb-6 md:mb-10 rounded-xl border border-border bg-card px-4 py-3 shadow-sm" style={{ animationDelay: "0.21s" }}>
      <p className="text-xs font-body text-muted-foreground mb-1">
        כתובת ה-API שאליה נשלח טופס "שמרו לי מקום":
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        dir="ltr"
        className="block font-mono text-xs md:text-sm text-primary underline underline-offset-2 break-all"
      >
        {url}
      </a>
    </div>
  );
}