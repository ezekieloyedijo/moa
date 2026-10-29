"use client";

import { useEffect, useRef, useState } from "react";
import type { LogoData, StatData } from "@/lib/types";
import { prefersReducedMotion } from "@/lib/motion";
import { SmartImage } from "./smart-image";

/** 03 TRUST BAR: monochrome logo marquee (speeds up with scroll) + count-up stats. */
export function TrustBar({ logos, stats }: { logos: LogoData[]; stats: StatData[] }) {
  return (
    <section aria-labelledby="trust-heading" className="border-y border-line bg-surface py-10 md:py-14">
      <h2 id="trust-heading" className="mb-8 px-4 text-center font-mono text-xs uppercase tracking-[0.2em] text-muted">
        Trusted by creators, brands &amp; agencies
      </h2>
      {logos.length > 0 && <Marquee logos={logos} />}
      {stats.length > 0 && (
        <dl className="mx-auto mt-12 grid max-w-6xl grid-cols-2 gap-y-8 px-4 md:grid-cols-4 md:px-8">
          {stats.map((s, i) => (
            <div key={s.id} data-reveal style={{ "--i": i } as React.CSSProperties} className="text-center md:border-l md:border-line md:first:border-l-0">
              <dd className="font-display text-[clamp(3rem,7vw,5rem)] leading-none text-fg">
                <CountUp value={s.value} />
                <span className="text-accent">{s.suffix}</span>
              </dd>
              <dt className="mt-2 text-sm text-muted">{s.label}</dt>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

function Marquee({ logos }: { logos: LogoData[] }) {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || prefersReducedMotion()) return;
    let x = 0;
    let velocity = 0;
    let lastY = window.scrollY;
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    const loop = () => {
      const y = window.scrollY;
      velocity += ((y - lastY) * 0.6 - velocity) * 0.1; // smoothed scroll speed
      lastY = y;
      if (visible) {
        const half = el.scrollWidth / 2;
        x -= 0.6 + Math.abs(velocity) * 0.35;
        if (x <= -half) x += half;
        el.style.transform = `translate3d(${x}px,0,0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  const row = [...logos, ...logos];
  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
      <div ref={track} className="flex w-max items-center gap-14 will-change-transform md:gap-20">
        {[...row, ...row].map((l, i) => (
          <div key={`${l.id}-${i}`} className="relative h-10 w-32 shrink-0 md:h-12 md:w-40" aria-hidden={i >= logos.length}>
            <SmartImage src={l.logoUrl} alt={i < logos.length ? l.name : ""} fill sizes="160px" className="logo-mono object-contain" />
          </div>
        ))}
      </div>
    </div>
  );
}

function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(value); // server renders the real number (no-JS / SEO)

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    setN(0);
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const dur = 1600;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / dur);
          setN(Math.round(value * (1 - Math.pow(1 - t, 4))));
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <span ref={ref} className="tabular-nums">
      {n.toLocaleString("en-US")}
    </span>
  );
}
