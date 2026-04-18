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
import { SITE_NAV_ITEMS } from "@/lib/site-navigation";

/** Compact sticky nav appears after scrolling this fraction of the viewport (0.3 = 30%). */
const STICKY_SCROLL_THRESHOLD_RATIO = 0.3;

function useViewportHeight() {
  const [vh, setVh] = useState(0);

  useLayoutEffect(() => {
    const update = () => setVh(window.innerHeight);
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  return vh;
}

function useHeaderHeight(ref: React.RefObject<HTMLElement | null>) {
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const h = el.offsetHeight;
      setHeight(h);
      document.documentElement.style.setProperty(
        "--site-header-height",
        `${h}px`,
      );
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty("--site-header-height");
    };
  }, [ref]);

  return height;
}

export function SiteHeader() {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const headerHeight = useHeaderHeight(headerRef);
  const viewportH = useViewportHeight();

  const [scrollY, setScrollY] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollThresholdPx = viewportH * STICKY_SCROLL_THRESHOLD_RATIO;
  const pastFirstViewport =
    viewportH > 0 && scrollY >= scrollThresholdPx - 0.5;
  /** Home: nav reveals after scroll (Figma). Other routes: always show full nav for in-app sections + future pages. */
  const isHomePage = pathname === "/";
  const showDesktopPrimaryNav = !isHomePage || pastFirstViewport;

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
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
      {pastFirstViewport ? (
        <div
          aria-hidden
          className="w-full shrink-0"
          style={{ height: headerHeight }}
        />
      ) : null}

      <motion.header
        ref={headerRef}
        layout
        className={
          pastFirstViewport
            ? "fixed top-0 left-0 right-0 z-[100] w-full"
            : "relative z-40 w-full border-b border-surface-raised bg-background"
        }
        initial={false}
        animate={{
          y: pastFirstViewport ? 0 : 0,
          opacity: 1,
          boxShadow: pastFirstViewport
            ? "0 1px 0 0 rgba(38, 38, 38, 0.9)"
            : "0 0 0 0 rgba(0,0,0,0)",
        }}
        transition={{
          layout: { type: "spring", stiffness: 380, damping: 38 },
          boxShadow: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
        }}
      >
        <motion.div
          layout
          className={`transition-[background-color,backdrop-filter,border-color] duration-300 ease-out ${
            pastFirstViewport
              ? "border-b border-surface-raised bg-background/95 backdrop-blur-md"
              : "border-b border-transparent bg-background"
          }`}
        >
          <div className="page-figma mx-auto max-w-figma">
            <motion.div
              className="flex items-center justify-between gap-3"
              animate={{
                paddingTop: pastFirstViewport ? 12 : 28,
                paddingBottom: pastFirstViewport ? 12 : 28,
              }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
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
                    className="h-full w-auto max-w-none select-none"
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
                      <Link
                        key={item.href}
                        href={item.href}
                        className="font-[family-name:var(--font-display)] text-xs font-medium uppercase tracking-[0.12em] text-muted transition-colors hover:text-white"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </motion.nav>
                ) : null}
              </AnimatePresence>

              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                <Link
                  href="/contact"
                  className="relative flex h-10 items-center justify-center rounded-full border border-border-nav bg-black px-4 outline outline-2 outline-offset-[-2px] outline-white transition-opacity hover:opacity-90 sm:h-12 sm:px-6"
                >
                  <span className="font-[family-name:var(--font-instrument)] text-sm font-normal uppercase leading-5 text-white sm:text-[17.6px]">
                    Let&apos;s talk
                  </span>
                </Link>

                <button
                  ref={menuButtonRef}
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-nav bg-surface text-white transition-colors hover:bg-surface-raised focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-lime lg:hidden"
                  aria-expanded={mobileOpen}
                  aria-controls={panelId}
                  aria-label={mobileOpen ? "Close menu" : "Open menu"}
                  onClick={() => setMobileOpen((o) => !o)}
                >
                  {mobileOpen ? (
                    <X className="size-5" strokeWidth={1.75} aria-hidden />
                  ) : (
                    <Menu className="size-5" strokeWidth={1.75} aria-hidden />
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.header>

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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
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
                        className="block rounded-xl px-4 py-4 font-[family-name:var(--font-display)] text-lg font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-surface hover:text-accent-lime"
                        onClick={closeMobile}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
                <div className="mt-auto shrink-0 border-t border-border-grey pt-8">
                  <Link
                    href="/contact"
                    className="flex h-12 w-full items-center justify-center rounded-full border border-border-nav bg-black outline outline-2 outline-offset-[-2px] outline-white"
                    onClick={closeMobile}
                  >
                    <span className="font-[family-name:var(--font-instrument)] text-[17.6px] font-normal uppercase text-white">
                      Let&apos;s talk
                    </span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
