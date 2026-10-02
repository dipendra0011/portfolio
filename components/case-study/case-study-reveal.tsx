"use client";

import type { ReactNode } from "react";
import { useRef } from "react";
import {
  gsap,
  useGSAP,
  ScrollTrigger,
  SplitText,
  REVEAL,
  MOTION_OK,
} from "@/lib/gsap";

/* Siblings that reveal together trail each other by this much, so a
   heading → paragraph → list cascades instead of landing as one block. */
const SIBLING_STAGGER = 0.06;

/* Cover image settles from a slight zoom as it scrolls into place. */
const COVER_SCALE = 1.06;

/* Extra room under each title line mask for descenders. */
const MASK_BLEED = "0.15em";

/* Where a pinned section title holds, from the viewport top. Clears the
   fixed site header plus the index label that hangs above the title. */
const PIN_TOP = 140;

/** All case-study motion. Lets the page itself stay a server component.
 *
 *  - `.cs-intro`   — header lines, played once on load (title lines rise
 *                    out of a mask, the rest fades up after).
 *  - `.cs-reveal`  — fades up on scroll, staggered against its siblings.
 *  - `.cs-cover`   — image scrubs from COVER_SCALE to 1.
 *  - `.cs-section` — on desktop its heading holds beside the body until
 *                    the body has scrolled past: pins when the title's top
 *                    and the body's first line (aligned in CSS) reach
 *                    PIN_TOP together, releases when the heading's bottom
 *                    meets the body's bottom. A ScrollTrigger pin, not CSS
 *                    sticky — ScrollSmoother's transform breaks sticky.
 */
export function CaseStudyReveal({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        // --- Intro: on load, not on scroll ---
        const title = rootRef.current!.querySelector<HTMLElement>(".cs-title");
        const intro = gsap.timeline({ delay: 0.15 });
        intro.from(".cs-intro--eyebrow", { ...REVEAL, duration: 0.6 });
        intro.from(".cs-intro--rest", { ...REVEAL, stagger: 0.08 }, 0.5);

        // autoSplit re-splits when the webfont lands or the width changes,
        // so the line tween is built (and returned) inside onSplit.
        const split = title
          ? SplitText.create(title, {
              type: "lines",
              mask: "lines",
              autoSplit: true,
              onSplit(self) {
                // The title's 0.9 line-height is tighter than its glyphs;
                // without this the masks crop descenders (g, y, p).
                gsap.set(self.masks, { paddingBottom: MASK_BLEED, marginBottom: `-${MASK_BLEED}` });
                return gsap.from(self.lines, {
                  yPercent: 110,
                  duration: 1.1,
                  ease: "expo.out",
                  stagger: 0.08,
                  delay: 0.25,
                });
              },
            })
          : null;

        // The intro starts hidden in CSS (case-study.css) so the server-
        // rendered text doesn't flash before these tweens take over. Every
        // from() above has already rendered its start state, so un-hiding
        // now can't show the resting layout first.
        gsap.set([".cs-title", ".cs-intro--eyebrow", ".cs-intro--rest"], {
          visibility: "visible",
        });

        // --- Scroll reveals, staggered by position among siblings ---
        const counts = new Map<Element | null, number>();
        gsap.utils.toArray<HTMLElement>(".cs-reveal").forEach((el) => {
          const i = counts.get(el.parentElement) ?? 0;
          counts.set(el.parentElement, i + 1);
          gsap.from(el, {
            ...REVEAL,
            delay: i * SIBLING_STAGGER,
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });

        // --- Cover zoom ---
        const cover = rootRef.current!.querySelector(".cs-cover img");
        if (cover) {
          gsap.fromTo(
            cover,
            { scale: COVER_SCALE },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: cover,
                start: "top bottom",
                end: "center center",
                scrub: 0.6,
              },
            }
          );
        }

        return () => split?.revert();
      });

      // Not gated on MOTION_OK: holding the heading in view isn't motion,
      // and ScrollTrigger pins work on native scroll too.
      mm.add("(min-width: 992px)", () => {
        gsap.utils.toArray<HTMLElement>(".cs-section").forEach((section) => {
          const head = section.querySelector<HTMLElement>(".cs-section__head");
          const body = section.querySelector<HTMLElement>(".cs-section__body");
          if (!head || !body) return;
          ScrollTrigger.create({
            trigger: head,
            pin: true,
            pinSpacing: false,
            start: `top ${PIN_TOP}px`,
            endTrigger: body,
            // The body may still sit at its reveal start (REVEAL.y below
            // its resting place) when this is measured; offset by whatever
            // y it has so the release lands on its resting bottom edge.
            end: () =>
              `bottom ${PIN_TOP + head.offsetHeight + Number(gsap.getProperty(body, "y"))}px`,
            invalidateOnRefresh: true,
          });
        });
      });
    },
    { scope: rootRef }
  );

  return <div ref={rootRef}>{children}</div>;
}
