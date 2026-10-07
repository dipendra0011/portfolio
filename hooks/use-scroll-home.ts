"use client";

import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import { getSmoother } from "@/lib/gsap";

/**
 * onClick for links to "/". A link to the page you're already on doesn't scroll
 * anywhere, so on Home it glides to the top instead (through ScrollSmoother when
 * the page has one). From any other page it does nothing and the link navigates.
 */
export function useScrollHome() {
  const pathname = usePathname();

  return (e: MouseEvent<HTMLElement>) => {
    if (pathname !== "/") return;
    // Let modified clicks (new tab, etc.) behave like normal links.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const smoother = getSmoother();
    if (smoother) smoother.scrollTo(0, !reduce);
    else window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };
}
