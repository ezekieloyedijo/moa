"use client";

import { useEffect, useRef, useState } from "react";
import { loadGsap, prefersReducedData, prefersReducedMotion } from "@/lib/motion";
import { parseVideoUrl } from "@/lib/video";
import { useVideoModal } from "./video-modal";
import { Icon } from "@/components/icons";

/**
 * Hero background. The poster renders on the server (fast LCP). The muted MP4
 * loop is attached only on capable connections with a wide enough screen;
 * phones and data-saver users keep the poster. Adds subtle scroll parallax.
 */
export function HeroMedia({ videoUrl, children }: { videoUrl: string; children: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    if (videoUrl && !prefersReducedData() && window.matchMedia("(min-width: 768px)").matches) setShowVideo(true);
  }, [videoUrl]);

  useEffect(() => {
    if (prefersReducedMotion() || !wrap.current) return;
    let kill: (() => void) | undefined;
    loadGsap().then(({ gsap }) => {
      const tween = gsap.to(wrap.current, {
        yPercent: 18,
        scale: 1.08,
        ease: "none",
        scrollTrigger: { trigger: wrap.current!.parentElement, start: "top top", end: "bottom top", scrub: true },
      });
      kill = () => tween.scrollTrigger?.kill();
    });
    return () => kill?.();
  }, []);

  return (
    <div ref={wrap} className="absolute inset-0 -z-20 will-change-transform" aria-hidden="true">
      {children}
      {showVideo && (
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
        />
      )}
    </div>
  );
}

/** Rotating role word. All words share one grid cell so width never jumps (no CLS). */
export function RotatingWord({ words }: { words: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (words.length < 2 || prefersReducedMotion()) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % words.length), 2400);
    return () => window.clearInterval(t);
  }, [words.length]);

  return (
    <span className="relative inline-grid overflow-hidden align-bottom text-[#FF6B35]">
      {words.map((w, n) => (
        <span
          key={w}
          aria-hidden={n !== i}
          className="col-start-1 row-start-1 whitespace-nowrap transition-[transform,opacity] duration-500 ease-[cubic-bezier(.16,1,.3,1)]"
          style={{
            transform: n === i ? "none" : `translate3d(0, ${n < i ? "-100%" : "100%"}, 0)`,
            opacity: n === i ? 1 : 0,
          }}
        >
          {w}
        </span>
      ))}
    </span>
  );
}

/** Running timecode readout (motif). */
export function Timecode() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const f = Math.floor(((now - start) / 1000) * 25);
      const s = Math.floor(f / 25);
      if (ref.current)
        ref.current.textContent = `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor(s / 60) % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}:${String(f % 25).padStart(2, "0")}`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <span className="hidden items-center gap-2 font-mono text-xs tracking-widest text-white/70 sm:inline-flex" aria-hidden="true">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> REC <span ref={ref}>00:00:00:00</span>
    </span>
  );
}

export function WatchShowreelButton({ url, title }: { url: string; title: string }) {
  const open = useVideoModal();
  const v = parseVideoUrl(url);
  if (!v) return null;
  return (
    <button
      type="button"
      onClick={() => open({ title, platform: v.platform, videoId: v.videoId, orientation: "LANDSCAPE" })}
      className="group inline-flex min-h-12 items-center gap-3 rounded-full border border-white/40 bg-black/20 py-1.5 pl-1.5 pr-6 font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-black"
    >
      <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-black transition group-hover:bg-black group-hover:text-white">
        <Icon name="play" size={14} />
      </span>
      Watch Showreel
    </button>
  );
}
