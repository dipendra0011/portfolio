"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { MOTION_OK } from "@/lib/gsap";
import type { PhoneScene } from "./phone-scene";
import { LEFT_PEEP_SVG, RIGHT_PEEP_SVG, SITTER_SVG } from "./stage-peeps";
import "./graphics-desk.css";

/* The phone's screen (cropped from the owner's capture), and the whole
   capture with its own phone frame for when WebGL isn't available. */
const SCREEN = "/what-i-do/graphics/post-screen.webp";
const FALLBACK = "/what-i-do/graphics/post-phone.webp";

/* Entrance order: each person settles this many steps after the first. */
const order = (i: number) => ({ "--i": i }) as CSSProperties;

/* How long the entrance takes to play out (ms), longest transition plus delay. */
const SETTLE_MS = 2400;

/**
 * "Graphics" visual: the a-OK launch post on a real 3D phone (WebGL,
 * phone-scene.ts) at the centre, with people around it: one looking at it
 * from each side and one sitting on the floor beside it.
 *
 * The phone leans toward the cursor and sways; the people drift with the
 * cursor at their own depths (CSS vars), the ones in front travelling
 * further than those further back. With motion on, everything settles in once the panel
 * is actually on screen, and the phone only renders while it is. Sized to the
 * media slot like the motion lab, so the accordion's sweep reveals it as a
 * window. No WebGL: the owner's own phone capture shows instead.
 */
export function GraphicsDesk() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [glFailed, setGlFailed] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const reduceMotion = !window.matchMedia(MOTION_OK).matches;
    if (!reduceMotion) root.classList.add("stage--armed");

    let phone: PhoneScene | null = null;
    let disposed = false;
    let entered = false;
    let visible = false;
    let settle: ReturnType<typeof setTimeout> | undefined;

    const enter = () => {
      if (entered) return;
      entered = true;
      root.classList.add("is-in");
      phone?.enter();
      // Once the entrance has played, drop its staggered transitions so the
      // parallax answers the cursor without the entrance delays.
      settle = setTimeout(() => root.classList.remove("stage--armed"), SETTLE_MS);
    };

    import("./phone-scene")
      .then(({ createPhoneScene }) => createPhoneScene({ canvas, screenImage: SCREEN, reduceMotion }))
      .then((scene) => {
        if (disposed) return scene.dispose();
        phone = scene;
        phone.setActive(visible);
        if (entered) phone.enter();
      })
      .catch(() => {
        if (!disposed) setGlFailed(true);
      });

    // In view: settle in once, and only render the phone while it's showing.
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        phone?.setActive(visible);
        if (visible) enter();
      },
      { threshold: 0.35 },
    );
    observer.observe(root);

    // Parallax: the cursor's position over the stage as -1..1 on each axis.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 2 - 1;
      const y = ((e.clientY - r.top) / r.height) * 2 - 1;
      root.style.setProperty("--px", x.toFixed(3));
      root.style.setProperty("--py", y.toFixed(3));
      phone?.setPointer(x, y);
    };
    const onLeave = () => {
      root.style.setProperty("--px", "0");
      root.style.setProperty("--py", "0");
      phone?.setPointer(0, 0);
    };
    if (fine && !reduceMotion) {
      root.addEventListener("pointermove", onMove);
      root.addEventListener("pointerleave", onLeave);
    }

    return () => {
      disposed = true;
      clearTimeout(settle);
      observer.disconnect();
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      root.classList.remove("stage--armed", "is-in");
      phone?.dispose();
    };
  }, []);

  return (
    <div ref={rootRef} className="stage" aria-hidden>
      <div className="stage-phone">
        <span className="stage-phone__shadow" />
        {glFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={FALLBACK} alt="" className="stage-phone__fallback" draggable={false} />
        ) : (
          <canvas ref={canvasRef} className="stage-phone__canvas" />
        )}
      </div>

      {/* Front: looking at the phone from both sides, and sitting beside it. */}
      <div className="stage__layer stage-peep-left" style={order(0)}>
        <div dangerouslySetInnerHTML={{ __html: LEFT_PEEP_SVG }} />
      </div>
      <div className="stage__layer stage-peep-right" style={order(1)}>
        <div dangerouslySetInnerHTML={{ __html: RIGHT_PEEP_SVG }} />
      </div>
      <div className="stage__layer stage-sitter" style={order(2)}>
        <div dangerouslySetInnerHTML={{ __html: SITTER_SVG }} />
      </div>
    </div>
  );
}
