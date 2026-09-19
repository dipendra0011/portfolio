"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MOTION_OK } from "@/lib/v2-gsap";
import "./background-ripple-effect.css";

const CELL_SIZE = 56;
// Matches the hero timeline's own initial delay (see hero.tsx) so the
// ripple and the "DIPENDRA SHREST" kicker text start animating together
// instead of the ripple visibly lagging behind.
const AUTO_PLAY_DELAY_MS = 150;

// No window/document listeners anywhere in this component — every cell
// owns its own onClick, scoped to that cell alone, so there's nothing here
// that could ever race with hover-reveal-text's own mousemove/mouseenter/
// mouseleave handlers on the headline.
export function BackgroundRippleEffect() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [grid, setGrid] = useState({ rows: 0, cols: 0 });
  const [clickedCell, setClickedCell] = useState<{ row: number; col: number } | null>(null);
  const [rippleKey, setRippleKey] = useState(0);
  const hasAutoPlayedRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      setGrid({
        cols: Math.ceil(width / CELL_SIZE) + 1,
        rows: Math.ceil(height / CELL_SIZE) + 1,
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Fires one ripple automatically, shortly after the grid is first
  // measured, so it draws attention on load instead of waiting to be
  // discovered by a click. Guarded so a later resize (which re-runs the
  // measure effect above and can change grid.rows/cols) never re-triggers
  // it — this is meant to happen exactly once per page load.
  useEffect(() => {
    if (hasAutoPlayedRef.current) return;
    if (grid.rows === 0 || grid.cols === 0) return;
    if (!window.matchMedia(MOTION_OK).matches) return;

    hasAutoPlayedRef.current = true;
    const id = setTimeout(() => {
      setClickedCell({ row: 0, col: Math.floor(grid.cols / 2) });
      setRippleKey((k) => k + 1);
    }, AUTO_PLAY_DELAY_MS);

    return () => clearTimeout(id);
  }, [grid.rows, grid.cols]);

  const cells = useMemo(
    () => Array.from({ length: grid.rows * grid.cols }, (_, i) => i),
    [grid.rows, grid.cols]
  );

  return (
    <div ref={containerRef} className="background-ripple" aria-hidden="true">
      <div
        key={rippleKey}
        className="background-ripple__grid"
        style={{ gridTemplateColumns: `repeat(${grid.cols}, ${CELL_SIZE}px)` }}
      >
        {cells.map((idx) => {
          const rowIdx = Math.floor(idx / grid.cols);
          const colIdx = idx % grid.cols;
          const distance = clickedCell
            ? Math.hypot(clickedCell.row - rowIdx, clickedCell.col - colIdx)
            : 0;
          const delay = clickedCell ? Math.max(0, distance * 55) : 0; // ms
          const duration = 250 + distance * 80; // ms

          return (
            <div
              key={idx}
              className={`background-ripple__cell${clickedCell ? " is-rippling" : ""}`}
              style={
                clickedCell
                  ? ({
                      "--delay": `${delay}ms`,
                      "--duration": `${duration}ms`,
                    } as React.CSSProperties)
                  : undefined
              }
              onClick={() => {
                setClickedCell({ row: rowIdx, col: colIdx });
                setRippleKey((k) => k + 1);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
