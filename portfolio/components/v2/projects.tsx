"use client";

import { useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { gsap, useGSAP, REVEAL, REVEAL_START, MOTION_OK, SplitText } from "@/lib/v2-gsap";
import { PROJECTS } from "@/lib/projects-data";
import { ArrowRight } from "./arrow-right";
import "./projects.css";

// three.js is only ever needed client-side and only for this one decorative
// effect, so it stays out of the SSR pass and out of the rest of the page's
// hydration payload. The .catch matters: without it a failed chunk load
// (flaky network, blocked request) throws during render and takes the whole
// Projects section down — losing the decoration is fine, losing the content
// is not.
const ProjectsCanvas = dynamic(
  () =>
    import("./projects-canvas")
      .then((m) => m.ProjectsCanvas)
      .catch(() => () => null),
  { ssr: false }
);

// Own constant, not Experience's original 0.15 — same reasoning as
// About/What-I-Do: at this headline's font-size, 0.15 read as nearly
// invisible rather than "dim but legible."
const PROJECTS_SCRUB_START_OPACITY = 0.35;

const HEADLINE = "Make possibility practical.";

export function Projects() {
  const rootRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLParagraphElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        // The headline gets its own word-scrub below (same pattern as
        // About), so it's excluded from this simple entrance — only the
        // label and subtext still just fade up once.
        gsap.from(".projects__intro-reveal", {
          ...REVEAL,
          stagger: 0.1,
          scrollTrigger: { trigger: ".projects__intro", start: REVEAL_START },
        });

        // Scroll-scrub reveal on the headline, matching About's structure
        // and ScrollTrigger config exactly (no pin — see About/Experience
        // for why pinning reads as "stuck").
        const words = headlineRef.current!.querySelectorAll(".projects__word");

        gsap.set(words, { opacity: PROJECTS_SCRUB_START_OPACITY });

        gsap.to(words, {
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

        // SplitText's own DOM mutations (the per-character spans) aren't
        // known to useGSAP's context revert — that will kill the tweens
        // riding on those spans but won't unwrap them back to plain text, so
        // each instance needs an explicit .revert() collected here and run
        // when this matchMedia condition itself reverts (unmount, or a
        // reduced-motion change mid-session).
        const splits: InstanceType<typeof SplitText>[] = [];

        // Text-only entrance, fired from the same trigger as the image's
        // WebGL unfurl (projects-canvas.tsx) so the card arrives as one
        // motion. Deliberately not transforming .project-card itself: the
        // canvas planes are placed from offsetLeft/offsetTop, which ignore
        // CSS transforms, so animating the whole card would slide the text
        // while the image stayed put. `i % 2` staggers the two cards that
        // share a grid row when a tall viewport reveals both at once.
        gsap.utils.toArray<HTMLElement>(".project-card").forEach((card, i) => {
          const tags = card.querySelector<HTMLElement>(".project-card__tags");
          // Captured now, before anything can run: ScrambleTextPlugin rewrites
          // innerHTML, so reading this inside the callback would bake a
          // half-scrambled string in as the target on a re-run (StrictMode
          // double-invokes effects in dev).
          const tagText = tags?.textContent ?? "";

          gsap.from(card.querySelectorAll(".project-card__tags, .project-card__title-row"), {
            opacity: 0,
            y: 24,
            duration: 0.8,
            stagger: 0.08,
            delay: (i % 2) * 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              // Scramble runs off this same trigger rather than its own, so
              // the two can never drift apart. It animates innerHTML while
              // the tween above animates opacity/y — disjoint properties, so
              // they coexist as long as overwrite stays at its default false.
              onEnter: () => {
                if (!tags) return;
                gsap.to(tags, {
                  duration: 1.1,
                  delay: (i % 2) * 0.12,
                  ease: "none",
                  scrambleText: {
                    text: tagText,
                    // The bullet is in the character set so the separators
                    // scramble along with the words instead of sitting there
                    // looking like the effect broke.
                    chars: "upperCase•",
                    speed: 0.4,
                    revealDelay: 0.2,
                    // Animating string length would reflow all four cards
                    // every tick and can invalidate ScrollTrigger positions.
                    tweenLength: false,
                  },
                });
              },
            },
          });

          // Character fly-in (lusion.co/projects reference): each title's
          // characters start scattered/rotated and settle into place as the
          // card scrolls in. Split fresh per card rather than once for the
          // whole section, since each card's title needs its own
          // ScrollTrigger firing independently as ITS card enters view.
          const titleEl = card.querySelector<HTMLElement>(".project-card__title");
          if (titleEl) {
            const split = new SplitText(titleEl, { type: "chars" });
            splits.push(split);

            gsap.from(split.chars, {
              opacity: 0,
              x: () => gsap.utils.random(-40, 40),
              y: () => gsap.utils.random(-30, 30),
              rotation: () => gsap.utils.random(-15, 15),
              stagger: { each: 0.02, from: "random" },
              duration: 0.6,
              ease: "power3.out",
              delay: (i % 2) * 0.12,
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                // One-time settle, not scrubbed — same convention as every
                // other scroll-in reveal in this codebase.
                toggleActions: "play none none none",
              },
            });
          }
        });

        // SplitText's inserted spans aren't part of what gsap's own context
        // revert unwinds — without this, unmounting (or a reduced-motion
        // toggle mid-session) would leave the title's text permanently split
        // into non-selectable character spans instead of restoring the
        // original text node. Returned from this mm.add callback, which
        // gsap.matchMedia runs as that condition's own cleanup.
        return () => {
          splits.forEach((split) => split.revert());
        };
      });
    },
    { scope: rootRef }
  );

  return (
    <section className="projects section-shell" id="projects" ref={rootRef}>
      <div className="projects__intro">
        <h2 className="section-label projects__intro-reveal">Projects</h2>
        <p className="display-statement projects__headline" ref={headlineRef}>
          {HEADLINE.split(" ").map((word, i) => (
            <span className="projects__word" key={i}>
              {word}
            </span>
          ))}
        </p>
        <p className="projects__subtext projects__intro-reveal">
          A maker&apos;s eye for the detail and a leader&apos;s view of the system. That
          includes the AI and agentic experiences people are only beginning to trust. I design
          the ones worth trusting.
        </p>
      </div>

      <div className="projects__grid" ref={gridRef}>
        {PROJECTS.map((project) => (
          <Link href={project.href} className="project-card" key={project.title} data-cursor-hover>
            <div className="project-card__media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={project.image} alt="" />
            </div>
            <p className="project-card__tags">{project.tags.join(" • ")}</p>
            <div className="project-card__title-row">
              <span className="project-card__arrow">
                <ArrowRight strokeWidth={1.5} />
              </span>
              <h3 className="project-card__title">{project.title}</h3>
            </div>
          </Link>
        ))}

        <ProjectsCanvas gridRef={gridRef} />
      </div>
    </section>
  );
}
