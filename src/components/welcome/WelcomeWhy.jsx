import React from "react";
import { CalendarX, GraduationCap, TrendingUp, Wallet } from "lucide-react";
import Reveal from "@/components/landing/Reveal";
import WSection from "./ui/WSection";
import WBentoTile from "./ui/WBentoTile";
import { CancelFragment, CourseFragment, EarningsFragment, SetupFragment } from "./WelcomeWhyFragments";
import { isDimmed, useRole } from "./WelcomeRoleContext";

const TILES = [
  {
    key: "earnings",
    role: "teacher",
    icon: Wallet,
    title: "אפס עלות עד שמרוויחים",
    text: "אין דמי הצטרפות. העמלה נגבית רק משיעור שמשולם.",
    fragment: <EarningsFragment />,
    span: "md:col-span-4",
  },
  {
    key: "courses",
    role: "student",
    icon: GraduationCap,
    title: "מורים שעברו את זה לא מזמן",
    text: "סטודנטים שמכירים את החומר והמבחנים מקרוב.",
    fragment: <CourseFragment />,
    span: "md:col-span-2",
  },
  {
    key: "cancel",
    role: "student",
    icon: CalendarX,
    title: "ביטול חינם עד 24 שעות לפני השיעור",
    text: "בלי לחץ ובלי התחייבות.",
    fragment: <CancelFragment />,
    span: "md:col-span-2",
  },
  {
    key: "setup",
    role: "teacher",
    icon: TrendingUp,
    title: "מתחילים להרוויח מהר",
    text: "פרופיל, זמינות ותשלום במקום אחד, בלי בירוקרטיה.",
    fragment: <SetupFragment />,
    span: "md:col-span-4",
  },
];

export default function WelcomeWhy() {
  const { role } = useRole();

  return (
    <WSection
      id="why"
      eyebrow="היתרונות"
      title="למה UniClass"
      titleId="welcome-why-title"
      subtitle="הערך שמקבל כל צד — לא רשימת פיצ׳רים."
    >
      <div className="mt-12 grid gap-4 md:grid-cols-6 md:gap-5">
        {TILES.map((tile, index) => (
          <Reveal key={tile.key} delay={index * 70} className={tile.span}>
            <WBentoTile
              role={tile.role}
              icon={tile.icon}
              title={tile.title}
              text={tile.text}
              fragment={tile.fragment}
              dimmed={isDimmed(role, tile.role)}
              className="h-full"
            />
          </Reveal>
        ))}
      </div>
    </WSection>
  );
}