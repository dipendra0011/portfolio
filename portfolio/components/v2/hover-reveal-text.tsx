"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/v2-gsap";
import "./hover-reveal-text.css";

type TrackInfo = { clientX: number; clientY: number; radius: number };

type HoverRevealTextProps = {
  as?: "h1" | "h2" | "div";
  className?: string;
  lines: React.ReactNode[];
  hoverLines: React.ReactNode[];
  radius?: number; // circle radius in px, default matches reference (~280px diameter)
  // Reports the circle's live viewport-space center + current radius every
  // tick, so a caller can echo the same circle onto an unrelated element
  // elsewhere on the page (e.g. text that sits just above this component)
  // without this component needing to know that element exists.
  onTrack?: (info: TrackInfo) => void;
};

export function HoverRevealText({
  as: Tag = "h1",
  className = "",
  lines,
  hoverLines,
  radius = 140,
  onTrack,
}: HoverRevealTextProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const wrap = wrapRef.current;
      const mask = maskRef.current;
      if (!wrap || !mask) return;

      mm.add(MOTION_OK, () => {
        // Unitless numbers throughout: gsap.quickTo's setter only accepts
        // `number`, and the CSS applies the px unit itself via
        // calc(var() * 1px) — feeding it a "Npx" string produces an invalid
        // calc() (px * px) and silently breaks the whole clip-path.
        gsap.set(mask, { "--r": 0, "--mx": 0, "--my": 0 });

        // Position is a lerp toward the cursor, ticked every frame, instead
        // of a fixed-duration tween — a constant-duration tween lags by an
        // amount that scales with cursor speed regardless of how short the
        // duration is, which reads as "delayed." A lerp settles
        // exponentially and its catch-up rate is one dial (`weight`), so it
        // reads as weight/inertia instead of latency.
        const pos = { x: 0, y: 0 };
        const target = { x: 0, y: 0 };
        const weight = 0.12; // lower = heavier/slower catch-up, higher = snappier

        const ticker = () => {
          pos.x += (target.x - pos.x) * weight;
          pos.y += (target.y - pos.y) * weight;
          gsap.set(mask, { "--mx": pos.x, "--my": pos.y });

          if (onTrack) {
            // Read the tween's current value straight off the inline style
            // GSAP already wrote (cheap) rather than getComputedStyle
            // (forces a style recalc) — this runs every tick.
            const r = parseFloat(mask.style.getPropertyValue("--r")) || 0;
            const rect = wrap.getBoundingClientRect();
            onTrack({
              clientX: rect.left + pos.x - radius,
              clientY: rect.top + pos.y - radius,
              radius: r,
            });
          }
        };
        gsap.ticker.add(ticker);

        const setR = gsap.quickTo(mask, "--r", { duration: 0.4, ease: "power2.out" });

        // The mask's own box is inset by -radius on every side (see CSS) so
        // clip-path always has room to draw a full circle, even when the
        // cursor is right at the headline's edge — otherwise the circle
        // gets flattened by the mask's own box boundary. That shifts the
        // mask's coordinate origin by `radius`, so cursor position has to
        // be offset by the same amount to land in the right spot.
        const handleMove = (e: MouseEvent) => {
          const rect = wrap.getBoundingClientRect();
          target.x = e.clientX - rect.left + radius;
          target.y = e.clientY - rect.top + radius;
        };

        const handleEnter = (e: MouseEvent) => {
          const rect = wrap.getBoundingClientRect();
          // Snap pos AND target together on entry so the circle appears
          // exactly at the cursor, not wherever it last settled — only
          // subsequent movement should lag, never the first contact.
          target.x = pos.x = e.clientX - rect.left + radius;
          target.y = pos.y = e.clientY - rect.top + radius;
          setR(radius);
        };

        const handleLeave = () => setR(0);

        wrap.addEventListener("mouseenter", handleEnter);
        wrap.addEventListener("mousemove", handleMove);
        wrap.addEventListener("mouseleave", handleLeave);

        return () => {
          gsap.ticker.remove(ticker);
          wrap.removeEventListener("mouseenter", handleEnter);
          wrap.removeEventListener("mousemove", handleMove);
          wrap.removeEventListener("mouseleave", handleLeave);
        };
      });
    },
    { scope: wrapRef }
  );

  return (
    <div
      ref={wrapRef}
      className={`hover-reveal ${className}`}
      style={{ "--reveal-radius": `${radius}px` } as React.CSSProperties}
      data-cursor-hide
    >
      <Tag className="hover-reveal__base">
        {lines.map((line, i) => (
          <span className="hover-reveal__line" key={i}>
            {line}
          </span>
        ))}
      </Tag>

      <div ref={maskRef} className="hover-reveal__mask" aria-hidden>
        {/* Exactly cancels the mask's outward inset so this inner box lines
            up with the base text's original bounds — the mask itself is
            bigger (for clip-path headroom), this keeps the overlay text
            from drifting or reflowing narrower. */}
        <div className="hover-reveal__mask-inner">
          <Tag className="hover-reveal__base hover-reveal__base--alt">
            {hoverLines.map((line, i) => (
              <span className="hover-reveal__line" key={i}>
                {line}
              </span>
            ))}
          </Tag>
        </div>
      </div>
    </div>
  );
}
