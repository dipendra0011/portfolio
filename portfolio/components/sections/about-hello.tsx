"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { figmaAssets } from "@/lib/figma-assets";

export function AboutHelloSection() {
  return (
    <section id="about" className="bg-background py-20 md:py-28">
      <div className="page-figma mx-auto max-w-figma">
        <div className="relative py-2">
          <div className="absolute inset-x-0 top-0">
            <Image
              src={figmaAssets.lineDivider}
              alt=""
              width={1366}
              height={1}
              className="h-px w-full object-cover opacity-80"
            />
          </div>
        </div>

        <div className="flex flex-col gap-16 py-12 md:gap-20 md:py-16 lg:gap-24">
          <motion.div
            className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-24 xl:gap-32"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-[family-name:var(--font-display)] text-[clamp(4rem,12vw,6.25rem)] font-extrabold leading-none tracking-tight text-foreground">
              Hello.
            </h2>
            <p className="max-w-[784px] font-[family-name:var(--font-display)] text-xl font-normal leading-[35px] text-foreground md:text-2xl">
              I&apos;m Dipendra. I&apos;ve spent the last few years working at the
              intersection of design and business — leading projects, shaping user
              experiences, and collaborating with teams to deliver products people
              enjoy using. Now, I&apos;m excited to take on new challenges where I
              can bring both creativity and strategy to the table.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-20 xl:gap-24"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.06 }}
          >
            <h3 className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,2.5rem)] font-medium leading-7 text-foreground lg:max-w-[318px]">
              How I Can Help
            </h3>
            <p className="max-w-[772px] font-[family-name:var(--font-display)] text-xl font-normal leading-[35px] text-foreground md:text-2xl">
              I help teams identify business opportunities and turn them into
              practical, user-centered solutions. From user research and strategy to
              UI/UX design and testing, I streamline the process to deliver products
              efficiently across web and mobile platforms.
            </p>
          </motion.div>
        </div>

        <div className="relative pb-2">
          <div className="absolute inset-x-0 bottom-0">
            <Image
              src={figmaAssets.lineDivider}
              alt=""
              width={1366}
              height={1}
              className="h-px w-full object-cover opacity-80"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
