import React from "react";
import "@/components/welcome/welcome.css";
import Seo from "@/components/blog/Seo";
import EnglishLandingHeader from "@/components/english-landing/EnglishLandingHeader";
import EnglishHero from "@/components/english-landing/EnglishHero";
import EnglishHowItWorks from "@/components/english-landing/EnglishHowItWorks";
import EnglishAudience from "@/components/english-landing/EnglishAudience";
import EnglishWhy from "@/components/english-landing/EnglishWhy";
import EnglishFaq from "@/components/english-landing/EnglishFaq";
import EnglishFinalCta from "@/components/english-landing/EnglishFinalCta";

const TITLE = "מורה פרטי לאנגלית אונליין | Uniclass";
const DESCRIPTION =
  "מורה פרטי לאנגלית אונליין לחטיבה, תיכון, בגרות ופסיכומטרי. שיעורים פרטיים עם סטודנטים מצטיינים וביטול חינם עד 24 שעות לפני.";
const CANONICAL = "https://www.uniclass.co.il/private-tutor-english";

/**
 * /private-tutor-english — דף נחיתה ציבורי לקידום שיעורים פרטיים באנגלית.
 * עומד בפני עצמו: אינו דורש התחברות ואינו משנה דפים אחרים.
 */
export default function PrivateTutorEnglish() {
  return (
    <div dir="rtl" data-role="student" className="landing welcome-page min-h-screen overflow-x-clip bg-background">
      <Seo title={TITLE} description={DESCRIPTION} canonical={CANONICAL} />

      <a href="#main-content" className="skip-link">
        דלג לתוכן הראשי
      </a>

      <EnglishLandingHeader />

      <main id="main-content">
        <EnglishHero />
        <EnglishHowItWorks />
        <EnglishAudience />
        <EnglishWhy />
        <EnglishFaq />
        <EnglishFinalCta />
      </main>
    </div>
  );
}