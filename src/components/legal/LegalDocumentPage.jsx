import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PageLogo from "@/components/PageLogo";
import MarkdownContent from "@/components/blog/MarkdownContent";

import { LEGAL_DOCS } from "@/content/legalDocs";
import Terms from "@/pages/Terms";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import AccessibilityStatement from "@/pages/AccessibilityStatement";

// עד שיוזן הטקסט של גרסה 2.0, שלושת המסמכים הקיימים מוצגים מהעמודים המקוריים.
const LEGACY_PAGES = {
  terms: Terms,
  privacy: PrivacyPolicy,
  accessibility: AccessibilityStatement,
};

function BackButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-heading font-medium text-foreground transition-colors hover:bg-muted min-h-[44px]"
    >
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
      חזרה
    </button>
  );
}

/**
 * עמוד ציבורי للمستند המשפטי. הטקסט מוצג כפי שהוא, כולל כותרות, מספור,
 * רשימות וטבלאות, ללא עריכה.
 */
export default function LegalDocumentPage({ docKey }) {
  const navigate = useNavigate();
  const doc = LEGAL_DOCS[docKey];

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  if (!doc) return null;

  const LegacyPage = LEGACY_PAGES[docKey];
  if (!doc.body && LegacyPage) return <LegacyPage />;

  return (
    <div dir="rtl" className="min-h-screen bg-background flex flex-col">
      <a href="#legal-content" className="skip-link">דלג לתוכן הראשי</a>

      <div id="legal-content" className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <BackButton onClick={goBack} />

        <PageLogo />

        <header className="mt-6 mb-8 space-y-2 border-b border-border pb-5">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground leading-snug">
            {doc.title}
          </h1>
          <p className="text-xs sm:text-sm font-body text-muted-foreground">
            גרסה {doc.version} · תאריך תוקף: {doc.effectiveDate}
          </p>
        </header>

        <article aria-label={doc.title}>
          {doc.body ? (
            <MarkdownContent content={doc.body} />
          ) : (
            <p className="text-base font-body leading-relaxed text-muted-foreground">
              הטקסט של מסמך זה יפורסם בעמוד הזה.
            </p>
          )}
        </article>

        <div className="mt-10 border-t border-border pt-6">
          <BackButton onClick={goBack} />
        </div>
      </div>

    </div>
  );
}