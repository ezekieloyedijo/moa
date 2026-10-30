import type { Metadata } from "next";
import { AuthCard } from "@/components/admin/auth-card";
import { ForgotForm } from "./forgot-form";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your dashboard email and we'll send you a link to choose a new one."
      footer={{ href: "/admin/login", label: "← Back to log in" }}
    >
      <ForgotForm />
    </AuthCard>
  );
}
