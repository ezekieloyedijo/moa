import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/admin/auth-card";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <AuthCard
      title="Choose a new password"
      subtitle="Use at least 10 characters."
      footer={{ href: "/admin/login", label: "← Back to log in" }}
    >
      {token ? (
        <ResetForm token={token} />
      ) : (
        <p className="mt-6 text-sm text-muted">
          This page needs the link from your reset email.{" "}
          <Link href="/admin/forgot" className="font-semibold text-accent underline underline-offset-4">
            Request a new link
          </Link>
        </p>
      )}
    </AuthCard>
  );
}
