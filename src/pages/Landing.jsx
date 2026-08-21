import React from "react";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingHero from "@/components/landing/LandingHero";
import LandingAbout from "@/components/landing/LandingAbout";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingHowItWorks from "@/components/landing/LandingHowItWorks";
import LandingCTA from "@/components/landing/LandingCTA";
import PilotRegistrationForm from "@/components/landing/PilotRegistrationForm";
import RegisterAside from "@/components/landing/RegisterAside";
import LandingFooter from "@/components/landing/LandingFooter";
import SectionGlow from "@/components/landing/SectionGlow";

const INDIGO = "hsl(262 67% 35%)";
const INDIGO_LIGHT = "hsl(258 90% 58%)";

export default function Landing() {
  return (
    <div dir="rtl" className="landing min-h-screen bg-background">
      <LandingHeader />
      <main>
        <LandingHero />
        <SectionGlow color={INDIGO} />
        <LandingAbout />
        <SectionGlow color={INDIGO} align="right" />
        <LandingFeatures />
        <SectionGlow color={INDIGO_LIGHT} align="left" />
        <LandingHowItWorks />
        <SectionGlow color={INDIGO} />
        <LandingCTA />
        <section id="register" className="relative bg-background py-20 sm:py-28 overflow-hidden">
          {/* decorative blurred indigo shapes */}
          <div className="absolute -top-20 -left-20 w-[380px] h-[380px] rounded-full blur-[130px] opacity-[0.06] pointer-events-none" style={{ background: "radial-gradient(circle, hsl(262 67% 35%), transparent 70%)" }} />
          <div className="absolute bottom-0 -right-16 w-[320px] h-[320px] rounded-full blur-[120px] opacity-[0.05] pointer-events-none" style={{ background: "radial-gradient(circle, hsl(258 90% 58%), transparent 70%)" }} />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center mb-10">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 rounded-full text-primary text-xs font-body font-medium tracking-wide mb-5">הרשמה</span>
            <h2 className="text-4xl sm:text-5xl font-heading font-semibold tracking-tight text-foreground mb-4">הצטרפו ל<span className="land-gradient-text">פיילוט</span></h2>
            <p className="text-lg text-muted-foreground font-body font-light">הירשמו עכשיו והיו מהראשונים ללמד ב-UniClass</p>
          </div>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 grid lg:grid-cols-5 gap-8 items-start">
            <div className="lg:col-span-3">
              <PilotRegistrationForm />
            </div>
            <div className="lg:col-span-2">
              <RegisterAside />
            </div>
          </div>
        </section>
        <SectionGlow color={INDIGO} />
        <LandingFooter />
      </main>
    </div>
  );
}