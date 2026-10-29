"use server";

/**
 * All dashboard mutations. EVERY action starts with requireAdmin() —
 * the middleware is a convenience, not the security boundary.
 */
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/guard";
import { signOut } from "@/lib/auth";
import { deleteBlobs, replacedUrls } from "@/lib/blob";
import { revalidatePublicSite } from "@/lib/revalidate";
import { imageFields, passwordSchema, resourceKeys, schemas, settingsSchema, type ResourceKey } from "@/lib/validators";
import { parseVideoUrl, youtubeThumb } from "@/lib/video";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export type ActionResult = { ok: true; id?: string } | { ok: false; error: string; fieldErrors?: Record<string, string> };

const modelFor: Record<ResourceKey, string> = {
  projects: "project",
  categories: "category",
  services: "service",
  pricing: "pricingTier",
  testimonials: "testimonial",
  faqs: "fAQ",
  stats: "stat",
  logos: "clientLogo",
  socials: "socialLink",
  process: "processStep",
  painpoints: "painPoint",
  gallery: "galleryItem",
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function delegate(resource: ResourceKey): any {
  if (!resourceKeys.includes(resource)) throw new Error("Unknown resource");
  return (prisma as any)[modelFor[resource]];
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function fail(err: unknown): ActionResult {
  if (err instanceof z.ZodError) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of err.issues) {
      const key = issue.path.join(".");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }
  if (err instanceof Error && err.message === "Unauthorized") {
    return { ok: false, error: "Your session expired. Please log in again." };
  }
  console.error("[admin action]", err);
  return { ok: false, error: "Something went wrong. Please try again." };
}

async function uniqueSlug(resource: "projects" | "categories", base: string, id: string | null) {
  const root = slugify(base) || "item";
  let slug = root;
  for (let i = 2; ; i++) {
    const hit = await delegate(resource).findUnique({ where: { slug }, select: { id: true } });
    if (!hit || hit.id === id) return slug;
    slug = `${root}-${i}`;
  }
}

// ─── Generic CRUD ───────────────────────────────────────────

export async function saveResource(resource: ResourceKey, id: string | null, input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const data: Record<string, unknown> = schemas[resource].parse(input);
    const model = delegate(resource);
    const before = id ? await model.findUnique({ where: { id } }) : null;
    if (id && !before) return { ok: false, error: "This item no longer exists." };

    let socialLinks: Array<{ platform: string; url: string; viewCount: string }> | undefined;

    if (resource === "projects") {
      const video = parseVideoUrl(data.videoUrl as string)!;
      data.platform = video.platform;
      data.videoId = video.videoId;
      if (!data.thumbnailUrl && video.platform === "YOUTUBE") data.thumbnailUrl = youtubeThumb(video.videoId, "hq");
      data.slug = await uniqueSlug("projects", (data.slug as string) || (data.title as string), id);
      socialLinks = data.socialLinks as typeof socialLinks;
      delete data.socialLinks;
    }
    if (resource === "categories") {
      data.slug = await uniqueSlug("categories", (data.slug as string) || (data.name as string), id);
    }

    if (resource === "pricing" && data.isPopular) {
      await prisma.pricingTier.updateMany({ where: id ? { id: { not: id } } : {}, data: { isPopular: false } });
    }

    let saved: { id: string };
    if (id) {
      saved = await model.update({
        where: { id },
        data: {
          ...data,
          ...(socialLinks && { socialLinks: { deleteMany: {}, create: socialLinks } }),
        },
      });
      await deleteBlobs(replacedUrls(before, data, imageFields[resource]));
    } else {
      const last = await model.findFirst({ orderBy: { order: "desc" }, select: { order: true } });
      saved = await model.create({
        data: {
          ...data,
          order: (last?.order ?? -1) + 1,
          ...(socialLinks && { socialLinks: { create: socialLinks } }),
        },
      });
    }

    revalidatePublicSite();
    revalidatePath(`/admin/${resource}`);
    return { ok: true, id: saved.id };
  } catch (err) {
    return fail(err);
  }
}

