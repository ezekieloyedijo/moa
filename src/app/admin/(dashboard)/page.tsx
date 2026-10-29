import Link from "next/link";
import { prisma } from "@/lib/db";
import { Icon } from "@/components/icons";
import { PageHeader } from "@/components/admin/page-header";

export const metadata = { title: "Overview" };

/** Dashboard home: counts, recent messages, quick actions. */
export default async function OverviewPage() {
  const [projects, drafts, testimonials, unread, subscribers, gallery, recent, settings] = await Promise.all([
    prisma.project.count(),
    prisma.project.count({ where: { published: false } }),
    prisma.testimonial.count(),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.subscriber.count(),
    prisma.galleryItem.count(),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.siteSettings.findUnique({ where: { id: "site" }, select: { ownerName: true } }),
  ]);
  const first = settings?.ownerName.split(" ")[0] ?? "there";

  const cards = [
    { label: "Projects", value: projects, sub: drafts ? `${drafts} draft${drafts > 1 ? "s" : ""}` : "All published", href: "/admin/projects", icon: "film" },
    { label: "Testimonials", value: testimonials, sub: "Client quotes", href: "/admin/testimonials", icon: "quote" },
    { label: "Unread messages", value: unread, sub: "From the contact form", href: "/admin/messages", icon: "mail", highlight: unread > 0 },
    { label: "Subscribers", value: subscribers, sub: "Lead magnet signups", href: "/admin/subscribers", icon: "download" },
  ];

  const actions = [
    { href: "/admin/projects", label: "Add a project", sub: "Paste a YouTube link", icon: "plus", external: false },
    { href: "/admin/settings#hero", label: "Edit hero", sub: "Headline, video, availability", icon: "spark", external: false },
    { href: "/", label: "View live site", sub: "Opens in a new tab", icon: "arrowUpRight", external: true },
  ];

  return (
    <div>
      <PageHeader title={`Welcome back, ${first} 👋`} description="Here's what's happening with your portfolio." />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`rounded-2xl border bg-surface p-4 transition hover:-translate-y-0.5 hover:border-accent md:p-5 ${c.highlight ? "border-accent" : "border-line"}`}
          >
            <span className="flex items-center justify-between text-muted">
              <span className="text-sm">{c.label}</span>
              <Icon name={c.icon} size={18} />
            </span>
            <span className={`mt-2 block text-4xl font-bold tabular-nums ${c.highlight ? "text-accent" : ""}`}>{c.value}</span>
            <span className="text-xs text-muted">{c.sub}</span>
          </Link>
        ))}
      </div>

      <h2 className="mb-3 mt-10 text-lg font-semibold">Quick actions</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {actions.map((a) => (
          <a
            key={a.label}
            href={a.href}
            {...(a.external && { target: "_blank", rel: "noopener" })}
            className="flex min-h-16 items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition hover:border-accent"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-on-accent">
              <Icon name={a.icon} />
            </span>
            <span>
              <span className="block font-semibold">{a.label}</span>
              <span className="text-sm text-muted">{a.sub}</span>
            </span>
          </a>
        ))}
      </div>

      <div className="mb-3 mt-10 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent messages</h2>
        <Link href="/admin/messages" className="text-sm font-medium text-accent">
          View all →
        </Link>
      </div>
      {recent.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">
          No messages yet. They will appear here when someone uses your contact form.
        </p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {recent.map((m) => (
            <li key={m.id}>
              <Link href="/admin/messages" className="flex items-start gap-3 p-4 hover:bg-surface-2">
                <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${m.isRead ? "bg-line" : "bg-accent"}`} />
                <span className="min-w-0 flex-1">
                  <span className="flex justify-between gap-3">
                    <span className={`truncate ${m.isRead ? "" : "font-bold"}`}>{m.name}</span>
                    <time className="shrink-0 text-xs text-muted">{m.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</time>
                  </span>
                  <span className="block truncate text-sm text-muted">{m.message}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-8 text-sm text-muted">{gallery} gallery images · Changes you save go live within seconds.</p>
    </div>
  );
}
