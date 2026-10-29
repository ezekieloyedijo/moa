/** Tiny className joiner (no dependency needed). */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

/** Two-digit section numbers: 1 -> "01". */
export const pad2 = (n: number) => String(n).padStart(2, "0");

/** wa.me link from any phone format ("+234 801 234 5678" -> 2348012345678). */
export function whatsappLink(number: string, text?: string) {
  const digits = number.replace(/\D/g, "");
  if (!digits) return "";
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

/** True for images we can hand to next/image's optimizer. SVGs are served as-is. */
export function isSvg(src: string) {
  return /\.svg($|\?)/i.test(src);
}

export function isBlobUrl(url: string | null | undefined): url is string {
  return !!url && /\.public\.blob\.vercel-storage\.com\//.test(url);
}

/** Neutral 8x5 blur placeholder used while thumbnails load (theme-agnostic grey). */
export const BLUR_DATA_URL =
  "data:image/svg+xml;base64," +
  (typeof btoa === "function"
    ? btoa(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 5"><rect width="8" height="5" fill="#3f3f46"/></svg>',
      )
    : Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 5"><rect width="8" height="5" fill="#3f3f46"/></svg>',
      ).toString("base64"));
