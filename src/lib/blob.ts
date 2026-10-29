import "server-only";
import { del } from "@vercel/blob";
import { isBlobUrl } from "./utils";

/**
 * Deletes Vercel Blob files that are no longer referenced, so storage doesn't
 * fill with orphans. Non-blob URLs (YouTube thumbs, /public files) are ignored.
 */
export async function deleteBlobs(urls: Array<string | null | undefined>) {
  const targets = [...new Set(urls.filter(isBlobUrl))];
  if (!targets.length || !process.env.BLOB_READ_WRITE_TOKEN) return;
  try {
    await del(targets);
  } catch (err) {
    console.error("[blob] delete failed", err);
  }
}

/** Old values that were replaced or cleared by an update. */
export function replacedUrls(
  before: Record<string, unknown> | null | undefined,
  after: Record<string, unknown>,
  fields: string[],
) {
  if (!before) return [];
  return fields
    .filter((f) => f in after && before[f] !== after[f])
    .map((f) => before[f] as string | undefined);
}
