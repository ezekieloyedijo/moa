import "server-only";
import { revalidatePath } from "next/cache";

/**
 * Rebuilds the statically generated public site (page, sitemap, OG image,
 * manifest) after the owner saves anything. Changes go live within seconds.
 */
export function revalidatePublicSite() {
  revalidatePath("/", "layout");
}
