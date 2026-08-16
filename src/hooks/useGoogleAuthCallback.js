import { useEffect } from "react";
import { base44 } from "@/api/base44Client";

// Module-level guard: prevents double-execution within the same page load
let _processingCode = null;

function getUrlParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/**
 * Handles the INDEPENDENT Google OAuth callback: detects ?code= on the current
 * page (returned by Google), exchanges it for a C# auth token via the
 * googleOAuthExchange backend function, stores the token, and navigates to the
 * app home page.
 *
 * @param {string} userType - "teacher" or "student"
 * @param {string} redirectPath - where to navigate after successful C# auth (e.g. "/teacher-home")
 * @param {function} navigate - React Router navigate function (from useNavigate)
 * @param {function} setAuthLoading - state setter to control the loading overlay
 */
export function useGoogleAuthCallback(userType, redirectPath, navigate, setAuthLoading) {
  useEffect(() => {
    // Safety timeout: if processing takes too long, clear loading so user isn't stuck on spinner
    const safetyTimeout = setTimeout(() => {
      sessionStorage.removeItem("googleAuthLoading");
      setAuthLoading?.(false);
    }, 15000);

    const handleCallback = async () => {
      // If we already have a C# authToken, the Google login already completed — skip.
      const existingAuthToken = localStorage.getItem("authToken");
      if (existingAuthToken) {
        sessionStorage.removeItem("googleAuthLoading");
        setAuthLoading?.(false);
        return;
      }

      // Cross-reload guard: if we already initiated the exchange this session, skip.
      if (sessionStorage.getItem("googleAuthCallbackDone") === "true") {
        sessionStorage.removeItem("googleAuthLoading");
        setAuthLoading?.(false);
        return;
      }

      const code = getUrlParam("code");

      // Only proceed if we have a Google authorization code in the URL.
      if (!code) {
        sessionStorage.removeItem("googleAuthLoading");
        setAuthLoading?.(false);
        return;
      }

      // Prevent double-execution within the same page load (hook may be on multiple pages)
      if (_processingCode === code) {
        sessionStorage.removeItem("googleAuthLoading");
        setAuthLoading?.(false);
        return;
      }
      _processingCode = code;

      // Mark callback as done early so a remount/reload doesn't re-trigger
      sessionStorage.setItem("googleAuthCallbackDone", "true");

      // Clear ALL old auth data to prevent mixing users
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("userRole");
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("userData");
      sessionStorage.removeItem("_studentHome_lastFetch");
      sessionStorage.removeItem("_studentHome_cachedData");
      sessionStorage.removeItem("_studentHome_cachedEmail");
      localStorage.removeItem("_studentHome_lastFetch");

      // redirect_uri MUST match the one used in the initial authorize request
      // (normalized: trailing slash stripped, since S3 adds one on the return).
      const path = window.location.pathname.replace(/\/+$/, "") || "/";
      const redirectUri = window.location.origin + path;

      console.log("[GoogleAuthCallback] Exchanging code for C# token:", { userType, redirectUri });

      try {
        const response = await base44.functions.invoke("googleOAuthExchange", {
          code,
          redirectUri,
          userType,
        });
        const data = response?.data || {};
        console.log("[GoogleAuthCallback] googleOAuthExchange response:", JSON.stringify(data));
        const token = data.accessToken || data.AccessToken || data.token || "";

        if (!token) {
          const email = data.email || "";
          // User not found in C# DB — redirect to registration page with email pre-filled
          if (email) {
            sessionStorage.setItem("googleAuthEmail", email);
            sessionStorage.setItem(
              "googleAuthMessage",
              "לא נמצא חשבון לאימייל זה. אנא השלימו את הרישום (כולל בחירת סיסמה) כדי להמשיך."
            );
            sessionStorage.removeItem("googleAuthLoading");
            const registerPath = userType === "teacher" ? "/register-teacher" : "/register-student";
            navigate(registerPath, { replace: true });
            return;
          }
          // Other error (e.g. code exchange failed, no email returned)
          sessionStorage.setItem(
            "googleAuthMessage",
            data.error || "הכניסה עם Google נכשלה. אנא נסו שוב."
          );
          sessionStorage.removeItem("googleAuthCallbackDone");
          sessionStorage.removeItem("googleAuthLoading");
          window.location.reload();
          return;
        }

        localStorage.setItem("userRole", userType);
        localStorage.setItem("authToken", token);
        localStorage.setItem("userData", JSON.stringify(data));
        sessionStorage.setItem("authToken", token);
        sessionStorage.setItem("userData", JSON.stringify(data));

        sessionStorage.removeItem("googleAuthLoading");
        console.log("[GoogleAuthCallback] Auth success, navigating to:", redirectPath);
        navigate(redirectPath, { replace: true });
      } catch (err) {
        console.error("[GoogleAuthCallback] Error:", err);
        sessionStorage.setItem("googleAuthMessage", "הכניסה עם Google נכשלה. אנא נסו שוב.");
        sessionStorage.removeItem("googleAuthCallbackDone");
        sessionStorage.removeItem("googleAuthLoading");
        window.location.reload();
      }
    };
    handleCallback();
    return () => clearTimeout(safetyTimeout);
  }, []);
}