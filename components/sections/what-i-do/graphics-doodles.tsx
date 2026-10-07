"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { MOTION_OK } from "@/lib/gsap";
import "./graphics-doodles.css";

const DIR = "/what-i-do/graphics/doodles";

/* Pop-in order. */
const order = (i: number) => ({ "--i": i }) as CSSProperties;

/**
 * "Graphics" visual, from the owner's sketch: a designer's canvas. A small
 * doodle sits selected in a Figma-style frame whose size badge counts as the
 * frame slowly resizes; the big UI-window doodle tilts and floats; the
 * owner's own portrait doodle bobs in the corner. Pure CSS motion
 * (graphics-doodles.css); they pop in once the panel is on screen. Sized to
 * the media slot like the motion lab, so the accordion's sweep reveals it as
 * a window.
 */
export function GraphicsDoodles() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !window.matchMedia(MOTION_OK).matches) return;
    root.classList.add("doodles--armed");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        root.classList.add("is-in");
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(root);
    return () => {
      observer.disconnect();
      root.classList.remove("doodles--armed", "is-in");
    };
  }, []);

  return (
    <div ref={rootRef} className="doodles" aria-hidden>
      {/* Selected in a design tool: frame, handles and a live size badge. */}
      <span className="doodle doodle--select" style={order(0)}>
        <span className="select">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${DIR}/camera.svg`} alt="" className="select__art" draggable={false} />
          <span className="select__frame">
            <span className="select__handle select__handle--tl" />
            <span className="select__handle select__handle--tr" />
            <span className="select__handle select__handle--bl" />
            <span className="select__handle select__handle--br" />
          </span>
          <span className="select__size" />
        </span>
      </span>

      <span className="doodle doodle--ui-window" style={order(1)}>
        <span className="doodle__motion doodle__motion--tilt">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${DIR}/ui-window.svg`} alt="" draggable={false} />
        </span>
      </span>

      <span className="doodle doodle--portrait" style={order(2)}>
        <span className="doodle__motion doodle__motion--bob">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${DIR}/portrait.svg`} alt="" draggable={false} />
        </span>
      </span>
    </div>
  );
}
