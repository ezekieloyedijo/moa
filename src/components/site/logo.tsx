import { cn } from "@/lib/utils";

/**
 * Brand mark. Uses the uploaded light/dark logo files when present (each
 * shown only in its theme, so it never disappears), otherwise renders the
 * MOA wordmark in the display font.
 */
export function Logo({
  brand,
  lightUrl,
  darkUrl,
  className,
}: {
  brand: string;
  lightUrl?: string;
  darkUrl?: string;
  className?: string;
}) {
  if (lightUrl || darkUrl) {
    const light = lightUrl || darkUrl!;
    const dark = darkUrl || lightUrl!;
    return (
      <span className={cn("relative inline-flex h-9 items-center", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={light} alt={brand} className="h-full w-auto dark:hidden" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={dark} alt={brand} className="hidden h-full w-auto dark:block" />
      </span>
    );
  }
  return (
    <span className={cn("font-display text-3xl leading-none tracking-wide", className)}>
      {brand}
      <span className="text-accent">.</span>
    </span>
  );
}
