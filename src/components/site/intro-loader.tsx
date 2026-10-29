"use client";

import { useEffect, useRef, useState } from "react";
import { INTRO_KEY as KEY } from "@/lib/intro";

const DURATION = 1400; // counter run; total with wipe stays under 2s

/** 00 INTRO: timecode counter to 100%, name reveal, wipe into the hero. Skippable. */
export function IntroLoader({ brand }: { brand: string }) {
  const [pct, setPct] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [done, setDone] = useState(false);
  const raf = useRef(0);

  useEffect(() => {
    if (!document.documentElement.classList.contains("intro")) {
      setDone(true);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      setPct(Math.round((1 - Math.pow(1 - t, 3)) * 100));
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else finish();
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  function finish() {
    cancelAnimationFrame(raf.current);
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
    setLeaving(true);
    window.setTimeout(() => {
      document.documentElement.classList.remove("intro");
      setDone(true);
    }, 550);
  }

  if (done) return null;

  // Frames at 25fps for the timecode readout
  const frames = Math.round((pct / 100) * 49);
  const tc = `00:00:${String(Math.floor(frames / 25)).padStart(2, "0")}:${String(frames % 25).padStart(2, "0")}`;

  return (
    <div
      aria-hidden="true"
      className="intro-loader fixed inset-0 z-[100] hidden flex-col justify-between bg-[#0B0B0F] p-6 text-white md:p-10"
      style={{
        transform: leaving ? "translate3d(0,-100%,0)" : "none",
        transition: "transform 550ms cubic-bezier(.76,0,.24,1)",
      }}
    >
      <div className="flex items-center justify-between font-mono text-xs tracking-widest text-zinc-400">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#FF6B35]" /> REC
        </span>
        <span>{tc}</span>
      </div>

      <div className="overflow-hidden">
        <p
          className="font-display text-[clamp(5rem,22vw,16rem)] leading-[0.85]"
          style={{
            transform: pct > 15 ? "none" : "translate3d(0,100%,0)",
            transition: "transform 700ms cubic-bezier(.16,1,.3,1)",
          }}
        >
          {brand}
          <span className="text-[#FF6B35]">.</span>
        </p>
      </div>

      <div>
        <div className="mb-3 flex items-end justify-between">
          <span className="font-display text-6xl tabular-nums md:text-8xl">{pct}%</span>
          <button
            type="button"
            onClick={finish}
            className="pointer-events-auto min-h-11 rounded-full border border-white/30 px-5 font-mono text-xs uppercase tracking-widest text-white hover:bg-white hover:text-black"
          >
            Skip intro
          </button>
        </div>
        {/* Timeline with playhead */}
        <div className="relative h-px w-full bg-white/20">
          <div className="absolute inset-y-0 left-0 bg-[#FF6B35]" style={{ width: `${pct}%` }} />
          <div className="absolute -top-2 h-5 w-px bg-[#FF6B35]" style={{ left: `${pct}%` }} />
        </div>
      </div>
    </div>
  );
}
