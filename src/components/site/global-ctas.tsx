"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { whatsappLink, cn } from "@/lib/utils";
import { track } from "@/lib/track";
import { Icon } from "@/components/icons";
import { Cta, ProofLine } from "./cta";

const POPUP_KEY = "moa-consult-popup";

/**
 * Floating WhatsApp button, the mobile sticky "Book a Call" bar, and a
 * one-time consultation popup (60% scroll or exit intent).
 */
export function GlobalCtas({
  whatsapp,
  ownerFirstName,
  bookHref,
  bookExternal,
  proof,
  availability,
}: {
  whatsapp: string;
  ownerFirstName: string;
  bookHref: string;
  bookExternal: boolean;
  proof: string;
  availability: string;
}) {
  const [pastHero, setPastHero] = useState(false);
  const [nearEnd, setNearEnd] = useState(false);
  const [popup, setPopup] = useState(false);
  const wa = whatsappLink(whatsapp, `Hi ${ownerFirstName}, I'd like to talk about a video project.`);

  useEffect(() => {
    let shown = false;
    try {
      shown = !!localStorage.getItem(POPUP_KEY);
    } catch {}

    const show = () => {
      if (shown) return;
      shown = true;
      try {
        localStorage.setItem(POPUP_KEY, "1");
      } catch {}
      setPopup(true);
    };

    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setPastHero(y > window.innerHeight * 0.8);
      const contact = document.getElementById("contact");
      setNearEnd(!!contact && contact.getBoundingClientRect().top < window.innerHeight * 0.85);
      if (max > 0 && y / max > 0.6) show();
    };
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && window.scrollY > window.innerHeight) show();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  useEffect(() => {
    if (!popup) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPopup(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [popup]);

  const showBar = pastHero && !nearEnd;

  return (
    <>
      {/* Floating WhatsApp: sits above the mobile bar so it never covers it */}
      {wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("contact_click", { method: "whatsapp_float" })}
          aria-label="Chat on WhatsApp"
          className={cn(
            "fixed right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-[#0B0B0F] shadow-[0_10px_30px_-6px_rgb(37_211_102/0.6)] transition-[transform,bottom] duration-300 hover:scale-110 md:bottom-6 md:right-6",
            showBar ? "bottom-24" : "bottom-5",
          )}
        >
          <Icon name="whatsapp" size={28} />
        </a>
      )}

      {/* Mobile sticky Book a Call bar */}
      <div
        className={cn(
          "pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line bg-glass px-4 pt-3 backdrop-blur-xl transition-transform duration-300 md:hidden",
          showBar ? "translate-y-0" : "translate-y-full",
        )}
        aria-hidden={!showBar}
      >
        <div className="flex items-center gap-3">
          <p className="flex-1 text-sm leading-tight">
            <span className="block font-semibold">{availability || "Available for projects"}</span>
            <span className="text-muted">Free 15-min consultation</span>
          </p>
          <a
            href={bookHref}
            {...(bookExternal && { target: "_blank", rel: "noopener noreferrer" })}
            tabIndex={showBar ? 0 : -1}
            onClick={() => track("book_call", { location: "mobile_bar" })}
            className="inline-flex min-h-12 items-center rounded-full bg-accent px-5 font-semibold text-on-accent"
          >
            Book a Call
          </a>
        </div>
      </div>

      {/* One-time consultation popup */}
      <AnimatePresence>
        {popup && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPopup(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="popup-title"
              initial={{ y: 40, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-3xl border border-line bg-surface p-7 shadow-2xl"
            >
              <button
                type="button"
                autoFocus
                onClick={() => setPopup(false)}
                aria-label="Close"
                className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full hover:bg-surface-2"
              >
                <Icon name="close" />
              </button>
              <p className="font-mono text-xs uppercase tracking-widest text-accent">Free consultation</p>
              <h2 id="popup-title" className="mt-2 font-display text-4xl uppercase leading-none">
                Got footage sitting on your drive?
              </h2>
              <p className="mt-3 text-muted">
                Book a free 15-minute call. I&apos;ll review your channel or campaign and suggest 3 quick wins, no strings attached.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Cta href={bookHref} external={bookExternal} event="book_call" magnetic={false} className="w-full">
                  Book my free call <Icon name="arrow" size={18} />
                </Cta>
                <button type="button" onClick={() => setPopup(false)} className="min-h-11 text-sm text-muted hover:text-fg">
                  Maybe later
                </button>
              </div>
              <ProofLine text={proof} className="mt-4 justify-center text-xs" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
