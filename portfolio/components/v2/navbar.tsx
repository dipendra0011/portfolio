"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, getSmoother } from "@/lib/v2-gsap";
import "./navbar.css";

const LINKS = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

function scrollToHash(href: string) {
  const target = document.querySelector(href);
  if (!target) return;
  const smoother = getSmoother();
  if (smoother) {
    smoother.scrollTo(target, true, "top top");
  } else {
    target.scrollIntoView();
  }
}

function NavLink({
  label,
  href,
  linkRef,
  progressRef,
}: {
  label: string;
  href: string;
  linkRef: (el: HTMLAnchorElement | null) => void;
  progressRef: (el: HTMLSpanElement | null) => void;
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToHash(href);
  };

  return (
    <a className="nav-link" href={href} onClick={handleClick} ref={linkRef} data-cursor-hover>
      <span className="nav-link__row">
        <span className="nav-link__text nav-link__text--top">{label}</span>
        <span className="nav-link__text nav-link__text--bottom" aria-hidden="true">
          {label}
        </span>
      </span>
      <span className="nav-link__progress" ref={progressRef}></span>
    </a>
  );
}

export function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const progressRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  useGSAP(
    () => {
      LINKS.forEach(({ href }) => {
        const section = document.querySelector(href);
        const link = linkRefs.current[href];
        const progress = progressRefs.current[href];
        if (!section || !link || !progress) return;

        gsap.fromTo(
          progress,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          }
        );

        ScrollTrigger.create({
          trigger: section,
          start: "top center",
          end: "bottom center",
          toggleClass: { targets: link, className: "is-active" },
        });
      });
    },
    { scope: navRef }
  );

  return (
    <nav className="navbar" ref={navRef}>
      <div className="navbar__inner">
        <a
          href="#home"
          className="navbar__logo"
          data-cursor-hover
          aria-label="Home"
          onClick={(e) => {
            e.preventDefault();
            const smoother = getSmoother();
            if (smoother) smoother.scrollTo(0, true);
            else window.scrollTo(0, 0);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/v2/logo.svg" alt="" />
        </a>

        <ul className="navbar__links">
          {LINKS.map((link) => (
            <li key={link.label}>
              <NavLink
                {...link}
                linkRef={(el) => (linkRefs.current[link.href] = el)}
                progressRef={(el) => (progressRefs.current[link.href] = el)}
              />
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
