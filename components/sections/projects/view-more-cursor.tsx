"use client";

import { useEffect, useRef } from "react";
import { gsap, MOTION_OK } from "@/lib/gsap";
import "./view-more-cursor.css";

/** Orange circle with a label that follows the cursor across its parent,
 *  standing in for the pointer. On the project cards it's rendered inside
 *  .project-card__media ("View more"), so it stacks above the WebGL canvas
 *  and is clipped by the rounded corners; the case study reuses it on its
 *  "Visit site" link. Position is driven here; the open/close scale is CSS
 *  on the parent's hover, set by whoever uses it. */
export function ViewMoreCursor({ label = "View more" }: { label?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const media = el?.parentElement;
    if (!el || !media) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const duration = window.matchMedia(MOTION_OK).matches ? 0.5 : 0;
    const xTo = gsap.quickTo(el, "x", { duration, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration, ease: "power3.out" });

    const local = (event: MouseEvent) => {
      const rect = media.getBoundingClientRect();
      return [event.clientX - rect.left, event.clientY - rect.top] as const;
    };
    const handleMove = (event: MouseEvent) => {
      const [x, y] = local(event);
      xTo(x);
      yTo(y);
    };
    // Jump straight to the entry point — otherwise the circle would glide in
    // from wherever the cursor last left the card.
    const handleEnter = (event: MouseEvent) => {
      const [x, y] = local(event);
      xTo(x, x);
      yTo(y, y);
    };

    media.addEventListener("mouseenter", handleEnter);
    media.addEventListener("mousemove", handleMove);
    return () => {
      media.removeEventListener("mouseenter", handleEnter);
      media.removeEventListener("mousemove", handleMove);
      gsap.killTweensOf(el);
    };
  }, []);

  return (
    <div className="project-view" ref={ref} aria-hidden>
      <span className="project-view__circle">{label}</span>
    </div>
  );
}
