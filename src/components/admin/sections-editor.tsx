"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveSettings } from "@/app/admin/actions";
import { settingsSchema } from "@/lib/validators";
import { SECTIONS, SECTION_KEYS, type SectionKey, type SectionOverride, type SectionOverrides } from "@/lib/sections";
import { Switch, TextArea, TextInput, Toggle } from "./fields";
import { PageHeader } from "./page-header";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";

type State = { sections: SectionOverrides; leadMagnetEnabled: boolean };
const TEXT_FIELDS = [
  { key: "label", label: "Small label above the title", max: 60 },
  { key: "title", label: "Section title", max: 120 },
  { key: "intro", label: "Intro line under the title", max: 300 },
] as const;

/** Show/hide every public section and edit its heading text. Empty fields use the default shown as placeholder. */
export function SectionsEditor({ initial, ownerFirstName, aboutHeading }: { initial: State; ownerFirstName: string; aboutHeading: string }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);

  const get = (k: SectionKey): SectionOverride => values.sections[k] ?? {};
  const patch = (k: SectionKey, p: SectionOverride) => setValues((v) => ({ ...v, sections: { ...v.sections, [k]: { ...v.sections[k], ...p } } }));
  const fill = (t?: string) => (t ?? "").replaceAll("{name}", ownerFirstName);
  const hiddenCount = SECTION_KEYS.filter((k) => get(k).enabled === false).length;

  function save() {
    const parsed = settingsSchema.pick({ sections: true, leadMagnetEnabled: true }).safeParse(values);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (fe[i.path.slice(1).join(".")] ??= i.message));
      setErrors(fe);
      toast.error("Please fix the highlighted fields.");
      return;
    }
    start(async () => {
      const res = await saveSettings(parsed.data);
      if (!res.ok) {
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
      <PageHeader
        title="Page sections"
        description="Switch sections of the website on or off, and change their titles. Leave a text box empty to keep the default shown in grey."
      />
      <p className="mb-6 text-sm text-muted">
        {hiddenCount === 0 ? "All sections are showing." : `${hiddenCount} of ${SECTION_KEYS.length} sections are hidden.`} Sections with no content (for example, no
        FAQs yet) stay hidden automatically.
      </p>

      <div className="space-y-4">
        {SECTION_KEYS.map((k) => {
          const def = SECTIONS[k];
          const o = get(k);
          const on = o.enabled !== false;
          const fields = TEXT_FIELDS.filter((f) => def[f.key] !== undefined);
          return (
            <section key={k} className={cn("rounded-2xl border border-line bg-surface p-5 transition-opacity md:p-6", !on && "opacity-70")}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold">{def.name}</h2>
                  <p className="mt-0.5 text-sm text-muted">
                    {on ? "Showing on the website" : "Hidden from the website"} ·{" "}
                    <Link href={def.contentHref} className="inline-flex items-center gap-1 font-medium text-accent hover:underline">
                      Edit content <Icon name="arrow" size={14} />
                    </Link>
                  </p>
                </div>
                <Switch checked={on} onChange={(x) => patch(k, { enabled: x })} label={`Show ${def.name}`} />
              </div>

              {on && fields.length > 0 && (
                <div className="mt-5 grid gap-5 border-t border-line pt-5 sm:grid-cols-2">
                  {fields.map((f) => {
                    const placeholder = fill(k === "about" && f.key === "title" ? aboutHeading || def.title : def[f.key]);
                    const props = {
                      label: f.label,
                      value: o[f.key] ?? "",
                      onChange: (x: string) => patch(k, { [f.key]: x }),
                      placeholder,
                      counter: f.max,
                      error: errors[`${k}.${f.key}`],
                    };
                    return f.key === "intro" ? (
                      <TextArea key={f.key} {...props} rows={2} className="sm:col-span-2" />
                    ) : (
                      <TextInput key={f.key} {...props} className={f.key === "title" ? "sm:col-span-2" : undefined} />
                    );
                  })}
                </div>
              )}
              {on && k === "hero" && <p className="mt-4 text-sm text-muted">The hero&apos;s name, value line and buttons are edited under Settings &amp; Hero.</p>}
            </section>
          );
        })}

        <section className="rounded-2xl border border-line bg-surface p-5 md:p-6">
          <h2 className="mb-4 text-lg font-semibold">Footer</h2>
          <Toggle
            label="Show the lead magnet (free guide email signup)"
            help="Its offer title and download link are under Settings & Hero → Lead magnet."
            checked={values.leadMagnetEnabled}
            onChange={(x) => setValues((v) => ({ ...v, leadMagnetEnabled: x }))}
          />
        </section>
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
