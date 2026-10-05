import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PageLogo from "@/components/PageLogo";

export default function AccessibilityStatement() {
  return (
    <div dir="rtl" className="landing min-h-screen bg-background">
      <a href="#main-content" className="skip-link">דלג לתוכן הראשי</a>
      <div id="main-content" className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-body font-medium text-primary hover:underline mb-6">
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
          חזרה לדף הראשי
        </Link>
        <PageLogo />
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mt-6 mb-8">
          הצהרת נגישות
        </h1>

        <div className="space-y-6 text-sm sm:text-base text-muted-foreground font-body leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">הצהרת מחויבות</h2>
            <p>
              האתר פועל להנגשת השירות לאנשים עם מוגבלות בהתאם לתקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), תשע"ג-2013.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">רמת הנגישות</h2>
            <p>
              ההתאמות בוצעו לפי תקן ישראלי ת"י 5568 חלק 1 ברמה AA, בהתבסס על WCAG 2.1 AA (הכולל את דרישות WCAG 2.0 AA).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">ההתאמות שבוצעו</h2>
            <ul className="list-disc pr-5 space-y-1">
              <li>ניווט מלא באמצעות מקלדת (Tab, Shift+Tab, Enter, Space, Esc).</li>
              <li>קישור "דלג לתוכן הראשי" בראש עמוד הנחיתה והעמודים הציבוריים.</li>
              <li>מחוון פוקוס גלוי וברור לכל אלמנט אינטראקטיבי.</li>
              <li>מבנה סמנטי עם כותרות בסדר היררכי (h1, h2, h3).</li>
              <li>תיאורי alt לתמונות משמעותיות והסתרת תמונות דקורטיביות.</li>
              <li>ניגודיות צבעים העומד בדרישות התקן.</li>
              <li>טפסים נגישים: תוויות גלויות, סימון שדות חובה, השלמה אוטומטית, והודעות שגיאה מוכרזות לקורא מסך.</li>
              <li>הודעות הצלחה מוכרזות לקורא מסך (aria-live).</li>
              <li>תמיכה בהעדפת הפחתת תנועה (prefers-reduced-motion).</li>
              <li>סרגל נגישות המאפשר הגדלת טקסט, ניגודיות גבוהה, שחור-לבן, הדגשת קישורים ועצירת אנימציות.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">מגבלות ידועות</h2>
            <p>
              [אם קיים תוכן צד ג' שלא הונגש — למשל וידאו מוטמע או מסמך PDF — יש לפרט זאת כאן ולציין חלופה נגישה. במידה ואין מגבלות, ניתן לציין "אין מגבלות ידועות כרגע".]
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">דרכי פנייה לבעיות נגישות</h2>
            <p>
              ניתן לפנות אלינו בכל עניין של נגישות באמצעות פרטי הקשר הבאים:
            </p>
            <ul className="list-disc pr-5 space-y-1">
              <li>שם איש קשר: [שם מלא]</li>
              <li>טלפון: [מספר טלפון]</li>
              <li>דוא"ל: [כתובת דוא"ל]</li>
              <li>כתובת לקבלת קהל: [כתובת, אם רלוונטי]</li>
            </ul>
            <p>
              נשמח לסייע ולטפל בכל בקשה סבירה להנגשה.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">תאריך עדכון אחרון</h2>
            <p>תאריך עדכון אחרון של הצהרה זו: [תאריך]</p>
          </section>
        </div>
      </div>
    </div>
  );
}