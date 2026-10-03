"use client";

import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { RollText } from "@/components/motion/roll-text";
import { siteConfig } from "@/config/site";
import {
  gsap,
  useGSAP,
  MOTION_OK,
  ScrollTrigger,
  SplitText,
  getSmoother,
} from "@/lib/gsap";
import "./site-footer.css";

/*
 * Closing sheet, borrowed in structure from an editorial hero: a 3/9 split
 * with a hairline between rail and statement, and the name set edge to edge
 * along the floor of the page.
 *
 *   - curtain: the sheet slides up from -CURTAIN_SHIFT while the footer
 *     scrolls in, so it reads as having been underneath the page all along.
 *   - wordmark: letters rise out of the bottom edge, centre first, scrubbed
 *     to the same scroll range — the name lands as the page runs out.
 *   - statement: words lift out of their masks once, like the hero.
 */

const TIME_ZONE = "Asia/Kathmandu";
const TIME_CITY = "Kathmandu";

/* Rail mascots, left to right. width/height are the files' intrinsic size;
   scale is each one's height relative to the tallest. */
const MASCOTS = [
  {
    src: "/footer/dog-dancing.webp",
    still: "/footer/dog-dancing-still.png",
    alt: "A cartoon dog dancing",
    width: 498,
    height: 498,
    scale: 1,
  },
  {
    src: "/footer/bird.gif",
    still: "/footer/bird-still.png",
    alt: "A crayon-drawn red bird pecking",
    width: 600,
    height: 537,
    scale: 0.7,
    // The home page's flying bird flies home into this one.
    perch: "home",
  },
];

/* Each mascot's column width, in units of the full mascot height. */
const MASCOT_COLUMNS = MASCOTS.map((m) => (m.width / m.height) * m.scale);
const MASCOT_ROW = MASCOT_COLUMNS.reduce((a, b) => a + b, 0);
const MASCOT_GAP_PX = 8;

const CURTAIN_SHIFT = -30; // yPercent of the sheet
// Timeline position (0–1 of the scroll range) where the letters start rising.
const WORDMARK_START = 0.4;
const WORDMARK_STAGGER = 0.04;
const STATEMENT_START = "top 55%";

/* Measured at this size, then scaled so the name spans its box exactly. */
const FIT_PROBE_PX = 100;

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});

const subscribeToClock = (onChange: () => void) => {
  const id = window.setInterval(onChange, 10_000);
  return () => window.clearInterval(id);
};

/** Local time as HH:MM. Null on the server so hydration never mismatches. */
function useLocalTime() {
  return useSyncExternalStore(
    subscribeToClock,
    () => timeFormat.format(Date.now()),
    () => null,
  );
}

