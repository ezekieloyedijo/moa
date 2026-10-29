import type { MetadataRoute } from "next";
import { getPublicData } from "@/lib/data";
import { siteUrl } from "@/lib/utils";

export const dynamic = "force-static";

/** Dynamic sitemap: the one-page site plus image + video entries for Google. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const d = await getPublicData();
  const url = siteUrl();
  const abs = (u: string) => (u.startsWith("http") ? u : `${url}${u}`);

  return [
    {
      url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      images: [
        d.settings.portraitUrl,
        ...d.projects.map((p) => p.thumbnailUrl),
        ...d.gallery.map((g) => g.imageUrl),
      ]
        .filter(Boolean)
        .map(abs),
    },
  ];
}
