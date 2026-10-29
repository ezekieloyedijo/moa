"use client";

import type { FieldDef } from "./resources";
import { iconSelectOptions } from "./resources";
import { ImageUploader } from "./image-uploader";
import { VideoField } from "./video-field";
import { Select, TagsInput, TextArea, TextInput, Toggle, inputCls } from "./fields";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";

type Values = Record<string, unknown>;

/** Renders a list of FieldDefs into a responsive two-column form grid. */
export function FieldRenderer({
  fields,
  values,
  set,
  errors,
  categories = [],
}: {
  fields: FieldDef[];
  values: Values;
  set: (patch: Values) => void;
  errors: Record<string, string>;
  categories?: Array<{ id: string; name: string }>;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {fields.map((f) => {
        if (f.showIf && !f.showIf(values)) return null;
        const v = values[f.name];
        const err = errors[f.name];
        const span = cn((f.full || f.type === "heading" || f.type === "textarea") && "sm:col-span-2");

        switch (f.type) {
          case "heading":
            return (
              <h3 key={f.name} className={cn(span, "border-t border-line pt-5 font-mono text-xs uppercase tracking-widest text-muted first:border-0 first:pt-0")}>
                {f.label}
              </h3>
            );
          case "text":
          case "url":
          case "email":
          case "number":
            return (
              <TextInput
                key={f.name}
                className={span}
                label={f.label}
                help={f.help}
                error={err}
                type={f.type === "number" ? "text" : f.type}
                inputMode={f.type === "number" ? "numeric" : f.type === "email" ? "email" : f.type === "url" ? "url" : undefined}
                placeholder={f.placeholder}
                counter={f.counter}
                value={(v as string | number) ?? ""}
                onChange={(x) => set({ [f.name]: x })}
              />
            );
          case "textarea":
            return (
              <TextArea
                key={f.name}
                className={span}
                label={f.label}
                help={f.help}
                error={err}
                rows={f.rows}
                placeholder={f.placeholder}
                counter={f.counter}
                value={(v as string) ?? ""}
                onChange={(x) => set({ [f.name]: x })}
              />
            );
          case "toggle":
            return (
              <div key={f.name} className={span}>
                <Toggle label={f.label} help={f.help} checked={!!v} onChange={(x) => set({ [f.name]: x })} />
              </div>
            );
          case "select": {
            const options =
              f.options === "categories"
                ? [{ value: "", label: "No category" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]
                : f.options === "icons"
                  ? iconSelectOptions
                  : f.options;
            return (
              <div key={f.name} className={cn(span, f.options === "icons" && "flex items-end gap-3")}>
                <Select
                  className="flex-1"
                  label={f.label}
                  help={f.help}
                  error={err}
                  options={options}
                  value={v == null ? "" : String(v)}
                  onChange={(x) => set({ [f.name]: f.name === "categoryId" ? x || null : x })}
                />
                {f.options === "icons" && (
                  <span className="mb-0.5 grid h-12 w-12 place-items-center rounded-xl border border-line text-accent">
                    <Icon name={String(v)} />
                  </span>
                )}
              </div>
            );
          }
          case "tags":
            return (
              <TagsInput
                key={f.name}
                className={span}
                label={f.label}
                help={f.help}
                error={err}
                placeholder={f.placeholder}
                value={(v as string[]) ?? []}
                onChange={(x) => set({ [f.name]: x })}
              />
            );
          case "image":
            return (
              <div key={f.name} className={span}>
                <ImageUploader
                  label={f.label}
                  help={f.help}
                  error={err}
                  aspect={f.aspect}
                  maxWidth={f.maxWidth}
                  fit={f.fit}
                  folder={f.folder}
                  value={(v as string) ?? ""}
                  onChange={(url, meta) =>
                    set({
                      [f.name]: url,
                      ...(f.dims && meta && { width: meta.width, height: meta.height, orientation: meta.height > meta.width ? "PORTRAIT" : "LANDSCAPE" }),
                    })
                  }
                />
              </div>
            );
          case "video":
            return (
              <div key={f.name} className={span}>
                <VideoField
                  label={f.label}
                  error={err}
                  value={(v as string) ?? ""}
                  orientation={values.orientation as string}
                  onChange={(x) => set({ [f.name]: x })}
                  onDetected={(m) =>
                    set({
                      orientation: m.orientation,
                      ...(!values.title && m.title && { title: m.title }),
                    })
                  }
                />
              </div>
            );
          case "socialLinks":
            return (
              <div key={f.name} className={span}>
                <SocialLinksField label={f.label} value={(v as SocialRow[]) ?? []} onChange={(x) => set({ [f.name]: x })} errors={errors} />
              </div>
            );
        }
      })}
    </div>
  );
}

type SocialRow = { platform: string; url: string; viewCount: string };

function SocialLinksField({
  label,
  value,
  onChange,
  errors,
}: {
  label: string;
  value: SocialRow[];
  onChange: (v: SocialRow[]) => void;
  errors: Record<string, string>;
}) {
  const update = (i: number, patch: Partial<SocialRow>) => onChange(value.map((r, n) => (n === i ? { ...r, ...patch } : r)));
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold">{label}</legend>
      <p className="text-sm text-muted">Shown as small “Also on Instagram · 120K views” buttons on the project.</p>
      {value.map((r, i) => (
        <div key={i} className="grid gap-2 rounded-xl border border-line p-3 sm:grid-cols-[140px_1fr_120px_auto]">
          <select aria-label="Platform" value={r.platform} onChange={(e) => update(i, { platform: e.target.value })} className={cn(inputCls, "border-line")}>
            <option value="INSTAGRAM">Instagram</option>
            <option value="TIKTOK">TikTok</option>
            <option value="YOUTUBE">YouTube</option>
            <option value="VIMEO">Vimeo</option>
          </select>
          <input
            aria-label="Post URL"
            type="url"
            inputMode="url"
            placeholder="https://www.instagram.com/reel/…"
            value={r.url}
            onChange={(e) => update(i, { url: e.target.value })}
            className={cn(inputCls, errors[`socialLinks.${i}.url`] ? "border-red-500" : "border-line")}
          />
          <input aria-label="View count" placeholder="120K views" value={r.viewCount} onChange={(e) => update(i, { viewCount: e.target.value })} className={cn(inputCls, "border-line")} />
          <button
            type="button"
            onClick={() => onChange(value.filter((_, n) => n !== i))}
            aria-label="Remove link"
            className="grid min-h-12 place-items-center rounded-xl border border-line px-3 text-red-600 hover:border-red-500"
          >
            <Icon name="close" size={18} />
          </button>
        </div>
      ))}
      {value.length < 6 && (
        <button
          type="button"
          onClick={() => onChange([...value, { platform: "INSTAGRAM", url: "", viewCount: "" }])}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-dashed border-line px-4 text-sm font-medium hover:border-accent"
        >
          <Icon name="plus" size={16} /> Add original post link
        </button>
      )}
    </fieldset>
  );
}
