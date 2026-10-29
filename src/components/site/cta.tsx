"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { track } from "@/lib/track";
import { isFinePointer, prefersReducedMotion } from "@/lib/motion";

const variants = {
  primary:
    "bg-accent text-on-accent shadow-[0_8px_30px_-8px_var(--accent)] hover:shadow-[0_12px_40px_-8px_var(--accent)] shimmer",
  ghost: "border border-line text-fg hover:border-accent hover:text-accent bg-transparent",
  light: "border border-white/40 text-white hover:bg-white hover:text-black bg-black/20 backdrop-blur-sm",
};

/**
 * CTA link/button with an optional magnetic hover (desktop only) and
 * automatic analytics tracking.
 */
export function Cta({
  href,
  onClick,
  children,
  variant = "primary",
  event,
  magnetic = true,
  className,
  external,
  ariaLabel,
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: keyof typeof variants;
  event?: string;
  magnetic?: boolean;
  className?: string;
  external?: boolean;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  const onMove = (e: React.MouseEvent) => {
    if (!magnetic || !ref.current || !isFinePointer() || prefersReducedMotion()) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.25;
    const y = (e.clientY - r.top - r.height / 2) * 0.35;
    ref.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };
  const handle = () => {
    if (event) track(event, { location: typeof href === "string" ? href : "button" });
    onClick?.();
  };

  const cls = cn(
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 text-[0.95rem] font-semibold",
    "transition-[transform,box-shadow,background-color,color,border-color] duration-300 ease-out will-change-transform",
    "active:scale-[0.97]",
    variants[variant],
    className,
  );

  if (href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        onClick={handle}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className={cls}
        aria-label={ariaLabel}
        {...(external && { target: "_blank", rel: "noopener noreferrer" })}
      >
        {children}
      </a>
    );
  }
  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type="button"
      onClick={handle}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cls}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

/** Small social-proof line placed under major CTAs. */
export function ProofLine({ text, className }: { text: string; className?: string }) {
  if (!text) return null;
  return (
    <p className={cn("flex items-center gap-2 text-sm text-muted", className)}>
      <span className="flex text-accent" aria-hidden="true">
        {"★★★★★"}
      </span>
      {text}
    </p>
  );
}
