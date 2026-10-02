"use client";

import { useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

const arrowButton =
  "group flex size-11 cursor-pointer items-center justify-center rounded-[4px] border border-fg transition-colors hover:bg-fg hover:text-bg focus-visible:bg-fg focus-visible:text-bg";

/** One quote at a time, stepped with previous/next. The outgoing quote lifts
 *  out before the incoming one settles in; reduced motion swaps instantly. */
export function AboutTestimonials({ items }: { items: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const quoteRef = useRef<HTMLElement>(null);
  const current = items[index];

  const step = (direction: 1 | -1) => {
    const advance = () => setIndex((i) => (i + direction + items.length) % items.length);
    const el = quoteRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      advance();
      return;
    }
    gsap.to(el, {
      opacity: 0,
      y: -12 * direction,
      duration: 0.25,
      ease: "power2.in",
      overwrite: true,
      onComplete: () => {
        advance();
        gsap.fromTo(
          el,
          { opacity: 0, y: 12 * direction },
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
        );
      },
    });
  };

  return (
    <div className="flex flex-col gap-10 md:col-span-9 md:min-h-[420px] md:justify-between">
      <figure ref={quoteRef} aria-live="polite" className="flex flex-col gap-8">
        <blockquote className="max-w-[24ch] text-[clamp(1.75rem,3.4vw,3.25rem)] font-medium leading-[1.02] tracking-[-0.035em] md:max-w-[26ch]">
          &ldquo;{current.quote}&rdquo;
        </blockquote>
        <figcaption className="text-[15px] leading-[1.35]">
          {current.name}
          <br />
          <span className="text-fg-dim">{current.role}</span>
        </figcaption>
      </figure>

      <div className="flex items-center gap-2">
        <button type="button" onClick={() => step(-1)} className={arrowButton} aria-label="Previous quote">
          <svg aria-hidden viewBox="0 0 10 10" className="size-3 transition-transform group-hover:-translate-x-0.5">
            <path d="M9 5H1M4.5 1.5 1 5l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
        <button type="button" onClick={() => step(1)} className={arrowButton} aria-label="Next quote">
          <svg aria-hidden viewBox="0 0 10 10" className="size-3 transition-transform group-hover:translate-x-0.5">
            <path d="M1 5h8M5.5 1.5 9 5 5.5 8.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
        <span className="ml-3 font-label text-[12px] tabular-nums leading-none tracking-[0.02em]">
          [{pad(index + 1)}/{pad(items.length)}]
        </span>
      </div>
    </div>
  );
}
