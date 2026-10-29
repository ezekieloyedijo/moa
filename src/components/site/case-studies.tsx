import type { ProjectData } from "@/lib/types";
import { SectionHeading } from "./section-heading";
import { BeforeAfter, WatchCaseButton } from "./case-studies-client";

/** 07 CASE STUDIES: Challenge → Approach → Before/After → Results. */
export function CaseStudies({ projects, index }: { projects: ProjectData[]; index: number }) {
  const studies = projects.filter((p) => p.isCaseStudy);
  if (!studies.length) return null;

  return (
    <section id="case-studies" aria-labelledby="cs-title" className="bg-surface py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div id="cs-title">
          <SectionHeading
            index={index}
            label="Case studies"
            title="How the edit moved the numbers"
            intro="A closer look at the problem, what I changed, and the measurable result."
          />
        </div>

        <div className="space-y-20 md:space-y-32">
          {studies.map((p, n) => (
            <article key={p.id} className="grid gap-10 lg:grid-cols-12 lg:gap-14">
              <header className="lg:col-span-12">
                <p className="font-mono text-xs uppercase tracking-widest text-accent">
                  Case {String(n + 1).padStart(2, "0")} · {p.client}
                </p>
                <h3 className="mt-2 font-display text-[clamp(2.2rem,5vw,4rem)] uppercase leading-[0.95]">{p.title}</h3>
                {p.resultMetric && (
                  <p className="mt-3 inline-flex rounded-full bg-accent-soft px-4 py-1.5 text-sm font-semibold text-accent">
                    ↗ {p.resultMetric}
                  </p>
                )}
              </header>

              <ol className="space-y-8 lg:col-span-5">
                {[
                  { label: "The challenge", text: p.challenge },
                  { label: "My approach", text: p.approach },
                  { label: "The results", text: p.results },
                ]
                  .filter((s) => s.text)
                  .map((s, i) => (
                    <li key={s.label} data-reveal style={{ "--i": i } as React.CSSProperties} className="relative border-l border-line pl-6">
                      <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-accent" aria-hidden="true" />
                      <h4 className="font-mono text-xs uppercase tracking-widest text-muted">{s.label}</h4>
                      <p className="mt-2 text-base leading-relaxed md:text-lg">{s.text}</p>
                    </li>
                  ))}
                <li className="pl-6">
                  <WatchCaseButton project={p} />
                </li>
              </ol>

              <div className="lg:col-span-7" data-reveal="scale">
                {p.beforeImageUrl && p.afterImageUrl ? (
                  <BeforeAfter before={p.beforeImageUrl} after={p.afterImageUrl} title={p.title} />
                ) : (
                  p.thumbnailUrl && <WatchCaseButton project={p} variant="thumb" />
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
