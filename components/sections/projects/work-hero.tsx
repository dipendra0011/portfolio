"use client";

import { useEffect, useRef } from "react";
import { gsap, useGSAP, MOTION_OK, SplitText, ScrollTrigger } from "@/lib/gsap";
import { HOLD_ATTR, RELEASE_EVENT } from "./entrance-hold";
import "./work-hero.css";

/* Measured at this size, then scaled so the word spans its box exactly. */
const FIT_PROBE_PX = 100;
/* Upper bound, so a short word on a very wide screen doesn't get absurdly
   tall. */
const FIT_MAX_PX = 480;
/* Also capped against the viewport height, so the word never fills the first
   screen and the top of the grid still peeks in below it. */
const FIT_MAX_VH = 0.4;
/* Seconds into the title's entrance before the projects are dealt in: late
   enough that the letters are most of the way up. */
const GRID_DELAY = 0.95;

/** Work page opener: the page name set edge to edge, with the project count
 *  as a superscript and a down-right arrow pointing into the grid. On load
 *  the letters rise out of their masks one by one, then the count and the
 *  arrow follow. */
/* Shows the project grid and lets its held card entrances play. */
function releaseGrid() {
  const grid = document.querySelector<HTMLElement>(".work-grid");
  if (!grid) return;
  grid.removeAttribute(HOLD_ATTR);
  grid.style.visibility = "visible";
  window.dispatchEvent(new Event(RELEASE_EVENT));
}

export function WorkHero({ title, count, unit = "projects" }: { title: string; count: number; unit?: string }) {
  const rootRef = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // Fit the word to the space left of the count column. Re-runs on resize
  // and once the webfont lands, since the extended face is far wider than
  // the fallback.
  useEffect(() => {
    const box = boxRef.current!;
    const text = box.querySelector<HTMLElement>(".work-hero__title")!;

    const fit = () => {
      text.style.fontSize = `${FIT_PROBE_PX}px`;
      const size = FIT_PROBE_PX * (box.clientWidth / text.scrollWidth);
      text.style.fontSize = `${Math.min(size, FIT_MAX_PX, window.innerHeight * FIT_MAX_VH)}px`;
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    // The box doesn't change on a height-only resize, so the vh cap needs
    // its own listener.
    window.addEventListener("resize", fit);
    let alive = true;
    document.fonts.ready.then(() => {
      if (!alive) return;
      fit();
      ScrollTrigger.refresh();
    });

    return () => {
      alive = false;
      observer.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Reduced motion: nothing to hold, show the grid as-is.
      mm.add("(prefers-reduced-motion: reduce)", releaseGrid);

      mm.add(MOTION_OK, () => {
        const root = rootRef.current!;
        const heading = root.querySelector<HTMLElement>(".work-hero__title")!;

        const split = SplitText.create(heading, {
          type: "chars",
          mask: "chars",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.chars, {
              yPercent: 110,
              duration: 1.2,
              ease: "lusion",
              stagger: 0.06,
              delay: 0.15,
            }),
        });

        gsap.from(".work-hero__count", {
          opacity: 0,
          y: 16,
          duration: 0.8,
          ease: "power3.out",
          delay: 0.55,
        });
        gsap.from(".work-hero__arrow path", {
          drawSVG: "0%",
          duration: 0.9,
          ease: "power3.inOut",
          stagger: 0.15,
          delay: 0.7,
        });

        // The title leads, then the projects are dealt in: the grid has been
        // holding its card entrances (WebGL unmask and slide, title roll,
        // index typewriter) parked at the start, and plays them card by card
        // from here.
        gsap.delayedCall(GRID_DELAY, releaseGrid);

        // Hidden in work-hero.css until here; every from() above has
        // already rendered its start state, so nothing flashes.
        gsap.set(root, { visibility: "visible" });

        // SplitText's spans aren't unwound by gsap's context revert.
        return () => split.revert();
      });
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      className="work-hero px-5 pt-40 pb-10 font-sans text-fg md:px-9 md:pt-[200px] md:pb-14"
    >
      <div className="flex items-stretch justify-between gap-4">
        <div ref={boxRef} className="min-w-0 flex-1">
          <h1 className="work-hero__title">{title}</h1>
        </div>

        <div className="flex shrink-0 flex-col items-end justify-between">
          <p className="work-hero__count">
            <span className="sr-only">
              {count} {unit}
            </span>
            <span aria-hidden>{count}</span>
          </p>
          <svg aria-hidden viewBox="0 0 24 24" className="work-hero__arrow">
            <path d="M3 3 21 21" fill="none" stroke="currentColor" strokeWidth="1.25" />
            <path d="M21 8v13H8" fill="none" stroke="currentColor" strokeWidth="1.25" />
          </svg>
        </div>
      </div>
    </section>
  );
}
