import React from "react";
import { HelpCircle } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const faqs = [
  {
    q: "מה זה UniClass ולמי זה מתאים?",
    a: "UniClass היא פלטפורמה חכמה ללימודים פרטיים שמחברת בין מורים לתלמידים — סטודנטים, תלמידי בית ספר ומתרגלים מקצועיים. היא מיועדת למי שרוצה ללמוד או ללמד באופן גמיש, בלי מסגרת נוקשה.",
  },
  {
    q: "כמה עולה להשתמש בפלטפורמה?",
    mobile: true,
    a: "ההצטרפות לפיילוט היא ללא עלות וללא התחייבות. אתם קובעים את מחיר השיעור שלכם, ואנחנו ניצור איתכם קשר עם פרטי ההצטרפות לפני ההשקה.",
  },
  {
    q: "איך מתבצעת הגבייה והתשלום?",
    mobile: true,
    a: "התשלום מתבצע באופן מאובטח ואוטומטי דרך הפלטפורמה, כך שלא צריך לרדוף אחרי תשלומים. הגבייה מתבצעת בנפרד עבור כל שיעור בהתאם למה שסיכמתם.",
  },
  {
    q: "האם אני חייב/ת להתחייב למספר שיעורים?",
    mobile: true,
    a: "לא. אין התחייבות למכסת שעות או למספר שיעורים. אתם בוחרים מתי ללמד ומתי ללמוד, בהתאם ליומן שלכם.",
  },
  {
    q: "איך מתקיימים השיעורים?",
    mobile: true,
    a: "השיעורים מתקיימים בכיתה וירטואלית עם וידאו חי — בלחיצת כפתור וללא צורך בהורדות או התקנות. בנוסף, הפלטפורמה מייצרת תקציר אוטומטי של השיעור באמצעות בינה מלאכותית.",
  },
  {
    q: "מה קורה אם צריך לבטל או לשנות שיעור?",
    mobile: true,
    a: "ניתן לבטל או לשנות שיעורים בקלות דרך היומן החכם. המערכת מעדכנת את שני הצדדים בזמן אמת ושולחת תזכורות אוטומטיות לתלמידים.",
  },
  {
    q: "איך נרשמים לפיילוט?",
    a: "ממלאים את טופס ההרשמה הקצר בתחתית העמוד עם כמה פרטים בסיסיים. ניצור איתכם קשר אישית לפני ההשקה ונשמור לכם מקום בפיילוט.",
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
            כל מה שרציתם לדעת לפני שמצטרפים לפיילוט
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((item, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className={`bg-card rounded-2xl border border-border px-4 md:px-6 shadow-sm transition-colors data-[state=open]:border-primary/30 border-b-0 ${item.mobile ? "" : "hidden md:block"}`}
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