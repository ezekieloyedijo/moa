/**
 * Video link helpers — shared by the dashboard (auto-detect while typing)
 * and the public site (building embed URLs inside the modal).
 * Videos are NEVER stored on Vercel: we only keep the platform + ID.
 */

export type Platform = "YOUTUBE" | "VIMEO" | "INSTAGRAM" | "TIKTOK";
export type VideoOrientation = "LANDSCAPE" | "PORTRAIT";

export interface ParsedVideo {
  platform: Platform;
  videoId: string;
  /** Best guess based on the URL shape (Shorts, Reels and TikToks are vertical). */
  suggestedOrientation: VideoOrientation;
  /** Auto thumbnail, when the platform offers a stable one without an API key. */
  thumbnailUrl: string | null;
}

/** Detect the platform and extract the video ID from any pasted link. */
export function parseVideoUrl(raw: string): ParsedVideo | null {
  const input = raw.trim();
  if (!input) return null;

  let url: URL;
  try {
    url = new URL(input.startsWith("http") ? input : `https://${input}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\.|^m\./, "");
  const parts = url.pathname.split("/").filter(Boolean);

  // ── YouTube ──────────────────────────────────────────────
  if (host === "youtu.be") {
    return youtube(parts[0], false);
  }
  if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
    const v = url.searchParams.get("v");
    if (v) return youtube(v, false);
    const [kind, id] = parts;
    if (["shorts", "embed", "live", "v"].includes(kind) && id) {
      return youtube(id, kind === "shorts");
    }
    return null;
  }

  // ── Vimeo ────────────────────────────────────────────────
  if (host.endsWith("vimeo.com")) {
    const id = [...parts].reverse().find((p) => /^\d+$/.test(p));
    if (!id) return null;
    return { platform: "VIMEO", videoId: id, suggestedOrientation: "LANDSCAPE", thumbnailUrl: null };
  }

  // ── Instagram (posts, reels, IGTV) ───────────────────────
  if (host.endsWith("instagram.com")) {
    const idx = parts.findIndex((p) => ["p", "reel", "reels", "tv"].includes(p));
    const id = idx >= 0 ? parts[idx + 1] : undefined;
    if (!id) return null;
    return { platform: "INSTAGRAM", videoId: id, suggestedOrientation: "PORTRAIT", thumbnailUrl: null };
  }

  // ── TikTok ───────────────────────────────────────────────
  if (host.endsWith("tiktok.com")) {
    const idx = parts.indexOf("video");
    const id = idx >= 0 ? parts[idx + 1] : undefined;
    if (!id || !/^\d+$/.test(id)) return null;
    return { platform: "TIKTOK", videoId: id, suggestedOrientation: "PORTRAIT", thumbnailUrl: null };
  }

  return null;
}

function youtube(id: string | undefined, isShort: boolean): ParsedVideo | null {
  if (!id || !/^[\w-]{11}$/.test(id)) return null;
  return {
    platform: "YOUTUBE",
    videoId: id,
    suggestedOrientation: isShort ? "PORTRAIT" : "LANDSCAPE",
    thumbnailUrl: youtubeThumb(id),
  };
}

/** hqdefault always exists; maxresdefault doesn't for every upload. */
export function youtubeThumb(id: string, quality: "hq" | "max" = "hq") {
  return `https://i.ytimg.com/vi/${id}/${quality === "max" ? "maxresdefault" : "hqdefault"}.jpg`;
}

/** The iframe URL loaded only AFTER the visitor clicks play. */
export function embedUrl(platform: Platform, id: string): string {
  switch (platform) {
    case "YOUTUBE":
      // youtube-nocookie = privacy-enhanced mode (no tracking cookies until play)
      return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    case "VIMEO":
      return `https://player.vimeo.com/video/${id}?autoplay=1&dnt=1&title=0&byline=0`;
    case "INSTAGRAM":
      return `https://www.instagram.com/p/${id}/embed/`;
    case "TIKTOK":
      return `https://www.tiktok.com/embed/v2/${id}`;
  }
}

/** Canonical public watch URL (used for JSON-LD + "open on platform" links). */
export function watchUrl(platform: Platform, id: string): string {
  switch (platform) {
    case "YOUTUBE":
      return `https://www.youtube.com/watch?v=${id}`;
    case "VIMEO":
      return `https://vimeo.com/${id}`;
    case "INSTAGRAM":
      return `https://www.instagram.com/p/${id}/`;
    case "TIKTOK":
      return `https://www.tiktok.com/embed/v2/${id}`;
  }
}

export const platformLabel: Record<Platform, string> = {
  YOUTUBE: "YouTube",
  VIMEO: "Vimeo",
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
};
