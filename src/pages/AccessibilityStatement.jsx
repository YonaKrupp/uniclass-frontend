import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PageLogo from "@/components/PageLogo";
import AccessibilityToolbar from "@/components/landing/AccessibilityToolbar";

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
          הצהרת נגישות – יוניקלאס (uniclass.co.il)
        </h1>

        <div className="space-y-6 text-sm sm:text-base text-muted-foreground font-body leading-relaxed">
          <p>עודכן לאחרונה: 15 באוקטובר 2026</p>

          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">מחויבות לנגישות</h2>
            <p>
              יוניקלאס רואה חשיבות רבה במתן שירות שוויוני ונגיש לכלל המשתמשים, ובכללם אנשים עם מוגבלויות, ופועלת לשפר את נגישות האתר ואת חווית השימוש בו, בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות, התשנ"ח-1998 ולתקנות לפיו.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">מצב הנגישות באתר</h2>
            <p>
              אנו פועלים להתאים את האתר להוראות התקן הישראלי ת"י 5568, המבוסס על הנחיות WCAG 2.0 ברמה AA. ההתאמות נעשות באופן הדרגתי. ייתכן שחלקים מסוימים באתר, או תכנים שמועלים על ידי משתמשים, עדיין אינם נגישים במלואם, ואנו ממשיכים לעבוד על שיפורם.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">רכיבים שעדיין אינם נגישים במלואם</h2>
            <p>
              נכון למועד עדכון ההצהרה, ייתכן שחלק מהאיורים והמחשות הממשק בדף הבית אינם מתוארים במלואם לקוראי מסך. אנו פועלים לתקן זאת.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-heading font-semibold text-foreground">כלי הנגישות באתר</h2>
            <p>
              באתר מותקן כלי נגישות, שנפתח בלחיצה על סמל הנגישות הצף בפינת המסך. הכלי מאפשר למשתמש להתאים את תצוגת האתר לצרכיו, ובהם:
            </p>

            <div className="space-y-2">
              <h3 className="text-base font-heading font-semibold text-foreground">תצוגה וצבעים</h3>
              <ul className="list-disc pr-5 space-y-1">
                <li>ניגודיות גבוהה, ניגודיות הפוכה, גווני אפור ותצוגה בשחור-לבן;</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-heading font-semibold text-foreground">טקסט</h3>
              <ul className="list-disc pr-5 space-y-1">
                <li>הגדלה והקטנה של גודל הטקסט, ושינוי ריווח בין מילים ובין אותיות;</li>
                <li>גופן קריא;</li>
                <li>הדגשת קישורים והדגשת כותרות;</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-heading font-semibold text-foreground">קריאה</h3>
              <ul className="list-disc pr-5 space-y-1">
                <li>הקראה קולית של טקסט שנבחר, בכפוף לתמיכת הדפדפן והמכשיר;</li>
                <li>מדריך קריאה;</li>
                <li>התאמה לקוראי מסך, הכוללת קישור לדילוג לתוכן הראשי, זיהוי אזורי הדף ותצוגת פוקוס ברורה בניווט במקלדת;</li>
                <li>הסתרת תמונות;</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-heading font-semibold text-foreground">ניווט ותנועה</h3>
              <ul className="list-disc pr-5 space-y-1">
                <li>סמן עכבר גדול בגוון כהה או בהיר;</li>
                <li>ביטול אנימציות;</li>
                <li>איפוס כל ההגדרות.</li>
              </ul>
            </div>

            <p>
              הבחירות נשמרות בדפדפן שלך לביקורים הבאים, ואפשר לאפס אותן בכל עת בלחיצה על "איפוס הגדרות". הכלי נועד להקל על השימוש באתר, ואינו מחליף שימוש בטכנולוגיות מסייעות אחרות שברשותך. חלק מהאפשרויות, כגון הקראה קולית, תלויות ביכולות הדפדפן והמכשיר שלך.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">פנייה בנושא נגישות</h2>
            <p>
              אם נתקלת בקושי בגלישה באתר, מצאת רכיב שאינו נגיש, או שאתה זקוק להתאמה או לשירות חלופי, נשמח שתפנה אלינו ונפעל לטפל בכך בהקדם האפשרי.
            </p>
            <p>פרטי יצירת קשר לנושא נגישות:</p>
            <ul className="list-disc pr-5 space-y-1">
              <li>שם איש הקשר: עידן משלי</li>
              <li>דוא"ל: idan@uniclass.co.il</li>
              <li>טלפון: 055-6657560</li>
            </ul>
            <p>
              בפנייתך, אנא ציין את תיאור הקושי, את כתובת העמוד שבו נתקלת בו, ואת סוג הדפדפן והמכשיר שבו השתמשת, כדי שנוכל לטפל בפנייה ביעילות.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">תכנים של צדדים שלישיים</h2>
            <p>
              האתר עשוי לכלול תכנים וקישורים של צדדים שלישיים, ובהם ספקי תשלום ושירותי שיחות וידאו, וכן תכנים שהועלו על ידי משתמשים. איננו שולטים בנגישות תכנים אלה, אך נפעל ככל שניתן לסייע למשתמשים שנתקלים בקושי.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">עדכון ההצהרה</h2>
            <p>
              הצהרה זו עודכנה לאחרונה בתאריך שמופיע בראשה, ותעודכן מעת לעת בהתאם לשינויים באתר ובכלי הנגישות.
            </p>
            <p>
              בדיקת הנגישות האחרונה באתר בוצעה ב-17 באוקטובר 2026.
            </p>
          </section>
        </div>
      </div>
      <AccessibilityToolbar />
    </div>
  );
}