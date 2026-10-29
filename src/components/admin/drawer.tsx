"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/icons";

/** Side drawer on desktop, full-screen sheet on mobile. */
export function Drawer({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]">
          <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="absolute inset-y-0 right-0 flex w-full flex-col bg-surface shadow-2xl sm:max-w-2xl sm:border-l sm:border-line"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
          >
            <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button type="button" onClick={onClose} aria-label="Close" className="grid h-11 w-11 place-items-center rounded-full hover:bg-surface-2">
                <Icon name="close" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6">{children}</div>
            {footer && <footer className="pb-safe border-t border-line bg-surface px-5 pt-3">{footer}</footer>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
