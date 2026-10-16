import React, { useEffect, useState } from "react";

/**
 * MobileStickyCta — a floating "save my spot" button, mobile only (<768px).
 * Appears once the user scrolls past the hero and hides again while the
 * registration form is on screen, so it never covers the form.
 */
export default function MobileStickyCta() {
  const [pastHero, setPastHero] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(true);

  // Stay out of the way while the cookie banner still occupies the bottom edge.
  useEffect(() => {
    try {
      setBannerDismissed(!!localStorage.getItem("uniclass_cookie_consent"));
    } catch {
      setBannerDismissed(false);
    }
    const onConsent = () => setBannerDismissed(true);
    window.addEventListener("uniclass-consent-change", onConsent);
    return () => window.removeEventListener("uniclass-consent-change", onConsent);
  }, []);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const target = document.getElementById("register");
    if (!target || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setFormVisible(entry.isIntersecting),
      { threshold: 0.12 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const show = pastHero && !formVisible && bannerDismissed;

  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 transition-all duration-300 ${show ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"}`}
    >
      <button
        type="button"
        tabIndex={show ? 0 : -1}
        aria-hidden={!show}
        onClick={() => document.getElementById("register")?.scrollIntoView({ behavior: "smooth" })}
        className="w-full py-3.5 bg-primary text-primary-foreground rounded-full text-base font-body font-semibold shadow-lg shadow-primary/25 min-h-[52px]"
      >
        שמרו לי מקום בפיילוט
      </button>
    </div>
  );
}