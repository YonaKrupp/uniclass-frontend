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
    <div dir="rtl" className="min-h-screen bg-background">
      <LandingHeader />
      <main>
        <LandingHero />
        <LandingAbout />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingCTA />
        <section id="register" className="py-20">
          <div className="max-w-4xl mx-auto px-4 text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">הצטרפו לפיילוט</h2>
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