import { base44 } from "@/api/base44Client";
import { clearFetchGuard } from "@/lib/fetchGuard";

/**
 * Clears all old auth tokens and initiates Google OAuth login.
 * Clearing old tokens ensures users can switch between Google accounts
 * (otherwise stale C#/Base44 tokens interfere with the new callback).
 */
export function initiateGoogleLogin(redirectPath) {
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
  // NOTE: Do NOT clear googleAuthLoading here — it must survive the Google redirect
  // so the login page can show the loading spinner when returning from Google.
  // useGoogleAuthCallback clears it when done (or on error/no-token).
  // Clear StudentHome cache so the old user's data isn't shown after switching accounts
  sessionStorage.removeItem("_studentHome_lastFetch");
  sessionStorage.removeItem("_studentHome_cachedData");
  sessionStorage.removeItem("_studentHome_cachedEmail");
  localStorage.removeItem("_studentHome_lastFetch");
  // Clear fetch guard so the new user's pages can fetch fresh data
  clearFetchGuard();

  // Clear ALL cookies on this domain — Base44 may cache the previous Google
  // OAuth session in a cookie, causing it to return the OLD user's token
  // even after the user picks a different Google account.
  document.cookie.split(";").forEach(function (c) {
    const eqPos = c.indexOf("=");
    const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim();
    if (name) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=${window.location.hostname}`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    }
  });

  console.log("[googleAuth] All tokens and cookies cleared, starting Google OAuth");
  base44.auth.loginWithProvider("google", redirectPath);
}