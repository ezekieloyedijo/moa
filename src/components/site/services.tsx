import type { PricingData, ServiceData } from "@/lib/types";
import { SectionHeading } from "./section-heading";
import type { SectionText } from "@/lib/sections";
import { Accordion } from "./accordion";
import { Cta, ProofLine } from "./cta";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";

/** 08 SERVICES & PACKAGES: numbered expandable services + 3 pricing tiers. */
export function Services({
  services,
  pricing,
  index,
  heading,
  bookHref,
  bookExternal,
  proof,
}: {
  services: ServiceData[];
  pricing: PricingData[];
  index: number;
  heading: SectionText;
  bookHref: string;
  bookExternal: boolean;
  proof: string;
}) {
  return (
    <section id="services" aria-labelledby="services-title" className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-32">
      <div id="services-title">
        <SectionHeading
          index={index} label={heading.label} title={heading.title} intro={heading.intro} />
      </div>

      {services.length > 0 && (
        <Accordion
          numbered
          items={services.map((s) => ({
            id: s.id,
            title: (
              <span className="flex items-center gap-3">
                <Icon name={s.icon} className="hidden text-accent sm:block" />
                {s.title}
              </span>
            ),
            lead: [s.startingPrice, s.turnaround && `Turnaround ${s.turnaround}`].filter(Boolean).join(" · "),
            content: (
              <div className="grid gap-6 md:grid-cols-2">
                <p className="text-base text-muted md:text-lg">{s.description}</p>
                {s.deliverables.length > 0 && (
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {s.deliverables.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-sm">
                        <Icon name="check" size={18} className="mt-0.5 shrink-0 text-accent" />
                        {d}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ),
          }))}
        />
      )}

      {pricing.length > 0 && (
        <div className="mt-20">
          <h3 className="mb-2 font-display text-[clamp(2rem,4.5vw,3.25rem)] uppercase leading-none">Packages</h3>
          <p className="mb-10 text-muted">Clear prices, no surprises. Every package starts with a free consultation.</p>
          <ul className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
            {pricing.map((t, i) => (
              <li
                key={t.id}
                data-reveal
                style={{ "--i": i } as React.CSSProperties}
                className={cn(
                  "relative flex flex-col rounded-3xl border p-7 transition-transform duration-300 hover:-translate-y-1 md:p-8",
                  t.isPopular ? "border-accent bg-surface shadow-[0_20px_60px_-20px_var(--accent)] lg:-my-4 lg:py-12" : "border-line bg-surface",
                )}
              >
                {t.isPopular && (
                  <span className="absolute -top-3.5 left-7 rounded-full bg-accent px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-on-accent">
                    Most popular
                  </span>
                )}
                <h4 className="font-mono text-sm uppercase tracking-widest text-muted">{t.name}</h4>
                <p className="mt-3 font-display text-6xl leading-none">{t.price}</p>
                <p className="mt-3 text-sm text-muted">
                  {[t.revisions, t.turnaround && `${t.turnaround} turnaround`].filter(Boolean).join(" · ")}
                </p>
                <ul className="my-7 flex-1 space-y-3 border-t border-line pt-7">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[0.95rem]">
                      <Icon name="check" size={18} className="mt-0.5 shrink-0 text-accent" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Cta href={bookHref} external={bookExternal} event="book_call" variant={t.isPopular ? "primary" : "ghost"} className="w-full" magnetic={false}>
                  {t.ctaLabel}
                </Cta>
              </li>
            ))}
          </ul>
          <ProofLine text={proof} className="mt-10 justify-center" />
        </div>
      )}
    </section>
  );
}
