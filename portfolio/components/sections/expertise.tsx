"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { figmaAssets } from "@/lib/figma-assets";

const tools = [
  { src: figmaAssets.figmaTool, label: "Figma" },
  { src: figmaAssets.illustrator, label: "Illustrator" },
  { src: figmaAssets.photoshop, label: "Photoshop" },
  { src: figmaAssets.meta, label: "Meta" },
  { src: figmaAssets.googleAds, label: "Google Ads" },
  { src: figmaAssets.framer, label: "Framer" },
  { src: figmaAssets.discordIcon, label: "VS Code" },
] as const;

const cards = [
  {
    num: "(1)",
    title: "Product Design",
    body: "Turn ideas into products that balance usability, style, and impact.",
  },
  {
    num: "(2)",
    title: "Web Design",
    body: "Design modern, responsive websites with seamless navigation.",
  },
  {
    num: "(3)",
    title: "GRAPHIC DESIGN",
    body: "Create visuals that define and strengthen your brand identity.T",
  },
] as const;

export function ExpertiseSection() {
  return (
    <section id="skills" className="bg-background py-20 md:py-28">
      <div className="page-figma mx-auto max-w-figma">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,8vw,5.625rem)] font-medium uppercase leading-[0.9] tracking-[-0.023em] text-foreground">
            <p>My</p>
            <p className="mt-1 md:mt-2">expertise</p>
          </div>

          <div
            className="flex flex-wrap items-center gap-3 md:gap-3 lg:max-w-[720px] lg:justify-end"
            role="list"
            aria-label="Tools"
          >
            {tools.map((tool) => (
              <motion.div
                key={tool.label}
                role="listitem"
                className="flex size-[60px] items-center justify-center overflow-hidden rounded-[10px] bg-surface opacity-80 transition-opacity hover:opacity-100"
                whileHover={{ scale: 1.04 }}
              >
                <Image
                  src={tool.src}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 object-contain"
                />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3 md:gap-5">
          {cards.map((card, i) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
              className="relative overflow-hidden rounded-[10px] border border-border-grey bg-surface px-6 pb-10 pt-8 md:min-h-[290px]"
            >
              <p className="font-[family-name:var(--font-instrument)] text-base font-bold uppercase tracking-[0.18em] text-foreground">
                {card.num}
              </p>
              <h3 className="mt-4 font-[family-name:var(--font-display)] text-[28px] font-bold uppercase leading-7 tracking-[-0.0125em] text-foreground md:text-[30px]">
                {card.title}
              </h3>
              <p className="mt-5 max-w-none font-[family-name:var(--font-display)] text-[18.6px] font-normal leading-[31px] tracking-[0.025em] text-body-subtle">
                {card.body}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
