import type { CSSProperties } from "react";
import "./roll-text.css";

/**
 * Text that rolls letter-by-letter when its `.roll-trigger` ancestor is
 * hovered or focused. Screen readers get the plain string, not the letters.
 */
export function RollText({ children }: { children: string }) {
  return (
    <>
      <span className="sr-only">{children}</span>
      <span aria-hidden className="roll-text">
        {Array.from(children).map((char, i) => (
          <span
            // Characters never reorder, so the index is a stable key
            key={i}
            className="roll-text__char"
            style={{ "--i": i } as CSSProperties}
          >
            {char}
          </span>
        ))}
      </span>
    </>
  );
}
