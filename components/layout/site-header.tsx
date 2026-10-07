"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { NavCount } from "@/components/layout/nav-count";
import { ISLAND_SPRING, SiteIsland, SOFT_EASE } from "@/components/layout/site-island";
import { RollText } from "@/components/motion/roll-text";
import { siteConfig } from "@/config/site";
import { useHeadroom } from "@/hooks/use-headroom";
import { useScrollHome } from "@/hooks/use-scroll-home";
import { cn } from "@/lib/cn";

const MOBILE_MENU_ID = "mobile-menu";

/* The bar gathers into the island as soon as the page scrolls this far (px). */
const ISLAND_OFFSET = 24;
/* Hidden while you scroll down; comes back after this long without scrolling (ms). */
const REVEAL_AFTER_MS = 4500;
/* How far the bar's side groups slide toward the centre as the island gathers them (px). */
const GATHER = 48;

// Each nav group sits on its own chip: invisible at the top of the page, a
// solid --bg panel once content scrolls underneath (keeps it legible).
const chip =
  "flex h-11 items-center rounded-[4px] px-3.5 transition-colors duration-[240ms] ease-nav";

/**
 * The full bar sits at the very top; the moment you scroll, it gathers into the island
 * (site-island.tsx). The header is hidden while you scroll down and comes
 * back when you scroll up or stay put for REVEAL_AFTER_MS. Pinned sections
 * also tuck it away (html[data-header-tucked]).
 */
export function SiteHeader() {
  const { scrolled, hidden } = useHeadroom({ offset: ISLAND_OFFSET, idleDelay: REVEAL_AFTER_MS });
  const [docked, setDocked] = useState(true);
  const [barWidth, setBarWidth] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const chipSurface = scrolled ? "bg-bg" : "bg-transparent";
  const headerRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const scrollHome = useScrollHome();
  const { scrollY } = useScroll();

  // A clicked nav link keeps focus after the route changes; left there, it
  // would hold the header on screen over the whole next page.
  useEffect(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement && headerRef.current?.contains(active)) {
      active.blur();
    }
  }, [pathname]);

  // The bar's width caps the island's open row on narrow screens, so track it.
  useEffect(() => {
    const measure = () => {
      setDocked(scrollY.get() < ISLAND_OFFSET);
      if (barRef.current) setBarWidth(barRef.current.offsetWidth);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, [pathname, scrollY]);

  useMotionValueEvent(scrollY, "change", (y) => setDocked(y < ISLAND_OFFSET));

  const groupTransition = reduceMotion
    ? { duration: 0 }
    : { default: ISLAND_SPRING, opacity: { duration: docked ? 0.6 : 0.45, ease: SOFT_EASE, delay: docked ? 0.1 : 0 } };
  const gather = (x: number, scale = 1) =>
    docked ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x, scale };

  return (
    <>
      {/* Hides on scroll down, returns on scroll up or after a few seconds
          without scrolling; pinned sections tuck it via html[data-header-tucked].
          Keyboard focus inside always brings it back so tabbing never lands
          on an offscreen link (:focus-visible, so a mouse click doesn't pin
          it). The header ignores the pointer outside its chips, so the page
          under the gaps stays clickable. */}
      <header
        ref={headerRef}
        className={cn(
          "pointer-events-none fixed inset-x-0 top-0 z-50 px-5 pt-5 md:px-[22px] md:pt-[17px]",
          "transition-transform duration-700 ease-out-expo has-[:focus-visible]:translate-y-0 motion-reduce:transition-none",
          hidden && !docked ? "-translate-y-[calc(100%+8px)]" : "translate-y-0",
        )}
      >
        <nav
          ref={barRef}
          aria-label="Primary"
          inert={!docked}
          className={cn(
            "grid grid-cols-[1fr_auto] items-center font-sans text-[18px] leading-none tracking-[-0.01em] text-fg md:grid-cols-[1fr_auto_1fr]",
            docked && "*:pointer-events-auto",
          )}
        >
          <motion.div initial={false} animate={gather(GATHER)} transition={groupTransition} className="justify-self-start">
            <Link href="/" onClick={scrollHome} className={cn(chip, chipSurface, "roll-trigger gap-2.5 pl-1.5")}>
              <Image
                src={siteConfig.avatar}
                alt=""
                width={32}
                height={32}
                className="size-8 rounded-full border border-line object-cover"
              />
              <RollText>{siteConfig.handle}</RollText>
            </Link>
          </motion.div>

          <motion.ul
            initial={false}
            animate={gather(0, 0.9)}
            transition={groupTransition}
            className={cn(chip, chipSurface, "hidden gap-2.5 md:flex")}
          >
            {siteConfig.nav.map((item) => (
              <li key={item.href} className="relative">
                {"soon" in item && item.soon ? (
                  <span
                    aria-disabled="true"
                    className="group inline-block cursor-default text-fg/60 outline-none"
                    tabIndex={0}
                  >
                    {item.label}
                    <span
                      role="tooltip"
                      className="pointer-events-none absolute top-full left-1/2 mt-3 -translate-x-1/2 whitespace-nowrap rounded-[4px] border border-line bg-bg px-2.5 py-1.5 text-[13px] text-fg opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
                    >
                      Coming soon
                    </span>
                  </span>
                ) : (
                  <Link href={item.href} className="roll-trigger group">
                    <RollText>{item.label}</RollText>
                    {"count" in item && item.count !== undefined && <NavCount count={item.count} />}
                  </Link>
                )}
              </li>
            ))}
          </motion.ul>

          <motion.div initial={false} animate={gather(-GATHER)} transition={groupTransition} className="justify-self-end">
            <Link href={siteConfig.contact.href} className={cn(chip, chipSurface, "roll-trigger hidden md:flex")}>
              <RollText>{siteConfig.contact.label}</RollText>
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls={MOBILE_MENU_ID}
              className={cn(chip, "roll-trigger border border-line bg-bg px-[18px] md:hidden")}
            >
              <RollText>Menu</RollText>
            </button>
          </motion.div>
        </nav>

        {/* Overlays the bar, centred on it, so the island appears where the bar's groups gather. */}
        <div className="absolute inset-x-0 top-5 flex justify-center md:top-[17px]">
          <SiteIsland docked={docked} barWidth={barWidth} />
        </div>
      </header>

      <MobileMenu id={MOBILE_MENU_ID} open={menuOpen} onClose={closeMenu} />
    </>
  );
}
