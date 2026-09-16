"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

const LENIS_EASING = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

const LenisContext = createContext<Lenis | null>(null);

export function useLenis() {
  return useContext(LenisContext);
}

export function LenisProvider({ children }: { children: ReactNode }) {
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);

  useEffect(() => {
    const html = document.documentElement;
    const previousScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";

    const lenis = new Lenis({
      duration: 1.2,
      easing: LENIS_EASING,
      anchors: true,
      allowNestedScroll: true,
      stopInertiaOnNavigate: true,
      prevent: () => document.body.style.overflow === "hidden",
    });

    setLenisInstance(lenis);

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const onAnchorClickCapture = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!anchor?.href) return;

      const url = new URL(anchor.href);
      const current = new URL(window.location.href);
      if (url.host !== current.host || url.pathname !== current.pathname) {
        return;
      }
      if (!url.hash || url.hash === "#") return;
      if (!document.getElementById(decodeURIComponent(url.hash.slice(1)))) {
        return;
      }

      event.preventDefault();
    };

    document.addEventListener("click", onAnchorClickCapture, true);

    return () => {
      document.removeEventListener("click", onAnchorClickCapture, true);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      setLenisInstance(null);
      html.style.scrollBehavior = previousScrollBehavior;
    };
  }, []);

  return (
    <LenisContext.Provider value={lenisInstance}>
      {children}
    </LenisContext.Provider>
  );
}
