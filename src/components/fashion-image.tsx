"use client";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
export function FashionImage({
  number,
  alt,
  className,
  sizes = "(min-width: 768px) 45vw, 100vw",
}: {
  number: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={cn("fashion-image", className)}
      initial={false}
      whileInView={
        reduced || !className?.startsWith("creation")
          ? undefined
          : { y: [16, 0] }
      }
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <Image
        src={`/images/florins-${number}.webp`}
        alt={alt}
        fill
        sizes={sizes}
      />
    </motion.div>
  );
}
