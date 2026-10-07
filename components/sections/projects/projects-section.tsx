"use client";

import { useRef, type ReactNode } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  gsap,
  useGSAP,
  ScrollTrigger,
  REVEAL,
  REVEAL_START,
  MOTION_OK,
  SplitText,
} from "@/lib/gsap";
import { ArrowRight } from "./arrow-right";
import { DEAL_STAGGER, RELEASE_EVENT, isHeld } from "./entrance-hold";
import { ViewMoreCursor } from "./view-more-cursor";
import { RollText } from "@/components/motion/roll-text";
import { PROJECTS } from "@/config/projects";
import "./projects-section.css";

// three.js is only ever needed client-side and only for this one decorative
// effect, so it stays out of the SSR pass and out of the rest of the page's
// hydration payload. The .catch matters: without it a failed chunk load
// (flaky network, blocked request) throws during render and takes the whole
// section down — losing the decoration is fine, losing the content is not.
const ProjectsCanvas = dynamic(
  () =>
    import("./projects-canvas")
      .then((m) => m.ProjectsCanvas)
      .catch(() => () => null),
  { ssr: false },
);

// At this headline's font-size, a lower start opacity read as nearly
// invisible rather than "dim but legible."
const PROJECTS_SCRUB_START_OPACITY = 0.35;

const HEADLINE = "Selected works";

/* Index typewriter ("01", "02"…) — lusion.co's values: real characters type
   on at 40/s, trailed by up to 5 random printable-ASCII glyphs ("!" to "}"). */
const LETTERS_PER_SECOND = 40;
const RANDOM_TAIL = 5;
const randomGlyph = () =>
  String.fromCharCode(33 + Math.floor(Math.random() * 93));
const formatIndex = (i: number) => String(i + 1).padStart(2, "0");

/* Title "slot-machine" roll: each letter is a column of ROLL_COPIES copies
   plus one blank slot. It starts parked on the blank (hidden) and rolls down
   through the copies onto the real letter. Centre letters lead slightly, so
   the word resolves from the middle outward. */
const ROLL_COPIES = 4;
const ROLL_START = -(ROLL_COPIES / (ROLL_COPIES + 1)) * 100; // yPercent parked on the blank
const ROLL_DURATION = 1.25;
const ROLL_CENTRE_LEAD = 0.0625;

/** Wraps a card in a link when it has a case study; a plain fragment
 *  otherwise, so unlinked cards keep their exact DOM. */
function CardLink({ href, children }: { href?: string; children: ReactNode }) {
  if (!href) return <>{children}</>;
  return (
    <Link href={href} className="project-card__link">
      {children}
    </Link>
  );
}

const WIP_TAPE = "Under construction · Still cooking · ";

/** Hover gag for unfinished projects: hazard tape slides up from the bottom
 *  edge and Bob pops out behind it, jackhammering. Lives inside
 *  .project-card__media so it stacks above the WebGL canvas and inherits the
 *  rounded clip. Decorative — the "In progress" text under the title is what
 *  assistive tech gets. */
function WipOverlay() {
  return (
    <div className="project-wip" aria-hidden>
      <div className="project-wip__builder">
        <span className="project-wip__dust project-wip__dust--a" />
        <span className="project-wip__dust project-wip__dust--b" />
        <span className="project-wip__dust project-wip__dust--c" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="project-wip__figure" src="/projects/wip-builder.png" alt="" />
      </div>
      <div className="project-wip__tape">
        <div className="project-wip__track">
          {/* Two identical halves so the -50% loop is seamless. */}
          <span>{WIP_TAPE.repeat(4)}</span>
          <span>{WIP_TAPE.repeat(4)}</span>
        </div>
      </div>
    </div>
  );
}

