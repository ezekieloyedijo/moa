import { prisma } from "@/lib/db";
import { Inbox } from "@/components/admin/inbox";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  return <Inbox messages={JSON.parse(JSON.stringify(messages))} />;
}
