import "server-only";
import { cache } from "react";
import { prisma } from "./db";
import type { PublicData } from "./types";
import * as P from "@/content/placeholder";

/**
 * Loads ALL public content in a single round of parallel queries.
 *
 * This only runs at BUILD time and when the dashboard calls
 * revalidatePath() — never on a visitor's page view, so Neon can sleep.
 */
export const getPublicData = cache(async (): Promise<PublicData> => {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "site" } });
    if (!settings) {
      console.warn("[data] No SiteSettings row found — using placeholder content. Run `npm run db:seed`.");
      return placeholderData();
    }

    const byOrder = { orderBy: { order: "asc" as const } };
    const [categories, projects, services, pricing, testimonials, faqs, stats, logos, socials, process, painPoints, gallery] =
      await Promise.all([
        prisma.category.findMany(byOrder),
        prisma.project.findMany({
          where: { published: true },
          orderBy: { order: "asc" },
          include: {
            category: { select: { name: true, slug: true } },
            socialLinks: { select: { id: true, platform: true, url: true, viewCount: true } },
          },
        }),
        prisma.service.findMany(byOrder),
        prisma.pricingTier.findMany(byOrder),
        prisma.testimonial.findMany({ where: { published: true }, ...byOrder }),
        prisma.fAQ.findMany(byOrder),
        prisma.stat.findMany(byOrder),
        prisma.clientLogo.findMany(byOrder),
        prisma.socialLink.findMany(byOrder),
        prisma.processStep.findMany(byOrder),
        prisma.painPoint.findMany(byOrder),
        prisma.galleryItem.findMany({ where: { published: true }, ...byOrder }),
      ]);

    // JSON round-trip converts Dates to strings and drops prototypes.
    return JSON.parse(
      JSON.stringify({
        settings,
        categories,
        projects,
        services,
        pricing,
        testimonials,
        faqs,
        stats,
        logos,
        socials,
        process,
        painPoints,
        gallery,
      }),
    ) as PublicData;
  } catch (err) {
    console.error("[data] Database unavailable — using placeholder content.", err);
    return placeholderData();
  }
});

/** Same shape as the DB result, built from src/content/placeholder.ts. */
export function placeholderData(): PublicData {
  const now = new Date().toISOString();
  const withIds = <T extends object>(rows: T[], prefix: string) =>
    rows.map((r, i) => ({ id: `${prefix}-${i}`, order: i, ...r }));

  const categories = P.placeholderCategories.map((c, i) => ({ id: `cat-${i}`, ...c }));

  return {
    settings: { id: "site", ...P.placeholderSettings },
    categories,
    projects: P.placeholderProjects.map((p, i) => {
      const cat = categories.find((c) => c.slug === p.categorySlug) ?? null;
      return {
        id: `proj-${i}`,
        title: p.title,
        slug: p.slug,
        client: p.client,
        categoryId: cat?.id ?? null,
        category: cat ? { name: cat.name, slug: cat.slug } : null,
        description: p.description,
        role: p.role,
        tools: p.tools,
        resultMetric: p.resultMetric,
        platform: "YOUTUBE" as const,
        videoUrl: `https://www.youtube.com/watch?v=${p.videoId}`,
        videoId: p.videoId,
        orientation: p.orientation,
        thumbnailUrl: P.placeholderThumb(p.videoId),
        thumbnailAlt: `${p.title} — video edited by Mercy Adedayo for ${p.client}`,
        publishedAt: now,
        featured: p.featured,
        published: true,
        order: i,
        isCaseStudy: !!p.isCaseStudy,
        challenge: p.challenge ?? "",
        approach: p.approach ?? "",
        results: p.results ?? "",
        beforeImageUrl: p.beforeImageUrl ?? "",
        afterImageUrl: p.afterImageUrl ?? "",
        socialLinks: (p.socialLinks ?? []).map((s, j) => ({ id: `sl-${i}-${j}`, ...s })),
      };
    }),
    services: withIds(P.placeholderServices, "svc"),
    pricing: withIds(P.placeholderPricing, "tier"),
    testimonials: withIds(P.placeholderTestimonials, "tst").map((t) => ({
      ...t,
      photoUrl: "",
      videoUrl: "",
      published: true,
    })),
    faqs: withIds(P.placeholderFaqs, "faq"),
    stats: withIds(P.placeholderStats, "stat"),
    logos: withIds(P.placeholderLogos, "logo"),
    socials: withIds(P.placeholderSocials, "soc"),
    process: withIds(P.placeholderProcess, "step"),
    painPoints: withIds(P.placeholderPainPoints, "pain"),
    gallery: withIds(P.placeholderGallery, "gal").map((g) => ({
      ...g,
      orientation: "LANDSCAPE" as const,
      width: 1280,
      height: 720,
      featured: false,
      published: true,
    })),
  };
}
