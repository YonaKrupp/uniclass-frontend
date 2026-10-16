import React from "react";

const steps = [
  "נרשמים בחינם בכמה שניות",
  "מגדירים מקצועות, מחיר וזמינות",
  "מקבלים תלמידים ומתחילים ללמד",
];

export default function TeacherHowItWorks() {
  return (
    <section aria-labelledby="teacher-how-title" className="space-y-4">
      <h2 id="teacher-how-title" className="text-xl font-heading font-bold text-foreground">
        איך זה עובד
      </h2>
      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li key={step} className="flex items-start gap-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-heading font-bold shrink-0">
              {index + 1}
            </span>
            <span className="text-base font-body text-foreground pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}