import type { PainPointData } from "@/lib/types";
import { SectionHeading } from "./section-heading";
import type { SectionText } from "@/lib/sections";
import { Icon } from "@/components/icons";

/** 04 PROBLEM → SOLUTION: client pain points vs. how Mercy solves them. */
export function ProblemSolution({ items, index, heading }: { items: PainPointData[]; index: number; heading: SectionText }) {
  if (!items.length) return null;
  return (
    <section id="why" aria-labelledby="why-title" className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-32">
      <div id="why-title">
        <SectionHeading
          index={index} label={heading.label} title={heading.title} intro={heading.intro} />
      </div>
      <ol className="divide-y divide-line border-y border-line">
        {items.map((p, i) => (
          <li key={p.id} className="grid gap-4 py-7 md:grid-cols-[3rem_1fr_auto_1fr] md:items-center md:gap-8 md:py-9">
            <span className="font-mono text-sm text-muted" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <p data-reveal className="text-lg text-muted line-through decoration-accent/60 decoration-2 md:text-xl">
              <span className="sr-only">Problem: </span>
              {p.problem}
            </p>
            <span
              data-reveal
              style={{ "--i": 1 } as React.CSSProperties}
              className="grid h-11 w-11 place-items-center rounded-full bg-accent-soft text-accent max-md:rotate-90"
              aria-hidden="true"
            >
              <Icon name="arrow" />
            </span>
            <p data-reveal style={{ "--i": 2 } as React.CSSProperties} className="text-lg font-medium md:text-xl">
              <span className="sr-only">Solution: </span>
              {p.solution}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
