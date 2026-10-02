"use client";

import { useRef, useState } from "react";
import type { MouseEvent } from "react";
import { gsap, useGSAP, ScrollTrigger, getSmoother } from "@/lib/gsap";

/* Clears the fixed site header; matches scroll-padding-top in
   case-study.css. */
const OFFSET = 110;

/** "Inside the project" jump links. The link for whichever section is
 *  crossing the upper part of the viewport is marked current. */
export function CaseStudyAnchors({ items }: { items: { id: string; label: string }[] }) {
  const navRef = useRef<HTMLElement>(null);
  const [current, setCurrent] = useState<string | null>(null);

  useGSAP(
    () => {
      items.forEach(({ id }) => {
        const section = document.getElementById(id);
        if (!section) return;
        ScrollTrigger.create({
          trigger: section,
          start: "top 45%",
          end: "bottom 45%",
          onToggle: (self) => self.isActive && setCurrent(id),
        });
      });
    },
    { scope: navRef, dependencies: [items] }
  );

  // ScrollSmoother owns the scroll position, so a native hash jump would
  // land in the wrong place. Without a smoother (reduced motion) the
  // browser's own anchor behaviour is fine.
  const onClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const smoother = getSmoother();
    const target = document.getElementById(id);
    if (!smoother || !target) return;
    event.preventDefault();
    // Tweens the smoother's scrollTop getter/setter directly.
    // scrollTo(target, true) left the content stuck partway in testing.
    gsap.to(smoother, {
      scrollTop: smoother.offset(target, `top ${OFFSET}px`),
      duration: 1.2,
      ease: "expo.inOut",
      overwrite: true,
    });
  };

  return (
    <nav ref={navRef} className="cs-anchors cs-intro--rest" aria-label="Inside the project">
      <span className="cs-label">Inside the project</span>
      {items.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={(e) => onClick(e, id)}
          aria-current={current === id ? "location" : undefined}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
