"use client";

import { useRef } from "react";
import { gsap, useGSAP, REVEAL, REVEAL_START, MOTION_OK } from "@/lib/v2-gsap";
import { ArrowUpRight } from "./arrow-up-right";
import "./cta.css";

export function CTA() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        gsap.from(".cta__reveal", {
          ...REVEAL,
          scrollTrigger: { trigger: rootRef.current, start: REVEAL_START },
        });
      });
    },
    { scope: rootRef }
  );

  return (
    <section className="cta section-shell" id="contact" ref={rootRef}>
      <a href="mailto:dipendra@example.com" className="cta__link cta__reveal" data-cursor-magnetic>
        <h2 className="display-statement cta__headline">
          Let&apos;s make
          <br />
          something move.
        </h2>
        <ArrowUpRight size={72} className="cta__arrow" />
      </a>
    </section>
  );
}
