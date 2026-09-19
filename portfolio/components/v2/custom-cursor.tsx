"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/v2-gsap";
import "./custom-cursor.css";

const MAGNETIC_STRENGTH = 0.35;
const RING_HOVER_SCALE = 64 / 36;

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const magnetTargetRef = useRef<Element | null>(null);

  useGSAP(() => {
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    if (!window.matchMedia(MOTION_OK).matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;

    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

    const setDotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
    const setDotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });
    const setRingX = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3.out" });
    const setRingY = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3.out" });

    let mouseX = 0;
    let mouseY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const magnet = magnetTargetRef.current;
      if (magnet) {
        const rect = magnet.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        mouseX += (cx - mouseX) * MAGNETIC_STRENGTH;
        mouseY += (cy - mouseY) * MAGNETIC_STRENGTH;
      }

      setDotX(e.clientX);
      setDotY(e.clientY);
      setRingX(mouseX);
      setRingY(mouseY);
    };

    const onMouseEnter = (el: Element, magnetic: boolean) => {
      gsap.to(dot, { scale: 0, duration: 0.2, ease: "power3.out" });
      gsap.to(ring, { scale: RING_HOVER_SCALE, duration: 0.35, ease: "power3.out" });
      if (magnetic) magnetTargetRef.current = el;
    };

    const onMouseLeave = () => {
      gsap.to(dot, { scale: 1, duration: 0.2, ease: "power3.out" });
      gsap.to(ring, { scale: 1, duration: 0.35, ease: "power3.out" });
      magnetTargetRef.current = null;
    };

    // Instant, not a fade: a transition here means the fake cursor is
    // visibly on-screen (at partial opacity) for a stretch of real time
    // while hovering the headline, which is exactly what a "no custom
    // cursor at all while hovering the text" requirement rules out.
    const onHideEnter = () => {
      gsap.set([dot, ring], { opacity: 0 });
    };
    const onHideLeave = () => {
      gsap.set([dot, ring], { opacity: 1 });
    };

    window.addEventListener("mousemove", onMouseMove);

    const cleanups: (() => void)[] = [];
    const targets = document.querySelectorAll(
      "a, button, [data-cursor-hover], [data-cursor-magnetic]"
    );
    targets.forEach((el) => {
      const magnetic = el.hasAttribute("data-cursor-magnetic");
      const enter = () => onMouseEnter(el, magnetic);
      el.addEventListener("mouseenter", enter);
      el.addEventListener("mouseleave", onMouseLeave);
      cleanups.push(() => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", onMouseLeave);
      });
    });

    // Elements that opt fully out of the custom cursor (real OS arrow
    // instead) also need the fake dot/ring hidden while over them —
    // otherwise the native arrow and the fake cursor would render at once.
    const hideTargets = document.querySelectorAll("[data-cursor-hide]");
    hideTargets.forEach((el) => {
      el.addEventListener("mouseenter", onHideEnter);
      el.addEventListener("mouseleave", onHideLeave);
      cleanups.push(() => {
        el.removeEventListener("mouseenter", onHideEnter);
        el.removeEventListener("mouseleave", onHideLeave);
      });
    });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cleanups.forEach((fn) => fn());
    };
  });

  return (
    <>
      <div className="cursor" ref={dotRef} aria-hidden="true"></div>
      <div className="cursor-ring" ref={ringRef} aria-hidden="true"></div>
    </>
  );
}
