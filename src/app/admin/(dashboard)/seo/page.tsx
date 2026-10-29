import { prisma } from "@/lib/db";
import { placeholderSettings } from "@/content/placeholder";
import { SeoSettings } from "@/components/admin/settings-pages";
import { siteUrl } from "@/lib/utils";

export const metadata = { title: "SEO & tracking" };

export default async function SeoPage() {
  const s = await prisma.siteSettings.findUnique({ where: { id: "site" } });
  return <SeoSettings initial={JSON.parse(JSON.stringify(s ?? placeholderSettings))} siteUrl={siteUrl()} />;
}
