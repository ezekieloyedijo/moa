import { prisma } from "@/lib/db";
import { placeholderSettings } from "@/content/placeholder";
import { readOverrides } from "@/lib/sections";
import { SectionsEditor } from "@/components/admin/sections-editor";

export const metadata = { title: "Page sections" };

export default async function SectionsPage() {
  const s = (await prisma.siteSettings.findUnique({ where: { id: "site" } })) ?? placeholderSettings;
  return (
    <SectionsEditor
      initial={{ sections: readOverrides(s.sections), leadMagnetEnabled: s.leadMagnetEnabled }}
      ownerFirstName={s.ownerName.split(" ")[0]}
      aboutHeading={s.aboutHeading}
    />
  );
}
