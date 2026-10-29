import { prisma } from "@/lib/db";
import { GalleryManager } from "@/components/admin/gallery-manager";

export const metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const items = await prisma.galleryItem.findMany({ orderBy: { order: "asc" } });
  return <GalleryManager items={JSON.parse(JSON.stringify(items))} />;
}
