"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { figmaAssets } from "@/lib/figma-assets";

const projects = [
  {
    image: figmaAssets.projectA,
    title: "NEPTUNES",
    tag: "Web Design",
    href: "/work/neptunes/",
  },
  {
    image: figmaAssets.projectB,
    title: "SERVICE BOOKING",
    tag: "Web Design",
  },
  {
    image: figmaAssets.projectC,
    title: "SERVICE BOOKING",
    tag: "Web Design",
  },
  {
    image: figmaAssets.projectA,
    title: "SERVICE BOOKING",
    tag: "Web Design",
  },
] as const satisfies readonly {
  image: string;
  title: string;
  tag: string;
  href?: string;
}[];

export function RecentWorkSection() {
  return (
    <section id="work" className="bg-background py-20 md:py-24">
      <div className="page-figma mx-auto max-w-figma">
        {/* Top row */}
        <div className="grid grid-cols-2 gap-y-8 lg:grid-cols-[520px_1fr] lg:items-start lg:gap-x-60">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-[540px] font-[family-name:var(--font-display)] text-[clamp(3rem,7vw,5.8rem)] font-medium uppercase leading-[0.9] tracking-[-0.05em] text-white"
            >
              MY RECENT
              <br />
              WORK
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:pt-4"
          >
            <p className="max-w-[560px] text-left font-[family-name:var(--font-inter)] text-[18px] leading-[1.65] tracking-[0.005em] text-white/92">
              Design is more than pixels; it&apos;s about creating experiences
              that matter. Here&apos;s a look into my process, challenges, and
              solutions that brought each project to life.
            </p>
          </motion.div>
        </div>

        {/* Projects */}
        <ul className="mt-16 grid grid-cols-1 gap-x-7 gap-y-14 md:grid-cols-2 lg:mt-14 lg:gap-y-20">
          {projects.map((p, i) => {
            const staggerClass =
              i % 2 === 1 ? "md:translate-y-12 lg:translate-y-5" : "";

            const card = (
              <article className="block">
                <div className="relative aspect-[1.43/1] w-full overflow-hidden bg-neutral-900">
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                <div className="mt-4 flex items-end justify-between gap-4">
                  <span className="font-[family-name:var(--font-instrument)] text-[15px] font-semibold uppercase leading-none tracking-[0.01em] text-white">
                    {p.title}
                  </span>
                  <span className="shrink-0 font-[family-name:var(--font-inter)] text-[14px] leading-none text-white/55">
                    {p.tag}
                  </span>
                </div>
              </article>
            );

            return (
              <motion.li
                key={`${p.title}-${i}`}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.05 }}
                className={`group ${staggerClass}`}
              >
                {"href" in p && p.href ? (
                  <Link
                    href={p.href}
                    className="block rounded-sm outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/40"
                  >
                    {card}
                  </Link>
                ) : (
                  card
                )}
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}