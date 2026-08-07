import React from "react";
import { Loader2 } from "lucide-react";

export default function GoogleAuthLoading() {
  return (
    <div dir="rtl" className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-lg font-heading font-medium text-foreground">מתחבר עם Google...</p>
        <p className="text-sm text-muted-foreground font-body">אנא המתינו</p>
      </div>
    </div>
  );
}