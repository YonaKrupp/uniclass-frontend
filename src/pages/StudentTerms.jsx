import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap } from "lucide-react";

export default function StudentTerms() {
  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">תנאי שימוש — פלטפורמת התלמידים</h1>
            <p className="text-sm text-muted-foreground font-body mt-0.5">תאריך עדכון אחרון: מאי 2026</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-7 font-body text-foreground">

          <Section title="1. הקדמה">
            ברוכים הבאים לפלטפורמת שיעורים פרטיים. על ידי הירשמות ושימוש בשירות זה, אתם מאשרים כי קראתם, הבנתם והסכמתם לתנאים הבאים. אם אינכם מסכימים לתנאים אלו, אנא אל תשתמשו בשירות.
          </Section>

          <Section title="2. תיאור השירות">
            <p>הפלטפורמה מאפשרת לתלמידים לחפש מורים, לקבוע שיעורים, לנהל את לוח הזמנים שלהם, ולתקשר עם מורים ודיירים אחרים דרך המערכת. השירות כולל:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>ניהול פרטים אישיים ומידע ממלא מקום</li>
              <li>חיפוש ודירוג מורים</li>
              <li>הזמנת וביטול שיעורים</li>
              <li>ניהול לוח זמנים של שיעורים</li>
              <li>התראות SMS ודוא"ל</li>
              <li>קשר עם מורים</li>
            </ul>
          </Section>

          <Section title="3. אחריות המשתמש">
            <p>אתם אחראים לשמירה על סודיות סיסמתכם ותא המייל שלכם. בהשתמשוש בשירות, אתם מתחייבים:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>להזין מידע אמיתי, מדויק ושלם בכל השדות הנדרשים</li>
              <li>לעדכן את הפרטים שלכם אם קרה שינוי</li>
              <li>לא להשתמש בחשבון של משתמש אחר ללא הסכמה</li>
              <li>לא לעקוף מערכות אבטחה או לנסות להגיע לנתונים ללא הרשאה</li>
              <li>להשתמש בשירות רק לצורכים חוקיים וחינוכיים</li>
              <li>לא להשתמש בחומר גזעני, פוגעני, מיני או אחר שאינו ראוי</li>
              <li>לא לבטל שיעורים באופן חוזר ללא סיבה</li>
            </ul>
          </Section>

          <Section title="4. פרטיות וסודיות">
            <p>המידע שלכם (דוא"ל, שם, טלפון, כתובת IP) נשמר בבסיס נתונים מאובטח. אנחנו משתמשים בנתונים אלו כדי:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>לתת לכם גישה לחשבון שלכם</li>
              <li>לשלוח לכם התראות וביצוע שיעורים</li>
              <li>למצוא לכם מורים מתאימים</li>
              <li>לשפר את חוויית השימוש</li>
              <li>לשמור על אבטחת המערכת</li>
            </ul>
            <p className="mt-2">לא נמכור או נעביר את המידע שלכם לצדדים שלישיים ללא הסכמה מפורשת שלכם, פרט למקרים שנדרש בחוק.</p>
          </Section>

          <Section title="5. דיווחי מורים ודירוגים">
            <p>תוכלו לדרג מורים לאחר השיעור בקנה מידה של 1-5 כוכבים. דיווחכם חוקי ובעיקר בעל תוקף של חוות דעת אמיתית.</p>
            <p className="mt-2">דיווחים מזויפים, בלתי הוגנים או שנועדו לפגוע במורה עלולים להגרום לביטול החשבון שלכם.</p>
          </Section>

          <Section title="6. זכויות יוצרים והקניין">
            כל התוכן של הפלטפורמה (עיצוב, לוגו, פונקציונליות) הוא קניין יוצרים שלנו או של צדדים שלישיים עם הסכמה.
          </Section>

          <Section title="7. הגבלת אחריות">
            <p>השירות מסופק "כמו שהוא" ללא כל ערובה. אנחנו לא אחראים על:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>הפסקות או תקלות בשרתים</li>
              <li>אובדן נתונים</li>
              <li>עיכובים בשליחת הודעות SMS או דוא"ל</li>
              <li>שימוש לא ראוי בחשבונכם על ידי צדדים שלישיים</li>
              <li>נזקים עקיפים או הפסדים כלכליים</li>
              <li>ביטול של מורים מהמערכת או ביטול שיעורים</li>
              <li>אי התאמה בין תלמיד למורה</li>
            </ul>
          </Section>

          <Section title="8. ביטול חשבון">
            <p>אתם יכולים לבקש ביטול חשבון בכל עת על ידי יצירת קשר עם תמיכה. עם ביטול:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
              <li>הנתונים שלכם יהיו לא זמינים (אך עשויים להישמר למטרות משפטיות או ביטחוניות)</li>
              <li>חשבון לא יכול להיות שוחזר</li>
              <li>שיעורים עתידיים שהוזמנו יהיו מבוטלים</li>
            </ul>
          </Section>

          <Section title="9. דמי הנחות ותשלומים">
            <p>בחלק מהשיעורים ייתכנו דמי השתתפות או הנחות מיוחדות. אתם מאשרים כי תשלמו בזמן ובאופן המוסכם.</p>
            <p className="mt-2">אנחנו לא אחראים על מחלוקות בתשלומים בין תלמידים למורים.</p>
          </Section>

          <Section title="10. שינויים בתנאים">
            אנחנו שומרים לעצמנו את הזכות לשנות תנאים אלו בכל עת. שינויים משמעותיים יהיו ברורים, ואתם תקבלו הודעה באמצעות דוא"ל או בעמוד ההגדרות שלכם.
          </Section>

          <Section title="11. יישום חוקים">
            תנאים אלו כפופים לחוקי מדינת ישראל. כל סכסוך או תביעה יטופלו בבתי המשפט המוסמכים בישראל.
          </Section>

          <Section title="12. יצירת קשר">
            אם יש לכם שאלות או דאגות לגבי תנאים אלו, אנא צרו קשר דרך דף ההתקשרות או שלחו דוא"ל לכתובת התמיכה.
          </Section>

          <p className="text-sm text-muted-foreground border-t border-border pt-5">
            בהמשך השימוש בשירות, אתם מאשרים כי קראתם וקיבלתם את תנאי שימוש אלו.
          </p>
        </div>

        {/* Back button */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            to="/register-student"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-heading font-semibold px-6 py-3 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 active:scale-[0.98]"
          >
            <ArrowRight className="w-5 h-5" />
            חזרה לטופס הרשמה
          </Link>
          <p className="text-xs text-muted-foreground font-body text-center">
            מסמך זה עודכן לאחרונה במאי 2026. אנחנו שומרים לעצמנו את הזכות לעדכן את התנאים בכל עת ללא הודעה מקדימה.
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-2">
      <h2 className="text-base font-heading font-bold text-foreground">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-1">{children}</div>
    </div>
  );
}