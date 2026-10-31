import type { SettingsData } from "@/lib/types";
import { SmartImage } from "./smart-image";
import { HeroMedia, RotatingWord, Timecode, WatchShowreelButton } from "./hero-client";
import { Cta, ProofLine } from "./cta";
import { Icon } from "@/components/icons";

/**
 * 02 HERO. Always sits on dark footage + scrim, so its text is white in both
 * themes. The H1 holds the owner's name AND role (one H1 on the page).
 */
export function Hero({ s, bookHref, bookExternal, showExplore }: { s: SettingsData; bookHref: string; bookExternal: boolean; showExplore: boolean }) {
  const name = s.heroHeadline || s.ownerName;
  let letterIndex = 0;

  return (
    <section id="top" aria-label="Introduction" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-black text-white">
      {/* Background: poster (LCP image) + optional muted loop */}
      <HeroMedia videoUrl={s.heroVideoUrl}>
        {s.heroPosterUrl && <SmartImage src={s.heroPosterUrl} alt="" fill priority sizes="100vw" className="object-cover" />}
      </HeroMedia>
      <div className="scrim-full absolute inset-0 -z-10" aria-hidden="true" />

      {/* Letterbox bars + timecode motif */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[7svh] bg-black" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[5svh] bg-black" aria-hidden="true" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-4 pb-[12svh] pt-28 md:px-8 md:pb-[11svh]">
        <div className="hero-fade mb-6 flex flex-wrap items-center gap-3" style={{ "--d": "0ms" } as React.CSSProperties}>
          {s.availabilityStatus && (
            <span className="inline-flex min-h-9 items-center gap-2.5 rounded-full border border-white/20 bg-black/40 px-4 text-sm backdrop-blur-md">
              <span className="pulse-dot relative h-2 w-2 rounded-full bg-emerald-400 text-emerald-400" aria-hidden="true" />
              {s.availabilityStatus}
              {s.availableFrom && <span className="hidden text-white/70 sm:inline">· {s.availableFrom}</span>}
            </span>
          )}
          <Timecode />
        </div>

        <h1 className="font-display uppercase">
          <span className="sr-only">{name}, </span>
          <span className="block text-[clamp(3.6rem,15vw,13rem)] leading-[0.85] tracking-tight" aria-hidden="true">
            {name.split(" ").map((word, w) => (
              <span key={w}>
                {w > 0 && " "}
                <span className="inline-block overflow-hidden pb-[0.04em] align-bottom">
                  {word.split("").map((ch, c) => (
                    <span key={c} className="hero-letter" style={{ "--i": letterIndex++ } as React.CSSProperties}>
                      {ch}
                    </span>
                  ))}
                </span>
              </span>
            ))}
          </span>
          <span
            className="hero-fade mt-3 block text-[clamp(1.5rem,4vw,2.75rem)] leading-none tracking-wide text-[#FF6B35]"
            style={{ "--d": "250ms" } as React.CSSProperties}
          >
            {s.role}
          </span>
        </h1>

        <div className="hero-fade mt-6 max-w-3xl space-y-3" style={{ "--d": "400ms" } as React.CSSProperties}>
          {s.rotatingWords.length > 0 && (
            <p className="text-lg font-medium md:text-2xl">
              I help creators, brands &amp; agencies win with <RotatingWord words={s.rotatingWords} />
            </p>
          )}
          {s.heroSubheadline && <p className="text-base text-white/80 md:text-lg">{s.heroSubheadline}</p>}
        </div>

        <div className="hero-fade mt-8 flex flex-col gap-3 sm:flex-row sm:items-center" style={{ "--d": "550ms" } as React.CSSProperties}>
          <Cta href={bookHref} external={bookExternal} event="book_call" className="!bg-[#FF6B35] !text-[#0B0B0F]">
            Book a Free Consultation <Icon name="arrow" size={18} />
          </Cta>
          {s.showreelUrl && <WatchShowreelButton url={s.showreelUrl} title={`${s.ownerName} — Showreel`} />}
        </div>

        {s.trustLine && (
          <div className="hero-fade mt-6" style={{ "--d": "700ms" } as React.CSSProperties}>
            <ProofLine text={s.trustLine} className="!text-white/80 [&>span]:!text-[#FF6B35]" />
          </div>
        )}
      </div>

      {/* Rotating "scroll to explore" badge (points at the work section, so it goes when that's switched off) */}
      {showExplore && (
        <a
          href="#work"
          aria-label="Scroll to explore my work"
          className="absolute bottom-[16svh] right-4 hidden h-28 w-28 md:right-8 md:grid md:place-items-center"
        >
          <svg viewBox="0 0 100 100" className="spin-slow absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <path id="circle-path" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
            </defs>
            <text className="fill-white font-mono text-[9px] uppercase">
              <textPath href="#circle-path" textLength="232" lengthAdjust="spacing">
                Scroll to explore • Watch my work •
              </textPath>
            </text>
          </svg>
          <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-black">
            <Icon name="arrow" className="rotate-90" size={18} />
          </span>
        </a>
      )}
    </section>
  );
}
