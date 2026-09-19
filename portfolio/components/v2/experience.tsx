"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/v2-gsap";
import "./experience.css";

// Own constant, tuned for legibility rather than Experience's original 0.15
// — at this font-size (nearly identical clamp range to About's), 0.15 read
// as nearly invisible rather than "dim but legible," the same reason
// About/What-I-Do/Projects all diverged from it too.
const SCRUB_START_OPACITY = 0.35;

const STATEMENT = [
  { text: "Over ", accent: false },
  { text: "a decade ", accent: true },
  {
    text: "of experience in interactive design and working with some of the most talented people in the business.",
    accent: false,
  },
];

export function Experience() {
  const rootRef = useRef<HTMLElement>(null);
  const wordsRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        // Accent words excluded entirely — full brightness from the start,
        // never dimmed by scroll position, same as About's accent word.
        const words = wordsRef.current!.querySelectorAll(
          ".experience__word:not(.experience__word--accent)"
        );

        gsap.set(words, { opacity: SCRUB_START_OPACITY });

        gsap.to(words, {
          opacity: 1,
          stagger: 1,
          // NOTE: kept as "none" (not About's "sine.inOut") — flagged, not
          // silently changed. Confirm which should be the standard.
          ease: "none",
          scrollTrigger: {
            trigger: rootRef.current,
            // No pin, start/end matching About exactly — pinning here had
            // no content-specific justification once About/What-I-Do had
            // already dropped it for feeling "stuck."
            start: "top bottom",
            end: "top top",
            scrub: 1,
          },
        });
      });
    },
    { scope: rootRef }
  );

  const renderStatement = () => {
    const nodes: React.ReactNode[] = [];
    STATEMENT.forEach((chunk, chunkIndex) => {
      chunk.text.split(" ").forEach((word, i) => {
        if (!word) return;
        nodes.push(
          <span
            className={`experience__word${chunk.accent ? " experience__word--accent" : ""}`}
            key={`${chunkIndex}-${i}`}
          >
            {word}
          </span>
        );
        nodes.push(" ");
      });
    });
    return nodes;
  };

  return (
    <section className="experience" id="experience" ref={rootRef}>
      <h2 className="section-label section-label--flush">Experience</h2>
      <p className="experience__statement" ref={wordsRef}>
        {renderStatement()}
      </p>
    </section>
  );
}