export function ProjectsSection({ intro = true }: { intro?: boolean }) {
  const rootRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        if (headlineRef.current) {
          gsap.from(".projects__intro-reveal", {
            ...REVEAL,
            stagger: 0.1,
            scrollTrigger: { trigger: ".projects__intro", start: REVEAL_START },
          });

          // Scroll-scrub reveal on the headline. No pin — pinning reads as
          // "stuck".
          const words = headlineRef.current.querySelectorAll(".projects__word");

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
        }

        // SplitText's spans aren't unwound by gsap's context revert, so each
        // instance is reverted explicitly in this condition's cleanup.
        const splits: InstanceType<typeof SplitText>[] = [];
        // Each card's on-screen trigger and entrance, so a held entrance can
        // be dealt in on release.
        const entrances: { trigger: ScrollTrigger; play: (delay: number) => void }[] = [];

        gsap.utils.toArray<HTMLElement>(".project-card").forEach((card) => {
          const indexEl = card.querySelector<HTMLElement>(
            ".project-card__index",
          );
          const titleEl = card.querySelector<HTMLElement>(
            ".project-card__title",
          );
          // Captured before anything mutates the text (StrictMode re-runs
          // effects in dev; reading later could bake in a half-typed string).
          const indexText = indexEl?.textContent ?? "";

          // --- Title roll setup ---
          let cols: HTMLElement[] = [];
          // Skip a title that's already split — hot reload can re-run this
          // effect on a split DOM, and splitting the roll columns again nests
          // copies inside copies.
          if (titleEl && !titleEl.querySelector(".project-card__char")) {
            // words+chars so wrapping still happens between words only.
            // SplitText's default aria handling labels the heading with its
            // real text and hides the split spans, so the duplicated letters
            // below are never read out.
            const split = new SplitText(titleEl, {
              type: "words,chars",
              charsClass: "project-card__char",
            });
            splits.push(split);

            split.chars.forEach((charEl, i) => {
              const el = charEl as HTMLElement;
              const letter = el.textContent ?? "";
              const col = document.createElement("span");
              col.className = "project-card__roll";
              for (let c = 0; c < ROLL_COPIES; c++) {
                const slot = document.createElement("span");
                slot.textContent = letter;
                col.appendChild(slot);
              }
              const blank = document.createElement("span");
              blank.textContent = " ";
              col.appendChild(blank);
              el.textContent = "";
              el.appendChild(col);
              // Per-letter index, kept for staggering — the hover now slides the whole
              // label as one piece, so the CSS no longer reads it.
              el.style.setProperty("--i", String(i));
            });
            cols = gsap.utils.toArray<HTMLElement>(
              ".project-card__roll",
              titleEl,
            );
            gsap.set(cols, { yPercent: ROLL_START });
          }

          const count = cols.length;
          const rollDelay = (i: number) =>
            count < 2
              ? 0
              : ROLL_CENTRE_LEAD * (1 - Math.sin((Math.PI * i) / (count - 1)));

          // --- Index typewriter ---
          const typewriter = { t: 0 };
          const renderTags = () => {
            if (!indexEl) return;
            const typed = Math.floor(typewriter.t * LETTERS_PER_SECOND);
            const real = Math.max(
              0,
              Math.min(indexText.length, typed - RANDOM_TAIL),
            );
            const shown = Math.max(0, Math.min(indexText.length, typed));
            let out = indexText.slice(0, real);
            for (let i = real; i < shown; i++) {
              // Spaces stay spaces so the line doesn't jitter as much.
              out += indexText[i] === " " ? " " : randomGlyph();
            }
            indexEl.textContent = out;
          };

          let played: gsap.core.Tween[] = [];
          const reset = () => {
            played.forEach((tween) => tween.kill());
            played = [];
            if (cols.length) gsap.set(cols, { yPercent: ROLL_START });
            typewriter.t = 0;
            renderTags();
          };
          const play = (delay = 0) => {
            reset();
            if (cols.length) {
              played.push(
                gsap.to(cols, {
                  yPercent: 0,
                  duration: ROLL_DURATION,
                  ease: "expo.inOut",
                  delay: (i: number) => delay + rollDelay(i),
                }),
              );
            }
            if (indexEl) {
              played.push(
                gsap.to(typewriter, {
                  t: (indexText.length + RANDOM_TAIL) / LETTERS_PER_SECOND,
                  duration:
                    (indexText.length + RANDOM_TAIL) / LETTERS_PER_SECOND,
                  ease: "none",
                  delay,
                  onUpdate: renderTags,
                }),
              );
            }
          };

          reset();

          // Same range lusion uses: active while any part of the card is on
          // screen, reset once it's fully off — so the text replays on every
          // re-entry, in step with the WebGL image entrance
          // (projects-canvas.tsx uses the identical on-screen test).
          const trigger = ScrollTrigger.create({
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            onToggle: (self) => {
              if (!self.isActive) reset();
              // Held by the page: the release below plays it instead.
              else if (!isHeld(card)) play();
            },
          });
          entrances.push({ trigger, play });
        });

        // Released by the page: deal the on-screen cards in, in order, in step
        // with the WebGL entrance (projects-canvas.tsx staggers the same way).
        const onRelease = () => {
          let order = 0;
          entrances.forEach(({ trigger, play }) => {
            if (trigger.isActive) play(DEAL_STAGGER * order++);
          });
        };
        window.addEventListener(RELEASE_EVENT, onRelease);

        return () => {
          window.removeEventListener(RELEASE_EVENT, onRelease);
          splits.forEach((split) => split.revert());
          // Restore the untouched index text (the typewriter wrote over it).
          gsap.utils
            .toArray<HTMLElement>(".project-card")
            .forEach((card, i) => {
              const indexEl = card.querySelector<HTMLElement>(
                ".project-card__index",
              );
              if (indexEl) indexEl.textContent = formatIndex(i);
            });
        };
      });
    },
    { scope: rootRef },
  );

  return (
    <section className="projects section-shell" id="projects" ref={rootRef}>
      {intro && (
        <div className="projects__intro">
          <h2 className="display-statement projects__headline" ref={headlineRef} data-bird-perch="end">
            {/* Space as its own text node BETWEEN the spans, not trailing
                inside one. inline-block trims trailing whitespace inside itself
                (its content is its own internal line, and whitespace at a
                line-end collapses), so a trailing space in the span renders
                zero-width even though it still pads the box. */}
            {HEADLINE.split(" ").flatMap((word, i, words) => {
              const span = (
                <span className="projects__word" key={i}>
                  {word}
                </span>
              );
              return i < words.length - 1 ? [span, " "] : [span];
            })}
          </h2>
          <Link
            href="/work"
            className="roll-trigger projects__see-all projects__intro-reveal"
          >
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              className="projects__see-all-icon"
            >
              <path
                d="M1 8h13M9 3l5 5-5 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            <RollText>See all works</RollText>
          </Link>
        </div>
      )}

      <div className="projects__grid" ref={gridRef}>
        {PROJECTS.map((project, i) => (
          <article
            className={`project-card${project.wip ? " project-card--wip" : ""}`}
            key={project.title}
          >
            <CardLink href={project.href}>
              <div
                className="project-card__media"
                data-depth={project.depthImage}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={project.image} alt="" />
                {project.wip && <WipOverlay />}
                {project.href && <ViewMoreCursor />}
              </div>
              <div className="project-card__title-row">
                <span className="project-card__arrow" aria-hidden>
                  <ArrowRight strokeWidth={1.5} />
                </span>
                {/* aria-hidden: the typewriter cycles random glyphs through it. */}
                <div className="project-card__label">
                  <span className="project-card__index" aria-hidden>
                    {formatIndex(i)}
                  </span>
                  <h3 className="project-card__title">{project.title}</h3>
                  {/* Outside the h3 so SplitText's letter roll never touches it. */}
                  {project.wip && <span className="sr-only">In progress</span>}
                </div>
              </div>
            </CardLink>
          </article>
        ))}

        <ProjectsCanvas gridRef={gridRef} />
      </div>
    </section>
  );
}
