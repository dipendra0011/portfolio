"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { RollText } from "@/components/motion/roll-text";
import { gsap, useGSAP, MOTION_OK, getSmoother } from "@/lib/gsap";

export type Role = {
  years: string;
  /** Row heading — the role, or the org when it's the better-known name. */
  title: string;
  /** Where, and in what capacity. */
  meta: string;
  /** One line: what the role taught. Leads the open panel. */
  takeaway: string;
  summary: string;
  highlights: string[];
  link?: { label: string; href: string };
};

const label = "font-label text-[12px] uppercase leading-none tracking-[0.02em]";

const pad = (n: number) => String(n).padStart(2, "0");

/** "2021 – Now" → 2021. */
const startYear = (years: string) => years.match(/\d{4}/)?.[0] ?? years;

/** Start and end as numbers; "Now" (or a single year) resolves against `now`. */
const yearRange = (years: string, now: number) => {
  const found = years.match(/\d{4}/g)?.map(Number) ?? [now];
  const start = found[0];
  const end = /now/i.test(years) ? now : (found[1] ?? start);
  return { start, end };
};

/* While the stage is pinned it fills the screen, so the header's idle "come
   back" would land on top of it. This flag keeps it tucked (about.css). */
const tuckHeader = (tucked: boolean) => {
  document.documentElement.toggleAttribute("data-header-tucked", tucked);
};

/* Timeline units, same rhythm as the chapters: the first role holds, each
   hand-off takes STEP_MOVE of its STEP, the last role holds before release. */
const HOLD_START = 0.3;
const STEP = 1;
const STEP_MOVE = 0.6;
const HOLD_END = 0.5;
const SCROLL_PER_UNIT = 0.8;

/* Odometer: each year digit trails the one before it by this much. */
const DIGIT_STAGGER = 0.05;

/* The band darkens one step per role, newest to oldest. */
const BAND_STEPS = ["--brand-600", "--brand-700", "--brand-800", "--brand-900", "--brand-950"];

/* Shortest span drawn on the track, so a one-year role still reads. */
const MIN_SPAN = 1.5; // % of track

/** "When and where" — the record, next to the story.
 *
 *  Desktop (with motion): a pinned stage. Scrolling opens one role at a time
 *  on the right while, on the left, the start year rolls over like an
 *  odometer and the track marks that role's span between the first year and
 *  now. The band deepens as the roles go further back. Clicking a row scrolls
 *  to it.
 *
 *  Below 992px, or with reduced motion: the same rows as a tap-to-open
 *  accordion, one open at a time. */
