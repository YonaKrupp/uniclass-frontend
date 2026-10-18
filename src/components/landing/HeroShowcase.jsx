import React from "react";

const PROFILE_SCREENSHOT = "https://media.base44.com/images/public/6a37f1517bf59551c5f4b6f9/f7ce7de4d_generated_image.png";
const LESSON_MANAGEMENT_SCREENSHOT = "https://media.base44.com/images/public/6a37f1517bf59551c5f4b6f9/fe489ac28_image.png";

const CONTACT_SCREENSHOT = "https://media.base44.com/images/public/6a37f1517bf59551c5f4b6f9/bd02b0294_generated_image.png";

export default function HeroShowcase() {
  return (
    <div className="relative mx-auto max-w-[440px] h-[440px] sm:h-[500px]" aria-hidden="true">
      {/* Contact page screenshot — top right */}
      <div className="absolute top-0 right-0 w-[180px] sm:w-[210px]">
        <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
          <img src={CONTACT_SCREENSHOT} alt="מסך יצירת קשר באפליקציית UniClass" className="w-full h-auto block" />
        </div>
      </div>

      {/* Lesson management screenshot — main, center-left */}
      <div className="absolute top-20 left-0 w-[230px] sm:w-[280px]">
        <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
          <img src={LESSON_MANAGEMENT_SCREENSHOT} alt="מסך ניהול השיעורים עם לוח הזמינות השבועי" className="w-full h-auto block" />
        </div>
      </div>

      {/* Teacher profile screenshot — bottom right */}
      <div className="absolute bottom-0 right-4 w-[190px] sm:w-[220px]">
        <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
          <img src={PROFILE_SCREENSHOT} alt="מסך עריכת פרופיל המורה עם פרטים אישיים ותמונה אישית" className="w-full h-auto block" />
        </div>
      </div>

      {/* Discreet label marking the card group as a product demo */}
      <span className="absolute bottom-1 left-2 text-[9px] font-body text-muted-foreground/70 tracking-wide">הדגמת ממשק</span>
    </div>
  );
}