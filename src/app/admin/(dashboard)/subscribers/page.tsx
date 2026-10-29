import { prisma } from "@/lib/db";
import { Subscribers } from "@/components/admin/subscribers";

export const metadata = { title: "Subscribers" };

export default async function SubscribersPage() {
  const subs = await prisma.subscriber.findMany({ orderBy: { createdAt: "desc" } });
  return <Subscribers subscribers={JSON.parse(JSON.stringify(subs))} />;
}