export function AboutExperience({ roles }: { roles: Role[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  // Set while the stage is pinned; row clicks scroll instead of toggling.
  const scrollToRole = useRef<((i: number) => void) | null>(null);

  const firstYear = Math.min(...roles.map((r) => Number(startYear(r.years)) || Infinity));

  useGSAP(
    () => {
      const root = rootRef.current!;
      const section = root.closest<HTMLElement>(".about-experience")!;
      const mm = gsap.matchMedia();

      mm.add(`(min-width: 992px) and ${MOTION_OK}`, () => {
        root.classList.add("about-exp--pinned");

        const items = gsap.utils.toArray<HTMLElement>(".about-exp__item", root).map((li) => ({
          body: li.querySelector<HTMLElement>(".about-exp__body")!,
          inner: li.querySelector<HTMLElement>(".about-exp__inner")!,
          content: li.querySelector<HTMLElement>(".about-exp__content")!,
        }));
        const years = gsap.utils
          .toArray<HTMLElement>(".about-exp__year", root)
          .map((layer) => layer.querySelectorAll<HTMLElement>(".about-exp__digit"));
        const span = root.querySelector<HTMLElement>(".about-exp__span")!;
        const dot = root.querySelector<HTMLElement>(".about-exp__dot")!;

        // Each body opens to its own content height.
        let heights: number[] = [];
        const measure = () => {
          heights = items.map(({ inner }) => inner.scrollHeight);
        };
        measure();

        // Where each role sits on the track: first start year → this year.
        const now = new Date().getFullYear();
        const axisStart = firstYear;
        const axisLength = Math.max(now - axisStart, 1);
        const marks = roles.map((role) => {
          const { start, end } = yearRange(role.years, now);
          return {
            left: ((start - axisStart) / axisLength) * 100,
            width: Math.max(((end - start) / axisLength) * 100, MIN_SPAN),
          };
        });

        const styles = getComputedStyle(document.documentElement);
        const bands = roles.map((_, i) =>
          styles.getPropertyValue(BAND_STEPS[Math.min(i, BAND_STEPS.length - 1)]).trim()
        );

        // Starting state: first role open, every other year rolled out below.
        items.forEach(({ body, content }, i) => {
          gsap.set(body, { height: i === 0 ? "auto" : 0 });
          gsap.set(content, { opacity: i === 0 ? 1 : 0 });
        });
        years.forEach((digits, i) => gsap.set(digits, { yPercent: i === 0 ? 0 : 100 }));
        gsap.set(span, { left: `${marks[0].left}%`, width: `${marks[0].width}%` });
        gsap.set(dot, { left: `${marks[0].left}%` });
        gsap.set(section, { backgroundColor: bands[0] });

        const total = HOLD_START + (items.length - 1) * STEP + HOLD_END;
        // The role at timeline time t: each hand-off flips at its midpoint.
        const roleAt = (t: number) =>
          gsap.utils.clamp(
            0,
            items.length - 1,
            Math.floor((t - HOLD_START - STEP_MOVE / 2) / STEP) + 1
          );

        const tl = gsap.timeline({
          defaults: { ease: "none", immediateRender: false },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: () => `+=${window.innerHeight * total * SCROLL_PER_UNIT}`,
            scrub: true,
            pin: true,
            invalidateOnRefresh: true,
            onRefreshInit: measure,
            onToggle: (self) => tuckHeader(self.isActive),
            onUpdate: (self) => {
              const i = roleAt(self.progress * total);
              if (i !== activeRef.current) {
                activeRef.current = i;
                setActive(i);
              }
            },
          },
        });

        items.slice(0, -1).forEach((current, i) => {
          const next = items[i + 1];
          const at = HOLD_START + i * STEP;

          // Explicit from/to so a resize mid-scroll re-records clean values.
          tl.fromTo(current.body, { height: () => heights[i] }, { height: 0, duration: STEP_MOVE }, at)
            .fromTo(next.body, { height: 0 }, { height: () => heights[i + 1], duration: STEP_MOVE }, at)
            // Copy leaves early and arrives late, so neither is seen clipped.
            .fromTo(current.content, { opacity: 1 }, { opacity: 0, duration: STEP_MOVE * 0.4 }, at)
            .fromTo(
              next.content,
              { opacity: 0 },
              { opacity: 1, duration: STEP_MOVE * 0.4 },
              at + STEP_MOVE * 0.6
            )
            .fromTo(
              section,
              { backgroundColor: bands[i] },
              { backgroundColor: bands[i + 1], duration: STEP_MOVE },
              at
            )
            .fromTo(
              span,
              { left: `${marks[i].left}%`, width: `${marks[i].width}%` },
              {
                left: `${marks[i + 1].left}%`,
                width: `${marks[i + 1].width}%`,
                duration: STEP_MOVE,
                ease: "power2.inOut",
              },
              at
            )
            .fromTo(
              dot,
              { left: `${marks[i].left}%` },
              { left: `${marks[i + 1].left}%`, duration: STEP_MOVE, ease: "power2.inOut" },
              at
            );

          // Odometer: only the digits that change roll (2021 → 2022 turns
          // the last one). Unchanged digits swap layers unseen at the
          // midpoint, so the number never flickers.
          const from = years[i];
          const to = years[i + 1];
          const sameLength = from.length === to.length;
          let rolled = 0;
          to.forEach((digit, d) => {
            const out = from[d];
            if (sameLength && out && out.textContent === digit.textContent) {
              const swap = at + STEP_MOVE / 2;
              tl.fromTo(out, { yPercent: 0 }, { yPercent: 100, duration: 0.001 }, swap).fromTo(
                digit,
                { yPercent: 100 },
                { yPercent: 0, duration: 0.001 },
                swap
              );
              return;
            }
            const delay = rolled++ * DIGIT_STAGGER;
            if (out) {
              tl.fromTo(
                out,
                { yPercent: 0 },
                { yPercent: -100, duration: STEP_MOVE * 0.6, ease: "power2.in" },
                at + delay
              );
            }
            tl.fromTo(
              digit,
              { yPercent: 100 },
              { yPercent: 0, duration: STEP_MOVE * 0.6, ease: "power2.out" },
              at + STEP_MOVE * 0.3 + delay
            );
          });
          // A shorter incoming year leaves digits behind; roll those out too.
          from.forEach((out, d) => {
            if (d >= to.length) {
              tl.fromTo(
                out,
                { yPercent: 0 },
                { yPercent: -100, duration: STEP_MOVE * 0.6, ease: "power2.in" },
                at
              );
            }
          });
        });
        // Pads the timeline out to its full length for the closing hold.
        tl.set({}, {}, total);

        // A row click lands where that role has fully opened.
        scrollToRole.current = (i: number) => {
          const st = tl.scrollTrigger!;
          const t = i === 0 ? 0 : HOLD_START + (i - 1) * STEP + STEP_MOVE;
          const target = st.start + (t / total) * (st.end - st.start);
          const smoother = getSmoother();
          if (smoother) {
            gsap.to(smoother, { scrollTop: target, duration: 1, ease: "expo.inOut", overwrite: true });
          } else {
            window.scrollTo({ top: target, behavior: "smooth" });
          }
        };

        return () => {
          root.classList.remove("about-exp--pinned");
          scrollToRole.current = null;
          tuckHeader(false);
        };
      });
    },
    { scope: rootRef }
  );

  const onRowClick = (i: number) => {
    if (scrollToRole.current) {
      scrollToRole.current(i);
      return;
    }
    // Accordion: one open at a time, and an open row can be closed.
    const next = active === i ? -1 : i;
    activeRef.current = next;
    setActive(next);
  };

  const current = roles[Math.max(active, 0)];

  return (
    <div ref={rootRef} className="about-exp grid md:grid-cols-12 md:gap-x-6">
      {/* Dial — desktop pin only (shown by about.css). Decorative: the same
          facts are in each row, so screen readers skip it. */}
      <div aria-hidden className="about-exp__dial hidden md:col-span-5 lg:col-span-4">
        <div className="flex items-baseline justify-between border-t border-bg/30 pt-4">
          <span className={`${label} text-bg/75`}>Selected role</span>
          <span className={`${label} tabular-nums text-bg/75`}>
            [{pad(Math.max(active, 0) + 1)}/{pad(roles.length)}]
          </span>
        </div>

        <div className="about-exp__years">
          {roles.map((role) => (
            <span key={`${role.years}-${role.title}`} className="about-exp__year">
              {Array.from(startYear(role.years)).map((digit, d) => (
                // Digits never reorder, so the index is a stable key
                <span key={d} className="about-exp__digit">
                  {digit}
                </span>
              ))}
            </span>
          ))}
        </div>

        <p className="text-[15px] leading-none text-bg/80">{current.years}</p>

        <div className="flex flex-col gap-3">
          <div className="about-exp__track">
            <span className="about-exp__span" />
            <span className="about-exp__dot" />
          </div>
          <div className={`${label} flex justify-between tabular-nums text-bg/75`}>
            <span>{firstYear}</span>
            <span>Now</span>
          </div>
        </div>
      </div>

      <ol className="about-exp__list border-b border-bg/30 md:col-span-12">
        {roles.map((role, i) => {
          const open = active === i;
          const bodyId = `role-${i}`;
          return (
            <li key={`${role.years}-${role.title}`} className="about-exp__item border-t border-bg/30">
              <h3>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={bodyId}
                  onClick={() => onRowClick(i)}
                  className="about-exp__row group grid w-full cursor-pointer grid-cols-[1fr_auto] items-start gap-x-6 gap-y-2 py-5 text-left md:grid-cols-[minmax(0,2fr)_minmax(0,7fr)_auto] md:py-6"
                >
                  <span className={`${label} col-span-2 pt-1.5 tabular-nums text-bg/75 md:col-span-1`}>
                    {role.years}
                  </span>
                  <span className="flex flex-col gap-2">
                    <span className="about-exp__title text-[clamp(1.625rem,2.4vw,2.375rem)] font-medium leading-none tracking-[-0.035em] transition-colors duration-300 group-hover:text-(--about-accent) group-aria-expanded:text-(--about-accent)">
                      {role.title}
                    </span>
                    <span className="text-[14px] leading-[1.3] text-bg/80">{role.meta}</span>
                  </span>
                  {/* Plus that turns into a cross when open */}
                  <svg
                    aria-hidden
                    viewBox="0 0 12 12"
                    className="mt-2 size-3 transition-transform duration-500 ease-out-expo group-aria-expanded:rotate-45"
                  >
                    <path d="M6 0v12M0 6h12" fill="none" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </button>
              </h3>

              <div id={bodyId} className="about-exp__body" data-open={open} inert={!open}>
                <div className="about-exp__inner">
                  <div className="about-exp__panel grid gap-x-6 pb-8 md:grid-cols-[minmax(0,2fr)_minmax(0,7fr)_auto] md:pb-9">
                    <div className="about-exp__content flex flex-col gap-5 md:col-start-2">
                      <p className="text-[clamp(1.25rem,1.7vw,1.625rem)] font-medium leading-[1.05] tracking-[-0.03em]">
                        {role.takeaway}
                      </p>
                      <p className="max-w-[60ch] text-[15px] leading-[1.5] text-bg/85">
                        {role.summary}
                      </p>
                      <ul className="flex flex-wrap gap-2">
                        {role.highlights.map((item) => (
                          <li
                            key={item}
                            className="rounded-[4px] border border-bg/35 px-2.5 py-1.5 font-label text-[12px] uppercase leading-none tracking-[0.02em]"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                      {role.link && (
                        <Link
                          href={role.link.href}
                          className="roll-trigger group/link flex items-center gap-2 self-start text-[15px] leading-none"
                        >
                          <RollText>{role.link.label}</RollText>
                          <svg
                            aria-hidden
                            viewBox="0 0 10 10"
                            className="size-2.5 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
                          >
                            <path
                              d="M2 8 8 2M3 2h5v5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.2"
                            />
                          </svg>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
