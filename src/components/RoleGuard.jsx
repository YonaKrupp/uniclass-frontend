import React from "react";
import { Navigate } from "react-router-dom";

const ADMIN_EMAIL = "idanmichaly@gmail.com";

function readSession() {
  try {
    const userData = JSON.parse(
      localStorage.getItem("userData") || sessionStorage.getItem("userData") || "{}",
    );
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken") || "";
    const role = String(
      localStorage.getItem("userRole") ||
        sessionStorage.getItem("userRole") ||
        userData.userRole ||
        userData.UserRole ||
        "",
    ).toLowerCase();
    return { userData, token, role };
  } catch {
    return { userData: {}, token: "", role: "" };
  }
}

function emailFromToken(token) {
  try {
    const part = String(token).split(".")[1];
    if (!part) return "";
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(
      decodeURIComponent(
        atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4))
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      ),
    );
    return String(payload.email || payload.Email || payload.unique_name || "").toLowerCase();
  } catch {
    return "";
  }
}

/**
 * שומר נתיב לפי תפקיד. האכיפה האמיתית היא בשרת — זה מונע רק הצגת הממשק למי שאינו מורשה.
 * role="admin" — רק כתובת המנהל. role="teacher" — רק משתמש שהתחבר כמורה.
 */
export default function RoleGuard({ role, children }) {
  const { userData, token, role: storedRole } = readSession();

  if (!token) return <Navigate to="/login-choice" replace />;

  const email =
    emailFromToken(token) ||
    String(userData.teacherEmail || userData.studentEmail || userData.email || "").toLowerCase();

  if (role === "admin") {
    if (email !== ADMIN_EMAIL) return <Navigate to="/" replace />;
    return children;
  }

  const isTeacher = storedRole === "teacher" || Boolean(userData.teacherEmail);

  if (role === "teacher" && !isTeacher) return <Navigate to="/" replace />;
  if (role === "student" && isTeacher) return <Navigate to="/" replace />;

  return children;
}