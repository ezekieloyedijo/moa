import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/admin/page-header";
import { PasswordForm } from "@/components/admin/password-form";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await auth();
  return (
    <div>
      <PageHeader title="Account" description={`Logged in as ${session?.user?.email}. Sessions last 7 days.`} />
      <PasswordForm />
    </div>
  );
}
