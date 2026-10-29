import { requireAdminPage } from "@/lib/guard";
import { prisma } from "@/lib/db";
import { AdminShell } from "@/components/admin/shell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminPage();
  const unread = await prisma.contactMessage.count({ where: { isRead: false } }).catch(() => 0);
  return (
    <AdminShell unread={unread} email={session.user?.email ?? ""}>
      {children}
    </AdminShell>
  );
}
