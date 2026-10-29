"use client";

import { useEffect, useRef, useState } from "react";
import { isFinePointer, prefersReducedMotion } from "@/lib/motion";

/**
 * Desktop-only cursor follower. Grows into a "Play" / "View" bubble over
 * elements with a data-cursor attribute. Disabled on touch devices and for
 * reduced motion. The native cursor stays visible for accessibility.
 */
export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!isFinePointer() || prefersReducedMotion()) return;
    setEnabled(true);
    const pos = { x: -100, y: -100, tx: -100, ty: -100 };
    let raf = 0;
    const move = (e: MouseEvent) => {
      pos.tx = e.clientX;
      pos.ty = e.clientY;
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor]");
      setLabel(el?.dataset.cursor ?? null);
    };
    const loop = () => {
      pos.x += (pos.tx - pos.x) * 0.2;
      pos.y += (pos.ty - pos.y) * 0.2;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;
  return (
    <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-[95]" aria-hidden="true">
      <div
        className="grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent font-mono text-xs font-semibold uppercase tracking-widest text-on-accent transition-[width,height,opacity] duration-300 ease-out"
        style={{ width: label ? 84 : 10, height: label ? 84 : 10, opacity: label ? 1 : 0.8 }}
      >
        {label && <span>{label}</span>}
      </div>
    </div>
  );
}
