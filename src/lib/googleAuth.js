import { base44 } from "@/api/base44Client";
import { clearFetchGuard } from "@/lib/fetchGuard";

let _cachedClientId = null;

/**
 * Fetches the Google OAuth client_id from the googleOAuthExchange backend
 * function (config mode). The client_id is public/safe to expose in the
 * browser; only the secret stays server-side.
 */
async function getClientId() {
  if (_cachedClientId) return _cachedClientId;
  try {
    const response = await base44.functions.invoke("googleOAuthExchange", { action: "config" });
    const data = response?.data || {};
    _cachedClientId = data.clientId || "";
  } catch (err) {
    console.error("[googleAuth] failed to fetch Google client id:", err);
    _cachedClientId = "";
  }
  return _cachedClientId;
}

/**
 * Clears all old auth tokens and initiates an INDEPENDENT Google OAuth flow.
 *
 * This does NOT use Base44's OAuth / loginWithProvider, so it works on any
 * hosting domain (e.g. www.uniclass.co.il on AWS) without registering the
 * domain in Base44 — no "Domain is not valid" error.
 *
 * Flow: redirect to Google consent → Google returns to the current page with
 * ?code= → useGoogleAuthCallback exchanges the code (via googleOAuthExchange)
 * for a C# auth token and navigates into the app.
 *
 * @param {string} _returnPath - kept for call-site compatibility; unused. The
 *   useGoogleAuthCallback hook mounted on the current page decides the final
 *   destination.
 */
export async function initiateGoogleLogin(_returnPath) {
  // Clear ALL storage — C# tokens, Base44 tokens, user data
  localStorage.removeItem("authToken");
  localStorage.removeItem("userData");
  localStorage.removeItem("userRole");
  sessionStorage.removeItem("authToken");
  sessionStorage.removeItem("userData");
  localStorage.removeItem("base44_access_token");
  localStorage.removeItem("base44_token");
  localStorage.removeItem("token");
  sessionStorage.removeItem("googleAuthCallbackDone");
  sessionStorage.removeItem("googleAuthMessage");
  sessionStorage.removeItem("googleAuthEmail");
  // Clear StudentHome cache so the old user's data isn't shown after switching accounts
  sessionStorage.removeItem("_studentHome_lastFetch");
  sessionStorage.removeItem("_studentHome_cachedData");
  sessionStorage.removeItem("_studentHome_cachedEmail");
  localStorage.removeItem("_studentHome_lastFetch");
  clearFetchGuard();

  // Clear ALL cookies on this domain — a stale Google session cookie could
  // make Google return the OLD user's account even after picking a different one.
  document.cookie.split(";").forEach(function (c) {
    const eqPos = c.indexOf("=");
    const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim();
    if (name) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=${window.location.hostname}`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    }
  });

  const clientId = await getClientId();
  if (!clientId) {
    sessionStorage.setItem("googleAuthMessage", "התחברות Google אינה מוגדרת כעת בשרת. אנא פנה למנהל המערכת.");
    window.location.reload();
    return;
  }

  // redirect_uri MUST exactly match an authorized redirect URI registered in
  // Google Cloud Console, and must be IDENTICAL in both the authorize request
  // (here) and the token exchange (useGoogleAuthCallback). S3 static hosting
  // 301-redirects SPA routes to add a trailing slash, so we normalize pathname
  // (strip trailing slash) to keep the URI stable across the two steps.
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  const redirectUri = window.location.origin + path;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account",
  });

  console.log("[googleAuth] Starting independent Google OAuth. redirect_uri:", redirectUri);
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}