"use client";

import { useEffect } from "react";

/**
 * One IntersectionObserver for the whole page: adds `.is-in` to any
 * [data-reveal] / .mask-line element as it scrolls into view. CSS does the
 * animating (transform/opacity only → 60fps). Watches for new nodes too.
 */
export function RevealObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    const scan = (root: ParentNode) =>
      root.querySelectorAll("[data-reveal]:not(.is-in), .mask-line:not(.is-in)").forEach((el) => io.observe(el));
    scan(document);
    const mo = new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach((n) => n instanceof Element && scan(n))));
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}
