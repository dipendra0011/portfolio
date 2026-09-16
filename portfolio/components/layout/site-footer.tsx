"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { motion } from "framer-motion";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { figmaAssets } from "@/lib/figma-assets";

const social = [
  // { label: "Instagram", href: "https://instagram.com" },
  { label: "Behance", href: "https://www.behance.net/dipendrashrest" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/dipendra-shrestha-966854267/" },
] as const;

function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Have a good morning !";
  } else if (hour >= 12 && hour < 17) {
    return "Have a good day !";
  } else if (hour >= 17 && hour < 21) {
    return "Have a good evening !";
  } else {
    return "Have a good night";
  }
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  const greeting = getGreeting();

  return (
    <footer id="footer" className="border-t border-line-grey/80 bg-background pb-16 pt-20 md:pb-24 md:pt-28">
      <div className="page-figma mx-auto flex max-w-figma flex-col gap-16 md:gap-20">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,8vw,5.625rem)] font-medium uppercase leading-[0.9] tracking-[-0.023em] text-foreground">
            <p>Let&apos;s work</p>
            <p className="mt-2 md:mt-4">TOGETHER</p>
          </div>

          <div className="flex max-w-xl flex-col gap-10">
            <p className="font-[family-name:var(--font-display)] text-lg font-medium leading-6 text-foreground">
              I started in visual design, but curiosity for how people interact
              with products led me to UI/UX. Today, I help teams transform abstract
              ideas into experiences that feel intuitive, consistent, and genuinely
              useful.
            </p>

            <nav
              className="flex flex-wrap gap-x-10 gap-y-4"
              aria-label="Social links"
            >
              {social.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 font-[family-name:var(--font-display)] text-lg font-bold uppercase text-foreground transition-colors hover:text-accent-lime"
                >
                  {item.label}
                  <span className="inline-flex size-5 rotate-45 items-center justify-center overflow-hidden">
                    <Image
                      src={figmaAssets.vector}
                      alt=""
                      width={22}
                      height={22}
                      className="size-[22px] max-w-none invert"
                    />
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="flex flex-col items-center gap-8 border-t border-line-grey/60 pt-10 md:flex-row md:items-end md:justify-between">
          <p className="font-[family-name:var(--font-display)] text-lg font-medium uppercase text-foreground">
            ©{year} DIPENDRA_SHRESTHA
          </p>

          <MagneticButton>
          <motion.button
            type="button"
            className="flex flex-col items-center gap-3 text-foreground transition-colors hover:text-accent-lime"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <ArrowUp className="size-6" strokeWidth={1.5} aria-hidden />
            <span className="font-[family-name:var(--font-display)] text-lg font-bold uppercase tracking-wide">
              BACK TO TOP
            </span>
          </motion.button>
          </MagneticButton>

          <p className="font-[family-name:var(--font-display)] text-lg font-extrabold uppercase text-accent-lime">
            {greeting}
          </p>
        </div>
      </div>
    </footer>
  );
}
