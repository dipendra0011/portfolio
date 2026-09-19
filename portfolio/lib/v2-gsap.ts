import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrambleTextPlugin, SplitText, useGSAP);
}

/* Every scroll reveal on the v2 site uses these. */
export const REVEAL = { opacity: 0, y: 24, duration: 0.8, ease: "power3.out" };
export const REVEAL_START = "top 85%";

/* gsap.matchMedia() condition — all motion is gated behind it. */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";

let smootherInstance: InstanceType<typeof ScrollSmoother> | null = null;

export function setSmoother(instance: InstanceType<typeof ScrollSmoother> | null) {
  smootherInstance = instance;
}

/** Clears the singleton only if `instance` is still the registered one.
 *  Route transitions kill the outgoing page's smoother and create the
 *  incoming page's — an unguarded `setSmoother(null)` in the wrong order
 *  would blank out a smoother that's actually live. */
export function clearSmoother(instance: InstanceType<typeof ScrollSmoother>) {
  if (smootherInstance === instance) {
    smootherInstance = null;
  }
}

export function getSmoother() {
  return smootherInstance;
}

export { gsap, ScrollTrigger, ScrollSmoother, ScrambleTextPlugin, SplitText, useGSAP };

/** Shared by every v2 route that owns a ScrollSmoother. Each page creates its
 *  own: React runs the outgoing route's cleanup before the incoming route's
 *  effects in the same commit, so the kill/create can't race. Kept out of the
 *  layout on purpose — that layout is a server component exporting `metadata`,
 *  which making it client-side would forfeit. */
export function createV2Smoother() {
  // Next restores scroll position on soft nav; building the smoother at a
  // non-zero offset produces a visible jump on arrival.
  window.scrollTo(0, 0);

  const smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.2,
    smoothTouch: 1.2,
  });
  setSmoother(smoother);
  ScrollTrigger.refresh();

  return () => {
    smoother.kill();
    clearSmoother(smoother);
  };
}
