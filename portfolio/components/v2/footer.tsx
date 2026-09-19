"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK } from "@/lib/v2-gsap";
import "./footer.css";

export function Footer() {
  const year = new Date().getFullYear();
  const footerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        ScrollTrigger.create({
          trigger: footerRef.current,
          start: "top 95%",
          once: true,
          onEnter: (self) => {
            const speed = Math.abs(self.getVelocity());
            const intensity = gsap.utils.clamp(0, 1, gsap.utils.mapRange(0, 2500, 0, 1, speed));

            gsap.fromTo(
              textRef.current,
              {
                y: 30 + intensity * 50,
                scale: 0.9 - intensity * 0.1,
                opacity: 0,
              },
              {
                y: 0,
                scale: 1,
                opacity: 1,
                duration: 0.8 + intensity * 0.5,
                ease: `elastic.out(1, ${0.4 - intensity * 0.15})`,
              }
            );
          },
        });
      });
    },
    { scope: footerRef }
  );

  return (
    <footer className="footer" ref={footerRef}>
      <p className="footer__copyright" ref={textRef}>
        &copy;{year} Dipendra Shrestha
      </p>
    </footer>
  );
}
