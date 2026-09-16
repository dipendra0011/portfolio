"use client";

import Image from "next/image";
import { useRef, useSyncExternalStore } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import {
  GRAPHIC_DESIGN_ITEMS,
  type GraphicDesignItem,
} from "@/lib/graphic-design";
import { GraphicDesignScene } from "./graphic-design-scene";

const REDUCE_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onStoreChange: () => void) {
  const mql = window.matchMedia(REDUCE_MOTION);
  mql.addEventListener("change", onStoreChange);
  return () => mql.removeEventListener("change", onStoreChange);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCE_MOTION).matches,
    () => false,
  );
}

export type GraphicDesignShowcaseProps = {
  items?: GraphicDesignItem[];
};

function StaticGrid({ items }: { items: GraphicDesignItem[] }) {
  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <li key={`${item.imageUrl}-${item.title}`}>
          <figure className="overflow-hidden border border-border-grey bg-surface">
            <div className="relative aspect-[4/5] w-full">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <figcaption className="px-4 py-3 font-[family-name:var(--font-instrument)] text-[13px] font-semibold uppercase tracking-[0.04em] text-foreground">
              {item.title}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}

export function GraphicDesignShowcase({
  items = GRAPHIC_DESIGN_ITEMS,
}: GraphicDesignShowcaseProps) {
  const reduceMotion = usePrefersReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    progressRef.current = latest;
  });

  return (
    <section
      id="graphic-design"
      aria-labelledby="graphic-design-heading"
      className="bg-background"
    >
      <div className="page-figma mx-auto max-w-figma pt-20 md:pt-28">
        <h2
          id="graphic-design-heading"
          className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,7vw,5rem)] font-medium uppercase leading-[0.9] tracking-[-0.05em] text-foreground"
        >
          Graphic
          <br />
          Design
        </h2>
        <p className="mt-6 max-w-xl font-[family-name:var(--font-inter)] text-[17px] leading-[1.65] text-foreground/80">
          Selected posters, campaigns, and visual work. Scroll down to spin the
          ring — it loops three times.
        </p>
      </div>

      {reduceMotion ? (
        <div className="page-figma mx-auto max-w-figma py-12 md:py-16">
          <StaticGrid items={items} />
        </div>
      ) : (
        <div ref={trackRef} className="relative h-[720vh]">
          <div className="sticky top-0 h-dvh w-full overflow-hidden bg-[#f0f1fa]">
            <GraphicDesignScene items={items} progressRef={progressRef} />
          </div>
        </div>
      )}
    </section>
  );
}
