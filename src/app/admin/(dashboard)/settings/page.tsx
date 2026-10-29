import { prisma } from "@/lib/db";
import { placeholderSettings } from "@/content/placeholder";
import { GeneralSettings } from "@/components/admin/settings-pages";

export const metadata = { title: "Settings & Hero" };

export default async function SettingsPage() {
  const s = await prisma.siteSettings.findUnique({ where: { id: "site" } });
  return <GeneralSettings initial={JSON.parse(JSON.stringify(s ?? placeholderSettings))} />;
}
