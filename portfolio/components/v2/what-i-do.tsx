"use client";

import { useRef } from "react";
import { gsap, useGSAP, REVEAL, REVEAL_START, MOTION_OK } from "@/lib/v2-gsap";
import { CursorRectReveal } from "./cursor-rect-reveal";
import "./what-i-do.css";

// Own constant, not Experience's 0.15 — same reasoning as About: at this
// section's font-size, 0.15 read as nearly invisible rather than "dim but
// legible."
const WHAT_I_DO_SCRUB_START_OPACITY = 0.35;

const ROWS = [
  { title: "Product", description: "I can produce anything that my 16” laptop can render." },
  {
    title: "Design Sys",
    description: "Tokens, components, and docs that keep a product coherent as it grows.",
  },
  {
    title: "Motion",
    description: "Interaction and scroll-driven animation that makes an interface feel alive.",
  },
  {
    title: "Graphics",
    description: "Visual identity, illustration, and imagery built to support the product.",
  },
];

export function WhatIDo() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        gsap.from(".what-i-do__label", {
          ...REVEAL,
          scrollTrigger: { trigger: rootRef.current, start: REVEAL_START },
        });

        // Scroll-scrub reveal (same pattern as Experience/About), but in
        // pairs of 2 rather than one at a time: rows [0,1] brighten
        // together, then rows [2,3] brighten together as a second beat.
        // No pin — same call as About, since pinning this section would
        // produce the same "stuck" feeling that was just removed from
        // About.
        const titles = gsap.utils.toArray<HTMLElement>(".what-i-do__title");

        gsap.set(titles, { opacity: WHAT_I_DO_SCRUB_START_OPACITY });

        // gsap.to flattens nested arrays when resolving targets (see
        // gsap.js's toArray -> _flatten), so passing [[a,b],[c,d]] directly
        // as targets does NOT stagger the two pairs as groups — it just
        // flattens back to [a,b,c,d] and staggers individually again. A
        // timeline with one .to() per pair (position params controlling the
        // gap between groups) driven by a single ScrollTrigger gets the
        // actual "pair, then pair" behavior.
        const pairSize = 2;
        const pairs: HTMLElement[][] = [];
        for (let i = 0; i < titles.length; i += pairSize) {
          pairs.push(titles.slice(i, i + pairSize));
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: rootRef.current,
            // Ends at "top top" (not "bottom top") so the reveal wraps up
            // during the section's approach, finished by the moment it
            // settles at the top of the screen — same fix as About.
            start: "top bottom",
            end: "top top",
            scrub: 1,
          },
        });

        pairs.forEach((pair, i) => {
          tl.to(pair, { opacity: 1, ease: "sine.inOut" }, i === 0 ? 0 : "+=0.3");
        });
      });
    },
    { scope: rootRef }
  );

  return (
    <section className="what-i-do section-shell" id="skills" ref={rootRef}>
      <h2 className="section-label what-i-do__label">What I do</h2>

      <div className="what-i-do__list">
        {ROWS.map((row) => (
          <div className="what-i-do__row" key={row.title} data-cursor-hover>
            <CursorRectReveal as="h3" className="what-i-do__title" text={row.title} />
            <p className="what-i-do__description">{row.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
