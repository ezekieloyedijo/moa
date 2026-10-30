"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { resetPassword } from "../forgot/actions";
import { inputCls } from "@/components/admin/fields";
import { cn } from "@/lib/utils";

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, { status: "idle" });
  const [show, setShow] = useState(false);
  const fe = state.fieldErrors ?? {};

  if (state.status === "success") {
    return (
      <div className="mt-6 space-y-4">
        <p role="status" className="rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300">
          {state.message}
        </p>
        <Link href="/admin/login" className="grid min-h-12 w-full place-items-center rounded-xl bg-accent font-semibold text-on-accent">
          Go to log in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="token" value={token} />
      <label className="block text-sm font-semibold">
        New password
        <span className="relative mt-2 block">
          <input name="next" type={show ? "text" : "password"} autoComplete="new-password" required minLength={10} aria-invalid={!!fe.next} className={cn(inputCls, "pr-20", fe.next ? "border-red-500" : "border-line")} />
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 min-h-9 -translate-y-1/2 rounded-lg px-3 text-xs font-medium text-muted hover:text-fg">
            {show ? "Hide" : "Show"}
          </button>
        </span>
        {fe.next && <span className="mt-1 block text-sm font-normal text-red-600 dark:text-red-400">{fe.next}</span>}
      </label>
      <label className="block text-sm font-semibold">
        Confirm new password
        <input name="confirm" type={show ? "text" : "password"} autoComplete="new-password" required aria-invalid={!!fe.confirm} className={cn(inputCls, "mt-2", fe.confirm ? "border-red-500" : "border-line")} />
        {fe.confirm && <span className="mt-1 block text-sm font-normal text-red-600 dark:text-red-400">{fe.confirm}</span>}
      </label>
      {state.message && (
        <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {state.message}{" "}
          {state.linkExpired && (
            <Link href="/admin/forgot" className="font-semibold underline underline-offset-4">
              Request a new link
            </Link>
          )}
        </p>
      )}
      <button type="submit" disabled={pending} className="min-h-12 w-full rounded-xl bg-accent font-semibold text-on-accent disabled:opacity-60">
        {pending ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}
