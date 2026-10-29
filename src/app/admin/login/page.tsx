import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <main className="grid min-h-[100svh] place-items-center bg-bg px-4 py-10">
      <div className="w-full max-w-sm">
        <p className="mb-8 text-center font-display text-5xl">
          MOA<span className="text-accent">.</span>
        </p>
        <div className="rounded-3xl border border-line bg-surface p-6 shadow-soft sm:p-8">
          <h1 className="text-xl font-bold">Log in to your dashboard</h1>
          <p className="mt-1 text-sm text-muted">Manage your portfolio content.</p>
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/" className="underline underline-offset-4 hover:text-fg">
            ← Back to the website
          </Link>
        </p>
      </div>
    </main>
  );
}
