"use client";

import { useState } from "react";
import type { ProjectData } from "@/lib/types";
import { useVideoModal } from "./video-modal";
import { SmartImage } from "./smart-image";
import { PlayButton } from "./play-button";
import { Icon } from "@/components/icons";

/**
 * Before/after comparison. A native range input drives the split, so it
 * works with mouse, touch and keyboard (arrow keys) out of the box.
 */
export function BeforeAfter({ before, after, title }: { before: string; after: string; title: string }) {
  const [x, setX] = useState(50);
  return (
    <figure>
      <div className="media-frame relative aspect-video select-none overflow-hidden rounded-2xl">
        <SmartImage src={after} alt={`${title}: after editing`} fill sizes="(min-width:1024px) 60vw, 100vw" className="object-cover" />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - x}% 0 0)` }}>
          <SmartImage src={before} alt={`${title}: before editing`} fill sizes="(min-width:1024px) 60vw, 100vw" className="object-cover" />
        </div>
        <span className="absolute left-3 top-3 rounded-full bg-black/75 px-3 py-1 font-mono text-xs uppercase tracking-wider text-white">Before</span>
        <span className="absolute right-3 top-3 rounded-full bg-black/75 px-3 py-1 font-mono text-xs uppercase tracking-wider text-white">After</span>
        <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_12px_rgb(0_0_0/0.5)]" style={{ left: `${x}%` }} aria-hidden="true">
          <span className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-black shadow-lg">
            <Icon name="chevron" size={16} className="rotate-90" />
            <Icon name="chevron" size={16} className="absolute -rotate-90" />
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={x}
          onChange={(e) => setX(Number(e.target.value))}
          aria-label="Drag to compare before and after"
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <figcaption className="mt-3 text-sm text-muted">Drag the handle to compare the raw footage with the final edit.</figcaption>
    </figure>
  );
}

export function WatchCaseButton({ project: p, variant = "link" }: { project: ProjectData; variant?: "link" | "thumb" }) {
  const open = useVideoModal();
  const play = () =>
    open({
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

  if (variant === "thumb") {
    return (
      <button type="button" onClick={play} data-cursor="Play" aria-label={`Play ${p.title}`} className="media-frame group relative block aspect-video w-full overflow-hidden rounded-2xl">
        <SmartImage src={p.thumbnailUrl} alt={p.thumbnailAlt || p.title} fill sizes="(min-width:1024px) 60vw, 100vw" className="object-cover" />
        <span className="absolute inset-0 grid place-items-center">
          <PlayButton />
        </span>
      </button>
    );
  }
  return (
    <button type="button" onClick={play} className="group inline-flex min-h-11 items-center gap-3 font-semibold text-fg hover:text-accent">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-accent text-on-accent transition group-hover:scale-110">
        <Icon name="play" size={14} />
      </span>
      Watch the final video
    </button>
  );
}
