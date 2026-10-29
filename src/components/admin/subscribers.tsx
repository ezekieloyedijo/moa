"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteSubscribers } from "@/app/admin/actions";
import { Icon } from "@/components/icons";
import { useConfirm } from "./confirm";
import { PageHeader } from "./page-header";

type Sub = { id: string; email: string; createdAt: string };

export function Subscribers({ subscribers: initial }: { subscribers: Sub[] }) {
  const router = useRouter();
  const confirm = useConfirm();
  const [subs, setSubs] = useState(initial);

  async function remove(s: Sub) {
    if (!(await confirm({ title: "Remove this subscriber?", body: s.email, confirmLabel: "Remove", danger: true }))) return;
    setSubs((l) => l.filter((x) => x.id !== s.id));
    const r = await deleteSubscribers([s.id]);
    if (!r.ok) toast.error(r.error);
    router.refresh();
  }

  return (
    <div>
      <PageHeader
        title="Subscribers"
        description={`${subs.length} people signed up for your lead magnet.`}
        action={
          <a href="/api/admin/subscribers/export" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent px-5 font-semibold text-on-accent">
            <Icon name="download" size={18} /> Export CSV
          </a>
        }
      />
      {subs.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">No subscribers yet.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-surface-2 text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Email</th>
                <th scope="col" className="hidden px-4 py-3 font-medium sm:table-cell">Signed up</th>
                <th scope="col" className="w-16 px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {subs.map((s) => (
                <tr key={s.id}>
                  <td className="break-all px-4 py-2">{s.email}</td>
                  <td className="hidden px-4 py-2 text-muted sm:table-cell">{new Date(s.createdAt).toLocaleDateString("en-GB", { dateStyle: "medium" })}</td>
                  <td className="px-2 py-1">
                    <button type="button" onClick={() => remove(s)} aria-label={`Remove ${s.email}`} className="grid h-11 w-11 place-items-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-600">
                      <Icon name="close" size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
