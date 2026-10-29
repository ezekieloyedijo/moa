"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons";

/** Large, touch-friendly form controls for the dashboard. */

export const inputCls =
  "block w-full min-h-12 rounded-xl border bg-bg px-4 py-3 text-base text-fg placeholder:text-muted/70 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25 disabled:opacity-60";

export function FieldShell({
  label,
  help,
  error,
  htmlFor,
  counter,
  children,
  className,
}: {
  label: string;
  help?: string;
  error?: string;
  htmlFor?: string;
  counter?: { value: number; ideal?: [number, number]; max?: number };
  children: React.ReactNode;
  className?: string;
}) {
  let counterColor = "text-muted";
  if (counter?.ideal) {
    const [lo, hi] = counter.ideal;
    counterColor = counter.value >= lo && counter.value <= hi ? "text-emerald-600 dark:text-emerald-400" : counter.value > hi ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400";
  } else if (counter?.max && counter.value > counter.max) counterColor = "text-red-600 dark:text-red-400";
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-sm font-semibold">
          {label}
        </label>
        {counter && (
          <span className={cn("font-mono text-xs tabular-nums", counterColor)}>
            {counter.value}
            {counter.ideal ? ` / ${counter.ideal[0]}–${counter.ideal[1]}` : counter.max ? ` / ${counter.max}` : ""}
          </span>
        )}
      </div>
      {children}
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : (
        help && <p className="text-sm text-muted">{help}</p>
      )}
    </div>
  );
}

export function TextInput({
  label,
  value,
  onChange,
  error,
  help,
  type = "text",
  placeholder,
  counter,
  ideal,
  inputMode,
  className,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  error?: string;
  help?: string;
  type?: string;
  placeholder?: string;
  counter?: number;
  ideal?: [number, number];
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  className?: string;
}) {
  const id = useId();
  return (
    <FieldShell
      label={label}
      help={help}
      error={error}
      htmlFor={id}
      className={className}
      counter={counter || ideal ? { value: String(value ?? "").length, max: counter, ideal } : undefined}
    >
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={cn(inputCls, error ? "border-red-500" : "border-line")}
      />
    </FieldShell>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  error,
  help,
  rows = 4,
  placeholder,
  counter,
  ideal,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  help?: string;
  rows?: number;
  placeholder?: string;
  counter?: number;
  ideal?: [number, number];
  className?: string;
}) {
  const id = useId();
  return (
    <FieldShell
      label={label}
      help={help}
      error={error}
      htmlFor={id}
      className={className}
      counter={counter || ideal ? { value: (value ?? "").length, max: counter, ideal } : undefined}
    >
      <textarea
        id={id}
        rows={rows}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={cn(inputCls, "resize-y leading-relaxed", error ? "border-red-500" : "border-line")}
      />
    </FieldShell>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
  error,
  help,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  error?: string;
  help?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <FieldShell label={label} help={help} error={error} htmlFor={id} className={className}>
      <select id={id} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, "border-line")}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  help,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  help?: string;
}) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center justify-between gap-4 rounded-xl border border-line bg-bg px-4 py-3">
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {help && <span className="block text-sm text-muted">{help}</span>}
      </span>
      <Switch checked={checked} onChange={onChange} label={label} />
    </label>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={(e) => {
        e.preventDefault();
        onChange(!checked);
      }}
      className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", checked ? "bg-accent" : "bg-line")}
    >
      <span
        className={cn(
          "absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200",
          checked && "translate-x-5",
        )}
      />
    </button>
  );
}

/** Chips input for string arrays (tools, features, rotating words…). Enter or comma adds. */
export function TagsInput({
  label,
  value,
  onChange,
  help,
  error,
  placeholder = "Type and press Enter",
  className,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  help?: string;
  error?: string;
  placeholder?: string;
  className?: string;
}) {
  const id = useId();
  const [draft, setDraft] = useState("");
  const list = value ?? [];
  const add = () => {
    const parts = draft
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => !list.includes(s));
    if (parts.length) onChange([...list, ...parts]);
    setDraft("");
  };
  const move = (i: number, d: number) => {
    const next = [...list];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <FieldShell label={label} help={help ?? "Press Enter or comma to add. Use the arrows to reorder."} error={error} htmlFor={id} className={className}>
      <div className={cn("rounded-xl border bg-bg p-2", error ? "border-red-500" : "border-line")}>
        {list.length > 0 && (
          <ul className="mb-2 flex flex-wrap gap-1.5">
            {list.map((t, i) => (
              <li key={`${t}-${i}`} className="flex items-center gap-1 rounded-lg bg-surface-2 py-1 pl-3 pr-1 text-sm">
                {t}
                <button type="button" onClick={() => move(i, -1)} aria-label={`Move ${t} left`} className="grid h-8 w-6 place-items-center text-muted hover:text-fg">
                  ‹
                </button>
                <button type="button" onClick={() => move(i, 1)} aria-label={`Move ${t} right`} className="grid h-8 w-6 place-items-center text-muted hover:text-fg">
                  ›
                </button>
                <button
                  type="button"
                  onClick={() => onChange(list.filter((_, n) => n !== i))}
                  aria-label={`Remove ${t}`}
                  className="grid h-8 w-8 place-items-center rounded-md text-muted hover:bg-red-500/10 hover:text-red-600"
                >
                  <Icon name="close" size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
        <input
          id={id}
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            } else if (e.key === "Backspace" && !draft && list.length) onChange(list.slice(0, -1));
          }}
          onBlur={add}
          className="min-h-11 w-full bg-transparent px-2 text-base focus:outline-none"
        />
      </div>
    </FieldShell>
  );
}