export async function deleteResources(resource: ResourceKey, ids: string[]): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsedIds = z.array(z.string().min(1).max(40)).min(1).max(200).parse(ids);
    const model = delegate(resource);
    const fields = imageFields[resource];
    const rows: Record<string, string>[] = fields.length
      ? await model.findMany({ where: { id: { in: parsedIds } }, select: Object.fromEntries(fields.map((f) => [f, true])) })
      : [];
    await model.deleteMany({ where: { id: { in: parsedIds } } });
    await deleteBlobs(rows.flatMap((r) => fields.map((f) => r[f])));
    revalidatePublicSite();
    revalidatePath(`/admin/${resource}`);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function reorderResource(resource: ResourceKey, ids: string[]): Promise<ActionResult> {
  try {
    await requireAdmin();
    const parsedIds = z.array(z.string().min(1).max(40)).max(500).parse(ids);
    const model = delegate(resource);
    await prisma.$transaction(parsedIds.map((id, order) => model.update({ where: { id }, data: { order } })));
    revalidatePublicSite();
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

const toggleable = z.enum(["published", "featured", "isPopular", "isCaseStudy"]);

export async function toggleField(resource: ResourceKey, id: string, field: string, value: boolean): Promise<ActionResult> {
  try {
    await requireAdmin();
    const f = toggleable.parse(field);
    const v = z.boolean().parse(value);
    // Only one pricing tier can carry the "Most popular" badge.
    if (f === "isPopular" && v) await prisma.pricingTier.updateMany({ where: { id: { not: id } }, data: { isPopular: false } });
    await delegate(resource).update({ where: { id }, data: { [f]: v } });
    revalidatePublicSite();
    revalidatePath(`/admin/${resource}`);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

/** Bulk insert from the multi-image gallery uploader. */
export async function createGalleryItems(items: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const rows = z.array(schemas.gallery).min(1).max(50).parse(items);
    const last = await prisma.galleryItem.findFirst({ orderBy: { order: "desc" }, select: { order: true } });
    const start = (last?.order ?? -1) + 1;
    await prisma.galleryItem.createMany({ data: rows.map((r, i) => ({ ...r, order: start + i })) });
    revalidatePublicSite();
    revalidatePath("/admin/gallery");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

// ─── Site settings ──────────────────────────────────────────

export async function saveSettings(input: unknown): Promise<ActionResult> {
  try {
    await requireAdmin();
    const data = settingsSchema.partial().parse(input);
    const before = await prisma.siteSettings.findUnique({ where: { id: "site" } });
    if (before) {
      await prisma.siteSettings.update({ where: { id: "site" }, data });
      await deleteBlobs(replacedUrls(before, data, imageFields.settings));
    } else {
      // First save on an unseeded DB: fill the required fields with whatever we have.
      await prisma.siteSettings.create({
        data: { id: "site", ownerName: data.ownerName ?? "Your Name", role: data.role ?? "Video Editor", ...data },
      });
    }
    revalidatePublicSite();
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

// ─── Media helpers ──────────────────────────────────────────

/** Remove an uploaded-but-unsaved blob (e.g. the user hit "Remove" before saving). */
export async function discardUpload(url: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const target = z.string().url().parse(url);
    // Only delete if nothing references it yet.
    const s = await prisma.siteSettings.findUnique({ where: { id: "site" } });
    const inSettings = s && imageFields.settings.some((f) => (s as Record<string, unknown>)[f] === target);
    const [p, t, l, g] = await Promise.all([
      prisma.project.count({ where: { OR: [{ thumbnailUrl: target }, { beforeImageUrl: target }, { afterImageUrl: target }] } }),
      prisma.testimonial.count({ where: { photoUrl: target } }),
      prisma.clientLogo.count({ where: { logoUrl: target } }),
      prisma.galleryItem.count({ where: { imageUrl: target } }),
    ]);
    if (!inSettings && p + t + l + g === 0) await deleteBlobs([target]);
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

/** Fetch title + best thumbnail for a pasted link (YouTube/Vimeo oEmbed, no API key). */
export async function fetchVideoMeta(url: string): Promise<
  { ok: true; platform: string; videoId: string; orientation: string; thumbnailUrl: string | null; title: string | null } | { ok: false; error: string }
> {
  try {
    await requireAdmin();
    const v = parseVideoUrl(url);
    if (!v) return { ok: false, error: "Unsupported link" };
    let title: string | null = null;
    let thumbnailUrl = v.thumbnailUrl;

    if (v.platform === "YOUTUBE") {
      const max = youtubeThumb(v.videoId, "max");
      const [head, oembed] = await Promise.all([
        fetch(max, { method: "HEAD" }).catch(() => null),
        fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${v.videoId}`)}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
      ]);
      if (head?.ok) thumbnailUrl = max;
      title = oembed?.title ?? null;
    } else if (v.platform === "VIMEO") {
      const o = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${v.videoId}`)}`)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null);
      title = o?.title ?? null;
      thumbnailUrl = o?.thumbnail_url ?? null;
    }
    return { ok: true, platform: v.platform, videoId: v.videoId, orientation: v.suggestedOrientation, thumbnailUrl, title };
  } catch {
    return { ok: false, error: "Could not fetch video details" };
  }
}

// ─── Messages ───────────────────────────────────────────────

export async function setMessageRead(ids: string[], isRead: boolean): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.contactMessage.updateMany({ where: { id: { in: z.array(z.string()).parse(ids) } }, data: { isRead } });
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function deleteMessages(ids: string[]): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.contactMessage.deleteMany({ where: { id: { in: z.array(z.string()).parse(ids) } } });
    revalidatePath("/admin", "layout");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function deleteSubscribers(ids: string[]): Promise<ActionResult> {
  try {
    await requireAdmin();
    await prisma.subscriber.deleteMany({ where: { id: { in: z.array(z.string()).parse(ids) } } });
    revalidatePath("/admin/subscribers");
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

// ─── Account ────────────────────────────────────────────────

export async function changePassword(input: unknown): Promise<ActionResult> {
  try {
    const session = await requireAdmin();
    const { current, next } = passwordSchema.parse(input);
    const user = await prisma.user.findUnique({ where: { email: session.user!.email! } });
    if (!user || !(await bcrypt.compare(current, user.passwordHash))) {
      return { ok: false, error: "Current password is incorrect.", fieldErrors: { current: "Incorrect password" } };
    }
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(next, 12) } });
    return { ok: true };
  } catch (err) {
    return fail(err);
  }
}

export async function logout() {
  await signOut({ redirectTo: "/admin/login" });
}
