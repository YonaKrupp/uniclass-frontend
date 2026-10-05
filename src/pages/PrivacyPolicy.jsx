import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const LOGO = "https://media.base44.com/images/public/6a37f1517bf59551c5f4b6f9/c40751db9_Logo_UNICLASS_purple_PNG.png";

export default function PrivacyPolicy() {
  return (
    <div dir="rtl" className="landing min-h-screen bg-background">
      <a href="#main-content" className="skip-link">דלג לתוכן הראשי</a>
      <div id="main-content" className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-body font-medium text-primary hover:underline mb-6">
          <ArrowRight className="w-4 h-4" aria-hidden="true" /> חזרה לדף הראשי
        </Link>
        <img src={LOGO} alt="UniClass" className="h-8 mb-6" />
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-8">מדיניות פרטיות</h1>

        <div className="space-y-6 text-sm sm:text-base text-muted-foreground font-body leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">1. מי אנחנו</h2>
            <p>
              מאגר המידע מוחזק על ידי [שם בעל המאגר / שם העסק], [כתובת], [דוא"ל ליצירת קשר]. לעניין מדיניות זו, "האתר" הוא אתר UniClass.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">2. איזה מידע נאסף</h2>
            <p>בעת ההרשמה לפיילוט אנו אוספים את הפרטים הבאים:</p>
            <ul className="list-disc pr-5 space-y-1">
              <li>שם מלא</li>
              <li>כתובת דוא"ל</li>
              <li>מספר טלפון</li>
              <li>מוסד לימודים / מקום עבודה</li>
              <li>תואר או תחום הוראה</li>
              <li>הערות שבחרת למסור</li>
            </ul>
            <p>הפלטפורמה המארחת עשויה לתעד נתונים טכניים בסיסיים ביומני שרת לצרכי אבטחה ותפעול בלבד. האתר עצמו אינו מפעיל כלי אנליטיקה או מעקב (פירוט בסעיף 8).</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">3. מטרות האיסוף</h2>
            <p>המידע נאסף ומשמש למטרות הבאות:</p>
            <ul className="list-disc pr-5 space-y-1">
              <li>הרשמה לפיילוט ויצירת קשר עמך.</li>
              <li>שליחת הודעות על השקת השירות, וזאת אך ורק אם נתת לכך הסכמה מפורשת נפרדת.</li>
              <li>שיפור ופיתוח השירות.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">4. האם חובה למסור את המידע</h2>
            <p>
              מסירת המידע אינה חובה על פי דין. עם זאת, ללא השדות שנבחרו כשדות חובה לא ניתן יהיה להשלים את ההרשמה לפיילוט.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">5. העברת מידע לספקי שירות ואחסון מחוץ לישראל</h2>
            <p>
              המידע עשוי להיות מועבר לספקי שירות טכניים המסייעים בהפעלת האתר, ובכלל זה שירותי אחסון, שליחת דוא"ל ו-SMS. [יש לפרט את שמות הספקים בפועל.] המידע עשוי להיות מאוחסן בשרתים הממוקמים מחוץ למדינת ישראל. המידע אינו נמכר לצדדים שלישיים.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">6. אבטחת מידע</h2>
            <p>
              אנו נוקטים באמצעי הגנה סבירים להגנה על המידע, לרבות העברת מידע מוצפנת בפרוטוקול HTTPS. עם זאת, אין אבטחה מוחלטת, ואיננו יכולים להבטיח הגנה מלאה מפני חדירה.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">7. שמירת המידע</h2>
            <p>
              המידע יישמר למשך [תקופה, למשל 24 חודשים] ממועד ההרשמה, או עד בקשת מחיקת המידע מצידך, המוקדם מביניהם.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">8. עוגיות ואחסון מקומי</h2>
            <p>
              האתר משתמש באחסון מקומי בדפדפן (localStorage) לצרכים טכניים בלבד, כגון שמירת אסימון כניסה והעדפות. האתר אינו משתמש בכלי אנליטיקה או בפיקסלים של צדדים שלישיים, ואינו טוען עוגיות שאינן הכרחיות לתפעולו.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">9. זכויות המשתמש</h2>
            <p>על פי חוק הגנת הפרטיות, התשנ"ה-1981, זכאי אתה:</p>
            <ul className="list-disc pr-5 space-y-1">
              <li>לעיין במידע המוחזק עליך.</li>
              <li>לבקש תיקון של מידע שגוי.</li>
              <li>לבקש מחיקת המידע.</li>
              <li>להסיר את עצמך מרשימת הדיוור בכל עת.</li>
            </ul>
            <p>
              למימוש זכויות אלו ניתן לפנות אלינו בכתובת [דוא"ל ליצירת קשר]. להסרה מרשימת הדיוור ניתן לפנות אלינו באותה כתובת, או באמצעות הפרטים בעמוד <Link to="/unsubscribe" className="text-primary underline underline-offset-2">ההסרה מדיוור</Link>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">10. עדכון המדיניות</h2>
            <p>
              רשאים אנו לעדכן מדיניות זו מעת לעת. הגרסה המעודכנת תפורסם בעמוד זה. תאריך עדכון אחרון: [תאריך].
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}