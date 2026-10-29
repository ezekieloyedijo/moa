import type { MetadataRoute } from "next";
import { getPublicData } from "@/lib/data";

export const dynamic = "force-static";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { settings: s } = await getPublicData();
  return {
    name: `${s.ownerName} (${s.brandName}): ${s.role}`,
    short_name: s.brandName,
    description: s.seoDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#0B0B0F",
    theme_color: "#FF6B35",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
