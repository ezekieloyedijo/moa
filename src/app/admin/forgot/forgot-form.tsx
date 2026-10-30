"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "./actions";
import { inputCls } from "@/components/admin/fields";
import { cn } from "@/lib/utils";

export function ForgotForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, { status: "idle" });

  if (state.status === "success") {
    return (
      <p role="status" className="mt-6 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300">
        {state.message} Check your spam folder if it doesn&apos;t arrive within a few minutes.
      </p>
    );
  }

  const fieldError = state.fieldErrors?.email;
  return (
    <form action={action} className="mt-6 space-y-4">
      <label className="block text-sm font-semibold">
        Email
        <input name="email" type="email" inputMode="email" autoComplete="username" required aria-invalid={!!fieldError} className={cn(inputCls, "mt-2", fieldError ? "border-red-500" : "border-line")} />
        {fieldError && <span className="mt-1 block text-sm font-normal text-red-600 dark:text-red-400">{fieldError}</span>}
      </label>
      {state.message && (
        <p role="alert" className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="min-h-12 w-full rounded-xl bg-accent font-semibold text-on-accent disabled:opacity-60">
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
