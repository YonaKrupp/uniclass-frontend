// Single source of truth for which C# API this page talks to.
//
// The tunnel belongs to the developer's own machine, so it is used ONLY for the
// Base44 builder/preview (and local development). Every address on the real
// domain — uniclass.co.il with or without www — talks to the production server,
// so real visitors never reach a laptop.
//
// The pilot registration form sends this value to its backend proxy, which
// honours it (production always wins), so the page the visitor is on decides
// which server their registration is written to.
export const NGROK_API_BASE = "https://hacking-frighten-dandy.ngrok-free.dev";
export const PRODUCTION_API_BASE = "http://corewebapi-env.il-central-1.elasticbeanstalk.com";

const LOCAL_DEV_HOSTS = ["localhost", "127.0.0.1"];

export function resolveApiBase() {
  if (typeof window === "undefined") return PRODUCTION_API_BASE;
  const host = window.location.hostname || "";
  return LOCAL_DEV_HOSTS.some((local) => host.includes(local)) ? NGROK_API_BASE : PRODUCTION_API_BASE;
}