"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { NavCount } from "@/components/layout/nav-count";
import { RollText } from "@/components/motion/roll-text";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

type MobileMenuProps = {
  id: string;
  open: boolean;
  onClose: () => void;
};

export function MobileMenu({ id, open, onClose }: MobileMenuProps) {
  // Lock page scroll and close on Escape while open.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const items = [...siteConfig.nav, siteConfig.contact];

  return (
    <div
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className={cn(
        "fixed inset-0 z-[60] flex flex-col bg-bg px-5 pt-5 pb-8 transition-opacity duration-300 md:hidden",
        open ? "opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <div className="flex items-center justify-between font-sans text-[18px] leading-none tracking-[-0.01em]">
        <span className="flex h-11 items-center gap-2.5 pr-3.5 pl-1.5">
          <Image
            src={siteConfig.avatar}
            alt=""
            width={32}
            height={32}
            className="size-8 rounded-full border border-line object-cover"
          />
          {siteConfig.handle}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="roll-trigger flex h-11 items-center rounded-[4px] border border-line bg-surface px-[18px]"
        >
          <RollText>Close</RollText>
        </button>
      </div>

      <ul className="mt-auto flex flex-col gap-1 px-3.5">
        {items.map((item) => (
          <li key={item.href}>
            {"soon" in item && item.soon ? (
              <span
                aria-disabled="true"
                className="font-sans text-5xl leading-[1.1] tracking-[-0.02em] text-fg/40"
              >
                {item.label}
                <sup className="ml-2 align-top font-sans text-[14px] tracking-normal">
                  Soon
                </sup>
              </span>
            ) : (
              <Link
                href={item.href}
                onClick={onClose}
                className="roll-trigger group font-sans text-5xl leading-[1.1] tracking-[-0.02em]"
              >
                <RollText>{item.label}</RollText>
                {"count" in item && item.count !== undefined && (
                  <NavCount count={item.count} />
                )}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
