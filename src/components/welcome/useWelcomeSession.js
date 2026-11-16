import { useState, useEffect } from "react";

/**
 * Reads the existing session the app already stores (no auth changes):
 * localStorage/sessionStorage "authToken" + "userRole".
 */
export function useWelcomeSession() {
  const [session, setSession] = useState({ isLoggedIn: false, role: "" });

  useEffect(() => {
    const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    const role = localStorage.getItem("userRole") || "";
    if (token && (role === "teacher" || role === "student")) {
      setSession({ isLoggedIn: true, role });
    }
  }, []);

  return {
    ...session,
    dashboardPath: session.role === "teacher" ? "/teacher-home" : "/student-home",
  };
}