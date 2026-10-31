"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { GalleryData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons";
import { SmartImage } from "./smart-image";
import { SectionHeading } from "./section-heading";
import type { SectionText } from "@/lib/sections";

/**
 * 07b GALLERY: masonry grid of stills, BTS and thumbnail designs with
 * category tabs. Opens a full-screen lightbox (swipe / arrows / Esc) that
 * zooms from the clicked tile via a shared layout animation.
 */
export function Gallery({ items, index, heading }: { items: GalleryData[]; index: number; heading: SectionText }) {
  const [filter, setFilter] = useState("All");
  const [active, setActive] = useState<number | null>(null);
  const reduce = useReducedMotion();

  const cats = useMemo(() => ["All", ...Array.from(new Set(items.map((i) => i.category)))], [items]);
  const shown = filter === "All" ? items : items.filter((i) => i.category === filter);

  if (!items.length) return null;

  return (
    <section id="gallery" aria-labelledby="gallery-title" className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-32">
      <div id="gallery-title">
        <SectionHeading
          index={index} label={heading.label} title={heading.title} intro={heading.intro} />
      </div>

      <div role="tablist" aria-label="Filter gallery" className="no-scrollbar -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {cats.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={filter === c}
            onClick={() => setFilter(c)}
            className={cn(
              "min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors",
              filter === c ? "border-fg bg-fg text-bg" : "border-line text-muted hover:border-fg hover:text-fg",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <ul className="columns-2 gap-3 md:columns-3 md:gap-5">
        {shown.map((g, i) => (
          <motion.li
            key={g.id}
            className="mb-3 break-inside-avoid md:mb-5"
            initial={reduce ? false : { opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: (i % 3) * 0.06, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              type="button"
              data-cursor="View"
              onClick={() => setActive(i)}
              aria-label={`Open image: ${g.altText}`}
              className="group block w-full text-left"
            >
              <motion.div
                layoutId={reduce ? undefined : `gal-${g.id}`}
                className="media-frame relative w-full overflow-hidden rounded-xl"
                style={{ aspectRatio: `${g.width} / ${g.height}` }}
              >
                <SmartImage
                  src={g.imageUrl}
                  alt={g.altText}
                  fill
                  sizes="(min-width: 768px) 33vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </motion.div>
              {g.title && <span className="mt-2 block text-sm text-muted">{g.title}</span>}
            </button>
          </motion.li>
        ))}
      </ul>

      <AnimatePresence>
        {active !== null && shown[active] && <Lightbox items={shown} index={active} onIndex={setActive} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </section>
  );
}

function Lightbox({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: GalleryData[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const item = items[index];
  const reduce = useReducedMotion();
  const go = useCallback((d: number) => onIndex((index + d + items.length) % items.length), [index, items.length, onIndex]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("lenis-stopped");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.documentElement.classList.remove("lenis-stopped");
      window.removeEventListener("keydown", onKey);
    };
  }, [go, onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Image ${index + 1} of ${items.length}: ${item.altText}`}
      className="fixed inset-0 z-[90] flex flex-col bg-black/95 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="flex items-center justify-between p-3 sm:p-5" onClick={(e) => e.stopPropagation()}>
        <span className="font-mono text-xs tracking-widest text-zinc-400">
          {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
        </span>
        <button
          type="button"
          autoFocus
          onClick={onClose}
          aria-label="Close gallery"
          className="grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white hover:text-black"
        >
          <Icon name="close" />
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-2 sm:px-16">
        <motion.div
          key={item.id}
          layoutId={reduce ? undefined : `gal-${item.id}`}
          className="relative h-full max-h-[78svh] w-full"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          onDragEnd={(_, info) => {
            if (info.offset.x < -80) go(1);
            else if (info.offset.x > 80) go(-1);
          }}
          onClick={(e) => e.stopPropagation()}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <SmartImage src={item.imageUrl} alt={item.altText} fill sizes="100vw" className="object-contain" draggable={false} />
        </motion.div>

        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => (e.stopPropagation(), go(-1))}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white hover:text-black sm:grid"
            >
              <Icon name="arrow" className="rotate-180" />
            </button>
            <button
              type="button"
              onClick={(e) => (e.stopPropagation(), go(1))}
              aria-label="Next image"
              className="absolute right-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 hover:bg-white hover:text-black sm:grid"
            >
              <Icon name="arrow" />
            </button>
          </>
        )}
      </div>

      <div className="p-4 text-center sm:p-6" onClick={(e) => e.stopPropagation()}>
        {item.title && <p className="font-semibold">{item.title}</p>}
        {item.caption && <p className="mx-auto mt-1 max-w-xl text-sm text-zinc-300">{item.caption}</p>}
        <p className="mt-2 text-xs text-zinc-500 sm:hidden">Swipe to browse</p>
      </div>
    </motion.div>
  );
}
