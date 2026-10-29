import type { Metadata } from "next";
import { ConfirmProvider } from "@/components/admin/confirm";

// The dashboard is never indexed (also: robots.txt disallow + X-Robots-Tag header).
export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · MOA Dashboard" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <ConfirmProvider>{children}</ConfirmProvider>;
}
