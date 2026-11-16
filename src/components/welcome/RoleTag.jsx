import React from "react";

const TONES = {
  teacher: "bg-primary/10 text-primary border-primary/20",
  student: "bg-mint/10 text-mint border-mint/20",
};

/** Small "למורים" / "לתלמידים" tag. */
export default function RoleTag({ role }) {
  const isTeacher = role === "teacher";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-body font-semibold ${
        isTeacher ? TONES.teacher : TONES.student
      }`}
    >
      {isTeacher ? "למורים" : "לתלמידים"}
    </span>
  );
}