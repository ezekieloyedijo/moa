"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { login } from "./actions";
import { inputCls } from "@/components/admin/fields";
import { cn } from "@/lib/utils";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, { error: null, email: "" });
  const error = state.error;
  const [show, setShow] = useState(false);
  return (
    <form action={action} className="mt-6 space-y-4">
      <label className="block text-sm font-semibold">
        Email
        <input key={state.email} name="email" type="email" inputMode="email" autoComplete="username" required defaultValue={state.email} className={cn(inputCls, "mt-2 border-line")} />
      </label>
      <label className="block text-sm font-semibold">
        <span className="flex items-center justify-between">
          Password
          <Link href="/admin/forgot" className="text-xs font-medium text-muted underline underline-offset-4 hover:text-fg">
            Forgot password?
          </Link>
        </span>
        <span className="relative mt-2 block">
          <input name="password" type={show ? "text" : "password"} autoComplete="current-password" required className={cn(inputCls, "border-line pr-20")} />
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 min-h-9 -translate-y-1/2 rounded-lg px-3 text-xs font-medium text-muted hover:text-fg">
            {show ? "Hide" : "Show"}
          </button>
        </span>
      </label>
      {error && (
        <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className="min-h-12 w-full rounded-xl bg-accent font-semibold text-on-accent disabled:opacity-60">
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
