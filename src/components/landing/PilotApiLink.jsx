import React from "react";

// Same rule the backend resolver uses: Base44 (builder/preview) talks to the
// ngrok tunnel, any other domain (uniclass.co.il) talks to the production API.
const NGROK_BASE = "https://hacking-frighten-dandy.ngrok-free.dev";
const PRODUCTION_BASE = "http://corewebapi-env.il-central-1.elasticbeanstalk.com";
const PILOT_PATH = "/api/Pilot/insert_pilot";

function resolveApiUrl() {
  const host = typeof window === "undefined" ? "" : window.location.hostname || "";
  const base = host.includes("base44") ? NGROK_BASE : PRODUCTION_BASE;
  return `${base}${PILOT_PATH}`;
}

export default function PilotApiLink() {
  const url = resolveApiUrl();

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