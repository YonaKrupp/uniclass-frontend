import React, { useEffect, useState } from "react";
import { BookOpen, GraduationCap } from "lucide-react";

const PAIRS = [
  { student: "יש לי שאלה במתמטיקה…", teacher: "בואו נפתור את זה יחד" },
  { student: "המבחן מחר, יש מקום היום?", teacher: "כן, נשארו מועדים פנויים" },
  { student: "לא הבנתי את התרגיל האחרון", teacher: "נעבור עליו צעד אחר צעד" },
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

/**
 * Two speech bubbles (teacher + student) typing alternating Hebrew lines in a loop.
 * Decorative — hidden from assistive tech.
 * layout="absolute": pinned to the scene corners. layout="inline": two compact bubbles in a row.
 */
export default function SpeechBubbles({ layout = "absolute" }) {
  const reduced = useReducedMotion();
  const [pairIndex, setPairIndex] = useState(0);
  const [active, setActive] = useState("student");
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const target = PAIRS[pairIndex][active];

    if (reduced) {
      setTyped(target);
      const hold = setTimeout(() => {
        if (active === "student") setActive("teacher");
        else {
          setActive("student");
          setPairIndex((i) => (i + 1) % PAIRS.length);
        }
      }, 3400);
      return () => clearTimeout(hold);
    }

    setTyped("");
    let index = 0;
    const typer = setInterval(() => {
      index += 1;
      setTyped(target.slice(0, index));
      if (index >= target.length) {
        clearInterval(typer);
        setTimeout(() => {
          if (active === "student") setActive("teacher");
          else {
            setActive("student");
            setPairIndex((n) => (n + 1) % PAIRS.length);
          }
        }, 1500);
      }
    }, 42);

    return () => clearInterval(typer);
  }, [pairIndex, active, reduced]);

  const teacher = (
    <Bubble
      tone="teacher"
      Icon={BookOpen}
      name="מורה"
      text={active === "teacher" ? typed : "…"}
      typing={active === "teacher"}
      compact={layout === "inline"}
    />
  );
  const student = (
    <Bubble
      tone="student"
      Icon={GraduationCap}
      name="תלמיד/ה"
      text={active === "student" ? typed : "…"}
      typing={active === "student"}
      compact={layout === "inline"}
    />
  );

  if (layout === "inline") {
    return (
      <div aria-hidden="true" className="flex w-full items-start gap-1.5">
        <div className="min-w-0 flex-1">{teacher}</div>
        <div className="min-w-0 flex-1">{student}</div>
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute top-0 right-0 max-w-[200px]">{teacher}</div>
      <div className="absolute bottom-0 left-0 max-w-[200px]">{student}</div>
    </div>
  );
}

function Bubble({ tone, Icon, name, text, typing, compact = false }) {
  const isTeacher = tone === "teacher";
  const styles = isTeacher
    ? { avatar: "welcome-role-soft welcome-role-text", border: "welcome-role-border", label: "welcome-role-text" }
    : { avatar: "bg-mint/10 text-mint", border: "border-mint/25", label: "text-mint" };

  return (
    <div
      className={`flex items-start gap-1.5 rounded-2xl border bg-card/95 px-2.5 py-2 shadow-md backdrop-blur-sm transition-opacity duration-500 ${styles.border} ${
        typing ? "opacity-100" : "opacity-55"
      }`}
    >
      <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${styles.avatar}`}>
        <Icon className="w-3 h-3" />
      </span>
      <p className={`font-body leading-snug text-foreground ${compact ? "text-[10px]" : "text-[11px] md:text-xs"} min-h-[28px]`}>
        <span className={`block text-[10px] font-heading font-semibold ${styles.label}`}>{name}</span>
        {text}
        {typing && <span className="welcome-caret inline-block w-[2px] h-[10px] align-middle mr-0.5 bg-foreground" />}
      </p>
    </div>
  );
}