"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ConfirmOpts = { title: string; body?: string; confirmLabel?: string; danger?: boolean };
const Ctx = createContext<(o: ConfirmOpts) => Promise<boolean>>(async () => false);

/** `const confirm = useConfirm(); if (await confirm({...})) …` */
export const useConfirm = () => useContext(Ctx);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = useState<ConfirmOpts | null>(null);
  const resolver = useRef<(v: boolean) => void>(() => {});

  const confirm = useCallback((o: ConfirmOpts) => {
    setOpts(o);
    return new Promise<boolean>((res) => (resolver.current = res));
  }, []);
  const close = (v: boolean) => {
    resolver.current(v);
    setOpts(null);
  };

  return (
    <Ctx.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {opts && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => close(false)}
            onKeyDown={(e) => e.key === "Escape" && close(false)}
          >
            <motion.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
              initial={{ y: 20, scale: 0.97, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-2xl"
            >
              <h2 id="confirm-title" className="text-lg font-semibold">
                {opts.title}
              </h2>
              {opts.body && <p className="mt-2 text-sm text-muted">{opts.body}</p>}
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => close(false)} className="min-h-12 rounded-xl border border-line px-5 font-medium hover:bg-surface-2">
                  Cancel
                </button>
                <button
                  type="button"
                  autoFocus
                  onClick={() => close(true)}
                  className={
                    opts.danger
                      ? "min-h-12 rounded-xl bg-red-600 px-5 font-semibold text-white hover:bg-red-700"
                      : "min-h-12 rounded-xl bg-accent px-5 font-semibold text-on-accent"
                  }
                >
                  {opts.confirmLabel ?? "Confirm"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}
