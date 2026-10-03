"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK, Flip } from "@/lib/gsap";
import { BIRD_RELEASE_EVENT } from "@/components/motion/bird-companion";
import { hasIntroPlayed, markIntroPlayed } from "./hero-intro";
import "./hero-section.css";

/*
 * The red-pen edit. The hero opens on a bloated first draft, a marker strikes
 * out the filler, and the words that survive slide together into the real
 * headline. Copywriting taught me that cutting is most of the work; this is
 * that, played out.
 *
 * It plays once per page load (see hero-intro.ts); coming back to Home
 * without reloading lands on the finished edit.
 *
 * Reduced motion (and the screen-reader heading) get the finished edit.
 */

type DraftWord = { text: string; keep?: boolean };

const DRAFT: DraftWord[] = [
  { text: "A", keep: true },
  { text: "truly" },
  { text: "innovative," },
  { text: "best-in-class" },
  { text: "headline", keep: true },
  { text: "that," },
  { text: "at" },
  { text: "the" },
  { text: "end" },
  { text: "of" },
  { text: "the" },
  { text: "day," },
  { text: "has", keep: true },
  { text: "one", keep: true },
  { text: "synergistic," },
  { text: "seamless," },
  { text: "scalable" },
  { text: "job.", keep: true },
];

/* Two passes, like a marker dragged out and back. Drawn in a stretched
   0-100 box over each word; the stroke doesn't scale with it. */
const STRIKE_PATH = "M2 58 C 25 42, 55 66, 98 46 C 72 62, 38 44, 4 70";

const WORD_STAGGER = 0.025;
const HOLD_BEFORE_EDIT = 0.3;
const STRIKE_DURATION = 0.32;
const STRIKE_STAGGER = 0.05;
const COLLAPSE_DURATION = 1;
const BIRD_DELAY = 0.2;

export function HeroSection() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current!;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const draft = root.querySelector<HTMLElement>(".hero-edit__draft")!;
        const words = gsap.utils.toArray<HTMLElement>(".hero-edit__word", root);
        const cut = words.filter((w) => w.dataset.cut !== undefined);
        const kept = words.filter((w) => w.dataset.cut === undefined);
        const strikes = cut.map((w) => w.querySelector("path")!);
        const lineTwo = root.querySelector<HTMLElement>(".hero-edit__line--two")!;
        const intro = root.querySelector<HTMLElement>(".hero-edit__intro")!;

        // Strict-mode re-runs start from the draft again.
        kept.forEach((w) => w.classList.remove("is-kept"));

        // Survivors slide into place, then the second line and intro land.
        // Not contextSafe: it runs from the timeline's .call(), which already
        // executes inside this matchMedia context. Wrapping it in the outer
        // useGSAP context nests that context inside its own child, and the
        // cycle overflows the stack when the page unmounts.
        const collapse = () => {
          const state = Flip.getState(kept);
          gsap.set(cut, { display: "none" });
          kept.forEach((w) => w.classList.add("is-kept"));
          Flip.from(state, { duration: COLLAPSE_DURATION, ease: "power2.inOut" });
          gsap.fromTo(
            [lineTwo, intro],
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 1,
              ease: "lusion",
              stagger: 0.1,
              delay: COLLAPSE_DURATION * 0.5,
            },
          );
          // Once the edit is done, let the bird companion fly in to its slot.
          gsap.delayedCall(COLLAPSE_DURATION + BIRD_DELAY, () => {
            window.dispatchEvent(new Event(BIRD_RELEASE_EVENT));
          });
        };

        gsap.set(draft, { autoAlpha: 1 });

        // Already played this page load: show the finished edit, no replay.
        if (hasIntroPlayed()) {
          gsap.set(cut, { display: "none" });
          kept.forEach((w) => w.classList.add("is-kept", "is-instant"));
          gsap.set([lineTwo, intro], { autoAlpha: 1 });
          return;
        }

        gsap.set([lineTwo, intro], { autoAlpha: 0 });
        gsap.set(strikes, { drawSVG: "0%" });

        gsap
          .timeline({ delay: 0.1, onStart: markIntroPlayed })
          .from(words, {
            yPercent: 60,
            autoAlpha: 0,
            duration: 0.9,
            ease: "lusion",
            stagger: WORD_STAGGER,
          })
          .to(
            strikes,
            {
              drawSVG: "100%",
              duration: STRIKE_DURATION,
              // Fast off the mark, easing out as it finishes the word, like a
              // hand dragging a marker.
              ease: "power2.out",
              stagger: STRIKE_STAGGER,
            },
            `+=${HOLD_BEFORE_EDIT}`,
          )
          // Overlaps the last strikes so the fade starts while the pen is
          // still moving, instead of stop, fade, stop.
          .to(cut, { autoAlpha: 0, duration: 0.45, ease: "sine.inOut" }, "-=0.1")
          .call(collapse);
      });
    },
    { scope: rootRef },
  );

  return (
    // The hero owns the whole first screen: headline centred in it, intro on
    // its floor.
    <section className="hero-edit" ref={rootRef}>
      <div className="flex min-h-svh flex-col px-5 pt-28 pb-8 font-sans text-fg md:px-9 md:pt-32 md:pb-9">
        <h1 className="sr-only">A headline has one job. So does every screen.</h1>

        <div
          aria-hidden
          className="hero-edit__draft flex flex-1 flex-col justify-center text-[clamp(3rem,8.2vw,11rem)] font-medium leading-[0.92] tracking-[-0.045em]"
        >
          <p>
            {DRAFT.map((word, i) => (
              <span
                key={i}
                className="hero-edit__word"
                data-cut={word.keep ? undefined : ""}
              >
                {word.text}
                {!word.keep && (
                  <svg
                    className="hero-edit__strike"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <path d={STRIKE_PATH} />
                  </svg>
                )}
              </span>
            ))}
          </p>
          <p className="hero-edit__line--two">
            So does every screen.
            {/* The bird's first perch. With motion on, <BirdCompanion /> flies
                in and sits here; with reduced motion this shows a still frame. */}
            <span className="hero-edit__bird" aria-hidden="true" data-bird-perch="spot">
              <span className="hero-edit__bird-flap" />
            </span>
          </p>
        </div>

        <p className="hero-edit__intro mt-12 max-w-[480px] text-[15px] leading-[1.35]">
          Hi, I am Dipendra. A Product Designer and frontend developer.
        </p>
      </div>

      {/* Roughens the strike so it reads as crayon, not a vector line. */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <filter id="hero-crayon">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
          <feDisplacementMap in="SourceGraphic" scale="4" />
        </filter>
      </svg>
    </section>
  );
}
