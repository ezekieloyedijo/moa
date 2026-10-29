"use client";

/**
 * Lazily loads GSAP + ScrollTrigger in their own chunk, so the
 * animation code never blocks first paint (code-splitting).
 */
type GsapBundle = {
  gsap: typeof import("gsap").gsap;
  ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger;
};

let loading: Promise<GsapBundle> | null = null;

export function loadGsap(): Promise<GsapBundle> {
  loading ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, st]) => {
    g.gsap.registerPlugin(st.ScrollTrigger);
    return { gsap: g.gsap, ScrollTrigger: st.ScrollTrigger };
  });
  return loading;
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Desktop pointer with hover: enables cursor effects + pinned scroll scenes. */
export const isFinePointer = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/** Data-saver or slow connection → skip the hero video and heavy effects. */
export function prefersReducedData() {
  if (typeof window === "undefined") return true;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return (
    window.matchMedia("(prefers-reduced-data: reduce)").matches ||
    !!conn?.saveData ||
    /(^|-)2g|3g/.test(conn?.effectiveType ?? "")
  );
}
