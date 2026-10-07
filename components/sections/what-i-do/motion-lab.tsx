import type { CSSProperties, ReactNode } from "react";
import "./motion-lab.css";

/* Each code line types out over its own length in characters. */
const chars = (n: number) => ({ "--chars": n }) as CSSProperties;

/* The site's own curve ("lusion", lib/gsap.ts), drawn in a 100 x 60 box:
   cubic-bezier(.35, 0, 0, 1) with y flipped for SVG. */
const LUSION_PATH = "M0 60 C35 60 0 0 100 0";

/* Craft demos: techniques this site is built with. */
const ease = (
  <div className="lab-ease">
    <svg viewBox="-4 -4 108 68" className="lab-ease__graph">
      <path d="M0 60H100M0 60V0" className="lab-ease__axis" />
      <path d={LUSION_PATH} pathLength={1} className="lab-ease__curve" />
    </svg>
    <div className="lab-ease__track">
      <span className="lab-ease__dot" />
    </div>
  </div>
);

const spring = (
  <div className="lab-spring">
    <span className="lab-spring__shadow" />
    <span className="lab-spring__box" />
  </div>
);

const mask = (
  <div className="lab-mask">
    {["Design for", "the person", "and the engineer."].map((line, i) => (
      <span key={line} className="lab-mask__line">
        <span className="lab-mask__text" style={{ animationDelay: `${i * 0.12}s` }}>
          {line}
        </span>
      </span>
    ))}
  </div>
);

const morph = (
  <div className="lab-morph">
    <span className="lab-morph__pill">
      <span className="lab-morph__avatar" />
      <span className="lab-morph__link" />
      <span className="lab-morph__link" />
      <span className="lab-morph__cta" />
    </span>
  </div>
);

const code = (
  <pre className="lab-code">
    <span className="lab-code__line" style={chars(18)}>
      gsap.to(&quot;.card&quot;, {"{"}
    </span>
    <span className="lab-code__line" style={chars(7)}>
      {"  "}y: <em>0</em>,
    </span>
    <span className="lab-code__line" style={chars(17)}>
      {"  "}ease: <em>&quot;lusion&quot;</em>,
    </span>
    <span className="lab-code__line lab-code__line--last" style={chars(3)}>
      {"});"}
    </span>
  </pre>
);

const cube = (
  <div className="lab-cube">
    <div className="lab-cube__body">
      {["front", "back", "right", "left", "top", "bottom"].map((face) => (
        <span key={face} className={`lab-cube__face lab-cube__face--${face}`} />
      ))}
    </div>
  </div>
);

/* Everyday moments: the small interactions people use all day. */
const like = (
  <div className="lab-like">
    {Array.from({ length: 6 }, (_, i) => (
      <span key={i} className="lab-like__spark" style={{ "--a": `${i * 60}deg` } as CSSProperties} />
    ))}
    <span className="lab-like__heart" />
  </div>
);

const toggle = (
  <div className="lab-toggle">
    <span className="lab-toggle__knob" />
  </div>
);

const check = (
  <div className="lab-check">
    <span className="lab-check__box">
      <span className="lab-check__tick" />
    </span>
    <span className="lab-check__text">Ship it</span>
  </div>
);

const typing = (
  <div className="lab-typing">
    {[0, 1, 2].map((i) => (
      <span key={i} className="lab-typing__dot" style={{ animationDelay: `${i * 0.15}s` }} />
    ))}
  </div>
);

const toast = (
  <div className="lab-toast">
    <span className="lab-toast__card">
      <span className="lab-toast__text">Changes saved</span>
      <span className="lab-toast__action">Undo</span>
      <span className="lab-toast__timer" />
    </span>
  </div>
);

const skeleton = (
  <div className="lab-skeleton">
    <span className="lab-skeleton__avatar" />
    <span className="lab-skeleton__lines">
      <span className="lab-skeleton__bar" />
      <span className="lab-skeleton__bar lab-skeleton__bar--short" />
    </span>
  </div>
);

/* Reading order, row by row on a 4 x 3 board. Craft and everyday moments are
   mixed so neither reads as a block; a phone shows only the first three. */
const TILES: { key: string; demo: ReactNode }[] = [
  { key: "like", demo: like },
  { key: "ease", demo: ease },
  { key: "toggle", demo: toggle },
  { key: "mask", demo: mask },
  { key: "check", demo: check },
  { key: "morph", demo: morph },
  { key: "typing", demo: typing },
  { key: "spring", demo: spring },
  { key: "toast", demo: toast },
  { key: "code", demo: code },
  { key: "skeleton", demo: skeleton },
  { key: "cube", demo: cube },
];

/**
 * "Motion and frontend" visual: a board of small live demos, so the visual is
 * the skill. Half are techniques this site is built with, half are the
 * everyday interactions people meet all day. Pure CSS (motion-lab.css); every
 * element's base style is its finished state, so reduced motion simply shows
 * a still board. Decorative, like the other disciplines' images.
 */
export function MotionLab() {
  return (
    <div className="lab" aria-hidden>
      {/* Dividers as their own lines, so each can fade out at its ends. */}
      <span className="lab__rules">
        <span className="lab__rule lab__rule--v lab__rule--1" />
        <span className="lab__rule lab__rule--v lab__rule--2" />
        <span className="lab__rule lab__rule--v lab__rule--3" />
        <span className="lab__rule lab__rule--h lab__rule--1" />
        <span className="lab__rule lab__rule--h lab__rule--2" />
      </span>
      {TILES.map(({ key, demo }) => (
        <div key={key} className="lab__tile">
          {demo}
        </div>
      ))}
    </div>
  );
}
