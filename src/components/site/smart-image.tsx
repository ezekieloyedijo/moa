import Image, { type ImageProps } from "next/image";
import { BLUR_DATA_URL, isSvg } from "@/lib/utils";

/**
 * next/image wrapper: blur placeholder by default, and SVGs are served
 * unoptimised (the optimiser doesn't process SVG). No theme filters — ever.
 */
export function SmartImage({ alt, ...props }: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  const svg = isSvg(src);
  return (
    <Image
      {...props}
      alt={alt}
      unoptimized={props.unoptimized ?? svg}
      placeholder={svg || props.priority ? "empty" : (props.placeholder ?? "blur")}
      blurDataURL={props.blurDataURL ?? BLUR_DATA_URL}
    />
  );
}
