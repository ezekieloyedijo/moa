"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { Icon } from "@/components/icons";
import { Logo } from "./logo";
import { Cta } from "./cta";
import { cn } from "@/lib/utils";
import { isFinePointer, prefersReducedMotion } from "@/lib/motion";

/** Hover text scramble (desktop only) — letters shuffle then settle. */
function ScrambleLink({ href, label }: { href: string; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const timer = useRef<number>(0);
  const run = () => {
    if (!isFinePointer() || prefersReducedMotion() || !ref.current) return;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let frame = 0;
    window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      if (!ref.current) return;
      ref.current.textContent = label
        .split("")
        .map((c, i) => (i < frame / 2 ? c : chars[Math.floor(Math.random() * chars.length)]))
        .join("");
      if (++frame > label.length * 2) {
        window.clearInterval(timer.current);
        ref.current.textContent = label;
      }
    }, 28);
  };
  return (
    <a
      href={href}
      onMouseEnter={run}
      className="relative inline-flex min-h-11 items-center px-3 font-mono text-[0.8rem] uppercase tracking-[0.14em] text-muted transition-colors hover:text-fg"
    >
      <span ref={ref} aria-label={label}>
        {label}
      </span>
    </a>
  );
}

export function Navbar({
  brand,
  logoLightUrl,
  logoDarkUrl,
  bookHref,
  bookExternal,
  links,
}: {
  brand: string;
  logoLightUrl: string;
  logoDarkUrl: string;
  bookHref: string;
  bookExternal: boolean;
  /** In-page links; sections switched off in the dashboard are left out. */
  links: Array<{ href: string; label: string }>;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("lenis-stopped", open);
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
      >
        Skip to content
      </a>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
          scrolled || open ? "border-b border-line bg-glass backdrop-blur-xl backdrop-saturate-150" : "border-b border-transparent",
        )}
      >
        <nav aria-label="Main" className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:h-[4.5rem] md:px-8">
          <a
            href="#top"
            aria-label={`${brand} — back to top`}
            className={cn("min-h-11 inline-flex items-center", !scrolled && !open && "text-white")}
          >
            <Logo brand={brand} lightUrl={logoLightUrl} darkUrl={logoDarkUrl} />
          </a>

          <ul
            className={cn(
              "hidden items-center lg:flex",
              !scrolled && "[&_a]:text-white/80! [&_a:hover]:text-white!",
            )}
          >
            {links.map((l) => (
              <li key={l.href}>
                <ScrambleLink {...l} />
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <ThemeToggle className={cn(!scrolled && !open && "border-white/30! text-white!")} />
            <Cta
              href={bookHref}
              external={bookExternal}
              event="book_call"
              className="min-h-11! px-4! text-sm sm:px-5!"
            >
              Book a Call
            </Cta>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className={cn(
                "grid h-11 w-11 place-items-center rounded-full border border-line lg:hidden",
                !scrolled && !open && "border-white/30! text-white!",
              )}
            >
              <Icon name={open ? "close" : "menu"} />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col bg-bg px-6 pb-8 pt-24 lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
          >
            <ul className="flex flex-1 flex-col justify-center gap-1">
              {links.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-14 items-baseline gap-4 font-display text-6xl uppercase leading-none"
                  >
                    <span className="font-mono text-sm text-accent">0{i + 1}</span>
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <Cta href={bookHref} external={bookExternal} event="book_call" className="w-full" magnetic={false}>
                Book a Free Consultation <Icon name="arrow" size={18} />
              </Cta>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
