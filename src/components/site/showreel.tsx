"use client";

import { useEffect, useRef } from "react";
import { isFinePointer, loadGsap, prefersReducedMotion } from "@/lib/motion";
import { parseVideoUrl } from "@/lib/video";
import { useVideoModal } from "./video-modal";
import { SmartImage } from "./smart-image";
import { PlayButton } from "./play-button";
import { SectionHeading } from "./section-heading";
import type { SectionText } from "@/lib/sections";

/**
 * 05 SHOWREEL. Desktop: the frame is pinned and scales to fullscreen as you
 * scroll. Mobile / reduced motion: a simple facade card. Either way the
 * YouTube iframe loads only when the visitor clicks play.
 */
export function Showreel({ url, thumbnail, owner, index, heading }: { url: string; thumbnail: string; owner: string; index: number; heading: SectionText }) {
  const open = useVideoModal();
  const section = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLButtonElement>(null);
  const v = parseVideoUrl(url);

  useEffect(() => {
    if (!v || !isFinePointer() || prefersReducedMotion() || window.innerWidth < 1024) return;
    let ctx: { revert: () => void } | undefined;
    loadGsap().then(({ gsap }) => {
      ctx = gsap.context(() => {
        gsap.fromTo(
          frame.current,
          { scale: 0.62, borderRadius: 28 },
          {
            scale: 1,
            borderRadius: 0,
            ease: "none",
            scrollTrigger: { trigger: section.current, start: "top top", end: "+=110%", scrub: 0.6, pin: true },
          },
        );
      }, section);
    });
    return () => ctx?.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  if (!v) return null;

  return (
    <section id="showreel" aria-labelledby="showreel-title" className="relative">
      <div id="showreel-title" className="mx-auto max-w-7xl px-4 pt-20 md:px-8 md:pt-32">
        <SectionHeading index={index} label={heading.label} title={heading.title} intro={heading.intro} />
      </div>
      <div ref={section} className="overflow-hidden px-4 pb-20 md:px-8 lg:flex lg:h-screen lg:items-center lg:justify-center lg:p-0">
        <button
          ref={frame}
          type="button"
          onClick={() => open({ title: `${owner}: Showreel`, platform: v.platform, videoId: v.videoId, orientation: "LANDSCAPE" })}
          aria-label="Play showreel"
          className="media-frame group relative block aspect-video w-full overflow-hidden rounded-2xl will-change-transform lg:aspect-auto lg:h-full lg:rounded-none"
        >
          {thumbnail && <SmartImage src={thumbnail} alt={`${owner} showreel preview`} fill sizes="100vw" className="object-cover" />}
          <span className="scrim-b absolute inset-0" aria-hidden="true" />
          <span className="absolute inset-0 grid place-items-center">
            <PlayButton size="lg" />
          </span>
          <span className="absolute bottom-5 left-5 font-display text-3xl uppercase text-white md:bottom-10 md:left-10 md:text-6xl">
            Watch the reel
          </span>
        </button>
      </div>
    </section>
  );
}
