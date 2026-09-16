"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLenis } from "@/components/lenis-provider";

type WipePhase = "idle" | "cover" | "reveal";

function normalizePath(pathname: string) {
  if (pathname === "/") return "/";
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function isInternalPageLink(anchor: HTMLAnchorElement) {
  if (!anchor.href) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;

  const url = new URL(anchor.href, window.location.href);
  const current = new URL(window.location.href);
  if (url.origin !== current.origin) return false;
  if (normalizePath(url.pathname) === normalizePath(current.pathname)) {
    return false;
  }
  return true;
}

export function PageWipe({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const lenis = useLenis();
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<WipePhase>("idle");
  const phaseRef = useRef<WipePhase>("idle");
  const pendingHref = useRef<string | null>(null);
  const pathRef = useRef(pathname);
  const busy = useRef(false);

  phaseRef.current = phase;

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      if (!(event.target instanceof Element)) return;

      const anchor = event.target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!isInternalPageLink(anchor)) return;

      event.preventDefault();
      const href = `${anchor.pathname}${anchor.search}${anchor.hash}`;

      if (reduceMotion) {
        router.push(href);
        return;
      }

      if (busy.current) return;
      busy.current = true;
      pendingHref.current = href;
      lenis?.stop();
      setPhase("cover");
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [lenis, reduceMotion, router]);

  useEffect(() => {
    if (pathRef.current === pathname) return;
    pathRef.current = pathname;
    window.scrollTo(0, 0);

    if (reduceMotion) {
      busy.current = false;
      lenis?.start();
      return;
    }

    if (phaseRef.current === "cover") {
      setPhase("reveal");
    }
  }, [lenis, pathname, reduceMotion]);

  return (
    <>
      {children}
      <AnimatePresence>
        {phase !== "idle" ? (
          <motion.div
            key="page-wipe"
            className={`fixed inset-0 z-[200] ${
              phase === "cover" ? "pointer-events-auto" : "pointer-events-none"
            }`}
            initial={{ y: "100%" }}
            animate={{ y: phase === "cover" ? "0%" : "-100%" }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
            onAnimationComplete={() => {
              if (phaseRef.current === "cover" && pendingHref.current) {
                const href = pendingHref.current;
                pendingHref.current = null;
                router.push(href);
                return;
              }
              if (phaseRef.current === "reveal") {
                setPhase("idle");
                busy.current = false;
                lenis?.start();
              }
            }}
            aria-hidden
          >
            <div className="h-full w-full bg-background">
              <div className="h-[3px] w-full bg-accent-lime" />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
