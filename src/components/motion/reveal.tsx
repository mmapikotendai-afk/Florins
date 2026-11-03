"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Optional single entrance. Content is visible before hydration and without JS. */
export function Reveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={reduced ? undefined : { y: [8, 0] }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
