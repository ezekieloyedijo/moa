import type { FaqData } from "@/lib/types";
import { SectionHeading } from "./section-heading";
import { Accordion } from "./accordion";

/** 12 FAQ: animated accordion. */
export function Faq({ faqs, index }: { faqs: FaqData[]; index: number }) {
  if (!faqs.length) return null;
  return (
    <section id="faq" aria-labelledby="faq-title" className="bg-surface py-20 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:px-8 lg:grid-cols-12">
        <div id="faq-title" className="lg:col-span-4">
          <SectionHeading index={index} label="FAQ" title="Questions, answered" intro="Everything clients usually ask before we start working together." />
        </div>
        <div className="lg:col-span-8">
          <Accordion
            defaultOpen={0}
            items={faqs.map((f) => ({
              id: f.id,
              title: f.question,
              content: <p className="max-w-2xl text-base leading-relaxed text-muted md:text-lg">{f.answer}</p>,
            }))}
          />
        </div>
      </div>
    </section>
  );
}
