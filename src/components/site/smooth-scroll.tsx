"use client";

import { useEffect } from "react";
import { loadGsap, prefersReducedMotion } from "@/lib/motion";

type LenisLike = { scrollTo: (t: string | number | HTMLElement, o?: { offset?: number }) => void };
let lenis: LenisLike | null = null;

/** Smooth-scroll to an anchor (falls back to native scrolling). */
export function scrollToTarget(target: string | number) {
  if (lenis) return lenis.scrollTo(target, { offset: typeof target === "string" ? -72 : 0 });
  if (typeof target === "number") return window.scrollTo({ top: target, behavior: "smooth" });
  document.querySelector(target)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
}

/** Lenis smooth scrolling, synced with GSAP ScrollTrigger. Off for reduced motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let destroyed = false;
    let instance: { destroy: () => void } | null = null;

    (async () => {
      const [{ default: Lenis }, { ScrollTrigger }] = await Promise.all([import("lenis"), loadGsap()]);
      if (destroyed) return;
      const l = new Lenis({ duration: 1.1, autoRaf: true });
      l.on("scroll", ScrollTrigger.update);
      lenis = l;
      instance = l;
    })();

    // Intercept same-page anchor clicks for smooth scrolling.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a[href^='#']") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank") return;
      const hash = a.getAttribute("href")!;
      if (hash.length < 2 || !document.querySelector(hash)) return;
      e.preventDefault();
      scrollToTarget(hash);
      history.replaceState(null, "", hash);
    };
    document.addEventListener("click", onClick);

    return () => {
      destroyed = true;
      document.removeEventListener("click", onClick);
      instance?.destroy();
      lenis = null;
    };
  }, []);
  return null;
}
