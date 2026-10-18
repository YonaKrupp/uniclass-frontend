// Single source of truth for which C# API this page talks to.
// Base44 (builder / preview) → the local ngrok tunnel; anywhere else → production.
export const NGROK_API_BASE = "https://hacking-frighten-dandy.ngrok-free.dev";
export const PRODUCTION_API_BASE = "http://corewebapi-env.il-central-1.elasticbeanstalk.com";

export function resolveApiBase() {
  if (typeof window === "undefined") return PRODUCTION_API_BASE;
  const host = window.location.hostname || "";
  return host.includes("base44") ? NGROK_API_BASE : PRODUCTION_API_BASE;
}