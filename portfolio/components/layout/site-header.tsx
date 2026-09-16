"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { SITE_NAV_ITEMS } from "@/lib/site-navigation";

const MotionLink = motion.create(Link);

type SitePrimaryNavLinkProps = {
  href: string;
  children: React.ReactNode;
  /** Horizontal sticky header vs vertical hero nav (Figma). */
  variant?: "horizontal" | "vertical";
  className?: string;
  onClick?: () => void;
};

/** Shared primary nav link — lime hover + animated underline. */
export function SitePrimaryNavLink({
  href,
  children,
  variant = "horizontal",
  className = "",
  onClick,
}: SitePrimaryNavLinkProps) {
  const isVertical = variant === "vertical";

  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        "group relative font-[family-name:var(--font-display)] font-medium uppercase text-muted",
        "transition-[color,transform] duration-200 ease-out",
        "hover:text-accent-lime focus-visible:text-accent-lime",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-lime/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isVertical
          ? "text-sm tracking-[0.1em] hover:-translate-x-1"
          : "text-xs tracking-[0.12em]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="relative inline-block">
        {children}
        <span
          aria-hidden
          className={[
            "absolute -bottom-0.5 h-px bg-accent-lime",
            "transition-[width,transform] duration-300 ease-[0.22,1,0.36,1]",
            "w-0 group-hover:w-full",
            isVertical ? "right-0 origin-right" : "left-0 origin-left",
          ].join(" ")}
        />
      </span>
    </Link>
  );
}

/** Compact sticky nav appears after scrolling this fraction of the viewport (0.3 = 30%). */
const STICKY_SCROLL_THRESHOLD_RATIO = 0.3;
/** Slightly lower than enter so the compact bar doesn't flicker at the threshold. */
const STICKY_SCROLL_EXIT_RATIO = 0.22;

function useHeaderMetrics(
  ref: React.RefObject<HTMLElement | null>,
  isCompact: boolean,
) {
  const [spacerHeight, setSpacerHeight] = useState(0);
  const isCompactRef = useRef(isCompact);
  isCompactRef.current = isCompact;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const h = el.offsetHeight;
      document.documentElement.style.setProperty(
        "--site-header-height",
        `${h}px`,
      );
      // Freeze spacer to the expanded height so compacting doesn't shift the page.
      if (!isCompactRef.current) {
        setSpacerHeight((prev) => (prev === h ? prev : h));
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty("--site-header-height");
    };
  }, [ref]);

  return spacerHeight;
}

