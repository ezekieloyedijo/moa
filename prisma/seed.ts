/**
 * Seed script — fills every model with realistic placeholder content.
 * Run with:  npm run db:seed
 *
 * Safe to re-run: content tables are cleared and re-created. The admin user
 * and contact messages/subscribers are never deleted.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as P from "../src/content/placeholder";

const prisma = new PrismaClient();

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const plain = process.env.ADMIN_PASSWORD;
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!email || (!plain && !hash)) {
    console.warn("⚠  ADMIN_EMAIL + ADMIN_PASSWORD (or ADMIN_PASSWORD_HASH) not set — skipping admin user.");
    return;
  }
  const passwordHash = plain ? await bcrypt.hash(plain, 12) : hash!;
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: P.placeholderSettings.ownerName },
  });
  console.log(`✓ Admin user ready: ${email}`);
}

async function main() {
  await seedAdmin();

  await prisma.siteSettings.upsert({
    where: { id: "site" },
    update: {},
    create: { id: "site", ...P.placeholderSettings },
  });
  console.log("✓ Site settings");

  // Clear content tables (children first).
  await prisma.socialPostLink.deleteMany();
  await prisma.project.deleteMany();
  await prisma.category.deleteMany();
  await Promise.all([
    prisma.service.deleteMany(),
    prisma.pricingTier.deleteMany(),
    prisma.testimonial.deleteMany(),
    prisma.fAQ.deleteMany(),
    prisma.stat.deleteMany(),
    prisma.clientLogo.deleteMany(),
    prisma.socialLink.deleteMany(),
    prisma.processStep.deleteMany(),
    prisma.painPoint.deleteMany(),
    prisma.galleryItem.deleteMany(),
  ]);

  const categories = await Promise.all(P.placeholderCategories.map((c) => prisma.category.create({ data: c })));

  for (const [i, p] of P.placeholderProjects.entries()) {
    const cat = categories.find((c) => c.slug === p.categorySlug);
    await prisma.project.create({
      data: {
        title: p.title,
        slug: p.slug,
        client: p.client,
        categoryId: cat?.id,
        description: p.description,
        role: p.role,
        tools: p.tools,
        resultMetric: p.resultMetric,
        platform: "YOUTUBE",
        videoUrl: `https://www.youtube.com/watch?v=${p.videoId}`,
        videoId: p.videoId,
        orientation: p.orientation,
        thumbnailUrl: P.placeholderThumb(p.videoId),
        thumbnailAlt: `${p.title}: video edited by Mercy Adedayo for ${p.client}`,
        featured: p.featured,
        published: true,
        order: i,
        isCaseStudy: !!p.isCaseStudy,
        challenge: p.challenge ?? "",
        approach: p.approach ?? "",
        results: p.results ?? "",
        beforeImageUrl: p.beforeImageUrl ?? "",
        afterImageUrl: p.afterImageUrl ?? "",
        socialLinks: { create: p.socialLinks ?? [] },
      },
    });
  }
  console.log(`✓ ${categories.length} categories, ${P.placeholderProjects.length} projects`);

  const ordered = <T extends object>(rows: T[]) => rows.map((r, order) => ({ ...r, order }));
  await prisma.service.createMany({ data: ordered(P.placeholderServices) });
  await prisma.pricingTier.createMany({ data: ordered(P.placeholderPricing) });
  await prisma.testimonial.createMany({ data: ordered(P.placeholderTestimonials) });
  await prisma.fAQ.createMany({ data: ordered(P.placeholderFaqs) });
  await prisma.stat.createMany({ data: ordered(P.placeholderStats) });
  await prisma.clientLogo.createMany({ data: ordered(P.placeholderLogos) });
  await prisma.socialLink.createMany({ data: ordered(P.placeholderSocials) });
  await prisma.processStep.createMany({ data: ordered(P.placeholderProcess) });
  await prisma.painPoint.createMany({ data: ordered(P.placeholderPainPoints) });
  await prisma.galleryItem.createMany({
    data: ordered(P.placeholderGallery).map((g) => ({ ...g, width: 1280, height: 720 })),
  });
  console.log("✓ Services, pricing, testimonials, FAQs, stats, logos, socials, process, pain points, gallery");

  // A couple of sample inbox items so the dashboard isn't empty.
  if ((await prisma.contactMessage.count()) === 0) {
    await prisma.contactMessage.createMany({
      data: [
        {
          name: "Sample Client",
          email: "client@example.com",
          projectType: "YouTube video editing",
          budget: "$500 – $1,000",
          message: "Hi Mercy! I run a tech channel and need 4 videos edited per month. Are you available?",
        },
        {
          name: "Agency Producer",
          email: "producer@example.com",
          projectType: "Commercial / ad",
          budget: "$1,000+",
          message: "We have a product launch next month and need a 30s ad with cut-downs. Can we book a call?",
          isRead: true,
        },
      ],
    });
  }
  console.log("🎬 Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
