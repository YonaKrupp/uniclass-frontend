import React from "react";
import { Sun, Moon } from "lucide-react";
import { useDarkMode } from "@/lib/useDarkMode";

export default function DarkModeToggle() {
  const [dark, setDark] = useDarkMode();
  return (
    <button
      onClick={() => setDark(!dark)}
      className="fixed top-3 left-3 z-[9999] p-2 rounded-full bg-card border border-border shadow-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      title={dark ? "מצב בהיר" : "מצב כהה"}
    >
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}