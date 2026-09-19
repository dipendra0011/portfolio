"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  gsap,
  useGSAP,
  createV2Smoother,
  REVEAL,
  REVEAL_START,
  MOTION_OK,
  SplitText,
} from "@/lib/v2-gsap";
import type { Project } from "@/lib/projects-data";
import { CustomCursor } from "./custom-cursor";
import { Footer } from "./footer";
import { ArrowRight } from "./arrow-right";
import "./case-study.css";

// Same legible-but-dim starting point every other scrubbed section uses
// (about.tsx, experience.tsx, what-i-do.tsx, projects.tsx all land on 0.35).
const BODY_SCRUB_START_OPACITY = 0.35;

const MARQUEE_TEXT = "Continue to scroll";

/** Splits a string into per-word spans — the scrub animates words, not
 *  characters, matching about.tsx's canonical treatment.
 *
 *  Each span keeps its own trailing space. Splitting on " " discards the
 *  separator, and adjacent JSX elements render with no whitespace between
 *  them, so without this the words would run together ("Makepossibility"). */
function Words({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");

  return (
    <>
      {words.map((word, i) => (
        <span className={`case-study__word ${className ?? ""}`} key={i}>
          {i < words.length - 1 ? `${word} ` : word}
        </span>
      ))}
    </>
  );
}

export function CaseStudy({ project, nextProject }: { project: Project; nextProject: Project }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const killSmoother = createV2Smoother();
        const splits: InstanceType<typeof SplitText>[] = [];

        // Hero title — same character fly-in as the grid card the visitor just
        // clicked, so the two reads connect.
        if (titleRef.current) {
          // "words, chars" — not "chars" alone. Char spans are inline-block,
          // so without word wrappers to hold them together the browser will
          // happily break a line mid-word ("mad / e tangible").
          const split = new SplitText(titleRef.current, { type: "words, chars" });
          splits.push(split);

          gsap.from(split.chars, {
            opacity: 0,
            x: () => gsap.utils.random(-40, 40),
            y: () => gsap.utils.random(-30, 30),
            rotation: () => gsap.utils.random(-15, 15),
            stagger: { each: 0.02, from: "random" },
            duration: 0.6,
            ease: "power3.out",
            delay: 0.15,
          });
        }

        // "Scroll to explore" retires itself the moment it's been acted on.
        if (hintRef.current) {
          gsap.to(hintRef.current, {
            opacity: 0,
            duration: 0.4,
            ease: "power2.out",
            scrollTrigger: {
              trigger: rootRef.current,
              start: "top top-=40",
              toggleActions: "play none none reverse",
            },
          });
        }

        // Canonical dim-to-bright scrub (about.tsx:47-73) across the whole
        // body block — paragraphs, services and links together, so the
        // brightening runs as one pass rather than three competing ones.
        const words = bodyRef.current?.querySelectorAll(".case-study__word");
        if (words?.length) {
          gsap.set(words, { opacity: BODY_SCRUB_START_OPACITY });
          gsap.to(words, {
            opacity: 1,
            stagger: 1,
            ease: "sine.inOut",
            scrollTrigger: {
              trigger: bodyRef.current,
              start: "top bottom",
              end: "top top",
              scrub: 1,
            },
          });
        }

        // Next-project teaser — the card entrance from projects.tsx.
        gsap.from(".case-study__next-inner > *", {
          ...REVEAL,
          stagger: 0.08,
          scrollTrigger: { trigger: ".case-study__next", start: REVEAL_START },
        });

        gsap.from(".case-study__cta-line", {
          ...REVEAL,
          stagger: 0.1,
          scrollTrigger: { trigger: ".case-study__cta", start: REVEAL_START },
        });

        return () => {
          // SplitText's inserted spans aren't unwound by gsap's context
          // revert — without this the title stays permanently split.
          splits.forEach((split) => split.revert());
          killSmoother();
        };
      });
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <CustomCursor />

      {/* Fixed, and deliberately OUTSIDE #smooth-wrapper: ScrollSmoother
          transforms #smooth-content, which makes it a containing block and
          would turn any fixed descendant into a content-relative element that
          scrolls away. Same reason the v2 page keeps its chrome outside. */}
      <Link href="/#projects" className="case-study__back" data-cursor-hover>
        <span className="case-study__back-icon">
          <ArrowRight strokeWidth={1.5} />
        </span>
        Back
      </Link>

      <div id="smooth-wrapper">
        <div id="smooth-content">
          <main id="main">
            <section className="case-study__hero">
              <div className="case-study__hero-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={project.heroImage} alt="" />

                {/* Lives inside the media so it sits over the image, where a
                    scroll affordance belongs — not below the title. */}
                <div className="case-study__hint" ref={hintRef} aria-hidden>
                  <span>Scroll to explore</span>
                </div>
              </div>

              <div className="case-study__hero-body section-shell">
                <p className="section-label case-study__eyebrow">Case study</p>
                <h1 className="case-study__title" ref={titleRef}>
                  {project.title}
                </h1>
              </div>
            </section>

            <section className="case-study__body section-shell" ref={bodyRef}>
              <div className="case-study__body-main">
                {project.description.map((paragraph, i) => (
                  <p className="case-study__paragraph" key={i}>
                    <Words text={paragraph} />
                  </p>
                ))}
              </div>

              <aside className="case-study__meta">
                <div className="case-study__meta-block">
                  <h2 className="section-label case-study__meta-label">Services</h2>
                  <ul className="case-study__services">
                    {project.tags.map((tag) => (
                      <li className="case-study__service" key={tag}>
                        <Words text={tag} />
                      </li>
                    ))}
                  </ul>
                </div>

                {project.links?.length ? (
                  <div className="case-study__meta-block">
                    <h2 className="section-label case-study__meta-label">Links</h2>
                    <ul className="case-study__links">
                      {project.links.map((link) => (
                        <li key={link.label}>
                          <a
                            className="case-study__link"
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            data-cursor-hover
                          >
                            {/* One wrapper so the flex gap applies between
                                label and icon only — without it every word
                                span becomes its own flex item and picks up
                                the gap on top of its own space. */}
                            <span className="case-study__link-label">
                              <Words text={link.label} />
                            </span>
                            <ArrowUpRightGlyph />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </aside>
            </section>

            <section className="case-study__next">
              <Link
                href={nextProject.href}
                className="case-study__next-inner section-shell"
                data-cursor-hover
              >
                <p className="section-label case-study__next-label">Next project</p>
                <div className="case-study__next-media">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={nextProject.image} alt="" />
                </div>
                <h2 className="case-study__next-title">{nextProject.title}</h2>
              </Link>
            </section>

            <section className="case-study__cta">
              <div className="section-shell">
                <p className="section-label case-study__cta-line">Got something in mind?</p>
                <h2 className="case-study__cta-title case-study__cta-line">
                  Let&apos;s work together.
                </h2>
              </div>

              {/* Track duplicated exactly twice so the -50% wrap is seamless.
                  Spacing lives as trailing margin INSIDE each item, not as a
                  flex gap on the track — a gap isn't duplicated at the wrap
                  point, so -50% would land one gap short and visibly hitch. */}
              <div className="case-study__marquee">
                <div className="case-study__marquee-track">
                  <MarqueeRun />
                  <MarqueeRun ariaHidden />
                </div>
              </div>
            </section>
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}

function MarqueeRun({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div className="case-study__marquee-run" aria-hidden={ariaHidden || undefined}>
      {Array.from({ length: 4 }).map((_, i) => (
        <span className="case-study__marquee-item" key={i}>
          {MARQUEE_TEXT}
        </span>
      ))}
    </div>
  );
}

/** Small inline glyph for external links — the shared ArrowRight points
 *  right, this one points out, which is the established meaning elsewhere. */
function ArrowUpRightGlyph() {
  return (
    <svg
      className="case-study__link-icon"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M7 17L17 7M17 7H9M17 7V15"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
