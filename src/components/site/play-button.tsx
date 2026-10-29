import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons";

/** High-contrast play button: solid circle + icon, readable on any thumbnail. */
export function PlayButton({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const s = { sm: "h-12 w-12", md: "h-16 w-16", lg: "h-20 w-20 md:h-24 md:w-24" }[size];
  const i = { sm: 18, md: 24, lg: 32 }[size];
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid place-items-center rounded-full bg-white text-black shadow-[0_8px_30px_rgb(0_0_0/0.45)] ring-4 ring-black/20",
        "transition-transform duration-300 ease-out group-hover:scale-110 group-focus-visible:scale-110",
        s,
        className,
      )}
    >
      <Icon name="play" size={i} className="translate-x-[2px]" />
    </span>
  );
}
