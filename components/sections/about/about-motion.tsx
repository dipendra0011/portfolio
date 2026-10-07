"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import { gsap, useGSAP, SplitText, REVEAL, REVEAL_START, MOTION_OK } from "@/lib/gsap";

/* Words of the manifesto start this faint and ink in as it scrolls past. */
const MANIFESTO_DIM = 0.14;
/* Load-in timing (s). The intro reads like an introduction: the portrait
   unmasks, the text beside it rises line by line out of masks (the same
   language as the Work title's letters), column by column, and the manifesto
   lines rise last. */
const INTRO_DELAY = 0.15;
const COLUMN_STAGGER = 0.12; // between the contents, portrait text and facts columns
const LINE_STAGGER = 0.05; // between lines within a column
const LEAD_DELAY = 0.75; // before the manifesto's lines start rising

/** All page-level About motion, so the page itself stays a server component.
 *
 *  - `.about-load`      — intro columns: lines rise out of masks on load, and
 *                         `.about-portrait` unmasks upward as the photo settles.
 *  - `.about-manifesto` — its lines rise after the intro, then words ink in
 *                         one by one, scrubbed to scroll.
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
        const root = rootRef.current!;
        const intro = gsap.timeline({ delay: INTRO_DELAY });
        // Line splits are only needed for the entrance; unwound once it's
        // done so the text reflows naturally on resize afterwards.
        const introSplits: InstanceType<typeof SplitText>[] = [];
        intro.eventCallback("onComplete", () => {
          introSplits.forEach((split) => split.revert());
          introSplits.length = 0;
        });

        // The portrait unmasks upward while the photo settles from a zoom.
        const portrait = root.querySelector<HTMLElement>(".about-portrait");
        if (portrait) {
          intro
            .fromTo(
              portrait,
              { clipPath: "inset(100% 0% 0% 0%)" },
              { clipPath: "inset(0% 0% 0% 0%)", duration: 1.2, ease: "lusion" },
              0,
            )
            .fromTo(portrait.querySelector("img"), { scale: 1.3 }, { scale: 1, duration: 1.6, ease: "lusion" }, 0);
        }

        // Each column's text rises line by line out of masks.
        gsap.utils.toArray<HTMLElement>(".about-load").forEach((column, c) => {
          const texts = column.querySelectorAll<HTMLElement>(":scope > span, p, li, dt, dd");
          const lines = Array.from(texts).flatMap((el) => {
            const split = SplitText.create(el, { type: "lines", mask: "lines" });
            introSplits.push(split);
            return split.lines;
          });
          intro.fromTo(
            lines,
            { yPercent: 110 },
            { yPercent: 0, duration: 1, ease: "lusion", stagger: LINE_STAGGER },
            c * COLUMN_STAGGER,
          );
        });

        // Hidden in about.css until here; the timeline has already rendered
        // its start state (lines below their masks, portrait clipped), so the
        // resting layout never flashes.
        gsap.set(".about-load", { visibility: "visible" });

        const manifesto = root.querySelector<HTMLElement>(".about-manifesto");
        let manifestoEntered = false;
        const split = manifesto
          ? SplitText.create(manifesto, {
              type: "words,lines",
              mask: "lines",
              wordsClass: "about-manifesto__word",
              autoSplit: true,
              onSplit: (self) => {
                // Its lines rise out of their masks once, after the intro. Only
                // the lines move, never the paragraph, so the scrub trigger
                // below still measures from the right place.
                if (!manifestoEntered) {
                  manifestoEntered = true;
                  gsap.fromTo(
                    self.lines,
                    { yPercent: 110 },
                    { yPercent: 0, duration: 1.2, ease: "lusion", stagger: 0.08, delay: LEAD_DELAY },
                  );
                  gsap.set(manifesto, { visibility: "visible" });
                }
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
        return () => {
          split?.revert();
          introSplits.forEach((s) => s.revert());
        };
      });
    },
    { scope: rootRef }
  );

  return <div ref={rootRef}>{children}</div>;
}
