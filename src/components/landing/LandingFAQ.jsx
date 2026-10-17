import React from "react";
import { HelpCircle } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const faqs = [
  {
    q: "מה זה UniClass ולמי זה מתאים?",
    a: "UniClass היא פלטפורמה לשיעורים פרטיים שמחברת בין סטודנטים ומורים פרטיים לבין תלמידים שמחפשים עזרה בלימודים. היא מתאימה לכל מי שיודע חומר ורוצה ללמד בגמישות, וגם לתלמידים שמחפשים מורה.",
  },
  {
    q: "מי יכול ללמד ב-UniClass?",
    a: "סטודנטים, בוגרים ומורים פרטיים בתחומים אקדמיים ובתחומי לימוד נוספים. בטופס ההרשמה תציינו את מקום הלימודים או העבודה ואת תחום ההוראה.",
  },
  {
    q: "כמה עולה להצטרף ולהשתמש בפלטפורמה?",
    a: "ההרשמה לפיילוט חינמית וללא התחייבות. אתם קובעים את מחיר השיעור, ופרטי העמלה יימסרו לפני ההשקה.",
  },
  {
    q: "האם אני חייב/ת ללמד מספר מינימלי של שעות?",
    a: "לא. אין מכסת שעות. אתם מחליטים כמה ומתי ללמד, ואפשר לשנות את הזמינות בכל עת.",
  },
  {
    q: "איך ומתי אקבל תשלום?",
    a: "התלמיד משלם דרך הפלטפורמה בתשלום מאובטח, ואתם לא צריכים לרדוף אחרי תשלומים. התשלום מועבר לחשבון הבנק שהגדרתם, בהתאם לתנאי ההתקשרות.",
  },
  {
    q: "איך מתקיימים השיעורים?",
    a: "השיעורים מתקיימים בווידאו דרך הפלטפורמה, ישירות מהדפדפן וללא התקנה. אפשר להתחבר ממחשב או מהנייד.",
  },
  {
    q: "מה זה סיכום השיעור האוטומטי?",
    a: "בסיום כל שיעור מופק סיכום מסודר בעזרת בינה מלאכותית, שנועד לעזור לתלמיד לחזור על החומר. הסיכום נגיש לתלמיד ולמורה.",
  },
  {
    q: "מה זה הפיילוט ומתי הפלטפורמה נפתחת?",
    a: "הפיילוט הוא שלב ההשקה הראשון, ובו מצטרפת קבוצה מצומצמת של מורים שמלמדים ומשפיעים על עיצוב המערכת. נרשמים בטופס, ולפני ההשקה נשלחת הזמנה במייל. ההשקה מתוכננת בחודשים הקרובים.",
  },
  {
    q: "מה היתרון בהצטרפות כבר עכשיו?",
    a: "מורים מייסדים מקבלים גישה מוקדמת, יכולים לבנות מוניטין וקהל תלמידים לפני כולם, והמשוב שלהם משפיע על הכלים שנבנים.",
  },
  {
    q: "האם המידע שלי מאובטח?",
    a: "כן. אנחנו נוקטים באמצעי הגנה מקובלים, כולל העברת מידע מוצפנת בפרוטוקול HTTPS, ואיננו מוסרים את פרטיכם לגורם אחר ללא הסכמתכם. פרטים מלאים במדיניות הפרטיות.",
  },
];

export default function LandingFAQ() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="order-7 relative bg-background py-10 md:py-28">
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-6 md:mb-12">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-body font-semibold mb-4">
            <HelpCircle className="w-4 h-4" aria-hidden="true" />
            שאלות ותשובות
          </span>
          <h2 id="faq-title" className="text-2xl md:text-5xl font-heading font-bold tracking-tight text-foreground mb-2 md:mb-4">
            שאלות נפוצות
          </h2>
          <p className="text-sm md:text-lg text-muted-foreground font-body font-light">
            כל מה שכדאי לדעת לפני שמצטרפים
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((item, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="bg-card rounded-2xl border border-border px-4 md:px-6 shadow-sm transition-colors data-[state=open]:border-primary/30 border-b-0"
            >
              <AccordionTrigger className="text-right text-sm md:text-lg font-heading font-semibold text-foreground hover:no-underline gap-4 py-3.5 md:py-5">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-xs md:text-base text-muted-foreground font-body font-light leading-relaxed pb-3.5 md:pb-5">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <p className="text-center text-sm text-muted-foreground font-body mt-6 md:mt-10">
          לא מצאתם תשובה?{" "}
          <a href="#register" className="text-primary font-medium hover:underline underline-offset-2">
            השאירו פרטים ונחזור אליכם
          </a>
        </p>
      </div>
    </section>
  );
}