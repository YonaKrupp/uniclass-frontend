import React from "react";
import { Link } from "react-router-dom";

const VARIANTS = {
  teacher: "wl-btn-teacher",
  student: "wl-btn-student",
  white: "wl-btn-white",
  outline: "wl-btn-outline",
};

const SIZES = {
  sm: "px-4 py-2.5 text-sm",
  md: "px-6 py-3.5 text-sm md:text-base",
  lg: "px-7 py-4 text-base",
};

/** Landing button that keeps the role colour system: green = student, purple = teacher. */
export default function WButton({ to, variant = "teacher", size = "md", className = "", children, ...rest }) {
  return (
    <Link to={to} className={`wl-btn ${VARIANTS[variant]} ${SIZES[size]} ${className}`} {...rest}>
      {children}
    </Link>
  );
}