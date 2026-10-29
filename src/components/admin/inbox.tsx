"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteMessages, setMessageRead } from "@/app/admin/actions";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons";
import { useConfirm } from "./confirm";
import { PageHeader } from "./page-header";

type Msg = { id: string; name: string; email: string; projectType: string; budget: string; message: string; isRead: boolean; createdAt: string };

/** Contact-form inbox: read/unread, reply via mailto, delete. */
export function Inbox({ messages: initial }: { messages: Msg[] }) {
  const router = useRouter();
  const confirm = useConfirm();
  const [messages, setMessages] = useState(initial);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  useEffect(() => setMessages(initial), [initial]);

  async function mark(m: Msg, isRead: boolean) {
    setMessages((l) => l.map((x) => (x.id === m.id ? { ...x, isRead } : x)));
    const r = await setMessageRead([m.id], isRead);
    if (!r.ok) toast.error(r.error);
    router.refresh();
  }

  async function open(m: Msg) {
    setOpenId(openId === m.id ? null : m.id);
    if (!m.isRead) await mark(m, true);
  }

  async function remove(m: Msg) {
    if (!(await confirm({ title: "Delete this message?", body: `From ${m.name} (${m.email}).`, confirmLabel: "Delete", danger: true }))) return;
    setMessages((l) => l.filter((x) => x.id !== m.id));
    const r = await deleteMessages([m.id]);
    if (r.ok) toast.success("Message deleted.");
    else toast.error(r.error);
    router.refresh();
  }

  const shown = filter === "unread" ? messages.filter((m) => !m.isRead) : messages;
  const unread = messages.filter((m) => !m.isRead).length;

  return (
    <div>
      <PageHeader
        title="Messages"
        description="Enquiries from your contact form."
        action={
          <div className="flex rounded-xl border border-line p-1">
            {(["all", "unread"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn("min-h-10 rounded-lg px-4 text-sm font-medium capitalize", filter === f ? "bg-fg text-bg" : "text-muted")}
              >
                {f}
                {f === "unread" && unread > 0 && ` (${unread})`}
              </button>
            ))}
          </div>
        }
      />
      {shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">{filter === "unread" ? "No unread messages 🎉" : "No messages yet."}</p>
      ) : (
        <ul className="space-y-2">
          {shown.map((m) => {
            const isOpen = openId === m.id;
            return (
              <li key={m.id} className={cn("overflow-hidden rounded-xl border bg-surface", m.isRead ? "border-line" : "border-accent/50")}>
                <button type="button" onClick={() => open(m)} aria-expanded={isOpen} className="flex w-full items-start gap-3 p-4 text-left">
                  <span className={cn("mt-2 h-2.5 w-2.5 shrink-0 rounded-full", m.isRead ? "bg-transparent" : "bg-accent")} aria-label={m.isRead ? "Read" : "Unread"} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <span className={cn("truncate", !m.isRead && "font-bold")}>{m.name}</span>
                      <time className="text-xs text-muted" dateTime={m.createdAt}>
                        {new Date(m.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                      </time>
                    </span>
                    <span className="block truncate text-sm text-muted">
                      {[m.projectType, m.budget].filter(Boolean).join(" · ") || m.email}
                    </span>
                    {!isOpen && <span className="mt-1 block truncate text-sm">{m.message}</span>}
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-line p-4">
                    <dl className="mb-4 grid gap-2 text-sm sm:grid-cols-3">
                      <div>
                        <dt className="text-muted">Email</dt>
                        <dd className="break-all font-medium">{m.email}</dd>
                      </div>
                      <div>
                        <dt className="text-muted">Project type</dt>
                        <dd className="font-medium">{m.projectType || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-muted">Budget</dt>
                        <dd className="font-medium">{m.budget || "—"}</dd>
                      </div>
                    </dl>
                    <p className="whitespace-pre-wrap leading-relaxed">{m.message}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <a
                        href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: your ${m.projectType || "video"} project`)}&body=${encodeURIComponent(`Hi ${m.name.split(" ")[0]},\n\nThanks for reaching out!\n\n`)}`}
                        className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-4 font-semibold text-on-accent"
                      >
                        <Icon name="mail" size={18} /> Reply by email
                      </a>
                      <button type="button" onClick={() => mark(m, !m.isRead)} className="min-h-11 rounded-xl border border-line px-4 text-sm font-medium">
                        Mark as {m.isRead ? "unread" : "read"}
                      </button>
                      <button type="button" onClick={() => remove(m)} className="min-h-11 rounded-xl border border-line px-4 text-sm font-medium text-red-600 hover:border-red-500 dark:text-red-400">
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
