import React, { useState, useEffect } from "react";

export default function TeacherStickyCta({ targetId }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  const scrollToForm = () => {
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className={`md:hidden fixed bottom-0 inset-x-0 z-40 p-4 bg-background/95 backdrop-blur border-t border-border transition-transform duration-200 ${
        visible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <button
        type="button"
        onClick={scrollToForm}
        className="w-full min-h-[52px] rounded-xl bg-primary text-primary-foreground text-base font-heading font-semibold shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform"
      >
        הרשמה
      </button>
    </div>
  );
}