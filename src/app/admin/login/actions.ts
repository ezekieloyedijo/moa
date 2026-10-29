"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export type LoginState = { error: string | null; email: string };

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "");
  try {
    await signIn("credentials", {
      email,
      password: form.get("password"),
      redirectTo: "/admin",
    });
    return { error: null, email };
  } catch (err) {
    if (err instanceof AuthError) {
      const error =
        (err as AuthError & { code?: string }).code === "rate_limited"
          ? "Too many attempts. Please wait 15 minutes and try again."
          : "Incorrect email or password.";
      // Return the email so the field survives React's post-action form reset.
      return { error, email };
    }
    throw err; // re-throw the NEXT_REDIRECT on success
  }
}
