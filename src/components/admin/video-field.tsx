"use client";

import { useEffect, useRef, useState } from "react";
import { embedUrl, parseVideoUrl, platformLabel } from "@/lib/video";
import { fetchVideoMeta } from "@/app/admin/actions";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons";
import { FieldShell, inputCls } from "./fields";

/**
 * Paste ANY video link → platform + ID detected instantly, YouTube/Vimeo
 * thumbnail + title fetched automatically, live preview (facade → iframe).
 */
export function VideoField({
  label,
  value,
  onChange,
  onDetected,
  error,
  orientation,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  /** Called with auto-fetched metadata so the form can fill empty fields. */
  onDetected?: (meta: { thumbnailUrl: string | null; title: string | null; orientation: string }) => void;
  error?: string;
  orientation?: string;
}) {
  const parsed = parseVideoUrl(value || "");
  const [playing, setPlaying] = useState(false);
  const [thumb, setThumb] = useState<string | null>(parsed?.thumbnailUrl ?? null);
  const [loading, setLoading] = useState(false);
  const lastFetched = useRef<string>("");
  const cb = useRef(onDetected);
  cb.current = onDetected;

  const key = parsed ? `${parsed.platform}:${parsed.videoId}` : "";

  useEffect(() => {
    setPlaying(false);
    if (!parsed || key === lastFetched.current) return;
    const first = lastFetched.current === "";
    lastFetched.current = key;
    setThumb(parsed.thumbnailUrl);
    // Don't overwrite fields when simply opening an existing project.
    if (first && value) {
      fetchVideoMeta(value).then((m) => m.ok && setThumb(m.thumbnailUrl));
      return;
    }
    setLoading(true);
    const t = window.setTimeout(async () => {
      const m = await fetchVideoMeta(value);
      setLoading(false);
      if (m.ok) {
        setThumb(m.thumbnailUrl);
        cb.current?.({ thumbnailUrl: m.thumbnailUrl, title: m.title, orientation: m.orientation });
      }
    }, 350);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const portrait = orientation === "PORTRAIT";

  return (
    <FieldShell
      label={label}
      error={error}
      help="Paste a YouTube, YouTube Shorts, Vimeo, Instagram or TikTok link. Upload the video there first. Never upload video files here."
    >
      <div className="relative">
        <input
          type="url"
          inputMode="url"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=…"
          aria-invalid={!!error}
          className={cn(inputCls, "pr-32", error ? "border-red-500" : "border-line")}
        />
        {value && (
          <span
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1 text-xs font-semibold",
              parsed ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" : "bg-red-500/15 text-red-700 dark:text-red-300",
            )}
          >
            {parsed ? `✓ ${platformLabel[parsed.platform]}` : "Not recognised"}
          </span>
        )}
      </div>

      {parsed && (
        <div className={cn("overflow-hidden rounded-xl border border-line bg-black", portrait ? "mx-auto aspect-[9/16] max-w-[260px]" : "aspect-video")}>
          {playing ? (
            <iframe src={embedUrl(parsed.platform, parsed.videoId)} title="Video preview" className="h-full w-full" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
          ) : (
            <button type="button" onClick={() => setPlaying(true)} className="group relative grid h-full w-full place-items-center" aria-label="Preview video">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {thumb && <img src={thumb} alt="" className="absolute inset-0 h-full w-full object-cover" />}
              <span className="relative grid h-14 w-14 place-items-center rounded-full bg-white text-black shadow-lg transition group-hover:scale-110">
                <Icon name="play" />
              </span>
              <span className="absolute bottom-2 left-2 rounded-md bg-black/75 px-2 py-1 font-mono text-xs text-white">
                {loading ? "Fetching details…" : `ID: ${parsed.videoId}`}
              </span>
            </button>
          )}
        </div>
      )}
      {parsed && (parsed.platform === "INSTAGRAM" || parsed.platform === "TIKTOK") && (
        <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
          {platformLabel[parsed.platform]} doesn&apos;t share thumbnails publicly, so please upload a custom thumbnail below.
        </p>
      )}
    </FieldShell>
  );
}
