import "server-only";
import { headers } from "next/headers";
import { prisma } from "./db";

/** The visitor's IP as reported by Vercel's proxy; used as a rate-limit key. */
export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/**
 * Fixed-window rate limiter stored in Postgres (no Redis needed on the free tier).
 * Only used on POSTs (login, contact form, newsletter), never on page views.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowSeconds * 1000);

  try {
    const existing = await prisma.rateLimit.findUnique({ where: { key } });
    if (!existing || existing.windowStart < windowStart) {
      await prisma.rateLimit.upsert({
        where: { key },
        update: { count: 1, windowStart: now },
        create: { key, count: 1, windowStart: now },
      });
      return { ok: true, remaining: limit - 1 };
    }
    if (existing.count >= limit) return { ok: false, remaining: 0 };
    await prisma.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
    return { ok: true, remaining: limit - existing.count - 1 };
  } catch (err) {
    // Fail open: a DB hiccup should not lock the owner out.
    console.error("[rate-limit]", err);
    return { ok: true, remaining: limit };
  }
}
