import React from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const faqs = [
  { q: "כמה זה עולה?", a: "ההרשמה חינם. אין עלות עד שאתם מרוויחים משיעורים." },
  { q: "צריך ניסיון קודם בהוראה?", a: "לא חייבים ניסיון. מספיק שאתם שולטים בחומר ורוצים ללמד." },
  { q: "מתי מקבלים את התשלום?", a: "התשלום מועבר ישירות לחשבונכם לאחר קיום השיעור." },
  { q: "אפשר ללמד מהבית?", a: "כן. אפשר ללמד אונליין מהבית או פרונטלי, מתי שנוח לכם." },
];

export default function TeacherFaq() {
  return (
    <section aria-labelledby="teacher-faq-title" className="space-y-4">
      <h2 id="teacher-faq-title" className="text-xl font-heading font-bold text-foreground">
        שאלות נפוצות
      </h2>
      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((item, index) => (
          <AccordionItem
            key={item.q}
            value={`teacher-faq-${index}`}
            className="bg-card rounded-xl border border-border px-4 border-b-0"
          >
            <AccordionTrigger className="text-right text-base font-heading font-semibold text-foreground hover:no-underline gap-3 py-4">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground font-body leading-relaxed pb-4">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}