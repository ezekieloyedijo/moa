"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";

export interface AccordionItem {
  id: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  content: React.ReactNode;
}

/**
 * Accessible accordion (button + region). Collapsed panels stay in the DOM
 * with `hidden`, so all text is still in the HTML for SEO / no-JS.
 */
export function Accordion({ items, numbered, defaultOpen = 0 }: { items: AccordionItem[]; numbered?: boolean; defaultOpen?: number | null }) {
  const [open, setOpen] = useState<string | null>(defaultOpen === null ? null : (items[defaultOpen]?.id ?? null));
  const uid = useId();

  return (
    <ul className="border-t border-line">
      {items.map((item, i) => {
        const isOpen = open === item.id;
        const btn = `${uid}-b-${i}`;
        const panel = `${uid}-p-${i}`;
        return (
          <li key={item.id} className="border-b border-line" data-reveal style={{ "--i": i } as React.CSSProperties}>
            <h3>
              <button
                id={btn}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panel}
                onClick={() => setOpen(isOpen ? null : item.id)}
                className="group flex min-h-16 w-full items-center gap-4 py-5 text-left md:gap-6 md:py-7"
              >
                {numbered && (
                  <span className={cn("font-mono text-sm transition-colors", isOpen ? "text-accent" : "text-muted")}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                )}
                <span className="flex-1">
                  <span className="block text-lg font-semibold leading-snug transition-colors group-hover:text-accent md:text-2xl">{item.title}</span>
                  {item.lead && <span className="mt-1 block text-sm text-muted">{item.lead}</span>}
                </span>
                <span
                  className={cn(
                    "grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-[transform,background-color,border-color,color] duration-300",
                    isOpen ? "rotate-45 border-accent bg-accent text-on-accent" : "border-line",
                  )}
                  aria-hidden="true"
                >
                  <Icon name="plus" size={18} />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panel}
                  role="region"
                  aria-labelledby={btn}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className={cn("pb-7", numbered && "md:pl-[3.25rem]")}>{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Crawlable copy of closed panels */}
            {!isOpen && (
              <div hidden id={panel}>
                {item.content}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
