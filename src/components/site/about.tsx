import type { SettingsData } from "@/lib/types";
import { SmartImage } from "./smart-image";
import { SectionHeading } from "./section-heading";
import type { SectionText } from "@/lib/sections";

const TOOL_ABBR: Record<string, string> = {
  "premiere pro": "Pr",
  "after effects": "Ae",
  "davinci resolve": "Dr",
  capcut: "Cc",
  photoshop: "Ps",
  audition: "Au",
  illustrator: "Ai",
  "final cut pro": "Fc",
  blender: "Bl",
  "cinema 4d": "C4",
  figma: "Fg",
};
const abbr = (t: string) => TOOL_ABBR[t.toLowerCase()] ?? t.slice(0, 2);

/** 11 ABOUT: portrait with mask reveal + accent glow, story, experience, software. */
export function About({ s, index, heading }: { s: SettingsData; index: number; heading: SectionText }) {
  const paragraphs = s.aboutText.split(/\n{2,}/).filter(Boolean);
  return (
    <section id="about" aria-labelledby="about-title" className="mx-auto max-w-7xl overflow-x-clip px-4 py-20 md:px-8 md:py-32">
      <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-20">
        {/* The unclipped wrapper is observed: a fully clipped target never reports as intersecting. */}
        <div data-reveal className="about-portrait relative mx-auto w-full max-w-md lg:col-span-5">
          {/* Accent glow + offset shape so the portrait pops in both themes */}
          <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-accent opacity-25 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-[2rem] border-2 border-accent" aria-hidden="true" />
          <div className="about-mask media-frame relative aspect-[4/5] overflow-hidden rounded-[2rem]">
            {s.portraitUrl && (
              <SmartImage src={s.portraitUrl} alt={s.portraitAlt || `Portrait of ${s.ownerName}`} fill sizes="(min-width:1024px) 40vw, 90vw" className="object-cover" />
            )}
          </div>
          <div className="absolute -left-3 bottom-8 rounded-2xl border border-line bg-surface px-5 py-4 shadow-soft md:-left-8">
            <p className="font-display text-5xl leading-none text-accent">{s.yearsExperience}+</p>
            <p className="text-sm text-muted">years editing</p>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div id="about-title">
            <SectionHeading index={index} label={heading.label} title={heading.title} className="!mb-8" />
          </div>
          <div className="space-y-5 text-base leading-relaxed text-muted md:text-lg">
            {paragraphs.map((p, i) => (
              <p key={i} data-reveal style={{ "--i": i } as React.CSSProperties} className={i === 0 ? "text-fg" : undefined}>
                {p}
              </p>
            ))}
          </div>
          <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-line pt-8 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted">Based in</dt>
              <dd className="font-semibold">{s.location}</dd>
            </div>
            <div>
              <dt className="text-muted">Experience</dt>
              <dd className="font-semibold">{s.yearsExperience}+ years</dd>
            </div>
            <div>
              <dt className="text-muted">Works with</dt>
              <dd className="font-semibold">Clients worldwide</dd>
            </div>
          </dl>
          {s.softwareTools.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted">My toolkit</h3>
              <ul className="flex flex-wrap gap-3">
                {s.softwareTools.map((t, i) => (
                  <li key={t} data-reveal style={{ "--i": i } as React.CSSProperties} className="group flex items-center gap-2.5 rounded-xl border border-line bg-surface py-2 pl-2 pr-4">
                    <span className="grid h-9 w-9 place-items-center rounded-lg border border-accent/40 bg-accent-soft font-display text-lg text-accent" aria-hidden="true">
                      {abbr(t)}
                    </span>
                    <span className="text-sm font-medium">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
