import React from "react";
import { Link } from "react-router-dom";
import { GraduationCap, BookOpen, ArrowLeft } from "lucide-react";

export default function LoginChoice() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8 space-y-4">
          <h1 className="text-2xl font-heading font-bold text-foreground text-center mb-2">כניסה למערכת UniClass</h1>
          <p className="text-muted-foreground font-body text-center text-sm mb-6">בחרו סוג משתמש לכניסה</p>
          <Link to="/teacher-login" className="flex items-center justify-between gap-3 w-full px-6 py-5 bg-primary text-primary-foreground rounded-xl font-heading font-semibold shadow-lg shadow-primary/25 hover:shadow-xl transition-all active:scale-[0.98]">
            <span className="flex items-center gap-3"><BookOpen className="w-6 h-6" /> כניסת מורה</span>
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link to="/student-login" className="flex items-center justify-between gap-3 w-full px-6 py-5 bg-card text-foreground border border-border rounded-xl font-heading font-semibold hover:bg-muted transition-colors active:scale-[0.98]">
            <span className="flex items-center gap-3"><GraduationCap className="w-6 h-6" /> כניסת תלמיד</span>
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
        <Link to="/" className="block text-center mt-6 text-sm text-muted-foreground hover:text-primary font-body transition-colors">
          חזרה לדף הבית
        </Link>
      </div>
    </div>
  );
}