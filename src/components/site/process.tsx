"use client";

import { useEffect, useRef } from "react";
import type { ProcessData } from "@/lib/types";
import { isFinePointer, loadGsap, prefersReducedMotion } from "@/lib/motion";
import { Icon } from "@/components/icons";
import { SectionHeading } from "./section-heading";
import type { SectionText } from "@/lib/sections";

/**
 * 09 PROCESS. Desktop: the section pins and the steps scroll horizontally
 * along an editing timeline with a moving playhead. Mobile: vertical timeline.
 */
export function Process({ steps, index, heading }: { steps: ProcessData[]; index: number; heading: SectionText }) {
  const pin = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isFinePointer() || prefersReducedMotion() || window.innerWidth < 1024) return;
    let ctx: { revert: () => void } | undefined;
    loadGsap().then(({ gsap }) => {
      ctx = gsap.context(() => {
        const distance = () => Math.max(0, track.current!.scrollWidth - window.innerWidth + 64);
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pin.current,
            start: "top top",
            end: () => `+=${distance() + window.innerHeight * 0.4}`,
            scrub: 0.6,
            pin: true,
            invalidateOnRefresh: true,
          },
        });
        tl.to(track.current, { x: () => -distance(), ease: "none" }, 0)
          .fromTo(head.current, { left: "0%" }, { left: "100%", ease: "none" }, 0)
          .fromTo(fill.current, { scaleX: 0 }, { scaleX: 1, ease: "none" }, 0);
      }, pin);
    });
    return () => ctx?.revert();
  }, []);

  if (!steps.length) return null;

  return (
    <section id="process" aria-labelledby="process-title" className="bg-surface">
      <div ref={pin} className="overflow-hidden py-20 md:py-32 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:py-0">
        <div id="process-title" className="mx-auto w-full max-w-7xl px-4 md:px-8">
          <SectionHeading
            index={index} label={heading.label} title={heading.title} intro={heading.intro} />
        </div>

        {/* Timeline ruler + playhead (desktop) */}
        <div className="relative mx-auto mb-10 hidden w-full max-w-7xl px-8 lg:block" aria-hidden="true">
          <div className="relative h-8 border-b border-line bg-[repeating-linear-gradient(90deg,var(--border)_0_1px,transparent_1px_40px)]">
            <div ref={fill} className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-accent" />
            <div ref={head} className="absolute -top-2 bottom-[-8px] w-0.5 -translate-x-1/2 bg-accent">
              <span className="absolute -top-1 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-accent" />
            </div>
          </div>
        </div>

        <ol
          ref={track}
          className="relative mx-auto flex max-w-7xl flex-col gap-0 px-4 md:px-8 lg:mx-0 lg:max-w-none lg:flex-row lg:gap-6 lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))] lg:pr-16"
        >
          {steps.map((s, i) => (
            <li
              key={s.id}
              data-reveal
              style={{ "--i": i } as React.CSSProperties}
              className="relative border-l border-line pb-10 pl-8 last:pb-0 lg:w-[380px] lg:shrink-0 lg:rounded-3xl lg:border lg:bg-bg lg:p-8"
            >
              <span className="absolute -left-[7px] top-1 h-3.5 w-3.5 rounded-full border-2 border-accent bg-surface lg:hidden" aria-hidden="true" />
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-accent">STEP {String(i + 1).padStart(2, "0")}</span>
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-soft text-accent">
                  <Icon name={s.icon} />
                </span>
              </div>
              <h3 className="mt-4 text-2xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-muted">{s.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
