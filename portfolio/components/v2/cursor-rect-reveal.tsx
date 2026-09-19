"use client";

import { useRef } from "react";
import { gsap, useGSAP, MOTION_OK } from "@/lib/v2-gsap";
import "./cursor-rect-reveal.css";

type CursorRectRevealProps = {
  as?: "h1" | "h2" | "h3" | "span" | "div";
  className?: string;
  text: React.ReactNode;
  // Shown in the revealed overlay instead of `text`, when the two should
  // differ (History's role -> altRole swap). Defaults to `text` so every
  // other caller (a single-text reveal) is unaffected.
  altText?: React.ReactNode;
};

export function CursorRectReveal({
  as: Tag = "h3",
  className = "",
  text,
  altText,
}: CursorRectRevealProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      const wrap = wrapRef.current;
      const mask = maskRef.current;
      if (!wrap || !mask) return;

      mm.add(MOTION_OK, () => {
        // Full coverage, no mouse tracking — just open/close the whole box.
        gsap.set(mask, { clipPath: "inset(0 100% 0 0)" });

        const open = gsap.to(mask, {
          clipPath: "inset(0 0% 0 0)",
          duration: 0.4,
          ease: "power3.out",
          paused: true,
        });

        const handleEnter = () => open.play();
        const handleLeave = () => open.reverse();

        wrap.addEventListener("mouseenter", handleEnter);
        wrap.addEventListener("mouseleave", handleLeave);

        return () => {
          wrap.removeEventListener("mouseenter", handleEnter);
          wrap.removeEventListener("mouseleave", handleLeave);
        };
      });
    },
    { scope: wrapRef }
  );

  return (
    <div ref={wrapRef} className={`cursor-rect-reveal ${className}`}>
      <Tag className="cursor-rect-reveal__base">{text}</Tag>
      <div ref={maskRef} className="cursor-rect-reveal__mask" aria-hidden>
        <Tag className="cursor-rect-reveal__base cursor-rect-reveal__base--alt">
          {altText ?? text}
        </Tag>
      </div>
    </div>
  );
}
