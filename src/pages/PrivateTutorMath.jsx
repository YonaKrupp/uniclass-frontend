import React from "react";
import "@/components/welcome/welcome.css";
import Seo from "@/components/blog/Seo";
import MathLandingHeader from "@/components/math-landing/MathLandingHeader";
import MathHero from "@/components/math-landing/MathHero";
import MathHowItWorks from "@/components/math-landing/MathHowItWorks";
import MathAudience from "@/components/math-landing/MathAudience";
import MathWhy from "@/components/math-landing/MathWhy";
import MathFaq from "@/components/math-landing/MathFaq";
import MathFinalCta from "@/components/math-landing/MathFinalCta";

const TITLE = "מורה פרטי למתמטיקה אונליין | Uniclass";
const DESCRIPTION =
  "מורה פרטי למתמטיקה אונליין ל-3, 4 ו-5 יחידות, לבגרות ולסטודנטים. שיעורים פרטיים עם סטודנטים מצטיינים וביטול חינם עד 24 שעות לפני.";
const CANONICAL = "https://www.uniclass.co.il/private-tutor-math";

/**
 * /private-tutor-math — דף נחיתה ציבורי לקידום שיעורים פרטיים במתמטיקה.
 * עומד בפני עצמו: אינו דורש התחברות ואינו משנה דפים אחרים.
 */
export default function PrivateTutorMath() {
  return (
    <div dir="rtl" data-role="student" className="landing welcome-page min-h-screen overflow-x-clip bg-background">
      <Seo title={TITLE} description={DESCRIPTION} canonical={CANONICAL} />

      <a href="#main-content" className="skip-link">
        דלג לתוכן הראשי
      </a>

      <MathLandingHeader />

      <main id="main-content">
        <MathHero />
        <MathHowItWorks />
        <MathAudience />
        <MathWhy />
        <MathFaq />
        <MathFinalCta />
      </main>
    </div>
  );
}