import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(
    ScrollTrigger,
    ScrollSmoother,
    ScrambleTextPlugin,
    SplitText,
    CustomEase,
    DrawSVGPlugin,
    useGSAP
  );
  // lusion.co's house curve, lifted from their production bundle — a slow
  // start into a long, soft landing.
  CustomEase.create("lusion", "0.35,0,0,1");
}

/* Every scroll reveal on the site uses these. */
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

export { gsap, ScrollTrigger, ScrollSmoother, ScrambleTextPlugin, SplitText, DrawSVGPlugin, useGSAP };

/** How long the page keeps gliding after the wheel stops. */
export const SMOOTH_SECONDS = 1;

/** Shared by every route that owns a ScrollSmoother. Each page creates its
 *  own: React runs the outgoing route's cleanup before the incoming route's
 *  effects in the same commit, so the kill/create can't race. Kept out of the
 *  layout on purpose — that layout is a server component exporting `metadata`,
 *  which making it client-side would forfeit. */
export function createSmoother() {
  // Next restores scroll position on soft nav; building the smoother at a
  // non-zero offset produces a visible jump on arrival.
  window.scrollTo(0, 0);

  const smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    // Seconds to catch up to the native scroll position — this is the
    // "weight". 0.6 felt light; 1.0 gives the heavy, premium glide without
    // tipping into floaty (1.2+). power2.out over ScrollSmoother's default
    // expo: expo covers ~60% of a flick in the first 100ms (snappy), power2
    // ~35%, so the page builds and then decelerates like it has mass —
    // settles in ~0.9s. SMOOTH_SECONDS is shared with the header's idle
    // reveal.
    smooth: SMOOTH_SECONDS,
    ease: "power2.out",
    // Touch stays close to 1:1: finger-tracking with heavy smoothing feels
    // like the page is fighting the drag.
    smoothTouch: 0.1,
  });
  setSmoother(smoother);
  ScrollTrigger.refresh();

  return () => {
    smoother.kill();
    clearSmoother(smoother);
  };
}
