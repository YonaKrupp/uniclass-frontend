import React from "react";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingHero from "@/components/landing/LandingHero";
import LandingAbout from "@/components/landing/LandingAbout";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingHowItWorks from "@/components/landing/LandingHowItWorks";
import LandingCTA from "@/components/landing/LandingCTA";
import PilotRegistrationForm from "@/components/landing/PilotRegistrationForm";
import LandingFooter from "@/components/landing/LandingFooter";

export default function Landing() {
  return (
    <div dir="rtl" className="landing min-h-screen bg-background">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingAbout />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingCTA />
        <section id="register" className="py-20 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 text-center mb-10">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-accent2/15 rounded-full text-[hsl(var(--accent2))] text-xs font-heading font-bold tracking-wide mb-4">הרשמה</span>
            <h2 className="text-4xl sm:text-5xl font-heading font-extrabold text-foreground mb-4">הצטרפו ל<span className="land-gradient-text">פיילוט</span></h2>
            <p className="text-lg text-muted-foreground font-body">הירשמו עכשיו והיו מהראשונים ללמד ב-UniClass</p>
          </div>
          <div className="px-4">
            <PilotRegistrationForm />
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>);

}