export function SiteHeader() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const [pastFirstViewport, setPastFirstViewport] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const spacerHeight = useHeaderMetrics(headerRef, pastFirstViewport);

  /** Home: nav reveals after scroll (Figma). Other routes: always show full nav for in-app sections + future pages. */
  const isHomePage = pathname === "/";
  const showDesktopPrimaryNav = !isHomePage || pastFirstViewport;

  useEffect(() => {
    let ticking = false;

    const readScroll = () => {
      ticking = false;
      const y = window.scrollY;
      const vh = window.innerHeight || 1;
      const enterAt = vh * STICKY_SCROLL_THRESHOLD_RATIO;
      const exitAt = vh * STICKY_SCROLL_EXIT_RATIO;

      setPastFirstViewport((prev) => {
        const next = prev ? y > exitAt : y >= enterAt;
        return next === prev ? prev : next;
      });
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(readScroll);
    };

    readScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMobile();
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen, closeMobile]);

  return (
    <>
      <div
        aria-hidden
        className="w-full shrink-0"
        style={{ height: spacerHeight }}
      />

      <header
        ref={headerRef}
        className={[
          "fixed top-0 left-0 right-0 z-[100] w-full",
          "transition-[background-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          pastFirstViewport
            ? "shadow-[0_1px_0_0_rgba(38,38,38,0.9)]"
            : "shadow-none",
        ].join(" ")}
      >
        <div
          className={`transition-[background-color,backdrop-filter,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            pastFirstViewport
              ? "border-b border-surface-raised bg-background/95 backdrop-blur-md"
              : "border-b border-surface-raised bg-background"
          }`}
        >
          <div className="page-figma mx-auto max-w-figma">
            <div
              className={[
                "flex items-center justify-between gap-3",
                "transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                pastFirstViewport ? "py-3" : "py-7",
              ].join(" ")}
            >
              <Link
                href="/#hero"
                className="group flex shrink-0 items-center"
                aria-label="Dipendra Shrestha home"
                onClick={closeMobile}
              >
                {/* logo-header.png: width matches scaled intrinsic width (72×46 at this height) so nothing is cropped sideways */}
          <span className="relative block h-9 w-[56px] shrink-0 overflow-hidden sm:h-11 sm:w-[69px]">
                  <Image
                    src="/logo-header.png"
                    alt=""
                    width={72}
                    height={46}
                    className="h-full w-auto max-w-none invert select-none"
                    priority
                    draggable={false}
                  />
                </span>
              </Link>

              <AnimatePresence mode="wait">
                {showDesktopPrimaryNav ? (
                  <motion.nav
                    key="compact-nav"
                    className="hidden items-center gap-8 lg:flex"
                    aria-label="Primary"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 6 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {SITE_NAV_ITEMS.map((item) => (
                      <SitePrimaryNavLink key={item.href} href={item.href}>
                        {item.label}
                      </SitePrimaryNavLink>
                    ))}
                  </motion.nav>
                ) : null}
              </AnimatePresence>

              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <MagneticButton>
                <MotionLink
                  href="/contact"
                  className="relative flex h-10 items-center justify-center rounded-full border border-foreground bg-foreground px-4 outline outline-2 outline-offset-[-2px] outline-foreground transition-opacity hover:opacity-90 sm:h-12 sm:px-6"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <span className="font-[family-name:var(--font-instrument)] text-sm font-normal uppercase leading-5 text-background sm:text-[17.6px]">
                    Let&apos;s talk
                  </span>
                </MotionLink>
                </MagneticButton>

                <MagneticButton>
                <motion.button
                  ref={menuButtonRef}
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-nav bg-surface text-foreground transition-colors hover:bg-surface-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-lime lg:hidden"
                  aria-expanded={mobileOpen}
                  aria-controls={panelId}
                  aria-label={mobileOpen ? "Close menu" : "Open menu"}
                  onClick={() => setMobileOpen((o) => !o)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {mobileOpen ? (
                    <X className="size-5" strokeWidth={1.75} aria-hidden />
                  ) : (
                    <Menu className="size-5" strokeWidth={1.75} aria-hidden />
                  )}
                </motion.button>
                </MagneticButton>
              </div>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            key="mobile-nav-layer"
            className="fixed inset-0 z-[90] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
              onClick={closeMobile}
            />
            <motion.div
              id={panelId}
              role="dialog"
              aria-modal="true"
              aria-label="Site navigation"
              className="absolute inset-x-0 bottom-0 flex max-h-[min(85vh,calc(100%-var(--site-header-height,4rem)))] flex-col border-t border-surface-raised bg-background"
              style={{ top: "var(--site-header-height, 4rem)" }}
              initial={{ y: 28, opacity: 0.95 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0.95 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
            >
              <div className="page-figma flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain py-8">
                <nav className="flex flex-col gap-1" aria-label="Mobile primary">
                  {SITE_NAV_ITEMS.map((item, i) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.05, duration: 0.25 }}
                    >
                      <Link
                        href={item.href}
                        className="block rounded-xl px-4 py-4 font-[family-name:var(--font-display)] text-lg font-semibold uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-surface hover:text-accent-lime"
                        onClick={closeMobile}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
                <div className="mt-auto shrink-0 border-t border-border-grey pt-8">
                  <MagneticButton className="flex w-full">
                  <MotionLink
                    href="/contact"
                    className="flex h-12 w-full items-center justify-center rounded-full border border-foreground bg-foreground outline outline-2 outline-offset-[-2px] outline-foreground"
                    onClick={closeMobile}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    <span className="font-[family-name:var(--font-instrument)] text-[17.6px] font-normal uppercase text-background">
                      Let&apos;s talk
                    </span>
                  </MotionLink>
                  </MagneticButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
