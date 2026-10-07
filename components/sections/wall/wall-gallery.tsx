"use client";

/*
 * The wall's drawings in loose columns. Clicking one opens it big in a
 * viewer you can flip through: arrow buttons, ← → keys, or a swipe on touch.
 * Esc, the close button or a click outside the drawing closes it. The page
 * behind stops scrolling while it's open.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeftIcon, ArrowRightIcon, XIcon } from "@phosphor-icons/react";
import { getSmoother } from "@/lib/gsap";

export type WallDrawing = { url: string; pathname: string; date: string };

/* A horizontal swipe longer than this (px) flips to the next drawing. */
const SWIPE = 48;

export function WallGallery({ drawings }: { drawings: WallDrawing[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const count = drawings.length;
  const isOpen = open !== null;

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((by: number) => setOpen((i) => (i === null ? i : (i + by + count) % count)), [count]);

  // While open: keys, no page scroll, focus inside; focus goes back after.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    const smoother = getSmoother();
    smoother?.paused(true);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      smoother?.paused(false);
      document.body.style.overflow = overflow;
    };
  }, [isOpen, close, step]);

  useEffect(() => {
    if (isOpen) closeRef.current?.focus({ preventScroll: true });
    else opener.current?.focus({ preventScroll: true });
  }, [isOpen]);

  // Warm the neighbours, so flipping doesn't wait on the network.
  useEffect(() => {
    if (open === null || count < 2) return;
    [1, -1].forEach((d) => {
      const img = new Image();
      img.src = drawings[(open + d + count) % count].url;
    });
  }, [open, count, drawings]);

  const current = open === null ? null : drawings[open];

  return (
    <>
      <ul className="wall__grid">
        {drawings.map((d, i) => (
          <li key={d.pathname} className="wall__item">
            <button
              type="button"
              className="wall__open"
              aria-label={`Open drawing ${i + 1} of ${count}`}
              onClick={(e) => {
                opener.current = e.currentTarget;
                setOpen(i);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={d.url} alt="" loading="lazy" decoding="async" />
            </button>
            <p className="wall__date">{d.date}</p>
          </li>
        ))}
      </ul>

      {current &&
        createPortal(
          <div
            className="wall-viewer"
            role="dialog"
            aria-modal="true"
            aria-label={`Drawing ${open! + 1} of ${count}`}
            onClick={(e) => e.target === e.currentTarget && close()}
            onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              touchX.current = null;
              if (Math.abs(dx) > SWIPE) step(dx < 0 ? 1 : -1);
            }}
          >
            <div className="wall-viewer__bar">
              <span className="wall-viewer__count">
                {open! + 1} / {count}
              </span>
              <span className="wall-viewer__date">{current.date}</span>
              <button ref={closeRef} type="button" className="wall-viewer__btn" aria-label="Close" onClick={close}>
                <XIcon weight="bold" />
              </button>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={current.url} className="wall-viewer__img" src={current.url} alt="A visitor's drawing" />

            {count > 1 && (
              <>
                <button
                  type="button"
                  className="wall-viewer__btn wall-viewer__nav wall-viewer__nav--prev"
                  aria-label="Previous drawing"
                  onClick={() => step(-1)}
                >
                  <ArrowLeftIcon weight="bold" />
                </button>
                <button
                  type="button"
                  className="wall-viewer__btn wall-viewer__nav wall-viewer__nav--next"
                  aria-label="Next drawing"
                  onClick={() => step(1)}
                >
                  <ArrowRightIcon weight="bold" />
                </button>
              </>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
