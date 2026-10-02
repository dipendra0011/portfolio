"use client";

import type { MouseEvent } from "react";
import { gsap, getSmoother } from "@/lib/gsap";
import { cn } from "@/lib/cn";

/* Lands each section just under the top edge; the header hides on the way
   down, so there's nothing to clear. */
const OFFSET = 24;

const label = "font-label text-[12px] uppercase leading-none tracking-[0.02em] text-fg-dim";

/** The intro's "Contents" list — jump links to each section of the page. */
export function AboutContents({
  items,
  className,
}: {
  items: { id: string; label: string }[];
  className?: string;
}) {
  // ScrollSmoother owns the scroll position, so a native hash jump would
  // land in the wrong place. Without a smoother (reduced motion) the
  // browser's own anchor behaviour is fine.
  const onClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const smoother = getSmoother();
    const target = document.getElementById(id);
    if (!smoother || !target) return;
    event.preventDefault();
    gsap.to(smoother, {
      scrollTop: smoother.offset(target, `top ${OFFSET}px`),
      duration: 1.2,
      ease: "expo.inOut",
      overwrite: true,
    });
  };

  return (
    <nav aria-label="On this page" className={cn("flex flex-col gap-3", className)}>
      <span className={label}>Contents</span>
      <ol className="flex flex-col gap-1 text-[15px] leading-[1.35]">
        {items.map(({ id, label: text }, i) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={(e) => onClick(e, id)}
              className="transition-colors hover:text-blue focus-visible:text-blue"
            >
              <span className="font-label text-[12px] text-fg-dim">
                [{String(i + 1).padStart(2, "0")}]
              </span>{" "}
              {text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
