"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { changePassword } from "@/app/admin/actions";
import { passwordSchema } from "@/lib/validators";
import { TextInput } from "./fields";

export function PasswordForm() {
  const [v, setV] = useState({ current: "", next: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = passwordSchema.safeParse(v);
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (fe[String(i.path[0])] ??= i.message));
      return setErrors(fe);
    }
    start(async () => {
      const r = await changePassword(v);
      if (!r.ok) {
        setErrors(r.fieldErrors ?? {});
        return void toast.error(r.error);
      }
      setErrors({});
      setV({ current: "", next: "", confirm: "" });
      toast.success("Password updated.");
    });
  }

  return (
    <form onSubmit={submit} className="max-w-md space-y-5 rounded-2xl border border-line bg-surface p-5 md:p-7">
      <h2 className="text-lg font-semibold">Change password</h2>
      <TextInput label="Current password" type="password" value={v.current} error={errors.current} onChange={(current) => setV({ ...v, current })} />
      <TextInput label="New password" type="password" value={v.next} error={errors.next} help="At least 10 characters." onChange={(next) => setV({ ...v, next })} />
      <TextInput label="Confirm new password" type="password" value={v.confirm} error={errors.confirm} onChange={(confirm) => setV({ ...v, confirm })} />
      <button type="submit" disabled={pending} className="min-h-12 w-full rounded-xl bg-accent font-semibold text-on-accent disabled:opacity-60">
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
