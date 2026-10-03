"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK, SplitText } from "@/lib/gsap";
import "./what-i-do-section.css";

type Discipline = {
  title: string;
  /** Short right-hand label on the collapsed row. */
  tag: string;
  story: string[];
  /** Tools and methods shown as chips. */
  uses: string[];
  image: string;
};

// Placeholder imagery borrowed from the projects section until each discipline
// has its own.
const DISCIPLINES: Discipline[] = [
  {
    title: "Product design",
    tag: "Research to ship",
    story: [
      "I start with the messy brief and stay until it ships.",
      "Research, flows and interfaces, so a product with a lot going on feels obvious to the person using it.",
    ],
    uses: ["Research", "User journeys", "Interfaces"],
    image: "/projects/project-a.webp",
  },
  {
    title: "Design system",
    tag: "Tokens and docs",
    story: [
      "Tokens, components and docs that keep a team consistent without slowing it down.",
      "I build them in Figma and mirror them in code, so design and engineering work from the same page.",
    ],
    uses: ["Tokens", "Components", "Documentation"],
    image: "/projects/paubha/showcase.webp",
  },
  {
    title: "Graphics",
    tag: "Brand and campaign",
    story: [
      "This is where it started: drawing, then a graphic design course.",
      "Brand visuals, illustration and campaign assets, made to stop the scroll and still hold up in print.",
    ],
    uses: ["Brand visuals", "Illustration", "Campaign assets"],
    image: "/projects/project-c.webp",
  },
  {
    title: "Motion and frontend",
    tag: "GSAP, WebGL, React",
    story: [
      "Code taught me how products actually get built, even if it isn't my strongest skill.",
      "So I use GSAP, WebGL and React where motion earns its place, and hand engineers something they can ship.",
    ],
    uses: ["GSAP", "WebGL", "React"],
    image: "/projects/gallery.webp",
  },
];

const formatIndex = (i: number) => `[${String(i + 1).padStart(2, "0")}]`;

/* While the panel is pinned it fills the screen edge to edge, so the header's
   idle "come back" would land on top of the rows. This flag keeps it tucked
   for the length of the pin (styled in what-i-do-section.css). */
const tuckHeader = (tucked: boolean) => {
  document.documentElement.toggleAttribute("data-header-tucked", tucked);
};

/* Pinned "marker" wipe: the stroke draws across the intro while its width
   swells from a pen line to a fill that covers the whole screen, handing off
   seamlessly into the disciplines panel, which shares the stroke's colour. */
const WIPE_PIN_LENGTH = "+=250%";
// Timeline time the finished headline sits pinned and readable before the
// stroke starts. Without it the wipe began the instant the intro pinned and
// covered the headline mid-roll.
const WIPE_HOLD = 0.35;
const WIPE_STROKE_START = "5%";
const WIPE_STROKE_END = "80%";
const WIPE_DRAW_END = "0% 85%";

// Must match the 15% inset / 130% size of .what-i-do-intro__stroke svg in the CSS.
const STROKE_OVERSCAN = 0.15;
const STROKE_PATH =
  "M90 150C260 70 430 10 330 150S40 520 110 580 560 240 660 190 300 760 380 840 860 360 920 430 650 900 960 980";

/* Rolling headline: chars flip up from behind the line like a drum. */
const ROLL_ROTATION = -110;
const ROLL_DEPTH = 0.6; // × font-size
const ROLL_STAGGER = 0.02;
// Fires while the intro is still well below the top, so the roll has played
// out by the time the section pins.
const ROLL_START = "top 70%";

/* Bracket heading: brackets close in on the word as it scrolls up. */
const BRACKET_OFFSET = 160; // xPercent

/* Desktop accordion: where the image sits inside its slot (the grid cell under
   the copy, see .discipline__media-slot in what-i-do-section.css). */
const MEDIA_LEFT = "0%";
const MEDIA_WIDTH = "100%";

/* Incoming numeral rises this far (of its own height) as its discipline opens. */
const NUMERAL_RISE = 35;
// Numeral font-size as a fraction of the (shortest) open panel height.
const NUMERAL_SCALE = 0.95;

