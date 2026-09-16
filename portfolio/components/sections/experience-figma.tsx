"use client";

import { motion } from "framer-motion";

const roles = [
  {
    company: "it sutra inc",
    position: "Product designer",
    period: "2025 — JAN 2026",
    description:
      "Led website design initiatives, including in-house projects, motion graphics, graphics, and product design.",
  },
  {
    company: "Wild Yak Expedition Pvt. Ltd",
    position: "ui ux designer",
    period: "2024 — JUN 2025",
    description:
      "Designed web UI/UX, and worked on design systems for multiple clients, and in-house software designs.",
  },
  {
    company: "Future hub asia pacific pvt. ltd",
    position: "ui Ux DESIGNER | Digital Marketer",
    period: "2024 — MAY 2024",
    description:
      "Gaming Experiences with Innovative Technology and Unparalleled Performance.",
  },
] as const;

export function ExperienceFigmaSection() {
  return (
    <section id="experience" className="bg-background py-20 md:py-28">
      <div className="page-figma mx-auto max-w-figma">
        <div className="flex flex-col gap-14 lg:flex-row lg:gap-16 xl:gap-24">
          <div className="shrink-0 lg:sticky lg:top-28 lg:h-fit lg:w-[320px]">
            <h2 className="font-[family-name:var(--font-display)] text-[clamp(2.5rem,5vw,3.75rem)] font-medium uppercase leading-none tracking-[-0.015em] text-foreground">
              EXPERIENCE
            </h2>
          </div>

          <ul className="flex flex-1 flex-col gap-0">
            {roles.map((role, i) => (
              <motion.li
                key={role.company}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="border-b border-line-grey py-10 first:pt-2 md:py-12"
              >
                <p className="font-[family-name:var(--font-instrument)] text-[28px] font-bold uppercase leading-8 tracking-[-0.02em] text-foreground md:text-[30px]">
                  {role.company}
                </p>
                <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                  <div className="max-w-xl space-y-4">
                    <p className="font-[family-name:var(--font-instrument)] text-[22px] font-bold uppercase tracking-[0.0125em] text-foreground">
                      {role.position}
                    </p>
                    <p className="font-[family-name:var(--font-inter)] text-[18.6px] font-normal leading-[31px] tracking-[0.03em] text-muted">
                      {role.description}
                    </p>
                  </div>
                  <p className="shrink-0 font-[family-name:var(--font-instrument)] text-[22px] font-bold uppercase tracking-[0.0125em] text-foreground md:text-right">
                    {role.period}
                  </p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
