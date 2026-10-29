import { pad2, cn } from "@/lib/utils";

/**
 * Numbered section header: "01 — WORK", a clear H2, and a one-line
 * explanation of what the visitor is looking at.
 */
export function SectionHeading({
  index,
  label,
  title,
  intro,
  align = "left",
  className,
}: {
  index: number;
  label: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <header className={cn("mb-10 md:mb-14", align === "center" && "mx-auto text-center", className)}>
      <p
        data-reveal
        className={cn(
          "mb-4 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-muted",
          align === "center" && "justify-center",
        )}
      >
        <span className="text-accent">{pad2(index)}</span>
        <span className="h-px w-8 bg-line" aria-hidden="true" />
        {label}
      </p>
      <h2 className="font-display text-[clamp(2.6rem,7vw,5.5rem)] uppercase leading-[0.92] tracking-tight">
        <span className="mask-line">
          <span>{title}</span>
        </span>
      </h2>
      {intro && (
        <p
          data-reveal
          style={{ "--i": 2 } as React.CSSProperties}
          className={cn("mt-5 max-w-2xl text-base text-muted md:text-lg", align === "center" && "mx-auto")}
        >
          {intro}
        </p>
      )}
    </header>
  );
}
