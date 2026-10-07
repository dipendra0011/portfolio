"use client";

/*
 * Glass nav island: what the header becomes once the page scrolls. The header
 * hides it while you scroll down and brings it back when you scroll up or
 * stay put (site-header.tsx); this component only draws it and fades it in.
 *
 * Motion approach (a container springing between fixed sizes) adapted from
 * Cult UI's Dynamic Island, MIT licensed, with softer springs and a
 * frosted-glass skin:
 * https://github.com/nolly-studio/cult-ui (apps/www/registry/default/ui/dynamic-island.tsx)
 */

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { NavCount } from "@/components/layout/nav-count";
import { RollText } from "@/components/motion/roll-text";
import { siteConfig } from "@/config/site";
import { useScrollHome } from "@/hooks/use-scroll-home";
import "./island.css";

/* A long, soft settle with no overshoot. Duration-based, so tuning feel is one number. */
export const ISLAND_SPRING = { type: "spring", visualDuration: 0.9, bounce: 0 } as const;
/* Fades follow a gentle ease-out so the island materialises rather than pops. */
export const SOFT_EASE = [0.22, 1, 0.36, 1] as const;

const HEIGHT = 48;
/* Half the height: a full pill, like the real island. */
const RADIUS = HEIGHT / 2;
const WIDTH = 356;
const AVATAR_INSET = 7;
const AVATAR_SIZE = HEIGHT - AVATAR_INSET * 2;

const link =
  "roll-trigger group flex h-10 items-center rounded-full px-3.5 text-[16px] leading-none text-fg transition-colors duration-[240ms] ease-nav hover:bg-fg/5 focus-visible:bg-fg/5";

type Props = {
  /** The full bar is showing (top of the page); the island is hidden behind it. */
  docked: boolean;
  /** Width of the docked bar; caps the island on narrow screens. */
  barWidth: number;
};

export function SiteIsland({ docked, barWidth }: Props) {
  const reduceMotion = useReducedMotion();
  const scrollHome = useScrollHome();

  return (
    <motion.nav
      aria-label="Primary"
      inert={docked}
      // Server render and first paint are docked (hidden); it only ever animates from there.
      initial={{ opacity: 0, scale: 0.94, y: -6, filter: "blur(6px)" }}
      animate={
        docked
          ? { opacity: 0, scale: 0.94, y: -6, filter: "blur(6px)" }
          : { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }
      }
      transition={
        reduceMotion
          ? { duration: 0 }
          : {
              default: ISLAND_SPRING,
              // Waits a beat for the bar to clear, then eases in.
              opacity: { duration: 0.7, ease: SOFT_EASE, delay: docked ? 0 : 0.12 },
              filter: { duration: 0.7, ease: SOFT_EASE, delay: docked ? 0 : 0.12 },
            }
      }
      style={{ width: Math.min(WIDTH, barWidth || WIDTH), height: HEIGHT, borderRadius: RADIUS }}
      className={`island-glass relative flex items-center justify-between gap-1 overflow-hidden pr-1 font-sans tracking-[-0.01em] text-fg ${
        docked ? "pointer-events-none" : "pointer-events-auto"
      }`}
    >
      <Link
        href="/"
        aria-label={siteConfig.name}
        onClick={scrollHome}
        className="relative shrink-0 rounded-[inherit] outline-none focus-visible:ring-2 focus-visible:ring-fg/40 focus-visible:ring-inset"
        style={{ width: HEIGHT, height: HEIGHT }}
      >
        <Image
          src={siteConfig.avatar}
          alt=""
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
          className="absolute rounded-full border border-line object-cover"
          style={{ left: AVATAR_INSET, top: AVATAR_INSET, width: AVATAR_SIZE, height: AVATAR_SIZE }}
        />
      </Link>

      {siteConfig.nav.map((item) => (
        <Link key={item.href} href={item.href} className={link}>
          <RollText>{item.label}</RollText>
          {"count" in item && item.count !== undefined && <NavCount count={item.count} />}
        </Link>
      ))}

      <Link
        href={siteConfig.contact.href}
        className="roll-trigger group flex h-10 items-center justify-center rounded-full bg-fg px-5 text-[16px] leading-none text-bg transition-opacity duration-[240ms] ease-nav hover:opacity-90 focus-visible:opacity-90"
      >
        <RollText>{siteConfig.contact.label}</RollText>
      </Link>
    </motion.nav>
  );
}
