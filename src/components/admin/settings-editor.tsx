"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveSettings } from "@/app/admin/actions";
import { settingsSchema } from "@/lib/validators";
import type { FieldDef } from "./resources";
import { FieldRenderer } from "./field-renderer";
import { PageHeader } from "./page-header";

type Values = Record<string, unknown>;
export type SettingsSection = { id: string; title: string; description?: string; fields: FieldDef[] };

/** Section-based editor for the single SiteSettings row, with a sticky save bar. */
export function SettingsEditor({
  title,
  description,
  sections,
  initial,
  aside,
}: {
  title: string;
  description: string;
  sections: SettingsSection[];
  initial: Values;
  aside?: (values: Values) => React.ReactNode;
}) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  const set = useCallback((patch: Values) => setValues((v) => ({ ...v, ...patch })), []);

  const names = sections.flatMap((s) => s.fields.filter((f) => f.type !== "heading").map((f) => f.name));
  const dirty = names.some((n) => JSON.stringify(values[n]) !== JSON.stringify(saved[n]));

  function save() {
    const payload = Object.fromEntries(names.map((n) => [n, values[n]]));
    const parsed = settingsSchema.partial().safeParse(payload);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (fe[String(i.path[0])] ??= i.message));
      setErrors(fe);
      toast.error("Please fix the highlighted fields.");
      return;
    }
    start(async () => {
      const res = await saveSettings(payload);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.error);
        return;
      }
      setErrors({});
      setSaved(values);
      toast.success("Saved. The live site updates in a few seconds.");
      router.refresh();
    });
  }

  return (
    <div>
      <PageHeader title={title} description={description} />
      <div className="space-y-6">
        {aside?.(values)}
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-24 rounded-2xl border border-line bg-surface p-5 md:p-7">
            <h2 className="text-lg font-semibold">{s.title}</h2>
            {s.description && <p className="mb-5 mt-1 text-sm text-muted">{s.description}</p>}
            <div className={s.description ? "" : "mt-5"}>
              <FieldRenderer fields={s.fields} values={values} set={set} errors={errors} />
            </div>
          </section>
        ))}
      </div>

      <div className="sticky bottom-20 z-10 mt-6 lg:bottom-4">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface/95 p-3 shadow-soft backdrop-blur">
          <p className="pl-2 text-sm text-muted">{dirty ? "You have unsaved changes" : "All changes saved"}</p>
          <button type="button" onClick={save} disabled={pending || !dirty} className="min-h-12 rounded-xl bg-accent px-6 font-semibold text-on-accent disabled:opacity-50">
            {pending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
