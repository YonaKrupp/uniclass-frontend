// Single source of truth for which C# API this page talks to.
//
// The ngrok tunnel belongs to the developer's own machine, so it is used ONLY
// when the page itself runs on a local development address. Every deployed
// address — the Base44 domain (preview and published) and the custom domain —
// talks to the production server, so real visitors never reach a laptop.
export const NGROK_API_BASE = "https://hacking-frighten-dandy.ngrok-free.dev";
export const PRODUCTION_API_BASE = "http://corewebapi-env.il-central-1.elasticbeanstalk.com";

const LOCAL_DEV_HOSTS = ["localhost", "127.0.0.1"];

export function resolveApiBase() {
  if (typeof window === "undefined") return PRODUCTION_API_BASE;
  const host = window.location.hostname || "";
  return LOCAL_DEV_HOSTS.some((local) => host.includes(local)) ? NGROK_API_BASE : PRODUCTION_API_BASE;
}