function scrollToTop() {
  const smoother = getSmoother();
  if (smoother) {
    smoother.scrollTo(0, true);
    return;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
}

const label =
  "font-label text-[12px] uppercase leading-none tracking-[0.02em] text-fg-dim";

export function SiteFooter() {
  const rootRef = useRef<HTMLElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const time = useLocalTime();
  const year = new Date().getFullYear();

  // Fit the wordmark to its box. Re-runs on resize and once the webfont
  // lands, since a fallback face has different advance widths.
  useEffect(() => {
    const box = wordmarkRef.current!;
    const text = box.querySelector<HTMLElement>(".site-footer__wordmark-text")!;

    const fit = () => {
      text.style.fontSize = `${FIT_PROBE_PX}px`;
      const scale = box.clientWidth / text.scrollWidth;
      text.style.fontSize = `${FIT_PROBE_PX * scale}px`;
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    let alive = true;
    document.fonts.ready.then(() => {
      if (!alive) return;
      fit();
      ScrollTrigger.refresh();
    });

    return () => {
      alive = false;
      observer.disconnect();
    };
  }, []);

  useGSAP(
    () => {
      const root = rootRef.current!;
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const sheet = root.querySelector<HTMLElement>(".site-footer__sheet")!;
        const chars = root.querySelectorAll<HTMLElement>(".site-footer__char");
        const statement = root.querySelector<HTMLElement>(
          ".site-footer__statement",
        )!;

        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: root,
              start: "top bottom",
              end: "bottom bottom",
              scrub: true,
            },
          })
          .fromTo(
            sheet,
            { yPercent: CURTAIN_SHIFT },
            { yPercent: 0, duration: 1 },
            0,
          )
          .fromTo(
            chars,
            { yPercent: 105 },
            {
              yPercent: 0,
              duration: 1 - WORDMARK_START,
              stagger: { each: WORDMARK_STAGGER, from: "center" },
            },
            WORDMARK_START,
          );

        // Words, not lines: line wrappers are blocks, and each would take
        // the first-line indent.
        SplitText.create(statement, {
          type: "words",
          mask: "words",
          wordsClass: "site-footer__word",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.words, {
              yPercent: 100,
              duration: 1.1,
              ease: "lusion",
              stagger: 0.025,
              scrollTrigger: {
                trigger: root,
                start: STATEMENT_START,
                once: true,
              },
            }),
        });
      });
    },
    { scope: rootRef },
  );

  return (
    <footer
      ref={rootRef}
      className="relative overflow-clip border-t border-fg bg-bg font-sans text-fg"
    >
      <div className="site-footer__sheet flex min-h-svh flex-col">
        <div className="grid flex-1 grid-cols-1 px-5 md:grid-cols-12 md:px-9">
          {/* Rail */}
          {/* Top padding clears the fixed header, which comes back at rest. */}
          <div className="flex flex-col items-start justify-between gap-8 pt-28 pb-10 md:col-span-3 md:pt-32 md:pr-6 md:pb-9">
            {/* Profile pair, standing on one baseline. Columns are weighted
                by aspect ratio × scale, so heights follow each scale; the row
                width is derived from --mascot-h (the tallest one's height)
                and shrinks as a whole when the rail is narrower. */}
            <div
              className="grid max-w-full items-end [--mascot-h:100px] md:[--mascot-h:clamp(110px,10vw,150px)]"
              style={{
                gridTemplateColumns: MASCOT_COLUMNS.map((c) => `${c}fr`).join(
                  " ",
                ),
                columnGap: MASCOT_GAP_PX,
                width: `calc(var(--mascot-h) * ${MASCOT_ROW} + ${MASCOT_GAP_PX * (MASCOTS.length - 1)}px)`,
              }}
            >
              {MASCOTS.map((m) => (
                // Animated files can't be paused, so reduced motion gets
                // their first frame instead.
                <picture key={m.src} className="block" data-bird-perch={"perch" in m ? m.perch : undefined}>
                  <source
                    media="(prefers-reduced-motion: reduce)"
                    srcSet={m.still}
                  />
                  <img
                    src={m.src}
                    alt={m.alt}
                    width={m.width}
                    height={m.height}
                    loading="lazy"
                    decoding="async"
                    className="block h-auto w-full"
                  />
                </picture>
              ))}
            </div>
            <dl className="flex flex-col gap-2">
              <dt className={label}>Local time · {TIME_CITY}</dt>
              <dd className="text-[18px] leading-none tabular-nums">
                <time>{time ?? "--:--"}</time>
              </dd>
            </dl>
          </div>

          {/* Statement + meta */}
          <div className="flex flex-col justify-between gap-20 border-line pb-10 md:col-span-9 md:border-l md:pt-32 md:pb-9 md:pl-9">
            <p className="site-footer__statement max-w-[22ch] text-[clamp(2.25rem,5.2vw,5.5rem)] font-medium leading-[0.95] tracking-[-0.045em] md:max-w-none md:indent-[calc(100%/9)]">
              Got a product with a lot going on?{" "}
              <span className="text-blue">
                Let&apos;s make it feel obvious.
              </span>
            </p>

            <div className="grid grid-cols-2 gap-x-6 gap-y-10 text-[15px] leading-[1.35] md:grid-cols-4">
              <div className="flex flex-col gap-3">
                <span className={label}>Status</span>
                <p>
                  Open to work
                  <br />
                  <span className="text-fg-dim">Full-time or contract</span>
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <span className={label}>Contact</span>
                <Link
                  href={siteConfig.contact.href}
                  className="roll-trigger group flex items-center gap-2 self-start"
                >
                  <RollText>{siteConfig.contact.label}</RollText>
                  <svg
                    aria-hidden
                    viewBox="0 0 10 10"
                    className="size-2.5 transition-[transform,color] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-blue"
                  >
                    <path
                      d="M2 8 8 2M3 2h5v5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                  </svg>
                </Link>
              </div>

              <nav aria-label="Footer" className="flex flex-col gap-3">
                <span className={label}>Index</span>
                <ul className="flex flex-col gap-1">
                  {siteConfig.nav.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="roll-trigger">
                        <RollText>{item.label}</RollText>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="flex flex-col items-start gap-3">
                <span className={label}>© {year}</span>
                <button
                  type="button"
                  onClick={scrollToTop}
                  className="roll-trigger group flex cursor-pointer items-center gap-2"
                >
                  <RollText>Back to top</RollText>
                  <svg
                    aria-hidden
                    viewBox="0 0 10 10"
                    className="size-2.5 transition-[transform,color] group-hover:-translate-y-0.5 group-hover:text-blue"
                  >
                    <path
                      d="M5 9V1M1.5 4.5 5 1l3.5 3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Wordmark — sits on the floor of the page */}
        <div className="border-t border-line px-5 pt-3 md:px-9 md:pt-4">
          <div ref={wordmarkRef} className="overflow-clip">
            <span className="sr-only">{siteConfig.name}</span>
            <span
              aria-hidden
              className="site-footer__wordmark-text inline-block whitespace-nowrap font-display text-[12vw] font-medium leading-none tracking-[-0.05em]"
            >
              {Array.from(siteConfig.name).map((char, i) => (
                <span
                  // Characters never reorder, so the index is a stable key
                  key={i}
                  className="site-footer__char inline-block whitespace-pre will-change-transform"
                >
                  {char}
                </span>
              ))}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
