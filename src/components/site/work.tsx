"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { CategoryData, ProjectData } from "@/lib/types";
import { platformLabel, type Platform } from "@/lib/video";
import { cn } from "@/lib/utils";
import { isFinePointer } from "@/lib/motion";
import { Icon } from "@/components/icons";
import { useVideoModal, type ModalVideo } from "./video-modal";
import { SmartImage } from "./smart-image";
import { PlayButton } from "./play-button";
import { SectionHeading } from "./section-heading";
import { Cta, ProofLine } from "./cta";

const toModal = (p: ProjectData): ModalVideo => ({
  title: p.title,
  platform: p.platform,
  videoId: p.videoId,
  orientation: p.orientation,
  client: p.client,
  description: p.description,
  role: p.role,
  tools: p.tools,
  resultMetric: p.resultMetric,
  socialLinks: p.socialLinks,
});

/**
 * 06 SELECTED WORK: category filter tabs, list view with a cursor-following
 * preview (desktop) + grid toggle, stacked cards on mobile.
 */
export function Work({
  projects,
  categories,
  index,
  proof,
}: {
  projects: ProjectData[];
  categories: CategoryData[];
  index: number;
  proof: string;
}) {
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState<"list" | "grid">("list");
  const reduce = useReducedMotion();

  const tabs = useMemo(
    () => categories.filter((c) => projects.some((p) => p.category?.slug === c.slug)),
    [categories, projects],
  );
  const shown = filter === "all" ? projects : projects.filter((p) => p.category?.slug === filter);

  return (
    <section id="work" aria-labelledby="work-title" className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-32">
      <div id="work-title">
        <SectionHeading
          index={index}
          label="Selected work"
          title="Edits that got results"
          intro="Real projects for creators, brands and agencies. Click any project to watch it and see the outcome."
        />
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div role="tablist" aria-label="Filter projects by category" className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 md:mx-0 md:px-0">
          {[{ slug: "all", name: "All work" }, ...tabs].map((t) => {
            const active = filter === t.slug;
            return (
              <button
                key={t.slug}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(t.slug)}
                className={cn(
                  "relative min-h-11 shrink-0 rounded-full px-4 text-sm font-medium transition-colors",
                  active ? "text-on-accent" : "text-muted hover:text-fg",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="work-tab"
                    className="absolute inset-0 -z-0 rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 400, damping: 34 }}
                  />
                )}
                <span className="relative">{t.name}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden items-center gap-1 rounded-full border border-line p-1 lg:flex" role="group" aria-label="Layout">
          {(["list", "grid"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              aria-pressed={view === v}
              aria-label={`${v} view`}
              className={cn(
                "grid h-10 w-10 place-items-center rounded-full transition-colors",
                view === v ? "bg-fg text-bg" : "text-muted hover:text-fg",
              )}
            >
              <Icon name={v} size={18} />
            </button>
          ))}
        </div>
      </div>

      {/* Desktop list view */}
      {view === "list" && (
        <div className="hidden lg:block">
          <ListView projects={shown} filterKey={filter} reduce={!!reduce} />
        </div>
      )}

      {/* Grid: always on mobile/tablet, optional on desktop */}
      <div className={cn(view === "list" && "lg:hidden")}>
        <motion.ul layout={!reduce} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((p, i) => (
              <motion.li
                key={p.id}
                layout={!reduce}
                initial={{ opacity: 0, scale: 0.94, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.45, delay: reduce ? 0 : Math.min(i, 6) * 0.04, ease: [0.16, 1, 0.3, 1] }}
                className={cn(p.orientation === "PORTRAIT" && "sm:row-span-2")}
              >
                <ProjectCard p={p} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>

      {shown.length === 0 && <p className="py-10 text-center text-muted">No projects in this category yet.</p>}

      <div className="mt-14 flex flex-col items-center gap-4 rounded-3xl border border-line bg-surface px-6 py-10 text-center">
        <p className="font-display text-[clamp(2rem,5vw,3.5rem)] uppercase leading-none">Want results like these?</p>
        <Cta href="#contact" event="contact_click">
          Let&apos;s talk <Icon name="arrow" size={18} />
        </Cta>
        <ProofLine text={proof} />
      </div>
    </section>
  );
}

function SocialBadges({ links }: { links: ProjectData["socialLinks"] }) {
  if (!links.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {links.map((s) => (
        <a
          key={s.id}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-surface px-3 text-xs text-muted transition hover:border-accent hover:text-fg"
        >
          <Icon name={s.platform.toLowerCase()} size={14} />
          Also on {platformLabel[s.platform as Platform]}
          {s.viewCount && <span>· {s.viewCount}</span>}
        </a>
      ))}
    </div>
  );
}

function ProjectCard({ p }: { p: ProjectData }) {
  const open = useVideoModal();
  const portrait = p.orientation === "PORTRAIT";
  return (
    <article className="group flex h-full flex-col gap-3">
      <button
        type="button"
        data-cursor="Play"
        onClick={() => open(toModal(p))}
        aria-label={`Play ${p.title}`}
        className={cn(
          "media-frame relative block w-full overflow-hidden rounded-2xl transition-transform duration-500 ease-out hover:-translate-y-1.5",
          portrait ? "aspect-[9/16] sm:h-full sm:min-h-[420px] sm:aspect-auto" : "aspect-video",
        )}
      >
        {p.thumbnailUrl && (
          <SmartImage
            src={p.thumbnailUrl}
            alt={p.thumbnailAlt || `${p.title} video thumbnail`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        )}
        <span className="scrim-b absolute inset-0" aria-hidden="true" />
        <span className="absolute inset-0 grid place-items-center">
          <PlayButton size="sm" />
        </span>
        {p.resultMetric && (
          <span className="absolute bottom-3 left-3 right-3 text-left text-sm font-semibold text-white">↗ {p.resultMetric}</span>
        )}
        {portrait && (
          <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 font-mono text-[0.7rem] uppercase tracking-wider text-white">
            9:16
          </span>
        )}
      </button>
      <div className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-widest text-muted">
          {p.category?.name}
          {p.client && <> · {p.client}</>}
        </p>
        <h3 className="text-xl font-semibold leading-snug">{p.title}</h3>
        <SocialBadges links={p.socialLinks} />
      </div>
    </article>
  );
}

/** Editorial list. A thumbnail preview follows the cursor on hover. */
function ListView({ projects, filterKey, reduce }: { projects: ProjectData[]; filterKey: string; reduce: boolean }) {
  const open = useVideoModal();
  const preview = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<ProjectData | null>(null);
  const pos = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  useEffect(() => {
    if (!isFinePointer() || reduce) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      pos.current.tx = e.clientX;
      pos.current.ty = e.clientY;
    };
    const loop = () => {
      const p = pos.current;
      p.x += (p.tx - p.x) * 0.15;
      p.y += (p.ty - p.y) * 0.15;
      if (preview.current) preview.current.style.transform = `translate3d(${p.x + 24}px, ${p.y - 110}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduce]);

  return (
    <>
      <ul key={filterKey} className="border-t border-line" onMouseLeave={() => setHovered(null)}>
        {projects.map((p, i) => (
          <motion.li
            key={p.id}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
            className="border-b border-line"
          >
            <div className="group relative grid grid-cols-[3rem_minmax(0,1.7fr)_minmax(0,0.8fr)_minmax(0,1fr)_19rem] items-center gap-6 py-6 transition-colors hover:bg-surface">
              <span className="pl-2 font-mono text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
              <button
                type="button"
                data-cursor="Play"
                onMouseEnter={() => setHovered(p)}
                onFocus={() => setHovered(p)}
                onClick={() => open(toModal(p))}
                className="text-left after:absolute after:inset-0 [position:static]"
              >
                <h3 className="font-display text-4xl uppercase leading-none transition-transform duration-300 group-hover:translate-x-2 group-hover:text-accent">
                  {p.title}
                </h3>
                <span className="mt-1 block text-sm text-muted">{p.client}</span>
              </button>
              <span className="text-sm text-muted">{p.category?.name}</span>
              <span className="text-sm font-semibold text-accent">{p.resultMetric}</span>
              <span className="pointer-events-none relative z-10 flex items-center justify-end gap-3 pr-2 [&_a]:pointer-events-auto">
                <SocialBadges links={p.socialLinks.slice(0, 1)} />
                <span className="grid h-11 w-11 place-items-center rounded-full border border-line transition group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent">
                  <Icon name="play" size={14} />
                </span>
              </span>
            </div>
          </motion.li>
        ))}
      </ul>

      {/* Floating preview */}
      <div
        ref={preview}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-40 hidden lg:block"
        style={{ willChange: "transform" }}
      >
        <AnimatePresence>
          {hovered?.thumbnailUrl && (
            <motion.div
              key={hovered.id}
              initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "media-frame relative overflow-hidden rounded-xl",
                hovered.orientation === "PORTRAIT" ? "h-[300px] w-[169px]" : "h-[200px] w-[356px]",
              )}
            >
              <SmartImage src={hovered.thumbnailUrl} alt="" fill sizes="360px" className="object-cover" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
