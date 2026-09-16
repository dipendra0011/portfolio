"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { CV_PDF_PATH } from "@/lib/cv";
import { figmaAssets } from "@/lib/figma-assets";
import { HeroScene } from "@/components/hero/hero-scene";
import { SitePrimaryNavLink } from "@/components/layout/site-header";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { SITE_NAV_ITEMS } from "@/lib/site-navigation";

const MotionLink = motion.create(Link);
const REDUCE_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onStoreChange: () => void) {
  const mql = window.matchMedia(REDUCE_MOTION);
  mql.addEventListener("change", onStoreChange);
  return () => mql.removeEventListener("change", onStoreChange);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCE_MOTION).matches,
    () => false,
  );
}

function HeroCopy() {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
      >
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(2.25rem,7vw,5rem)] font-bold uppercase leading-[1.05] tracking-[-0.04em] drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]">
          <span className="text-accent-lime">Hi!!</span>{" "}
          <span className="text-foreground">I am</span>
        </h1>
        <p className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.75rem,5.5vw,4.25rem)] font-bold uppercase leading-[1.1] tracking-[-0.04em] text-foreground">
          DIPENDRA SHRESTHA
        </p>
        <div className="mt-6 flex flex-wrap items-baseline gap-x-1 font-[family-name:var(--font-instrument)] text-[17px] font-semibold uppercase">
          <span className="text-foreground">Product Designer</span>
          <span className="text-muted">+ Digital Marketer</span>
        </div>
      </motion.div>
      <nav
        className="hidden lg:flex lg:flex-col lg:items-end lg:gap-5 lg:pt-2 lg:text-right"
        aria-label="Section navigation"
      >
        {SITE_NAV_ITEMS.map((item) => (
          <SitePrimaryNavLink key={item.href} href={item.href} variant="vertical">
            {item.heroLabel}
          </SitePrimaryNavLink>
        ))}
      </nav>
    </>
  );
}

function HeroCtas() {
  return (
    <div className="page-figma mx-auto max-w-figma pb-12 pt-10 md:pb-16 md:pt-14 lg:pb-20">
      <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-0">
        <div className="relative z-20 flex shrink-0 flex-wrap items-center gap-3 lg:pt-[15px]">
          <MagneticButton>
            <MotionLink
              href="/contact"
              className="relative inline-flex h-12 shrink-0 items-center justify-center whitespace-nowrap rounded-full border-2 border-foreground bg-foreground px-8 text-[17.6px] font-medium uppercase leading-none text-background shadow-sm transition-opacity hover:opacity-90"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <span className="relative z-10 text-background">Let&apos;s talk</span>
            </MotionLink>
          </MagneticButton>
          <span className="relative inline-flex size-[45px] shrink-0 items-center justify-center">
            <Image
              src={figmaAssets.iconArrowBadge}
              alt=""
              width={45}
              height={45}
              className="size-[45px]"
            />
            <span className="absolute flex size-[34px] rotate-[48deg] items-center justify-center">
              <Image
                src={figmaAssets.arrowUp}
                alt=""
                width={24}
                height={24}
              />
            </span>
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-10 max-lg:w-full sm:flex-row sm:flex-wrap sm:items-start sm:justify-end lg:min-w-0 lg:flex-1 lg:basis-0 lg:flex-row lg:gap-10">
          <div className="relative order-first box-border flex min-h-[322px] w-full max-w-[303px] flex-col border border-[rgba(133,133,133,0.7)] bg-white p-8 transition-opacity hover:opacity-95 sm:order-none lg:h-[322px]">
            <Link
              href="#about"
              className="block text-left outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
            >
              <span className="absolute left-7 top-5 block size-[60px]">
                <Image
                  src={figmaAssets.iconSpark}
                  alt=""
                  width={60}
                  height={60}
                />
              </span>
              <span className="mt-14 block font-[family-name:var(--font-display)] text-[32px] font-bold leading-10 text-black">
                More About
                <br />
                Me?
              </span>
            </Link>
            <MagneticButton>
              <motion.a
                href={CV_PDF_PATH}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-16 inline-flex w-fit flex-col outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <span className="font-[family-name:var(--font-display)] text-lg font-medium text-black">
                  Download
                </span>
                <span className="relative mt-1 block h-px w-[100px]">
                  <Image
                    src={figmaAssets.lineDecor}
                    alt=""
                    width={100}
                    height={1}
                    className="w-full"
                  />
                </span>
                <span className="sr-only"> résumé (opens in new tab)</span>
              </motion.a>
            </MagneticButton>
          </div>

          <div className="relative h-[322px] w-full max-w-[322px] shrink-0 overflow-hidden border border-[rgba(133,133,133,0.7)] sm:max-w-none sm:w-[322px]">
            <Image
              src={figmaAssets.rectangle2}
              alt="Featured project mockup on laptop"
              fill
              className="object-cover"
              sizes="322px"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  const reduceMotion = usePrefersReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [canvasActive, setCanvasActive] = useState(true);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end start"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    progressRef.current = latest;
  });

  useEffect(() => {
    const node = stageRef.current;
    if (!node || reduceMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setCanvasActive(Boolean(entry?.isIntersecting));
      },
      { threshold: 0.05 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduceMotion]);

  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="border-b border-surface-raised bg-background"
    >
      <div
        ref={trackRef}
        className={reduceMotion ? "relative" : "relative h-[150vh]"}
      >
        <div
          ref={stageRef}
          className={
            reduceMotion
              ? "relative min-h-dvh overflow-hidden bg-background"
              : "sticky top-0 h-dvh w-full overflow-hidden bg-background"
          }
        >
          {reduceMotion ? (
            <Image
              src={figmaAssets.rectangle2}
              alt=""
              fill
              priority
              className="object-cover opacity-35"
              sizes="100vw"
            />
          ) : (
            <HeroScene progressRef={progressRef} active={canvasActive} />
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/80 via-background/25 to-background/85" />

          <div className="page-figma relative z-10 mx-auto flex h-full min-h-dvh max-w-figma flex-col justify-between pb-10 pt-28 md:pt-32">
            <div className="pointer-events-auto relative grid gap-10 lg:grid-cols-[1fr_auto] lg:gap-8">
              <HeroCopy />
            </div>
            <p className="pointer-events-none font-[family-name:var(--font-instrument)] text-[12px] font-medium uppercase tracking-[0.22em] text-foreground/60">
              scroll to explore
            </p>
          </div>
        </div>
      </div>

      <HeroCtas />
    </section>
  );
}
