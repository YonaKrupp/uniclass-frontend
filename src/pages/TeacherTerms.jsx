import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Briefcase } from "lucide-react";
import { LEGAL_DOCS } from "@/content/legalDocs";
import MarkdownContent from "@/components/blog/MarkdownContent";
import PageLogo from "@/components/PageLogo";

export default function TeacherTerms() {
  const doc = LEGAL_DOCS.terms;

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16">
        <PageLogo />

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5 text-primary" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">{doc.title}</h1>
            <p className="text-sm text-muted-foreground font-body mt-0.5">
              גרסה {doc.version} · תאריך תוקף: {doc.effectiveDate}
            </p>
          </div>
        </div>

        <article className="bg-card border border-border rounded-2xl p-6 sm:p-8" aria-label={doc.title}>
          <MarkdownContent content={doc.body} />
        </article>

        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            to="/register-teacher"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-heading font-semibold px-6 py-3 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 active:scale-[0.98]"
          >
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
            חזרה לטופס הרשמה
          </Link>
        </div>
      </div>
    </div>
  );
}