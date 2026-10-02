"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/gsap";

export type Chapter = {
  title: string;
  years: string;
  story: string[];
  /** Skills or lessons taken out of this chapter, shown as chips. */
  picked: string[];
};

const label = "font-label text-[12px] uppercase leading-none tracking-[0.02em] text-fg-dim";

const formatIndex = (i: number) => `[${String(i + 1).padStart(2, "0")}]`;

/* While the panel is pinned it fills the screen edge to edge, so the header's
   idle "come back" would land on top of the rows. This flag keeps it tucked
   (styled in about.css). */
const tuckHeader = (tucked: boolean) => {
  document.documentElement.toggleAttribute("data-header-tucked", tucked);
};

/* Timeline units; each unit is SCROLL_PER_UNIT viewports of scroll. The first
   chapter holds before anything moves, each hand-off takes STEP_MOVE of its
   STEP, and the last chapter holds before the pin releases. */
const HOLD_START = 0.3;
const STEP = 1;
const STEP_MOVE = 0.6;
const HOLD_END = 0.5;
const SCROLL_PER_UNIT = 0.9;

/* Incoming numeral rises this far (of its own height) as its chapter opens. */
const NUMERAL_RISE = 35;

/** "How did I get here?" — on desktop, a pinned accordion: every chapter's
 *  row stays on screen, finished ones stacked above and upcoming ones below,
 *  and scrolling hands the space between from one chapter to the next. Below
 *  992px, or with reduced motion, it's a plain list. */
export function AboutChapters({ chapters }: { chapters: Chapter[] }) {
  const rootRef = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current!;
      const mm = gsap.matchMedia();

      mm.add(`(min-width: 992px) and ${MOTION_OK}`, () => {
        root.classList.add("about-chapters--pinned");

        const items = gsap.utils.toArray<HTMLElement>(".about-chapter", root).map((li) => ({
          row: li.querySelector<HTMLElement>(".about-chapter__row")!,
          body: li.querySelector<HTMLElement>(".about-chapter__body")!,
          content: li.querySelector<HTMLElement>(".about-chapter__content")!,
          numeral: li.querySelector<HTMLElement>(".about-chapter__numeral")!,
        }));

        // The open chapter gets whatever the screen has left after every row.
        // Published as --about-open so the CSS can size each body's contents
        // (and its numeral) to the open height, not the animating one.
        let open = 0;
        const measure = () => {
          const rows = items.reduce((sum, { row }) => sum + row.offsetHeight, 0);
          open = Math.max(root.clientHeight - rows, 0);
          root.style.setProperty("--about-open", `${open}px`);
        };
        measure();

        const total = HOLD_START + (items.length - 1) * STEP + HOLD_END;
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
          },
        });

        // Initial heights and opacities come from about.css, so a resize
        // before the first hand-off still lands on the new --about-open.
        items.slice(0, -1).forEach((current, i) => {
          const next = items[i + 1];
          const at = HOLD_START + i * STEP;
          // Explicit from/to so a resize mid-scroll re-records clean values
          // instead of whatever half-open height is on screen.
          tl.fromTo(current.body, { height: () => open }, { height: 0, duration: STEP_MOVE }, at)
            .fromTo(next.body, { height: 0 }, { height: () => open, duration: STEP_MOVE }, at)
            .fromTo(
              next.numeral,
              { yPercent: NUMERAL_RISE },
              { yPercent: 0, duration: STEP_MOVE, ease: "power2.out" },
              at
            )
            // The copy is clipped by its closing panel, so it leaves early
            // and the incoming copy arrives late.
            .fromTo(current.content, { opacity: 1 }, { opacity: 0, duration: STEP_MOVE * 0.4 }, at)
            .fromTo(
              next.content,
              { opacity: 0 },
              { opacity: 1, duration: STEP_MOVE * 0.4 },
              at + STEP_MOVE * 0.6
            );
        });
        // Pads the timeline out to its full length for the closing hold.
        tl.set({}, {}, total);

        return () => {
          root.classList.remove("about-chapters--pinned");
          root.style.removeProperty("--about-open");
          tuckHeader(false);
        };
      });
    },
    { scope: rootRef }
  );

  return (
    <ol ref={rootRef} className="about-chapters border-b border-fg">
      {chapters.map((chapter, i) => (
        <li key={chapter.title} className="about-chapter">
          {/* The row repeats what the body's heading says, for sighted
              scanning; screen readers get the heading. */}
          <div
            aria-hidden
            className="about-chapter__row relative z-10 grid h-11 grid-cols-[auto_1fr_auto] items-center gap-x-6 border-t border-fg bg-bg px-5 text-[15px] leading-none md:grid-cols-12 md:px-9"
          >
            <span className="font-label text-[12px] md:col-span-3">{formatIndex(i)}</span>
            <span className="truncate md:col-span-6">{chapter.title}</span>
            <span className="text-right tabular-nums md:col-span-3">{chapter.years}</span>
          </div>

          <div className="about-chapter__body">
            <div className="about-chapter__inner grid gap-8 px-5 pt-8 pb-20 md:grid-cols-12 md:gap-x-6 md:px-9 md:pt-12 md:pb-28">
              <div aria-hidden className="about-chapter__numeral-slot md:col-span-3">
                <span className="about-chapter__numeral">
                  <span className="about-chapter__numeral-ghost">{i + 1}</span>
                  {i + 1}
                </span>
              </div>

              <div className="about-chapter__content grid gap-8 md:col-span-9 md:grid-cols-9 md:gap-x-6">
                <div className="md:col-span-6">
                  <h3 className="text-[clamp(2rem,3.4vw,3.5rem)] font-medium leading-[0.95] tracking-[-0.045em]">
                    {chapter.title}
                    <span className="sr-only">, {chapter.years}</span>
                  </h3>
                  <div className="mt-6 grid gap-4 text-[15px] leading-[1.45] md:mt-8 md:grid-cols-2 md:gap-6">
                    {chapter.story.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 md:col-span-3 md:items-end">
                  <span className={label}>Picked up</span>
                  <ul className="flex flex-wrap gap-2 md:justify-end">
                    {chapter.picked.map((item) => (
                      <li
                        key={item}
                        className="rounded-[4px] border border-line px-2.5 py-1.5 font-label text-[12px] uppercase leading-none tracking-[0.02em]"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
