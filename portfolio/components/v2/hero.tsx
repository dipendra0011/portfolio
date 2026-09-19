"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/v2-gsap";
import { HoverRevealText } from "./hover-reveal-text";
import { BackgroundRippleEffect } from "./background-ripple-effect";
import "./hero.css";

// One word per line, matching the reference's stacked-headline structure.
// Only the first two lines swap on hover (a confident brag vs. the honest
// version) — the rest stay put, same "confident vs. honest" joke pattern
// already used in the History section.
const DEFAULT_LINES = [
  "I DESIGN",
  "LIKE YOU",
  "ARE ALREADY",
  <span key="accent" className="hero__accent">
    ANNOYED
  </span>,
];
const HOVER_LINES = ["STOLEN", "FROM DRIBBBLE", "POLISHED", "WITH GUILT"];

export function Hero() {
  const rootRef = useRef<HTMLElement>(null);
  const headlineWrapRef = useRef<HTMLDivElement>(null);
  const kickerRef = useRef<HTMLParagraphElement>(null);
  const kickerInkRef = useRef<HTMLSpanElement>(null);

  // Echoes the headline's hover-reveal circle onto the kicker text above it
  // — the circle's mask is intentionally larger than the headline itself
  // (so it isn't clipped near the headline's own edges), which means it can
  // reach up into the kicker's space. Without this, the kicker just goes
  // solid-accent-on-solid-accent there and disappears (same color as the
  // circle's fill, zero contrast) instead of reading as ink on the circle.
  const handleTrack = ({ clientX, clientY, radius }: { clientX: number; clientY: number; radius: number }) => {
    const kicker = kickerRef.current;
    const ink = kickerInkRef.current;
    if (!kicker || !ink) return;
    const rect = kicker.getBoundingClientRect();
    gsap.set(ink, {
      "--kicker-r": radius,
      "--kicker-mx": clientX - rect.left,
      "--kicker-my": clientY - rect.top,
    });
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        gsap
          .timeline({ delay: 0.15 })
          .from(".hero__kicker", {
            opacity: 0,
            y: 16,
            duration: 0.7,
            ease: "power3.out",
          })
          .from(
            headlineWrapRef.current,
            { opacity: 0, y: 24, duration: 0.9, ease: "power3.out" },
            "-=0.35"
          );
      });
    },
    { scope: rootRef }
  );

  return (
    <section className="hero" id="home" ref={rootRef}>
      <BackgroundRippleEffect />

      <p className="section-label section-label--flush hero__kicker" ref={kickerRef}>
        DIPENDRA SHREST
        <span className="hero__kicker-ink" ref={kickerInkRef} aria-hidden>
          DIPENDRA SHREST
        </span>
      </p>

      <div ref={headlineWrapRef}>
        <HoverRevealText
          as="h1"
          className="hero__headline"
          lines={DEFAULT_LINES}
          hoverLines={HOVER_LINES}
          radius={180}
          onTrack={handleTrack}
        />
      </div>
    </section>
  );
}
