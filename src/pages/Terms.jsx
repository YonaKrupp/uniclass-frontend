import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const LOGO = "https://media.base44.com/images/public/6a37f1517bf59551c5f4b6f9/c40751db9_Logo_UNICLASS_purple_PNG.png";

export default function Terms() {
  return (
    <div dir="rtl" className="landing min-h-screen bg-background">
      <a href="#main-content" className="skip-link">דלג לתוכן הראשי</a>
      <div id="main-content" className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-body font-medium text-primary hover:underline mb-6">
          <ArrowRight className="w-4 h-4" aria-hidden="true" /> חזרה לדף הראשי
        </Link>
        <img src={LOGO} alt="UniClass" className="h-8 mb-6" />
        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-8">תנאי שימוש</h1>

        <div className="space-y-6 text-sm sm:text-base text-muted-foreground font-body leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">1. מבוא</h2>
            <p>
              תנאי שימוש אלו מסדירים את השימוש באתר UniClass (להלן: "האתר"). השימוש באתר מהווה הסכמה לתנאים אלו.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">2. שלב פיילוט</h2>
            <p>
              האתר נמצא בשלב פיילוט. השירות, התכונות, הממשק והזמינות עשויים להשתנות מעת לעת ללא הודעה מוקדמת. ייתכן שחלק מהיכולות טרם פותחו במלואן.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">3. הרשמה לפיילוט</h2>
            <p>
              הרשמה לפיילוט אינה מהווה התחייבות למתן שירות, לזמינותו, למחירו או לתאריך הפעלתו. הרשמה מאפשרת יצירת קשר עמך במועד ההשקה, ככל שתאשר זאת.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">4. אופי התוכן</h2>
            <p>
              התוכן המוצג באתר הינו כללי ואינו מהווה ייעוץ מקצועי, לימודי, משפטי או אחר. אין להסתמך על התוכן כעל חוות דעת מקצועית.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">5. הגבלת אחריות</h2>
            <p>
              ככל שהדבר מותר על פי דין, האתר ובעליו אינם אחראים לנזקים עקיפים או עקביים הנובעים מהשימוש באתר או מחוסר יכולת להשתמש בו. האחריות מוגבלת למירב המותר על פי דין המגן על זכויות הצרכן.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">6. זכויות יוצרים</h2>
            <p>
              כל הזכויות באתר, בעיצובו ובתכניו (למעט תוכן שהועלה על ידי משתמשים) שמורות לבעלי האתר. אין להעתיק, להפיץ או לעשות שימוש מסחרי בתכנים ללא אישור בכתב.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">7. דין וסמכות שיפוט</h2>
            <p>
              על תנאים אלו חל הדין במדינת ישראל. סמכות השיפוט הבלעדית מסורה לערכאות המוסמכות בישראל, בכפוף לסעיפים מנדטוריים בחוק הגנת הצרכן.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">8. יצירת קשר</h2>
            <p>
              לשאלות בנוגע לתנאי השימוש ניתן לפנות אלינו בכתובת: [דוא"ל ליצירת קשר].
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-heading font-semibold text-foreground">9. עדכון התנאים</h2>
            <p>
              רשאים אנו לעדכן תנאים אלו מעת לעת. הגרסה המעודכנת תפורסם בעמוד זה. תאריך עדכון אחרון: [תאריך].
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}