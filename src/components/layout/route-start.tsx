"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

/** Route changes start at the top; explicit in-page links retain their targets. */
export function RouteStart() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    if (!window.location.hash) window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}
