"use client";

import { upload } from "@vercel/blob/client";
import { slugify } from "./utils";

export interface UploadedImage {
  url: string;
  width: number;
  height: number;
}

/**
 * Compresses an image IN THE BROWSER (WebP, ≤ maxWidth px, ~200KB target),
 * then uploads it straight to Vercel Blob with a short-lived token from
 * /api/blob/upload (a "client upload"). SVG logos are uploaded as-is.
 */
export async function compressAndUpload(
  file: File,
  { folder = "images", maxWidth = 1600, onProgress }: { folder?: string; maxWidth?: number; onProgress?: (pct: number) => void } = {},
): Promise<UploadedImage> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file. Videos belong on YouTube, not here.");
  if (file.size > 25 * 1024 * 1024) throw new Error("That image is over 25MB. Please export a smaller version.");

  const isSvg = file.type === "image/svg+xml";
  let blob: Blob = file;
  if (!isSvg) {
    const { default: imageCompression } = await import("browser-image-compression");
    blob = await imageCompression(file, {
      maxSizeMB: 0.2,
      maxWidthOrHeight: maxWidth,
      fileType: "image/webp",
      initialQuality: 0.82,
      useWebWorker: true,
    });
  }

  const { width, height } = await dimensions(blob);
  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "image";
  const res = await upload(`${folder}/${base}.${isSvg ? "svg" : "webp"}`, blob, {
    access: "public",
    handleUploadUrl: "/api/blob/upload",
    contentType: isSvg ? "image/svg+xml" : "image/webp",
    onUploadProgress: ({ percentage }) => onProgress?.(percentage),
  });
  return { url: res.url, width, height };
}

async function dimensions(blob: Blob): Promise<{ width: number; height: number }> {
  try {
    const bmp = await createImageBitmap(blob);
    const d = { width: bmp.width, height: bmp.height };
    bmp.close();
    return d;
  } catch {
    // SVGs can't always be decoded by createImageBitmap
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth || 1600, height: img.naturalHeight || 900 });
      img.onerror = () => resolve({ width: 1600, height: 900 });
      img.src = URL.createObjectURL(blob);
    });
  }
}
