"use client";

import { useRef } from "react";
import { gsap, useGSAP, REVEAL, REVEAL_START, MOTION_OK } from "@/lib/v2-gsap";
import { CursorRectReveal } from "./cursor-rect-reveal";
import "./history.css";

// Own constant, matching About/What-I-Do/Projects/Experience's reasoning —
// legible-but-dim starting point rather than a near-invisible one.
const HISTORY_SCRUB_START_OPACITY = 0.35;

const HISTORY = [
  {
    year: "2016",
    role: "Senior Product Designer",
    altRole: "Regular Web Designer",
    company: "Interactive Labs",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    year: "2012",
    role: "Art Director",
    altRole: "Photoshop Doodler",
    company: "DR Com Group",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
  {
    year: "2009",
    role: "Flash Designer",
    altRole: "Jurassic Designer",
    company: "DR Com Group",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  },
];

function HistoryRow({ item }: { item: (typeof HISTORY)[number] }) {
  return (
    <div className="history-row" data-cursor-hover>
      <span className="history-row__year">{item.year}</span>
      <CursorRectReveal
        as="span"
        className="history-row__role"
        text={item.role}
        altText={item.altRole}
      />
      <div className="history-row__meta">
        <span className="history-row__company">{item.company}</span>
        <p className="history-row__description">{item.description}</p>
      </div>
    </div>
  );
}

export function History() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        gsap.from(".history__label", {
          ...REVEAL,
          scrollTrigger: { trigger: rootRef.current, start: REVEAL_START },
        });

        // Scroll-scrub reveal (same mechanics as About), one row at a time
        // — rows are the natural stagger unit here (heterogeneous
        // multi-field content, not a flowing sentence to split into
        // words), same idea as What-I-Do's per-title granularity.
        const rows = gsap.utils.toArray<HTMLElement>(".history-row");

        gsap.set(rows, { opacity: HISTORY_SCRUB_START_OPACITY });

        gsap.to(rows, {
          opacity: 1,
          stagger: 1,
          ease: "sine.inOut",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top bottom",
            end: "top top",
            scrub: 1,
          },
        });
      });
    },
    { scope: rootRef }
  );

  return (
    <section className="history section-shell" ref={rootRef}>
      <h2 className="section-label history__label">History</h2>
      <div className="history__list">
        {HISTORY.map((item) => (
          <HistoryRow item={item} key={item.year} />
        ))}
      </div>
    </section>
  );
}
