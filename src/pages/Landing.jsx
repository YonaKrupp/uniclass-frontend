import React from "react";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingHero from "@/components/landing/LandingHero";
import LandingAbout from "@/components/landing/LandingAbout";
import LandingStats from "@/components/landing/LandingStats";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingHowItWorks from "@/components/landing/LandingHowItWorks";
import LandingCTA from "@/components/landing/LandingCTA";
import LandingFAQ from "@/components/landing/LandingFAQ";
import PilotRegistrationForm from "@/components/landing/PilotRegistrationForm";
import RegisterAside from "@/components/landing/RegisterAside";
import MobileStickyCta from "@/components/landing/MobileStickyCta";
import LandingFooter from "@/components/landing/LandingFooter";
import CookieConsent from "@/components/landing/CookieConsent";
import AccessibilityToolbar from "@/components/landing/AccessibilityToolbar";

export default function Landing() {
  return (
    <div dir="rtl" className="landing min-h-screen bg-background overflow-x-hidden">
      <a href="#main-content" className="skip-link">דלג לתוכן הראשי</a>
      <LandingHeader />
      <main id="main-content" className="flex flex-col md:block">
        <LandingHero />
        <LandingAbout />
        <LandingStats />
        <LandingFeatures />
        <p className="order-3 md:hidden mx-4 my-4 rounded-xl border border-border bg-card px-4 py-3 text-center text-xs font-body text-muted-foreground">
          ניהול שיעורים, תשלום אוטומטי וצ'אט ישיר עם תלמידים
        </p>
        <LandingHowItWorks />
        <LandingCTA />
        <LandingFAQ />
        <section id="register" aria-labelledby="register-title" className="order-6 relative bg-background py-10 md:py-28">
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center mb-6 md:mb-10">
            <h2 id="register-title" className="text-2xl md:text-5xl font-heading font-bold tracking-tight text-foreground mb-2 md:mb-4">הצטרפו לפיילוט</h2>
            <p className="text-sm md:text-lg text-muted-foreground font-body font-light">הירשמו עכשיו והיו מהראשונים ללמד ב-UniClass</p>
          </div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 grid lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-3">
              <PilotRegistrationForm />
            </div>
            <div className="hidden md:block lg:col-span-2">
              <RegisterAside />
            </div>
          </div>
        </section>
        <LandingFooter />
      </main>
      <MobileStickyCta />
      <CookieConsent />
      <AccessibilityToolbar />
    </div>
  );
}