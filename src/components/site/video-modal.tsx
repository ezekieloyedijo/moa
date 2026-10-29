"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Icon } from "@/components/icons";
import { embedUrl, platformLabel, type Platform, type VideoOrientation } from "@/lib/video";
import { track } from "@/lib/track";
import { cn } from "@/lib/utils";

export interface ModalVideo {
  title: string;
  platform: Platform;
  videoId: string;
  orientation: VideoOrientation;
  client?: string;
  description?: string;
  role?: string;
  tools?: string[];
  resultMetric?: string;
  socialLinks?: Array<{ platform: string; url: string; viewCount: string }>;
}

const Ctx = createContext<(v: ModalVideo) => void>(() => {});
export const useVideoModal = () => useContext(Ctx);

/**
 * Global video modal. The platform iframe is created ONLY when a video is
 * opened (lite-embed facade), and destroyed on close — no heavy embeds on load.
 */
export function VideoModalProvider({ children }: { children: React.ReactNode }) {
  const [video, setVideo] = useState<ModalVideo | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const open = useCallback((v: ModalVideo) => {
    lastFocus.current = document.activeElement as HTMLElement;
    setVideo(v);
    track("video_play", { title: v.title, platform: v.platform });
  }, []);
  const close = useCallback(() => {
    setVideo(null);
    lastFocus.current?.focus();
  }, []);

  return (
    <Ctx.Provider value={open}>
      {children}
      <AnimatePresence>{video && <Modal video={video} onClose={close} />}</AnimatePresence>
    </Ctx.Provider>
  );
}

function Modal({ video, onClose }: { video: ModalVideo; onClose: () => void }) {
  const reduce = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const portrait = video.orientation === "PORTRAIT";
  const hasDetails = !!(video.description || video.role || video.tools?.length || video.resultMetric);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("lenis-stopped");
    dialogRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      // Simple focus trap
      if (e.key === "Tab" && dialogRef.current) {
        const f = dialogRef.current.querySelectorAll<HTMLElement>("button, a[href], iframe");
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.classList.remove("lenis-stopped");
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-black/85 p-3 backdrop-blur-md sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Video: ${video.title}`}
        className={cn(
          "relative my-auto w-full overflow-hidden rounded-2xl border border-white/10 bg-[#111117] text-white shadow-2xl",
          portrait ? (hasDetails ? "max-w-4xl md:grid md:grid-cols-[minmax(0,380px)_1fr]" : "max-w-[420px]") : "max-w-5xl",
        )}
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          data-autofocus
          onClick={onClose}
          aria-label="Close video"
          className="absolute right-3 top-3 z-10 grid h-11 w-11 place-items-center rounded-full bg-black/70 text-white ring-1 ring-white/20 transition hover:bg-white hover:text-black"
        >
          <Icon name="close" />
        </button>

        <div className={cn("relative w-full bg-black", portrait ? "aspect-[9/16] max-h-[80vh] md:max-h-none" : "aspect-video")}>
          <iframe
            src={embedUrl(video.platform, video.videoId)}
            title={video.title}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>

        {hasDetails && (
          <div className="space-y-4 p-5 sm:p-7">
            <div>
              {video.client && <p className="font-mono text-xs uppercase tracking-widest text-[#FF6B35]">{video.client}</p>}
              <h3 className="mt-1 font-display text-3xl uppercase leading-none sm:text-4xl">{video.title}</h3>
            </div>
            {video.description && <p className="text-[0.95rem] leading-relaxed text-zinc-300">{video.description}</p>}
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {video.role && (
                <div>
                  <dt className="text-zinc-400">My role</dt>
                  <dd className="font-medium">{video.role}</dd>
                </div>
              )}
              {video.resultMetric && (
                <div>
                  <dt className="text-zinc-400">Outcome</dt>
                  <dd className="font-medium text-[#FF6B35]">{video.resultMetric}</dd>
                </div>
              )}
              {!!video.tools?.length && (
                <div className="sm:col-span-2">
                  <dt className="mb-1.5 text-zinc-400">Tools</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {video.tools.map((t) => (
                      <span key={t} className="rounded-full border border-white/15 px-2.5 py-1 text-xs">
                        {t}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
            {!!video.socialLinks?.length && (
              <div className="flex flex-wrap gap-2">
                {video.socialLinks.map((s) => (
                  <a
                    key={s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/10 px-4 text-sm transition hover:bg-white/20"
                  >
                    <Icon name={s.platform.toLowerCase()} size={16} />
                    Also on {platformLabel[s.platform as Platform] ?? s.platform}
                    {s.viewCount && <span className="text-zinc-400">· {s.viewCount}</span>}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
