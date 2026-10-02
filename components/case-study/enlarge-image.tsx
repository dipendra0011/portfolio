"use client";

import { useRef } from "react";
import { getSmoother } from "@/lib/gsap";

/** An image that opens full-screen in a native <dialog> when clicked.
 *  showModal() puts the dialog in the top layer, so it escapes
 *  ScrollSmoother's transformed content without any portal, traps focus,
 *  closes on Esc, and hands focus back to the trigger on close. */
export function EnlargeImage({ src, alt }: { src: string; alt: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const open = () => {
    dialogRef.current?.showModal();
    // The page behind would otherwise keep scrolling under the wheel.
    getSmoother()?.paused(true);
  };

  return (
    <>
      <button
        type="button"
        className="cs-enlarge"
        onClick={open}
        aria-haspopup="dialog"
        aria-label={alt ? `Enlarge image: ${alt}` : "Enlarge image"}
      >
        {/* alt="" — the button's label already names it, and the figure's
            caption follows; a second copy would be read out twice. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" loading="lazy" draggable={false} />
        <span className="cs-enlarge__hint" aria-hidden>
          <svg viewBox="0 0 16 16">
            <path d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5 9 7M2.5 13.5 7 9" />
          </svg>
        </span>
      </button>

      <dialog
        ref={dialogRef}
        className="cs-lightbox"
        aria-label={alt ? `Enlarged image: ${alt}` : "Enlarged image"}
        // Fires for Esc, the close button and backdrop clicks alike.
        onClose={() => getSmoother()?.paused(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialogRef.current?.close();
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} />
        <button
          type="button"
          className="cs-lightbox__close"
          onClick={() => dialogRef.current?.close()}
          autoFocus
        >
          Close
        </button>
      </dialog>
    </>
  );
}
