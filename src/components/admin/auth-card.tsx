import Link from "next/link";

/** Centered card shell shared by the login, forgot-password and reset-password pages. */
export function AuthCard({
  title,
  subtitle,
  footer = { href: "/", label: "← Back to the website" },
  children,
}: {
  title: string;
  subtitle: string;
  footer?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-[100svh] place-items-center bg-bg px-4 py-10">
      <div className="w-full max-w-sm">
        <p className="mb-8 text-center font-display text-5xl">
          MOA<span className="text-accent">.</span>
        </p>
        <div className="rounded-3xl border border-line bg-surface p-6 shadow-soft sm:p-8">
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
          {children}
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          <Link href={footer.href} className="underline underline-offset-4 hover:text-fg">
            {footer.label}
          </Link>
        </p>
      </div>
    </main>
  );
}
