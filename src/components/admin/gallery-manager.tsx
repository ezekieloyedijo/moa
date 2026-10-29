"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createGalleryItems, deleteResources, reorderResource, saveResource, toggleField } from "@/app/admin/actions";
import { compressAndUpload } from "@/lib/upload";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons";
import { SortableList } from "./sortable-list";
import { Drawer } from "./drawer";
import { useConfirm } from "./confirm";
import { PageHeader } from "./page-header";
import { Select, Switch, TextArea, TextInput, Toggle } from "./fields";

type Item = {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  altText: string;
  category: string;
  orientation: "LANDSCAPE" | "PORTRAIT";
  width: number;
  height: number;
  featured: boolean;
  published: boolean;
};

const DEFAULT_CATS = ["Stills", "Behind the Scenes", "Thumbnails", "Posters"];

/** Gallery: multi-image upload, edit caption/alt/category, reorder, publish toggle, bulk delete. */
export function GalleryManager({ items: initial }: { items: Item[] }) {
  const router = useRouter();
  const confirm = useConfirm();
  const input = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState(initial);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [queue, setQueue] = useState<Array<{ name: string; pct: number }>>([]);
  const [uploadCat, setUploadCat] = useState("Stills");
  const [edit, setEdit] = useState<Item | null>(null);
  const [drag, setDrag] = useState(false);
  const [saving, start] = useTransition();

  useEffect(() => setItems(initial), [initial]);
  const cats = Array.from(new Set([...DEFAULT_CATS, ...items.map((i) => i.category)]));

  async function uploadFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, 20);
    if (!list.length) return toast.error("Please choose image files.");
    setQueue(list.map((f) => ({ name: f.name, pct: 0 })));
    const done: Array<Omit<Item, "id">> = [];
    // Upload 3 at a time to stay fast without hammering the browser.
    let cursor = 0;
    const worker = async () => {
      while (cursor < list.length) {
        const i = cursor++;
        const f = list[i];
        try {
          const res = await compressAndUpload(f, {
            folder: "gallery",
            onProgress: (pct) => setQueue((q) => q.map((x, n) => (n === i ? { ...x, pct } : x))),
          });
          const name = f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
          done.push({
            title: name,
            caption: "",
            imageUrl: res.url,
            altText: name,
            category: uploadCat,
            orientation: res.height > res.width ? "PORTRAIT" : "LANDSCAPE",
            width: res.width,
            height: res.height,
            featured: false,
            published: true,
          });
          setQueue((q) => q.map((x, n) => (n === i ? { ...x, pct: 100 } : x)));
        } catch (e) {
          toast.error(`${f.name}: ${(e as Error).message}`);
          setQueue((q) => q.map((x, n) => (n === i ? { ...x, pct: -1 } : x)));
        }
      }
    };
    await Promise.all([worker(), worker(), worker()]);
    if (done.length) {
      const res = await createGalleryItems(done);
      if (res.ok) toast.success(`${done.length} image${done.length > 1 ? "s" : ""} added. Edit the alt text for better SEO.`);
      else toast.error(res.error);
      router.refresh();
    }
    setQueue([]);
    if (input.current) input.current.value = "";
  }

  async function bulkDelete() {
    const ids = [...selected];
    const ok = await confirm({
      title: `Delete ${ids.length} image${ids.length > 1 ? "s" : ""}?`,
      body: "They'll be removed from the live site and from storage. This can't be undone.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    setItems((l) => l.filter((i) => !selected.has(i.id)));
    setSelected(new Set());
    const res = await deleteResources("gallery", ids);
    if (res.ok) toast.success("Deleted.");
    else toast.error(res.error);
    router.refresh();
  }

  function saveEdit() {
    if (!edit) return;
    start(async () => {
      const { id, ...data } = edit;
      const res = await saveResource("gallery", id, data);
      if (!res.ok) return void toast.error(res.fieldErrors ? Object.values(res.fieldErrors)[0] : res.error);
      toast.success("Saved.");
      setEdit(null);
      router.refresh();
    });
  }

  const toggleSel = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div>
      <PageHeader title="Gallery" description="Stills, behind-the-scenes photos and thumbnail designs. Upload several images at once; they're compressed to WebP automatically." />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          uploadFiles(e.dataTransfer.files);
        }}
        className={cn("mb-6 rounded-2xl border-2 border-dashed p-6 text-center transition-colors", drag ? "border-accent bg-accent-soft" : "border-line bg-surface")}
      >
        {queue.length ? (
          <ul className="space-y-2 text-left" aria-live="polite">
            {queue.map((q) => (
              <li key={q.name} className="text-sm">
                <span className="flex justify-between">
                  <span className="truncate">{q.name}</span>
                  <span className="font-mono">{q.pct < 0 ? "failed" : q.pct === 0 ? "compressing" : `${Math.round(q.pct)}%`}</span>
                </span>
                <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-line">
                  <span className={cn("block h-full", q.pct < 0 ? "bg-red-500" : "bg-accent")} style={{ width: `${q.pct < 0 ? 100 : Math.max(4, q.pct)}%` }} />
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <p className="font-semibold">Drag & drop images here</p>
            <p className="mt-1 text-sm text-muted">Up to 20 at a time</p>
            <div className="mx-auto mt-4 flex max-w-md flex-col items-stretch gap-2 sm:flex-row sm:items-end">
              <Select className="flex-1 text-left" label="Category for new images" value={uploadCat} onChange={setUploadCat} options={cats.map((c) => ({ value: c, label: c }))} />
              <button type="button" onClick={() => input.current?.click()} className="min-h-12 rounded-xl bg-accent px-5 font-semibold text-on-accent">
                Choose images
              </button>
            </div>
          </>
        )}
        <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && uploadFiles(e.target.files)} />
      </div>

      {selected.size > 0 && (
        <div className="sticky top-20 z-10 mb-4 flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-3 shadow-soft">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => setSelected(new Set())} className="min-h-11 rounded-lg border border-line px-4 text-sm">
              Clear
            </button>
            <button type="button" onClick={bulkDelete} className="min-h-11 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white">
              Delete selected
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">No images yet.</p>
      ) : (
        <SortableList
          items={items}
          layout="grid"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          onReorder={async (next) => {
            setItems(next);
            const r = await reorderResource(
              "gallery",
              next.map((i) => i.id),
            );
            if (r.ok) toast.success("Order saved.");
            else toast.error(r.error);
          }}
          render={(it, handle) => (
            <div className={cn("overflow-hidden rounded-xl border bg-surface", selected.has(it.id) ? "border-accent ring-2 ring-accent" : "border-line")}>
              <div className="relative aspect-square bg-surface-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.imageUrl} alt={it.altText} className={cn("h-full w-full object-cover", !it.published && "opacity-40")} />
                <label className="absolute left-2 top-2 grid h-9 w-9 cursor-pointer place-items-center rounded-lg bg-black/60">
                  <input type="checkbox" checked={selected.has(it.id)} onChange={() => toggleSel(it.id)} aria-label={`Select ${it.altText}`} className="h-5 w-5 accent-[var(--accent)]" />
                </label>
                <span className="absolute right-1 top-1 rounded-lg bg-surface/90">{handle}</span>
                {!it.published && <span className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-0.5 text-xs text-white">Hidden</span>}
              </div>
              <div className="flex items-center gap-2 p-2">
                <button type="button" onClick={() => setEdit(it)} className="min-h-11 min-w-0 flex-1 text-left">
                  <span className="block truncate text-sm font-semibold">{it.title || "Untitled"}</span>
                  <span className="block truncate text-xs text-muted">{it.category}</span>
                </button>
                <Switch
                  label={`Publish ${it.title}`}
                  checked={it.published}
                  onChange={async (v) => {
                    setItems((l) => l.map((x) => (x.id === it.id ? { ...x, published: v } : x)));
                    const r = await toggleField("gallery", it.id, "published", v);
                    if (!r.ok) toast.error(r.error);
                  }}
                />
              </div>
            </div>
          )}
        />
      )}

      <Drawer
        open={!!edit}
        onClose={() => setEdit(null)}
        title="Edit image"
        footer={
          <div className="flex gap-2">
            <button type="button" onClick={() => setEdit(null)} className="min-h-12 flex-1 rounded-xl border border-line sm:flex-none sm:px-6">
              Cancel
            </button>
            <button type="button" onClick={saveEdit} disabled={saving} className="min-h-12 flex-1 rounded-xl bg-accent font-semibold text-on-accent disabled:opacity-60">
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        }
      >
        {edit && (
          <div className="space-y-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={edit.imageUrl} alt="" className="max-h-72 w-full rounded-xl border border-line object-contain" />
            <TextInput label="Title" value={edit.title} onChange={(title) => setEdit({ ...edit, title })} />
            <TextArea label="Caption" rows={2} value={edit.caption} onChange={(caption) => setEdit({ ...edit, caption })} counter={300} />
            <TextInput label="Alt text (required)" help="Describe what's in the image for Google and screen readers." value={edit.altText} onChange={(altText) => setEdit({ ...edit, altText })} counter={200} />
            <TextInput label="Category" help={`e.g. ${DEFAULT_CATS.join(", ")}`} value={edit.category} onChange={(category) => setEdit({ ...edit, category })} />
            <Toggle label="Published" checked={edit.published} onChange={(published) => setEdit({ ...edit, published })} />
            <Toggle label="Featured" checked={edit.featured} onChange={(featured) => setEdit({ ...edit, featured })} />
            <p className="flex items-center gap-2 text-sm text-muted">
              <Icon name="film" size={16} /> {edit.width}×{edit.height} · {edit.orientation === "PORTRAIT" ? "Vertical" : "Horizontal"}
            </p>
          </div>
        )}
      </Drawer>
    </div>
  );
}
