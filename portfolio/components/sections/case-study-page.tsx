"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { CaseStudyContent } from "@/lib/case-study-content";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { figmaAssets } from "@/lib/figma-assets";

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 22 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-48px" },
    transition: { duration: 0.45, delay },
  } as const;
}

type Props = { content: CaseStudyContent };

export function CaseStudyPage({ content }: Props) {
  const splitSections = [
    ["Overview", "case-overview", content.overviewBody],
    ["Problem", "case-problem", content.problemBody],
    ["Solution", "case-solution", content.solutionBody],
  ] as const;

  return (
    <div className="bg-background">
      <section
        className="border-b border-surface-raised pt-6 pb-12 md:pb-16 lg:pt-8 lg:pb-20"
        aria-label="Project introduction"
      >
        <div className="page-figma mx-auto max-w-figma">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start lg:gap-x-12 xl:gap-x-20">
            <div>
              <motion.h1
                {...fadeUp(0)}
                className="font-[family-name:var(--font-display)] text-[clamp(2.75rem,8vw,4.875rem)] font-medium uppercase leading-[0.95] tracking-[-0.04em] text-foreground"
              >
                {content.title}
              </motion.h1>
              <motion.div
                {...fadeUp(0.06)}
                className="mt-6 flex flex-wrap gap-3"
              >
                {content.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center border border-foreground/35 px-5 py-2.5 font-[family-name:var(--font-display)] text-xs font-medium uppercase tracking-[0.08em] text-foreground"
                  >
                    {t}
                  </span>
                ))}
              </motion.div>
            </div>
            <motion.p
              {...fadeUp(0.1)}
              className="max-w-[784px] font-[family-name:var(--font-inter)] text-[17px] leading-[1.65] tracking-[0.01em] text-foreground/90 lg:pt-2"
            >
              {content.intro}
            </motion.p>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14" aria-label="Product mockups">
        <div className="page-figma relative mx-auto max-w-figma">
          {/* Figma img frame — line-md:arrow-up decorative mark */}
          <div
            className="pointer-events-none absolute right-[6%] top-[8%] z-[1] hidden opacity-90 md:block lg:right-[10%] lg:top-[10%]"
            aria-hidden
          >
            <Image
              src={figmaAssets.arrowUp}
              alt=""
              width={16}
              height={15}
              className="size-4 lg:size-[18px]"
            />
          </div>
          <motion.div
            {...fadeUp(0)}
            className="relative z-[2] flex flex-col items-center gap-10"
          >
            <div className="flex w-full max-w-[814px] flex-wrap justify-center gap-6 sm:gap-8 md:gap-10 lg:flex-nowrap lg:justify-center">
              {content.mockupSrc.map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-[166/369] w-[min(100%,166px)] shrink-0 overflow-hidden bg-surface sm:w-[140px] md:w-[166px]"
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="166px"
                  />
                </div>
              ))}
            </div>
            <div className="flex w-full flex-wrap items-center justify-end gap-6">
              <MagneticButton>
              <motion.button
                type="button"
                className="inline-flex h-10 shrink-0 items-center justify-center border border-foreground bg-foreground px-4 font-[family-name:var(--font-display)] text-xs font-semibold uppercase tracking-[0.06em] text-background transition-opacity hover:opacity-90"
                onClick={() =>
                  document
                    .getElementById("case-overview")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                View case study
              </motion.button>
              </MagneticButton>
              {content.mockupShowComingSoon ? (
                <span className="font-[family-name:var(--font-display)] text-sm font-medium uppercase tracking-[0.12em] text-foreground/55">
                  Coming soon
                </span>
              ) : null}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="page-figma mx-auto max-w-figma space-y-16 py-12 md:space-y-20 md:py-16 lg:space-y-24">
        {splitSections.map(([label, id, body], idx) => (
          <motion.section
            key={id}
            id={id}
            {...fadeUp(idx * 0.05)}
            className="grid gap-8 lg:grid-cols-[minmax(0,318px)_1fr] lg:gap-x-12 xl:gap-x-24"
          >
            <h2 className="font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3.4rem)] font-medium uppercase leading-[1] tracking-[-0.03em] text-foreground lg:pt-2">
              {label}
            </h2>
            <p className="max-w-[772px] font-[family-name:var(--font-inter)] text-[17px] leading-[1.65] text-foreground/88 lg:pt-1">
              {body}
            </p>
          </motion.section>
        ))}
      </div>

      <section
        className="border-t border-surface-raised py-16 md:py-24"
        aria-label="Process"
      >
        <div className="page-figma mx-auto max-w-figma">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,369px)_1fr] lg:gap-x-8 xl:gap-x-16">
            <motion.h2
              {...fadeUp(0)}
              className="font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3.4rem)] font-medium uppercase leading-[1] tracking-[-0.03em] text-foreground"
            >
              Process
              <br />
              Overview
            </motion.h2>
            {content.process.variant === "steps" ? (
              <motion.div
                {...fadeUp(0.08)}
                className="grid max-w-[776px] gap-10 md:gap-12 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-12"
              >
                {content.process.steps.map((step) => (
                  <div key={step.title}>
                    <h3 className="font-[family-name:var(--font-display)] text-base font-semibold uppercase tracking-[0.04em] text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-4 font-[family-name:var(--font-inter)] text-[15px] leading-[1.65] text-foreground/75">
                      {step.body}
                    </p>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.p
                {...fadeUp(0.08)}
                className="max-w-[772px] font-[family-name:var(--font-inter)] text-[17px] leading-[1.65] text-foreground/88"
              >
                {content.process.text}
              </motion.p>
            )}
          </div>
        </div>
      </section>

      <section className="w-full" aria-label="Project imagery">
        <motion.div {...fadeUp(0)} className="relative aspect-[144/90] w-full bg-surface">
          <Image
            src={content.gallerySrc}
            alt={content.galleryAlt}
            fill
            className="object-cover"
            sizes="100vw"
            priority={false}
          />
        </motion.div>
      </section>

      <section
        id="more-work"
        className="border-t border-surface-raised py-20 md:py-28"
        aria-label="More work"
      >
        <div className="page-figma mx-auto max-w-figma">
          <motion.h2
            {...fadeUp(0)}
            className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,7vw,5rem)] font-medium uppercase leading-[0.9] tracking-[-0.05em] text-foreground"
          >
            More work
          </motion.h2>
          <ul className="mt-12 grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:mt-16 lg:gap-y-16">
            {content.moreWork.map((p, i) => (
              <motion.li
                key={`${p.title}-${i}`}
                {...fadeUp(i * 0.06)}
                className={i % 2 === 1 ? "md:translate-y-8 lg:translate-y-6" : ""}
              >
                <motion.div
                  className="group"
                  whileHover={{ scale: 1.03, y: -4 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <div className="relative aspect-[659/450] w-full overflow-hidden bg-surface">
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-4">
                    <span className="font-[family-name:var(--font-instrument)] text-[15px] font-semibold uppercase leading-none tracking-[0.01em] text-foreground">
                      {p.title}
                    </span>
                    <span className="shrink-0 font-[family-name:var(--font-inter)] text-[14px] leading-none text-foreground/55">
                      {p.tag}
                    </span>
                  </div>
                </motion.div>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
