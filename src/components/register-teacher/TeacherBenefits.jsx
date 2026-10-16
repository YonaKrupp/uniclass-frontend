import React from "react";
import { Wallet, Clock, CreditCard } from "lucide-react";

const benefits = [
  { icon: Wallet, text: "אפס עלות עד שמרוויחים" },
  { icon: Clock, text: "שעות גמישות" },
  { icon: CreditCard, text: "תשלום ישיר לחשבון" },
];

export default function TeacherBenefits() {
  return (
    <section aria-label="היתרונות שלנו" className="space-y-3">
      {benefits.map((benefit) => {
        const Icon = benefit.icon;
        return (
          <div
            key={benefit.text}
            className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3"
          >
            <span
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary shrink-0"
              aria-hidden="true"
            >
              <Icon className="w-4 h-4" />
            </span>
            <span className="text-base font-body text-foreground">{benefit.text}</span>
          </div>
        );
      })}
    </section>
  );
}