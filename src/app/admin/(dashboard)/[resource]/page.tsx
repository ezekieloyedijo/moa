import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ResourceManager } from "@/components/admin/resource-manager";
import { resources } from "@/components/admin/resources";
import type { ResourceKey } from "@/lib/validators";

type Key = Exclude<ResourceKey, "gallery">;

/* eslint-disable @typescript-eslint/no-explicit-any */
const loaders: Record<Key, () => Promise<any[]>> = {
  projects: () =>
    prisma.project.findMany({
      orderBy: { order: "asc" },
      include: { category: { select: { name: true } }, socialLinks: { select: { platform: true, url: true, viewCount: true } } },
    }),
  categories: () => prisma.category.findMany({ orderBy: { order: "asc" } }),
  services: () => prisma.service.findMany({ orderBy: { order: "asc" } }),
  pricing: () => prisma.pricingTier.findMany({ orderBy: { order: "asc" } }),
  testimonials: () => prisma.testimonial.findMany({ orderBy: { order: "asc" } }),
  faqs: () => prisma.fAQ.findMany({ orderBy: { order: "asc" } }),
  stats: () => prisma.stat.findMany({ orderBy: { order: "asc" } }),
  logos: () => prisma.clientLogo.findMany({ orderBy: { order: "asc" } }),
  socials: () => prisma.socialLink.findMany({ orderBy: { order: "asc" } }),
  process: () => prisma.processStep.findMany({ orderBy: { order: "asc" } }),
  painpoints: () => prisma.painPoint.findMany({ orderBy: { order: "asc" } }),
};
/* eslint-enable @typescript-eslint/no-explicit-any */

type Props = { params: Promise<{ resource: string }> };

export async function generateMetadata({ params }: Props) {
  const { resource } = await params;
  return { title: resources[resource as Key]?.title ?? "Not found" };
}

/** One page serves every list-style content type (projects, services, FAQs…). */
export default async function ResourcePage({ params }: Props) {
  const { resource } = await params;
  if (!Object.hasOwn(loaders, resource)) notFound();
  const key = resource as Key;

  const [items, categories] = await Promise.all([
    loaders[key](),
    key === "projects" ? prisma.category.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }) : Promise.resolve(undefined),
  ]);

  return <ResourceManager resource={key} items={JSON.parse(JSON.stringify(items))} categories={categories} />;
}
