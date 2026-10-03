"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { gsap, useGSAP, SplitText, REVEAL, REVEAL_START, MOTION_OK } from "@/lib/gsap";

/* Words of the manifesto start this faint and ink in as it scrolls past. */
const MANIFESTO_DIM = 0.14;

/** All page-level About motion, so the page itself stays a server component.
 *
 *  - `.about-load`      — intro blocks, faded up once on load.
 *  - `.about-manifesto` — words ink in one by one, scrubbed to scroll.
 *  - `.about-reveal`    — fades up on scroll.
 *
 *  The chapter stack and the quote carousel own their motion.
 */
export function AboutMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        gsap.from(".about-load", { ...REVEAL, stagger: 0.08, delay: 0.15 });
        // Hidden in about.css until here; from() has already rendered the
        // start state, so the resting layout never flashes.
        gsap.set(".about-load", { visibility: "visible" });

        const manifesto = rootRef.current!.querySelector<HTMLElement>(".about-manifesto");
        const split = manifesto
          ? SplitText.create(manifesto, {
              type: "words",
              wordsClass: "about-manifesto__word",
              autoSplit: true,
              onSplit: (self) => {
                // Dim every word up front. A staggered fromTo only applies its
                // start state to words the scrub has reached, so on a load
                // that starts mid-way the words further on stayed fully inked.
                gsap.set(self.words, { opacity: MANIFESTO_DIM });
                return gsap.to(self.words, {
                  opacity: 1,
                  ease: "none",
                  stagger: 0.1,
                  scrollTrigger: {
                    trigger: manifesto,
                    start: "top 80%",
                    end: "bottom 45%",
                    scrub: true,
                  },
                });
              },
            })
          : null;

        gsap.utils.toArray<HTMLElement>(".about-reveal").forEach((el) => {
          gsap.from(el, {
            ...REVEAL,
            scrollTrigger: { trigger: el, start: REVEAL_START, once: true },
          });
        });

        // SplitText's spans aren't unwound by gsap's context revert.
        return () => split?.revert();
      });
    },
    { scope: rootRef }
  );

  return <div ref={rootRef}>{children}</div>;
}
