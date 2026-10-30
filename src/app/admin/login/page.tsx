import type { Metadata } from "next";
import { AuthCard } from "@/components/admin/auth-card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <AuthCard title="Log in to your dashboard" subtitle="Manage your portfolio content.">
      <LoginForm />
    </AuthCard>
  );
}
