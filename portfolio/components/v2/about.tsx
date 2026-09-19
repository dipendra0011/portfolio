"use client";

import { useRef } from "react";
import { gsap, useGSAP, REVEAL, REVEAL_START, MOTION_OK } from "@/lib/v2-gsap";
import "./about.css";

// Deliberately its own constant, not Experience's SCRUB_START_OPACITY
// (0.15) — About's statement runs at a larger font-size where 0.15 read as
// nearly invisible against the dark background rather than "dim but
// legible." 0.35 keeps the same dim-to-bright scrub feel while staying
// readable throughout.
const ABOUT_SCRUB_START_OPACITY = 0.35;

const STATEMENT = [
  { text: "I care about ", accent: false },
  { text: "why something's ", accent: true },
  {
    text: "broken more than how pretty the fix looks. Most of my process is just staring at the problem until it makes sense.",
    accent: false,
  },
];

// Matches the Hero headline's radius exactly — kept consistent across every
// section that uses this hover-circle mechanic, rather than each one being
// independently tuned.
const HOVER_RADIUS = 180;

export function About() {
  const rootRef = useRef<HTMLElement>(null);
  const wordsRef = useRef<HTMLParagraphElement>(null);
  const statementWrapRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        gsap.from(".about__reveal", {
          ...REVEAL,
          scrollTrigger: { trigger: rootRef.current, start: REVEAL_START },
        });

        // Accent words are excluded entirely — they should read as
        // full-brightness/colored from the very start, never dimmed by
        // scroll position, same as Experience's accent words.
        const words = wordsRef.current!.querySelectorAll(".about__word:not(.about__accent)");

        gsap.set(words, { opacity: ABOUT_SCRUB_START_OPACITY });

        gsap.to(words, {
          opacity: 1,
          stagger: 1,
          // "none" made each word snap linearly on/off — sine.inOut eases
          // the fade in and out, so a word settling in feels like a soft
          // fade rather than a mechanical ramp.
          ease: "sine.inOut",
          scrollTrigger: {
            trigger: rootRef.current,
            // No pin: the reveal rides the section's own natural scroll
            // transit instead of locking scroll in place — that pin read as
            // "stuck," breaking the otherwise seamless scroll flow between
            // sections. Ends at "top top" (not "bottom top") so the reveal
            // is fully wrapped up by the moment the section settles at the
            // top of the screen, during its approach — not still dragging
            // on for the whole time it's already sitting there in view.
            start: "top bottom",
            end: "top top",
            // Higher than the tight 0.5 — adds a touch more catch-up lag so
            // quick wheel ticks glide instead of snapping word-to-word.
            scrub: 1,
          },
        });

        // Independent of the scroll-scrub above: a mouse-tracked hover
        // circle over the statement, same mechanic as the Hero headline's
        // hover-reveal (mask inset-extended by radius so clip-path has room
        // near the paragraph's edges, position lerped every tick instead of
        // tweened so it doesn't lag behind the cursor, radius tweened
        // separately for the open/close).
        const wrap = statementWrapRef.current;
        const mask = maskRef.current;
        if (!wrap || !mask) return;

        gsap.set(mask, { "--r": 0, "--mx": 0, "--my": 0 });

        const pos = { x: 0, y: 0 };
        const target = { x: 0, y: 0 };
        const weight = 0.12;

        const ticker = () => {
          pos.x += (target.x - pos.x) * weight;
          pos.y += (target.y - pos.y) * weight;
          gsap.set(mask, { "--mx": pos.x, "--my": pos.y });
        };
        gsap.ticker.add(ticker);

        const setR = gsap.quickTo(mask, "--r", { duration: 0.4, ease: "power2.out" });

        const handleMove = (e: MouseEvent) => {
          const rect = wrap.getBoundingClientRect();
          target.x = e.clientX - rect.left + HOVER_RADIUS;
          target.y = e.clientY - rect.top + HOVER_RADIUS;
        };

        const handleEnter = (e: MouseEvent) => {
          const rect = wrap.getBoundingClientRect();
          target.x = pos.x = e.clientX - rect.left + HOVER_RADIUS;
          target.y = pos.y = e.clientY - rect.top + HOVER_RADIUS;
          setR(HOVER_RADIUS);
        };

        const handleLeave = () => setR(0);

        wrap.addEventListener("mouseenter", handleEnter);
        wrap.addEventListener("mousemove", handleMove);
        wrap.addEventListener("mouseleave", handleLeave);

        return () => {
          gsap.ticker.remove(ticker);
          wrap.removeEventListener("mouseenter", handleEnter);
          wrap.removeEventListener("mousemove", handleMove);
          wrap.removeEventListener("mouseleave", handleLeave);
        };
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
            className={`about__word${chunk.accent ? " about__accent" : ""}`}
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
    <section className="about section-shell" id="about" ref={rootRef}>
      <h2 className="section-label about__reveal">About me</h2>

      <div
        className="about__statement-wrap"
        ref={statementWrapRef}
        style={{ "--about-reveal-radius": `${HOVER_RADIUS}px` } as React.CSSProperties}
        data-cursor-hide
      >
        <p className="display-statement about__statement" ref={wordsRef}>
          {renderStatement()}
        </p>

        {/* Same text as the base paragraph, not a different sentence — a
            flowing paragraph reflows based on its own content, so two
            different strings can't be guaranteed to wrap at the same
            points (unlike Hero's headline, where each word is its own
            fixed line). This reads as a dark-ink "spotlight" on the real
            text instead of a word swap. */}
        <div ref={maskRef} className="about__statement-mask" aria-hidden>
          <div className="about__statement-mask-inner">
            <p className="display-statement about__statement about__statement--alt">
              {renderStatement()}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
