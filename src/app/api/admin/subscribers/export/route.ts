import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** CSV download of lead-magnet subscribers (admin only). */
export async function GET() {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const rows = await prisma.subscriber.findMany({ orderBy: { createdAt: "desc" } });
  const csv = ["email,subscribed_at", ...rows.map((r) => `"${r.email.replace(/"/g, '""')}",${r.createdAt.toISOString()}`)].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
