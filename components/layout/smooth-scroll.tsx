"use client";

import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { gsap, useGSAP, createSmoother, MOTION_OK, ScrollTrigger } from "@/lib/gsap";

/* Quiet period after the page stops changing height before re-measuring. */
const REMEASURE_DELAY_MS = 150;

/** ScrollSmoother wrapper for a page. A client component so pages using it
 *  can stay server components. <SiteHeader /> lives in the root layout,
 *  outside #smooth-wrapper — fixed elements must stay outside the smoothed
 *  content or they scroll with it. Reduced motion gets native scroll. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => createSmoother());

    // ScrollTrigger only re-measures on window resize. If the page itself
    // changes height afterwards (images, late content, hot reload), every
    // trigger below the change is left pointing at stale positions: the
    // footer's name could stop short of the bottom and never finish rising.
    // Re-measure once the height settles. Refreshing can itself change the
    // height (pin spacers), so only a change since the last refresh counts.
    const content = document.getElementById("smooth-content")!;
    let measured = content.offsetHeight;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onRefresh = () => {
      measured = content.offsetHeight;
    };
    ScrollTrigger.addEventListener("refresh", onRefresh);
    const observer = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (content.offsetHeight !== measured) ScrollTrigger.refresh();
      }, REMEASURE_DELAY_MS);
    });
    observer.observe(content);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
    };
  }, []);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">
        {children}
        <SiteFooter />
      </div>
    </div>
  );
}
