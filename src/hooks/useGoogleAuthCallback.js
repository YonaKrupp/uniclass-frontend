import { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { appParams } from "@/lib/app-params";

const FUNCTIONS_BASE = "https://learn-le-connect.base44.app/api/apps/6a37f1517bf59551c5f4b6f9/functions";

// Module-level guard: prevents double-execution within the same page load
let _processingToken = null;

/**
 * Decodes a JWT token and extracts the email from its payload.
 * Returns null if the token is not a JWT or doesn't contain an email.
 */
function decodeJwtEmail(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    console.log("[GoogleAuthCallback] JWT payload keys:", Object.keys(payload));
    return payload.email || payload.Email || payload["preferred_username"] || payload.sub_email || null;
  } catch {
    return null;
  }
}

/**
 * Calls the getBase44UserEmail backend function with the token in the
 * Authorization header. The backend calls auth.me() server-side, completely
 * bypassing any browser cookies/cache that return a stale/old user.
 */
async function fetchEmailFromApi(token) {
  try {
    const res = await fetch(`${FUNCTIONS_BASE}/getBase44UserEmail`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    console.log("[GoogleAuthCallback] Backend getBase44UserEmail response:", JSON.stringify(data));
    return data?.email || null;
  } catch (err) {
    console.warn("[GoogleAuthCallback] Backend getBase44UserEmail failed:", err?.message || err);
    return null;
  }
}

/**
 * Detects a Base44 Google OAuth callback (token present from Google, possibly stale C# token),
 * fetches the user's email, authenticates against the C# backend via googleAuthProxy,
 * stores the C# token, and navigates to the home page.
 *
 * Uses client-side navigation (navigate) instead of window.location.href to avoid
 * a full page reload — this eliminates the "double load" and speeds up the transition.
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

      // Cross-reload guard: if we already initiated googleAuthProxy this session, skip.
      if (sessionStorage.getItem("googleAuthCallbackDone") === "true") {
        sessionStorage.removeItem("googleAuthLoading");
        setAuthLoading?.(false);
        return;
      }

      // appParams.token captures the access_token from the URL at module load time.
      const base44Token = appParams.token;

      // Only proceed if we have a Base44 token from Google OAuth (from URL only — never localStorage).
      if (!base44Token) {
        sessionStorage.removeItem("googleAuthLoading");
        setAuthLoading?.(false);
        return;
      }

      // Prevent double-execution within the same page load (hook may be on multiple pages)
      if (_processingToken === base44Token) {
        // Already processing this token — clear loading so user isn't stuck on spinner
        sessionStorage.removeItem("googleAuthLoading");
        setAuthLoading?.(false);
        return;
      }
      _processingToken = base44Token;

      // Mark callback as done early so a remount/reload doesn't re-trigger GoogleLogin
      sessionStorage.setItem("googleAuthCallbackDone", "true");

      // Clear ALL old auth data to prevent mixing users
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("userRole");
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("userData");
      // Clear StudentHome cache so stale data from a previous user is never displayed
      sessionStorage.removeItem("_studentHome_lastFetch");
      sessionStorage.removeItem("_studentHome_cachedData");
      sessionStorage.removeItem("_studentHome_cachedEmail");
      localStorage.removeItem("_studentHome_lastFetch");

      let email = null;

      // Method 1: Decode email directly from the JWT token — instant, no network call
      email = decodeJwtEmail(base44Token);
      console.log("[GoogleAuthCallback] JWT decoded email:", email);

      // Method 2: Direct API call — bypasses SDK caching entirely
      if (!email) {
        email = await fetchEmailFromApi(base44Token);
        console.log("[GoogleAuthCallback] Direct API email:", email);
      }

      // Method 3: Last resort — SDK's me() with setToken
      if (!email) {
        try {
          base44.auth.setToken(base44Token);
          const user = await base44.auth.me();
          email = user?.email;
          console.log("[GoogleAuthCallback] base44.auth.me() email:", email);
        } catch (err) {
          console.error("[GoogleAuthCallback] base44.auth.me() failed:", err?.message || err);
        }
      }

      if (!email) {
        sessionStorage.setItem("googleAuthMessage", "שגיאה: לא נמצא אימייל בחשבון Google. אנא נסו שוב.");
        sessionStorage.removeItem("googleAuthCallbackDone");
        sessionStorage.removeItem("googleAuthLoading");
        window.location.reload();
        return;
      }

      console.log("[GoogleAuthCallback] Calling googleAuthProxy with:", { userType, email });

      try {
        const res = await fetch(`${FUNCTIONS_BASE}/googleAuthProxy`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userType, email }),
        });
        const data = await res.json();
        console.log("[GoogleAuthCallback] googleAuthProxy response:", JSON.stringify(data));
        const token = data.accessToken || data.AccessToken || data.token || "";

        if (!token) {
          // User not found in C# DB — redirect to registration page with email pre-filled
          sessionStorage.removeItem("googleAuthCallbackDone");
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

        localStorage.setItem("userRole", userType);
        localStorage.setItem("authToken", token);
        localStorage.setItem("userData", JSON.stringify(data));
        sessionStorage.setItem("authToken", token);
        sessionStorage.setItem("userData", JSON.stringify(data));

        sessionStorage.removeItem("googleAuthLoading");
        console.log("[GoogleAuthCallback] Auth success, navigating to:", redirectPath, "email:", email);
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