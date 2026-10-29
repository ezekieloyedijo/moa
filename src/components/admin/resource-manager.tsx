"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteResources, reorderResource, saveResource, toggleField } from "@/app/admin/actions";
import { schemas, type ResourceKey } from "@/lib/validators";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons";
import { resources } from "./resources";
import { FieldRenderer } from "./field-renderer";
import { SortableList } from "./sortable-list";
import { Drawer } from "./drawer";
import { useConfirm } from "./confirm";
import { Switch } from "./fields";
import { PageHeader } from "./page-header";

type Row = Record<string, unknown> & { id: string };

/** Generic list + drag-to-reorder + create/edit drawer for one content type. */
export function ResourceManager({
  resource,
  items: initial,
  categories,
}: {
  resource: Exclude<ResourceKey, "gallery">;
  items: Row[];
  categories?: Array<{ id: string; name: string }>;
}) {
  const cfg = resources[resource];
  const router = useRouter();
  const confirm = useConfirm();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, startSaving] = useTransition();
  const [query, setQuery] = useState("");

  useEffect(() => setItems(initial), [initial]);

  const openEditor = (row: Row | "new") => {
    setErrors({});
    setValues(row === "new" ? { ...cfg.defaults } : cfg.toForm ? cfg.toForm(row) : { ...row });
    setEditing(row);
  };
  const close = useCallback(() => setEditing(null), []);
  const set = useCallback((patch: Record<string, unknown>) => setValues((v) => ({ ...v, ...patch })), []);

  function save() {
    // Inline validation first (same Zod schema the server uses).
    const parsed = schemas[resource].safeParse(values);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (fe[i.path.join(".")] ??= i.message));
      setErrors(fe);
      toast.error("Please fix the highlighted fields.");
      return;
    }
    startSaving(async () => {
      const res = await saveResource(resource, editing === "new" ? null : (editing as Row).id, values);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.error);
        return;
      }
      toast.success(`${cfg.singular[0].toUpperCase()}${cfg.singular.slice(1)} saved. The live site updates in a few seconds.`);
      setEditing(null);
      router.refresh();
    });
  }

  async function remove(row: Row) {
    const ok = await confirm({
      title: `Delete this ${cfg.singular}?`,
      body: `“${cfg.list.title(row)}” will be removed from the live site. Uploaded images are deleted too. This can't be undone.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    setItems((list) => list.filter((i) => i.id !== row.id));
    const res = await deleteResources(resource, [row.id]);
    if (res.ok) toast.success("Deleted.");
    else {
      toast.error(res.error);
      router.refresh();
    }
  }

  async function reorder(next: Row[]) {
    setItems(next);
    const res = await reorderResource(
      resource,
      next.map((i) => i.id),
    );
    if (res.ok) toast.success("Order saved.");
    else toast.error(res.error);
  }

  async function toggle(row: Row, field: string, value: boolean) {
    setItems((list) => list.map((i) => (i.id === row.id ? { ...i, [field]: value } : field === "isPopular" && value ? { ...i, isPopular: false } : i)));
    const res = await toggleField(resource, row.id, field, value);
    if (!res.ok) {
      toast.error(res.error);
      router.refresh();
    }
  }

  const filtered = useMemo(
    () => (query ? items.filter((i) => JSON.stringify(i).toLowerCase().includes(query.toLowerCase())) : items),
    [items, query],
  );

  return (
    <div>
      <PageHeader
        title={cfg.title}
        description={cfg.description}
        action={
          <button type="button" onClick={() => openEditor("new")} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent px-5 font-semibold text-on-accent">
            <Icon name="plus" size={18} /> Add {cfg.singular}
          </button>
        }
      />

      {items.length > 6 && (
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${cfg.title.toLowerCase()}…`}
          className="mb-4 min-h-12 w-full rounded-xl border border-line bg-surface px-4 text-base focus:border-accent focus:outline-none"
        />
      )}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center">
          <p className="font-semibold">No {cfg.title.toLowerCase()} yet</p>
          <p className="mt-1 text-sm text-muted">Click “Add {cfg.singular}” to create the first one.</p>
        </div>
      ) : (
        <>
          {!query && <p className="mb-3 text-sm text-muted">Drag the ⋮⋮ handle to change the order on the live site.</p>}
          <SortableList
            items={filtered}
            onReorder={query ? () => toast.info("Clear the search to reorder.") : reorder}
            className="space-y-2"
            render={(row, handle) => {
              const img = cfg.list.image?.(row);
              return (
                <div className="flex items-center gap-1.5 rounded-xl border border-line bg-surface p-2 sm:gap-3 sm:pr-3">
                  {!query && handle}
                  {img !== undefined && (
                    <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg border border-line bg-surface-2 sm:h-12 sm:w-20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {img && <img src={img} alt="" className={cn("h-full w-full", cfg.list.imageFit === "contain" ? "object-contain p-1 dark:invert" : "object-cover")} />}
                    </span>
                  )}
                  <button type="button" onClick={() => openEditor(row)} className="min-h-11 min-w-0 flex-1 text-left">
                    <span className="block truncate font-semibold">{cfg.list.title(row)}</span>
                    {cfg.list.subtitle && <span className="block truncate text-sm text-muted">{cfg.list.subtitle(row)}</span>}
                  </button>
                  {cfg.toggles?.map((t) => (
                    <label key={t.field} className="hidden items-center gap-2 text-xs text-muted md:flex">
                      {t.label}
                      <Switch label={`${t.label}: ${cfg.list.title(row)}`} checked={!!row[t.field]} onChange={(v) => toggle(row, t.field, v)} />
                    </label>
                  ))}
                  {cfg.toggles?.[0] && (
                    <span className="md:hidden">
                      <Switch label={`${cfg.toggles[0].label}: ${cfg.list.title(row)}`} checked={!!row[cfg.toggles[0].field]} onChange={(v) => toggle(row, cfg.toggles![0].field, v)} />
                    </span>
                  )}
                  <button type="button" onClick={() => openEditor(row)} aria-label="Edit" className="hidden h-11 w-11 place-items-center sm:grid rounded-lg text-muted hover:bg-surface-2 hover:text-fg">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path d="M4 20h4L19 9l-4-4L4 16v4ZM13 7l4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button type="button" onClick={() => remove(row)} aria-label="Delete" className="grid h-11 w-11 place-items-center rounded-lg text-muted hover:bg-red-500/10 hover:text-red-600">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              );
            }}
          />
        </>
      )}

      <Drawer
        open={editing !== null}
        onClose={close}
        title={editing === "new" ? `Add ${cfg.singular}` : `Edit ${cfg.singular}`}
        footer={
          <div className="flex gap-2">
            <button type="button" onClick={close} className="min-h-12 flex-1 rounded-xl border border-line font-medium sm:flex-none sm:px-6">
              Cancel
            </button>
            <button type="button" onClick={save} disabled={saving} className="min-h-12 flex-1 rounded-xl bg-accent font-semibold text-on-accent disabled:opacity-60">
              {saving ? "Saving…" : "Save & publish changes"}
            </button>
          </div>
        }
      >
        {editing !== null && <FieldRenderer fields={cfg.fields} values={values} set={set} errors={errors} categories={categories} />}
      </Drawer>
    </div>
  );
}