function IntroContent({ headingId }: { headingId?: string }) {
  return (
    <div className="what-i-do-intro__content">
      <p className="what-i-do-intro__statement">
        Design for the brand, the person <span className="what-i-do-intro__statement-lead">and the engineer.</span>
      </p>
      <h2 className="what-i-do-intro__heading" id={headingId} data-bird-perch="end">
        <span className="what-i-do-intro__bracket what-i-do-intro__bracket--left" aria-hidden>
          [
        </span>
        What I do
        <span className="what-i-do-intro__bracket what-i-do-intro__bracket--right" aria-hidden>
          ]
        </span>
      </h2>
    </div>
  );
}

export function WhatIDoSection() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current!;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        // --- Marker wipe ---
        const intro = root.querySelector<HTMLElement>(".what-i-do-intro")!;
        const strokes = intro.querySelectorAll<SVGPathElement>(".what-i-do-intro__wipe-path");

        // The off-white headline copy is revealed through a mask holding the
        // same path as the stroke, so it flips colour exactly where the blue
        // covers it. The mask lives in plain pixel space, so it's fitted to
        // the stroke's oversized, non-uniformly stretched viewBox by hand.
        const maskGroup = intro.querySelector<SVGGElement>(".what-i-do-intro__mask-group")!;
        const fitMask = () => {
          const { clientWidth: w, clientHeight: h } = intro;
          maskGroup.setAttribute(
            "transform",
            `translate(${-w * STROKE_OVERSCAN} ${-h * STROKE_OVERSCAN}) scale(${(w * (1 + 2 * STROKE_OVERSCAN)) / 1000} ${(h * (1 + 2 * STROKE_OVERSCAN)) / 1000})`
          );
        };
        fitMask();
        const maskObserver = new ResizeObserver(fitMask);
        maskObserver.observe(intro);

        gsap.set(strokes, { strokeWidth: WIPE_STROKE_START, drawSVG: "0% 0%" });
        gsap
          .timeline({
            scrollTrigger: {
              trigger: intro,
              start: "top top",
              end: WIPE_PIN_LENGTH,
              scrub: true,
              pin: true,
            },
          })
          .to(strokes, { drawSVG: WIPE_DRAW_END, duration: 1, ease: "none" }, WIPE_HOLD)
          .to(strokes, { strokeWidth: WIPE_STROKE_END, duration: 0.75, ease: "none" }, WIPE_HOLD + 0.25);

        // --- Rolling headline ---
        const headline = intro.querySelector<HTMLElement>(".what-i-do-intro__statement")!;
        const split = SplitText.create(headline, {
          type: "chars,lines",
          mask: "lines",
          autoSplit: true,
          onSplit(self) {
            const depth = ROLL_DEPTH * parseFloat(getComputedStyle(headline).fontSize);
            gsap.set(self.lines, { perspective: 500 });
            gsap.set(self.chars, {
              rotationX: ROLL_ROTATION,
              z: -depth,
              y: depth,
              opacity: 0,
              transformOrigin: `50% 50% -${depth}px`,
            });
            // Returned so autoSplit can kill and rebuild it on re-split.
            return gsap.to(self.chars, {
              rotationX: 0,
              z: 0,
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: "power4.out",
              stagger: ROLL_STAGGER,
              scrollTrigger: { trigger: intro, start: ROLL_START },
            });
          },
        });

        // --- Bracket heading ---
        const heading = intro.querySelector<HTMLElement>(".what-i-do-intro__heading")!;
        [
          [".what-i-do-intro__bracket--left", -BRACKET_OFFSET],
          [".what-i-do-intro__bracket--right", BRACKET_OFFSET],
        ].forEach(([selector, offset]) => {
          gsap.fromTo(
            heading.querySelector(selector as string),
            { xPercent: offset },
            {
              xPercent: 0,
              ease: "none",
              scrollTrigger: { trigger: heading, start: "top bottom", end: "top 40%", scrub: true },
            }
          );
        });

        // SplitText's spans aren't unwound by gsap's context revert.
        return () => {
          split.revert();
          maskObserver.disconnect();
        };
      });

      const panel = root.querySelector<HTMLElement>(".what-i-do-panel")!;
      const list = panel.querySelector<HTMLElement>(".what-i-do-panel__list")!;
      const items = gsap.utils.toArray<HTMLElement>(".discipline", panel).map((item) => ({
        row: item.querySelector<HTMLElement>(".discipline__row")!,
        body: item.querySelector<HTMLElement>(".discipline__body")!,
        media: item.querySelector<HTMLElement>(".discipline__media")!,
        numeral: item.querySelector<HTMLElement>(".discipline__numeral")!,
        content: item.querySelector<HTMLElement>(".discipline__content")!,
      }));

      // --- Desktop: pinned accordion with sweeping images ---
      mm.add(`(min-width: 992px) and ${MOTION_OK}`, () => {
        const viewport = panel.querySelector<HTMLElement>(".what-i-do-panel__viewport")!;
        panel.classList.add("what-i-do-panel--pinned");

        // One discipline at a time: the open panel fills whatever the viewport
        // has left after its own row and the collapsed row above it, which
        // stays parked at the top.
        let openHeights: number[] = [];
        const measure = () => {
          const available = viewport.clientHeight;
          openHeights = items.map(({ row }, i) => {
            const prevRow = i > 0 ? items[i - 1].row.offsetHeight : 0;
            return Math.max(available - row.offsetHeight - prevRow, 0);
          });
          // The inner layout is sized off each panel's own open height (CSS).
          items.forEach(({ body }, i) => body.style.setProperty("--discipline-open", `${openHeights[i]}px`));
          // The first panel has no collapsed row above it, so it opens taller.
          // The numeral is sized off the shortest one so all four match.
          const numeralSize = Math.min(...openHeights.filter((h) => h > 0)) * NUMERAL_SCALE;
          panel.style.setProperty("--discipline-numeral-size", `${numeralSize}px`);
        };
        // Lifts the list so the row above the active one sits at the top.
        const listOffset = (active: number) => {
          let y = 0;
          for (let i = 0; i <= active - 2; i++) y -= items[i].row.offsetHeight;
          return y;
        };

        measure();
        items.forEach(({ body, media }, i) => {
          gsap.set(body, { height: i === 0 ? openHeights[0] : 0 });
          gsap.set(media, { left: MEDIA_LEFT, width: i === 0 ? MEDIA_WIDTH : "0%" });
        });

        items.forEach(({ numeral, content }, i) => {
          gsap.set(numeral, { "--rise": i === 0 ? 0 : NUMERAL_RISE });
          gsap.set(content, { opacity: i === 0 ? 1 : 0 });
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: panel,
            start: "top top",
            end: () => `+=${window.innerHeight * items.length}`,
            scrub: true,
            pin: true,
            invalidateOnRefresh: true,
            onRefreshInit: measure,
            onToggle: (self) => tuckHeader(self.isActive),
          },
        });

        items.slice(0, -1).forEach((current, i) => {
          const next = items[i + 1];
          // Explicit from/to (not .to) so a resize mid-scroll re-records clean
          // values instead of whatever half-open height is on screen.
          // immediateRender off: otherwise each later tween would snap its
          // panel open at build time.
          tl.fromTo(
            current.body,
            { height: () => openHeights[i] },
            { height: 0, duration: 1, ease: "none", immediateRender: false },
            i
          )
            .fromTo(
              next.body,
              { height: 0 },
              { height: () => openHeights[i + 1], duration: 1, ease: "none", immediateRender: false },
              i
            )
            // Outgoing image is swept off to the right while the next one
            // grows out from the same left edge.
            .to(current.media, { left: "100%", width: "0%", duration: 1, ease: "none" }, i)
            .to(next.media, { left: MEDIA_LEFT, width: MEDIA_WIDTH, duration: 1, ease: "none" }, i)
            .fromTo(
              list,
              { y: () => listOffset(i) },
              { y: () => listOffset(i + 1), duration: 1, ease: "none", immediateRender: false },
              i
            )
            // Incoming numeral rises into place as its discipline opens, like
            // the About chapters.
            .fromTo(
              next.numeral,
              { "--rise": NUMERAL_RISE },
              { "--rise": 0, duration: 0.6, ease: "power2.out", immediateRender: false },
              i
            )
            // The copy is clipped by its closing panel, so it leaves early
            // and the incoming copy arrives late.
            .to(current.content, { opacity: 0, duration: 0.4, ease: "none" }, i)
            .fromTo(
              next.content,
              { opacity: 0 },
              { opacity: 1, duration: 0.4, ease: "none", immediateRender: false },
              i + 0.6
            );
        });
        // Hold on the last discipline for the final viewport of the pin.
        tl.to({}, { duration: 1 });

        return () => {
          panel.classList.remove("what-i-do-panel--pinned");
          panel.style.removeProperty("--discipline-numeral-size");
          gsap.set(items.map(({ numeral }) => numeral), { clearProps: "--rise" });
          tuckHeader(false);
        };
      });

      // --- Tablet: pinned height-only accordion ---
      mm.add(`(min-width: 768px) and (max-width: 991px) and ${MOTION_OK}`, () => {
        let heights: number[] = [];
        const measure = () => {
          gsap.set(items.map(({ body }) => body), { height: "auto" });
          heights = items.map(({ body }) => body.offsetHeight);
          items.forEach(({ body }, i) => gsap.set(body, { height: i === 0 ? heights[0] : 0 }));
        };
        measure();

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: panel,
            start: "top top",
            end: () => `+=${window.innerHeight * (items.length - 1)}`,
            scrub: true,
            pin: true,
            invalidateOnRefresh: true,
            onRefreshInit: measure,
            onToggle: (self) => tuckHeader(self.isActive),
          },
        });

        items.slice(0, -1).forEach((current, i) => {
          tl.to(current.body, { height: 0, duration: 1, ease: "none" }, i).to(
            items[i + 1].body,
            { height: () => heights[i + 1], duration: 1, ease: "none" },
            i
          );
        });

        return () => tuckHeader(false);
      });
    },
    { scope: rootRef }
  );

  return (
    <section className="what-i-do" id="what-i-do" aria-labelledby="what-i-do-heading" ref={rootRef}>
      <div className="what-i-do-intro">
        <IntroContent headingId="what-i-do-heading" />

        <div className="what-i-do-intro__stroke" aria-hidden>
          <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" fill="none">
            <path
              className="what-i-do-intro__wipe-path"
              d={STROKE_PATH}
              stroke="currentColor"
              strokeWidth="0"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Off-white copy of the headline, drawn above the stroke and visible
            only where the stroke's mask covers it. */}
        <svg className="what-i-do-intro__inverted" aria-hidden>
          <defs>
            <mask id="what-i-do-wipe-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
              <g className="what-i-do-intro__mask-group">
                <path
                  className="what-i-do-intro__wipe-path"
                  d={STROKE_PATH}
                  fill="none"
                  stroke="#fff"
                  strokeWidth="0"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </mask>
          </defs>
          <foreignObject x="0" y="0" width="100%" height="100%" mask="url(#what-i-do-wipe-mask)">
            <IntroContent />
          </foreignObject>
        </svg>
      </div>

      <div className="what-i-do-panel">
        <div className="what-i-do-panel__viewport">
          <ol className="what-i-do-panel__list">
            {DISCIPLINES.map((discipline, i) => (
              <li className="discipline" key={discipline.title}>
                {/* The row repeats the heading in the body, for sighted
                    scanning; screen readers get the heading. */}
                <div className="discipline__row" aria-hidden>
                  <span className="discipline__index">{formatIndex(i)}</span>
                  <span className="discipline__title">{discipline.title}</span>
                  <span className="discipline__tag">{discipline.tag}</span>
                </div>
                <div className="discipline__body">
                  <div className="discipline__inner">
                    <div className="discipline__numeral" data-digit={i + 1} aria-hidden>
                      <span className="discipline__numeral-glyph">
                        <span className="discipline__numeral-ghost">{i + 1}</span>
                        {i + 1}
                      </span>
                    </div>

                    <div className="discipline__content">
                      <div className="discipline__text">
                        <h3 className="discipline__heading">{discipline.title}</h3>
                        <div className="discipline__story">
                          {discipline.story.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                          ))}
                        </div>
                      </div>
                      <div className="discipline__uses">
                        <span className="discipline__uses-label">What I use</span>
                        <ul className="discipline__chips">
                          {discipline.uses.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="discipline__media-slot">
                      <div className="discipline__media">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={discipline.image} alt="" loading="lazy" draggable={false} />
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
