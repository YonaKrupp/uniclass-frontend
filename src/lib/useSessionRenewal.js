import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { clearFetchGuard } from "@/lib/fetchGuard";

const API_BASE = "https://learn-le-connect.base44.app/api/apps/6a37f1517bf59551c5f4b6f9/functions";

// Set by ClassRoom when a video room is actively connected.
window.__uniclassVideoActive = false;
let isVideoActive = () => !!window.__uniclassVideoActive;
export const setVideoActive = (active) => { window.__uniclassVideoActive = !!active; };

// Prevent repeated logout/redirect from the interval firing multiple times
let handlingLogout = false;

// Renew token if it expires within this many minutes
const RENEW_BUFFER_MINUTES = 30;
// Check interval
const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

function getStoredData() {
  const userDataStr = localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}";
  return {
    userData: JSON.parse(userDataStr),
    authToken: localStorage.getItem("authToken") || sessionStorage.getItem("authToken") || "",
  };
}

function getExpiryDate(userData) {
  const expiresAt = userData.expiresAt || userData.ExpiresAt;
  if (!expiresAt) return null;
  const date = new Date(expiresAt);
  return isNaN(date.getTime()) ? null : date;
}

function getRefreshToken(userData) {
  return userData.refreshToken || userData.RefreshToken || "";
}

function updateStoredToken(data) {
  const newToken = data.accessToken || data.AccessToken || data.token || "";
  if (!newToken) return;

  // Merge new token data into existing userData
  const existingStr = localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}";
  const existing = JSON.parse(existingStr);
  const merged = { ...existing, ...data };

  localStorage.setItem("authToken", newToken);
  localStorage.setItem("userData", JSON.stringify(merged));
  sessionStorage.setItem("authToken", newToken);
  sessionStorage.setItem("userData", JSON.stringify(merged));
  console.log("[SessionRenewal] Token refreshed, expires:", data.expiresAt || data.ExpiresAt);
}

function handleSessionExpired() {
  if (handlingLogout) return;

  // Don't interrupt an active video lesson — just notify the user.
  if (isVideoActive()) {
    toast.error("פג תוקף החיבור. לאחר סיום השיעור, התנתקו והתחברו מחדש.", { duration: 8000 });
    return;
  }

  handlingLogout = true;
  localStorage.removeItem("userRole");
  localStorage.removeItem("authToken");
  localStorage.removeItem("userData");
  sessionStorage.removeItem("authToken");
  sessionStorage.removeItem("userData");
  sessionStorage.removeItem("sessionCredentials");
  clearFetchGuard();

  toast.error("פג תוקף החיבור. אנא התחברו מחדש.", { duration: 4000 });
  setTimeout(() => { window.location.href = "/"; }, 1200);
}

async function refreshSession() {
  const { userData, authToken } = getStoredData();

  if (!authToken) return false;

  const expiry = getExpiryDate(userData);
  if (expiry) {
    const now = new Date();
    const buffer = new Date(expiry.getTime() - RENEW_BUFFER_MINUTES * 60 * 1000);
    if (now < buffer) {
      // Token still has plenty of life — no need to refresh
      return true;
    }
    // Token is about to expire — try to refresh
  } else {
    // Expiry date unknown (e.g. C# API returned a format we can't parse).
    // Don't try to refresh on every page load — the token is likely valid
    // (just logged in) and an aggressive refresh can log the user out.
    // API calls from the page itself will fail naturally if the token is bad.
    return true;
  }

  const refreshToken = getRefreshToken(userData);
  if (!refreshToken) {
    console.warn("[SessionRenewal] No refresh token available — cannot refresh silently");
    return false;
  }

  try {
    const res = await fetch(`${API_BASE}/refreshTokenProxy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json();

    // Only log out on a definitive 401 — the refresh token is actually invalid.
    // Don't log out on generic success:false/error (may be a transient issue).
    if (data._status === 401) {
      console.warn("[SessionRenewal] Refresh token invalid (401)");
      handleSessionExpired();
      return false;
    }

    updateStoredToken(data);
    return true;
  } catch (err) {
    console.error("[SessionRenewal] Refresh error:", err.message);
    return false;
  }
}

export function useSessionRenewal() {
  const refreshingRef = useRef(false);

  useEffect(() => {
    const checkAndRefresh = async () => {
      if (refreshingRef.current) return;
      refreshingRef.current = true;
      try {
        await refreshSession();
      } finally {
        refreshingRef.current = false;
      }
    };

    // Check on mount
    checkAndRefresh();

    // Check periodically
    const interval = setInterval(checkAndRefresh, CHECK_INTERVAL_MS);

    // Check when user returns to the tab
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        checkAndRefresh();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);
}