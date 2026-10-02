"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { NavCount } from "@/components/layout/nav-count";
import { RollText } from "@/components/motion/roll-text";
import { siteConfig } from "@/config/site";
import { useHeadroom } from "@/hooks/use-headroom";
import { cn } from "@/lib/cn";

const MOBILE_MENU_ID = "mobile-menu";

// Each nav group sits on its own chip: invisible at the top of the page, a
// solid --bg panel once content scrolls underneath (keeps it legible).
const chip =
  "flex h-11 items-center rounded-[4px] px-3.5 transition-colors duration-[240ms] ease-nav";

export function SiteHeader() {
  const { scrolled, hidden } = useHeadroom();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const chipSurface = scrolled ? "bg-bg" : "bg-transparent";
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  // A clicked nav link keeps focus after the route changes; left there, it
  // would hold the header on screen over the whole next page.
  useEffect(() => {
    const active = document.activeElement;
    if (active instanceof HTMLElement && headerRef.current?.contains(active)) {
      active.blur();
    }
  }, [pathname]);

  return (
    <>
      {/* Hides on scroll down, returns on scroll up. Keyboard focus inside
          always brings it back so tabbing never lands on an offscreen link.
          :focus-visible, not :focus-within — a mouse click on a link also
          focuses it, and that shouldn't pin the header open. */}
      <header
        ref={headerRef}
        className={cn(
          "fixed inset-x-0 top-0 z-50 px-5 pt-5 md:px-[22px] md:pt-[17px]",
          "transition-transform duration-500 ease-out-expo has-[:focus-visible]:translate-y-0 motion-reduce:transition-none",
          hidden && !menuOpen ? "-translate-y-[calc(100%+8px)]" : "translate-y-0",
        )}
      >
        <nav
          aria-label="Primary"
          className="grid grid-cols-[1fr_auto] items-center font-sans text-[18px] leading-none tracking-[-0.01em] text-fg md:grid-cols-[1fr_auto_1fr]"
        >
          <Link
            href="/"
            className={cn(
              chip,
              chipSurface,
              "roll-trigger justify-self-start gap-2.5 pl-1.5",
            )}
          >
            <Image
              src={siteConfig.avatar}
              alt=""
              width={32}
              height={32}
              className="size-8 rounded-full border border-line object-cover"
            />
            <RollText>{siteConfig.handle}</RollText>
          </Link>

          <ul className={cn(chip, chipSurface, "hidden gap-2.5 md:flex")}>
            {siteConfig.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="roll-trigger group">
                  <RollText>{item.label}</RollText>
                  {"count" in item && item.count !== undefined && (
                    <NavCount count={item.count} />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href={siteConfig.contact.href}
            className={cn(
              chip,
              chipSurface,
              "roll-trigger hidden justify-self-end md:flex",
            )}
          >
            <RollText>{siteConfig.contact.label}</RollText>
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-controls={MOBILE_MENU_ID}
            className={cn(
              chip,
              "roll-trigger justify-self-end border border-line bg-bg px-[18px] md:hidden",
            )}
          >
            <RollText>Menu</RollText>
          </button>
        </nav>
      </header>

      <MobileMenu id={MOBILE_MENU_ID} open={menuOpen} onClose={closeMenu} />
    </>
  );
}
