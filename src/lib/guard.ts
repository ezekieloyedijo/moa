import "server-only";
import { redirect } from "next/navigation";
import { auth } from "./auth";

/** For server actions: throws if there's no valid session. Never trust the client. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");
  return session;
}

/** For admin pages/layouts: redirects to login instead of throwing. */
export async function requireAdminPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/admin/login");
  return session;
}
