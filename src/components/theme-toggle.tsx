"use client";

import { useEffect, useId, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/**
 * Sun ⇄ moon morph: one circle grows into the sun body while a second
 * "bite" circle slides in to carve the crescent; rays scale away.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const maskId = `bite${useId().replace(/:/g, "")}`;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const dark = !mounted || resolvedTheme !== "light";

  function toggle() {
    const root = document.documentElement;
    root.classList.add("theming");
    setTheme(dark ? "light" : "dark");
    window.setTimeout(() => root.classList.remove("theming"), 350);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className={cn(
        "relative grid h-11 w-11 place-items-center rounded-full border border-line text-fg transition-colors hover:border-accent hover:text-accent",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" className="overflow-visible">
        <mask id={maskId}>
          <rect x="0" y="0" width="24" height="24" fill="white" />
          <circle
            cx={dark ? 17 : 30}
            cy={dark ? 7 : -6}
            r="7"
            fill="black"
            style={{ transition: "cx 500ms cubic-bezier(.16,1,.3,1), cy 500ms cubic-bezier(.16,1,.3,1)" }}
          />
        </mask>
        <circle
          cx="12"
          cy="12"
          r={dark ? 9 : 5}
          fill="currentColor"
          mask={`url(#${maskId})`}
          style={{ transition: "r 500ms cubic-bezier(.16,1,.3,1)" }}
        />
        <g
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            transformOrigin: "12px 12px",
            transform: dark ? "rotate(-45deg) scale(0)" : "rotate(0) scale(1)",
            opacity: dark ? 0 : 1,
            transition: "transform 500ms cubic-bezier(.16,1,.3,1), opacity 300ms",
          }}
        >
          <path d="M12 1.5v2M12 20.5v2M1.5 12h2M20.5 12h2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M4.6 19.4L6 18M18 6l1.4-1.4" />
        </g>
      </svg>
    </button>
  );
}
