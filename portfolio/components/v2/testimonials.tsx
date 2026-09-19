"use client";

import { useRef, useState, useEffect } from "react";
import { gsap, useGSAP, REVEAL, REVEAL_START, MOTION_OK } from "@/lib/v2-gsap";
import "./testimonials.css";

const AUTO_ADVANCE_MS = 6000;

// Placeholder — swap in real client/collaborator quotes when available.
const QUOTES = [
  {
    quote:
      "Placeholder testimonial. Real quotes from clients and collaborators go here once available.",
    name: "Name Surname",
    role: "Role, Company",
  },
  {
    quote:
      "Placeholder testimonial. Real quotes from clients and collaborators go here once available.",
    name: "Name Surname",
    role: "Role, Company",
  },
  {
    quote:
      "Placeholder testimonial. Real quotes from clients and collaborators go here once available.",
    name: "Name Surname",
    role: "Role, Company",
  },
];

export function Testimonials() {
  const rootRef = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const [index, setIndex] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        gsap.from(".testimonials__reveal", {
          ...REVEAL,
          scrollTrigger: { trigger: rootRef.current, start: REVEAL_START },
        });
      });
    },
    { scope: rootRef }
  );

  useEffect(() => {
    if (!window.matchMedia(MOTION_OK).matches) return;
    // Keyed on `index` so a manual dot click resets the countdown instead of
    // being overridden by a coincidentally-timed auto-advance right after.
    const id = setTimeout(() => {
      setIndex((i) => (i + 1) % QUOTES.length);
    }, AUTO_ADVANCE_MS);
    return () => clearTimeout(id);
  }, [index]);

  useEffect(() => {
    if (!window.matchMedia(MOTION_OK).matches) return;
    gsap.fromTo(
      quoteRef.current,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
    );
  }, [index]);

  const active = QUOTES[index];

  return (
    <section className="testimonials section-shell" ref={rootRef}>
      <p className="section-label testimonials__reveal">Testimonials</p>

      <div className="testimonials__reveal">
        <blockquote className="testimonials__quote" ref={quoteRef}>
          <p className="display-statement testimonials__text">&ldquo;{active.quote}&rdquo;</p>
          <footer className="testimonials__attribution">
            <span className="testimonials__name">{active.name}</span>
            <span className="testimonials__role">{active.role}</span>
          </footer>
        </blockquote>

        <div className="testimonials__dots" role="tablist" aria-label="Choose testimonial">
          {QUOTES.map((_, i) => (
            <button
              key={i}
              className={`testimonials__dot${i === index ? " is-active" : ""}`}
              onClick={() => setIndex(i)}
              role="tab"
              aria-selected={i === index}
              aria-label={`Testimonial ${i + 1}`}
              data-cursor-hover
            />
          ))}
        </div>
      </div>
    </section>
  );
}
