"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { compressAndUpload, type UploadedImage } from "@/lib/upload";
import { discardUpload } from "@/app/admin/actions";
import { cn, isBlobUrl } from "@/lib/utils";
import { Icon } from "@/components/icons";
import { FieldShell } from "./fields";

/**
 * Drag-and-drop image field: in-browser compression → client upload to
 * Vercel Blob with a progress bar → preview → replace / remove.
 * Blobs uploaded in this session but then replaced/removed before saving
 * are deleted immediately; replaced SAVED images are deleted by the server
 * on save.
 */
export function ImageUploader({
  label,
  value,
  onChange,
  help,
  error,
  aspect = "16/9",
  maxWidth = 1600,
  folder = "images",
  fit = "cover",
}: {
  label: string;
  value: string;
  onChange: (url: string, meta?: UploadedImage) => void;
  help?: string;
  error?: string;
  aspect?: string;
  maxWidth?: number;
  folder?: string;
  fit?: "cover" | "contain";
}) {
  const input = useRef<HTMLInputElement>(null);
  const initial = useRef(value);
  const [progress, setProgress] = useState<number | null>(null);
  const [drag, setDrag] = useState(false);

  async function handle(file?: File | null) {
    if (!file) return;
    setProgress(0);
    try {
      const res = await compressAndUpload(file, { folder, maxWidth, onProgress: setProgress });
      // Clean up a session-only upload we're replacing.
      if (value && value !== initial.current && isBlobUrl(value)) void discardUpload(value);
      onChange(res.url, res);
      toast.success("Image uploaded. Remember to save.");
    } catch (e) {
      toast.error((e as Error).message || "Upload failed");
    } finally {
      setProgress(null);
      if (input.current) input.current.value = "";
    }
  }

  function remove() {
    if (value && value !== initial.current && isBlobUrl(value)) void discardUpload(value);
    onChange("");
  }

  return (
    <FieldShell label={label} help={help ?? "JPG, PNG or WebP. Automatically compressed to WebP before upload."} error={error}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handle(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "relative overflow-hidden rounded-xl border-2 border-dashed transition-colors",
          drag ? "border-accent bg-accent-soft" : error ? "border-red-500" : "border-line",
        )}
      >
        {value ? (
          <div className="relative bg-surface-2" style={{ aspectRatio: aspect }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className={cn("absolute inset-0 h-full w-full", fit === "contain" ? "object-contain p-4" : "object-cover")} />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 p-6 text-center"
            style={{ aspectRatio: aspect, maxHeight: 260 }}
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-accent-soft text-accent">
              <Icon name="plus" />
            </span>
            <span className="font-semibold">Drop an image or tap to choose</span>
            <span className="text-sm text-muted">Max ~1600px wide, ~200KB after compression</span>
          </button>
        )}

        {progress !== null && (
          <div className="absolute inset-0 grid place-items-center bg-surface/85 backdrop-blur-sm" role="status" aria-live="polite">
            <div className="w-2/3 max-w-xs text-center">
              <p className="mb-2 text-sm font-semibold">{progress === 0 ? "Compressing…" : `Uploading ${Math.round(progress)}%`}</p>
              <div className="h-2 overflow-hidden rounded-full bg-line">
                <div className="h-full bg-accent transition-[width]" style={{ width: `${Math.max(5, progress)}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {value && (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => input.current?.click()} className="min-h-11 rounded-xl border border-line px-4 text-sm font-medium hover:border-accent">
            Replace
          </button>
          <button type="button" onClick={remove} className="min-h-11 rounded-xl border border-line px-4 text-sm font-medium text-red-600 hover:border-red-500 dark:text-red-400">
            Remove
          </button>
        </div>
      )}
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => handle(e.target.files?.[0])} />
    </FieldShell>
  );
}
