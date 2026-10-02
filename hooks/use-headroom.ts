"use client";

import { useEffect, useState } from "react";
import { SMOOTH_SECONDS } from "@/lib/gsap";

type Headroom = {
  /** Page has scrolled past the very top. */
  scrolled: boolean;
  /** Header should be tucked away (scrolling down, past `offset`). */
  hidden: boolean;
};

/**
 * "Headroom" header state: hide while the reader scrolls down, reveal as soon
 * as they scroll up (intent to navigate) or stop scrolling, always shown near
 * the top.
 *
 * @param offset    distance from the top before the header may hide
 * @param tolerance px of movement ignored, so trackpad jitter doesn't flicker it
 * @param idleDelay ms without scrolling before the header comes back. A beat
 *                  past ScrollSmoother's glide (SMOOTH_SECONDS), so it returns
 *                  once the page has visibly settled, not mid-glide.
 */
export function useHeadroom({
  offset = 120,
  tolerance = 6,
  idleDelay = SMOOTH_SECONDS * 1000 + 200,
} = {}): Headroom {
  const [state, setState] = useState<Headroom>({ scrolled: false, hidden: false });

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;

    const reveal = () =>
      setState((prev) => (prev.hidden ? { ...prev, hidden: false } : prev));

    const update = () => {
      frame = 0;
      const y = Math.max(window.scrollY, 0);
      const delta = y - lastY;

      setState((prev) => {
        const scrolled = y > 8;
        let hidden = prev.hidden;
        if (y <= offset) hidden = false;
        else if (delta > tolerance) hidden = true;
        else if (delta < -tolerance) hidden = false;
        return scrolled === prev.scrolled && hidden === prev.hidden
          ? prev
          : { scrolled, hidden };
      });

      if (Math.abs(delta) > tolerance || y <= offset) lastY = y;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(reveal, idleDelay);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      clearTimeout(idleTimer);
    };
  }, [offset, tolerance, idleDelay]);

  return state;
}
