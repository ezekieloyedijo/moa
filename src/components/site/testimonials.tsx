"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { TestimonialData } from "@/lib/types";
import { parseVideoUrl } from "@/lib/video";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons";
import { useVideoModal } from "./video-modal";
import { SmartImage } from "./smart-image";
import { SectionHeading } from "./section-heading";
import { Cta } from "./cta";

/** Avatar: photo when uploaded, otherwise initials on an accent tint. */
export function Avatar({ name, photo, size = 56 }: { name: string; photo?: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
  return (
    <span className="relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-accent-soft font-semibold text-accent ring-1 ring-line" style={{ width: size, height: size }}>
      {photo ? <SmartImage src={photo} alt={`Photo of ${name}`} fill sizes={`${size}px`} className="object-cover" /> : initials}
    </span>
  );
}

/** 10 TESTIMONIALS: auto-sliding carousel (pauses on hover/touch/focus), video testimonials supported. */
export function Testimonials({
  items,
  index,
  happyClients,
  bookHref,
  bookExternal,
}: {
  items: TestimonialData[];
  index: number;
  happyClients: number;
  bookHref: string;
  bookExternal: boolean;
}) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dir, setDir] = useState(1);
  const reduce = useReducedMotion();
  const open = useVideoModal();
  const touchX = useRef(0);

  const go = useCallback(
    (d: number) => {
      setDir(d);
      setI((n) => (n + d + items.length) % items.length);
    },
    [items.length],
  );

  useEffect(() => {
    if (paused || reduce || items.length < 2) return;
    const t = window.setTimeout(() => go(1), 6000);
    return () => window.clearTimeout(t);
  }, [i, paused, reduce, go, items.length]);

  if (!items.length) return null;
  const t = items[i];
  const video = t.videoUrl ? parseVideoUrl(t.videoUrl) : null;

  return (
    <section id="testimonials" aria-labelledby="testimonials-title" className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-32">
      <div id="testimonials-title">
        <SectionHeading index={index} label="Testimonials" title="What clients say" intro="Real words from creators, brands and agencies I've edited for." />
      </div>

      <div
        className="relative rounded-3xl border border-line bg-surface p-6 sm:p-10 md:p-16"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        onTouchStart={(e) => {
          setPaused(true);
          touchX.current = e.touches[0].clientX;
        }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        }}
        aria-roledescription="carousel"
        aria-label="Client testimonials"
      >
        <Icon name="quote" size={56} strokeWidth={1.2} className="mb-6 text-accent" />
        <div className="relative min-h-[240px] sm:min-h-[200px]" aria-live={paused ? "polite" : "off"}>
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.figure
              key={t.id}
              custom={dir}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -40 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${items.length}`}
            >
              <blockquote className="font-serif text-[clamp(1.6rem,3.6vw,2.75rem)] italic leading-[1.25]">“{t.quote}”</blockquote>
              <figcaption className="mt-8 flex flex-wrap items-center gap-4">
                <Avatar name={t.name} photo={t.photoUrl} />
                <div className="flex-1">
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-muted">{[t.role, t.company].filter(Boolean).join(", ")}</p>
                  <p className="mt-1 flex gap-0.5 text-accent" aria-label={`${t.rating} out of 5 stars`}>
                    {Array.from({ length: t.rating }).map((_, n) => (
                      <Icon key={n} name="star" size={14} />
                    ))}
                  </p>
                </div>
                {video && (
                  <button
                    type="button"
                    onClick={() => open({ title: `Testimonial from ${t.name}`, platform: video.platform, videoId: video.videoId, orientation: video.suggestedOrientation })}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-4 text-sm font-medium hover:border-accent hover:text-accent"
                  >
                    <Icon name="play" size={14} /> Watch video testimonial
                  </button>
                )}
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        {items.length > 1 && (
          <div className="mt-10 flex items-center justify-between gap-4">
            <div className="flex gap-1.5" role="tablist" aria-label="Choose testimonial">
              {items.map((x, n) => (
                <button
                  key={x.id}
                  role="tab"
                  aria-selected={n === i}
                  aria-label={`Testimonial ${n + 1}`}
                  onClick={() => (setDir(n > i ? 1 : -1), setI(n))}
                  className="grid h-11 min-w-6 place-items-center"
                >
                  <span className={cn("block h-1.5 rounded-full transition-all duration-300", n === i ? "w-8 bg-accent" : "w-3 bg-line")} />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => go(-1)} aria-label="Previous testimonial" className="grid h-12 w-12 place-items-center rounded-full border border-line hover:border-accent hover:text-accent">
                <Icon name="arrow" className="rotate-180" />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Next testimonial" className="grid h-12 w-12 place-items-center rounded-full border border-line hover:border-accent hover:text-accent">
                <Icon name="arrow" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* All quotes in HTML for search engines / no-JS readers */}
      <ul className="sr-only">
        {items.map((x) => (
          <li key={x.id}>
            “{x.quote}”: {x.name}, {x.company}
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-col items-center gap-3 text-center">
        <Cta href={bookHref} external={bookExternal} event="book_call">
          Join {happyClients}+ happy clients · Book a Call <Icon name="arrow" size={18} />
        </Cta>
      </div>
    </section>
  );
}
