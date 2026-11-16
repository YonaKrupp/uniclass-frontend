import React from "react";
import "@/components/welcome/welcome.css";
import WelcomeHeader from "@/components/welcome/WelcomeHeader";
import WelcomeHero from "@/components/welcome/WelcomeHero";
import WelcomeTrustStrip from "@/components/welcome/WelcomeTrustStrip";
import WelcomeWhy from "@/components/welcome/WelcomeWhy";
import WelcomeHowItWorks from "@/components/welcome/WelcomeHowItWorks";
import WelcomeTeachers from "@/components/welcome/WelcomeTeachers";
import WelcomeParents from "@/components/welcome/WelcomeParents";
import WelcomeTeacherBand from "@/components/welcome/WelcomeTeacherBand";
import WelcomeFAQ from "@/components/welcome/WelcomeFAQ";
import WelcomeSocialProof from "@/components/welcome/WelcomeSocialProof";
import WelcomeCTA from "@/components/welcome/WelcomeCTA";
import WelcomeFooter from "@/components/welcome/WelcomeFooter";
import WelcomeHead from "@/components/welcome/WelcomeHead";
import CookieConsent from "@/components/landing/CookieConsent";
import { WelcomeRoleProvider, useRole } from "@/components/welcome/WelcomeRoleContext";
import { useWelcomeTracking } from "@/components/welcome/useWelcomeAnalytics";

/**
 * /welcome — the public landing page for both teachers and students.
 * Standalone route: it does not replace "/" and is not linked from the
 * existing navigation.
 */
function WelcomeShell() {
  const { role } = useRole();
  useWelcomeTracking();

  return (
    <div dir="rtl" data-role={role} className="landing welcome-page min-h-screen overflow-x-clip bg-background">
      <WelcomeHead />
      <a href="#main-content" className="skip-link">
        דלג לתוכן הראשי
      </a>

      <WelcomeHeader />

      <main id="main-content">
        <WelcomeHero />
        <WelcomeTrustStrip />
        <WelcomeWhy />
        <WelcomeHowItWorks />
        <WelcomeTeachers />
        <WelcomeParents />
        <WelcomeTeacherBand />
        <WelcomeFAQ />
        <WelcomeSocialProof />
        <WelcomeCTA />
      </main>

      <WelcomeFooter />
      <CookieConsent />
    </div>
  );
}

export default function Welcome() {
  return (
    <WelcomeRoleProvider>
      <WelcomeShell />
    </WelcomeRoleProvider>
  );
}