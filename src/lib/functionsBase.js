// Base44 function endpoint for this app, resolved for the environment that
// actually serves the page.
//
// The live app (the base44.app address and the custom domain) must call the
// published functions, but the editor preview runs on a Base44 sandbox that
// serves the current, not-yet-published version of the app — including its
// backend functions. Calling the page's own origin on Base44 hosts therefore
// keeps preview testing on the latest saved function, while every other
// address (the custom domain) keeps using the app's base44.app address.
const APP_ID = "6a37f1517bf59551c5f4b6f9";
const APP_FUNCTIONS_BASE = `https://learn-le-connect.base44.app/api/apps/${APP_ID}/functions`;

export function functionsBase() {
  if (typeof window === "undefined") return APP_FUNCTIONS_BASE;
  const host = window.location.hostname || "";
  return host.includes("base44")
    ? `${window.location.origin}/api/apps/${APP_ID}/functions`
    : APP_FUNCTIONS_BASE;
}

export const FUNCTIONS_BASE = functionsBase();