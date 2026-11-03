import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

/** Callers supply the actual editorial crop, intrinsic dimensions and layout sizes. */
export function EditorialImage({
  alt,
  sizes,
  className,
  ...props
}: ImageProps & { alt: string; sizes: string }) {
  return (
    <Image
      alt={alt}
      sizes={sizes}
      className={cn("h-auto w-full", className)}
      {...props}
    />
  );
}
